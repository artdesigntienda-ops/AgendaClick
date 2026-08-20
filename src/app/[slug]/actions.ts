'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { google } from 'googleapis'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

const FROM_ADDRESS = 'AgendaClick <no-reply@agendaclick.com.co>'


function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateICS(
  uid: string,
  startTime: string, 
  endTime: string, 
  summary: string, 
  description: string, 
  location: string
) {
  const formatICSDate = (dateString: string) => {
    return new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AgendaClick//ES
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date().toISOString())}
DTSTART:${formatICSDate(startTime)}
DTEND:${formatICSDate(endTime)}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n');
}

export async function sendOtpCode(email: string, clientName: string, recaptchaToken: string) {
  // 1. Verificar reCAPTCHA
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  if (secretKey && recaptchaToken) {
    try {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
      const response = await fetch(verifyUrl, { method: 'POST' })
      const data = await response.json()
      
      if (!data.success || data.score < 0.5) {
        console.error('reCAPTCHA failed:', data)
        return { success: false, error: 'Detectamos actividad inusual. Por favor, intenta más tarde.' }
      }
    } catch (e) {
      console.error('Error verifying reCAPTCHA:', e)
      // Continuamos si el servicio de Google falla temporalmente para no bloquear al usuario legítimo
    }
  } else if (!recaptchaToken) {
    return { success: false, error: 'La validación de seguridad (reCAPTCHA) falló. Por favor recarga la página e intenta nuevamente.' }
  }
  
  // Generar código de 6 dígitos
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Fecha de expiración (5 min)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 5)

  // Guardar en base de datos
  const { error } = await getSupabaseAdmin().from('otp_verifications').insert({
    email: email.trim().toLowerCase(),
    otp_code: otpCode,
    expires_at: expiresAt.toISOString()
  })

  if (error) {
    console.error('Error saving OTP:', error)
    return { success: false, error: 'No se pudo generar el código. Intenta nuevamente.' }
  }

  try {
    const resend = getResend()
    await resend.emails.send({
      from: 'AgendaClick Seguridad <no-reply@agendaclick.com.co>',
      to: email.trim().toLowerCase(),
      subject: `Tu código de verificación es ${otpCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">Hola ${clientName},</h2>
          <p>Para confirmar tu cita, ingresa el siguiente código de verificación de 6 dígitos:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; text-align: center; background: #f4f4f5; border-radius: 8px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>Este código expirará en 5 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este correo.</p>
        </div>
      `
    })
    return { success: true }
  } catch (e: any) {
    console.error('Error sending OTP via SMTP:', e)
    return { success: false, error: `Error enviando correo: ${e?.message || 'Error desconocido'}` }
  }
}

export async function createAppointment(data: {
  clinicId: string
  serviceId: string
  serviceIds?: string[]
  serviceNames?: string
  totalPrice?: number
  clientName: string
  clientEmail: string
  clientPhone: string
  startTime: string
  endTime: string
  staffId?: string | null
}, otpCode: string) {
  const supabase = await createClient()

  // 1. Validar OTP
  const normalizedEmail = data.clientEmail.trim().toLowerCase()
  const { data: verifications, error: otpError } = await getSupabaseAdmin()
    .from('otp_verifications')
    .select('*')
    .eq('email', normalizedEmail)
    .eq('otp_code', otpCode.trim())
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)

  if (otpError || !verifications || verifications.length === 0) {
    return { error: true, message: 'Código inválido o expirado. Por favor intenta de nuevo.' }
  }

  // 1.5 Validar que el horario siga disponible (prevenir double-booking / carrera de clicks)
  let overlapQuery = getSupabaseAdmin()
    .from('appointments')
    .select('id')
    .eq('clinic_id', data.clinicId)
    .neq('status', 'cancelled')
    .lt('start_time', data.endTime) // La cita existente empieza antes de que la nueva termine
    .gt('end_time', data.startTime) // La cita existente termina después de que la nueva empiece

  if (data.staffId) {
    // Si la nueva cita es para un doctor específico, chocará si ya hay otra para él, o si hay un bloqueo de toda la clínica (null)
    overlapQuery = overlapQuery.or(`staff_id.eq.${data.staffId},staff_id.is.null`)
  } else {
    // Si la nueva cita no tiene doctor asignado (null), choca si ya hay un bloqueo general (null)
    overlapQuery = overlapQuery.is('staff_id', null)
  }

  const { data: overlapping } = await overlapQuery
  if (overlapping && overlapping.length > 0) {
    return { error: true, message: 'Lo sentimos, este horario acaba de ser ocupado. Por favor elige otro.' }
  }

  // 2. Guardar en la DB (usamos admin para saltar RLS, ya que la legitimidad fue validada por el OTP)
  const appointmentPayload: any = {
    clinic_id: data.clinicId,
    service_id: data.serviceId,
    staff_id: data.staffId,
    client_name: data.clientName,
    client_email: data.clientEmail,
    client_phone: data.clientPhone,
    start_time: data.startTime,
    end_time: data.endTime,
    status: 'confirmed' // El OTP valida la intención, así que entra como confirmado
  }

  if (data.totalPrice !== undefined && data.totalPrice !== null) {
    appointmentPayload.total_price = data.totalPrice
  }

  const { data: newApp, error } = await getSupabaseAdmin()
    .from('appointments')
    .insert(appointmentPayload)
    .select('id')
    .maybeSingle()

  if (error || !newApp) {
    console.error('Error creating appointment:', error)
    return { error: true, message: 'Error interno guardando la cita.' }
  }

  const appointmentId = newApp.id

  // Borramos el OTP que ya se usó para evitar reusos (fire and forget)
  getSupabaseAdmin().from('otp_verifications').delete().eq('id', verifications[0].id).then()

  // 3. Obtener info adicional (correo del dueño y nombre del servicio) para el email
  const { data: clinicInfo } = await supabase
    .from('clinics')
    .select('name, profiles(email, google_refresh_token, google_calendar_id)')
    .eq('id', data.clinicId)
    .maybeSingle()

  const { data: serviceInfo } = await supabase
    .from('services')
    .select('name')
    .eq('id', data.serviceId)
    .maybeSingle()

  const serviceName = data.serviceNames || serviceInfo?.name || 'Cita'
  const clinicName = clinicInfo?.name || 'AgendaClick'
  
  // Generar archivo de calendario (.ics)
  const appointmentUid = `${Date.now()}@agendaclick.com`
  const icsContent = generateICS(
    appointmentUid,
    data.startTime,
    data.endTime,
    `${serviceName} - ${data.clientName}`,
    `Cita agendada vía AgendaClick.\nCliente: ${data.clientName}\nTeléfono: ${data.clientPhone}\nCorreo: ${data.clientEmail}`,
    clinicName
  )

  const attachment = {
    filename: 'cita.ics',
    content: Buffer.from(icsContent),
    contentType: 'text/calendar'
  }

  const formattedDate = format(new Date(data.startTime), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
  
  // Extraemos tokens de google si existen
  const ownerProfile = (clinicInfo?.profiles as any)?.[0] || (clinicInfo?.profiles as any)
  const ownerEmail = ownerProfile?.email || null
  const googleRefreshToken = ownerProfile?.google_refresh_token || null
  const googleCalendarId = ownerProfile?.google_calendar_id || null

  try {
    // 3.5. Crear evento en Google Calendar si el dueño tiene la integración activa
    if (googleRefreshToken && googleCalendarId) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      )
      oauth2Client.setCredentials({ refresh_token: googleRefreshToken })
      
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      await calendar.events.insert({
        calendarId: googleCalendarId,
        requestBody: {
          summary: `${serviceName} - ${data.clientName}`,
          description: `Teléfono: ${data.clientPhone}\nCorreo: ${data.clientEmail}\nServicio: ${serviceName}`,
          start: {
            dateTime: new Date(data.startTime).toISOString(),
          },
          end: {
            dateTime: new Date(data.endTime).toISOString(),
          },
        }
      })
    }
  } catch (err) {
    console.error('Error insertando en Google Calendar:', err)
  }

  try {
    const resend = getResend()
    
    // 4. Enviar correo al Dueño
    if (ownerEmail) {
      await resend.emails.send({
        from: 'AgendaClick Notificaciones <no-reply@agendaclick.com.co>',
        to: ownerEmail,
        subject: `¡Nueva Cita! ${serviceName} - ${data.clientName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #000;">Tienes una nueva cita en ${clinicName}</h2>
            <p><strong>Cliente:</strong> ${data.clientName}</p>
            <p><strong>Teléfono:</strong> ${data.clientPhone}</p>
            <p><strong>Correo:</strong> ${data.clientEmail}</p>
            <p><strong>Servicio:</strong> ${serviceName}</p>
            <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
            <br/>
            <p>El cliente también tiene la instrucción de contactarte vía WhatsApp.</p>
            <p><i>Abre el archivo adjunto (cita.ics) desde tu celular para guardar este evento en tu calendario de Google o Apple.</i></p>
          </div>
        `,
        attachments: [{
          filename: 'cita.ics',
          content: Buffer.from(icsContent).toString('base64'),
          contentType: 'text/calendar'
        }]
      })
    }

    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://agendaclick.com.co'}/cancelar/${appointmentId}`

    // 5. Enviar correo a la Clienta
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.clientEmail,
      subject: `Reserva Confirmada en ${clinicName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #000; margin-top: 0;">¡Hola ${data.clientName}, tu reserva está confirmada!</h2>
          <p>Has agendado exitosamente tu cita en <strong>${clinicName}</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p><strong>Servicio:</strong> ${serviceName}</p>
          <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
          <br/>
          <p style="font-size: 14px; color: #71717a;">Abre el archivo adjunto (cita.ics) para guardarlo en tu calendario.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p style="font-size: 13px; color: #71717a; text-align: center; margin-bottom: 0;">
            ¿Necesitas cancelar o reprogramar tu cita? 
            <a href="${cancelUrl}" style="color: #ef4444; font-weight: bold; text-decoration: underline; margin-left: 5px;">Cancela tu cita aquí</a>
          </p>
        </div>
      `,
      attachments: [{
        filename: 'cita.ics',
        content: Buffer.from(icsContent).toString('base64'),
        contentType: 'text/calendar'
      }]
    })
  } catch (e) {
    console.error('Error sending emails via Resend:', e)
  }

  revalidatePath('/dashboard')
  
  return { success: true }
}

export async function cancelAppointmentFromClient(appointmentId: string) {
  const supabase = getSupabaseAdmin()

  // 1. Obtener la cita y los datos de la clínica
  const { data: appointment, error: getError } = await supabase
    .from('appointments')
    .select('*, services(name), clinics(name, owner_id)')
    .eq('id', appointmentId)
    .maybeSingle()

  if (getError || !appointment) {
    console.error('Error fetching appointment for cancellation:', getError)
    return { success: false, error: 'No se encontró la cita especificada.' }
  }

  // Si ya está cancelada, no volvemos a enviar correos
  if (appointment.status === 'cancelled') {
    return { success: true, alreadyCancelled: true, appointment }
  }

  // 2. Cancelar en la base de datos
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Error updating appointment to cancelled:', updateError)
    return { success: false, error: 'Hubo un error al cancelar la cita en el sistema.' }
  }

  // 3. Obtener el perfil del dueño
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('email, google_refresh_token, google_calendar_id')
    .eq('id', appointment.clinics.owner_id)
    .maybeSingle()

  const formattedDate = format(new Date(appointment.start_time), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
  const serviceName = appointment.services?.name || 'Cita'
  const clinicName = appointment.clinics?.name || 'Estética'

  try {
    const resend = getResend()

    // 4. Enviar correo al Cliente
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: appointment.client_email,
      subject: `Cancelación de Cita: ${serviceName} en ${clinicName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #ef4444; margin-top: 0;">Tu cita ha sido cancelada</h2>
          <p>Te confirmamos que tu cita para <strong>${serviceName}</strong> en <strong>${clinicName}</strong> ha sido cancelada con éxito.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p><strong>Fecha y Hora original:</strong> ${formattedDate}</p>
          <br/>
          <p style="font-size: 14px; color: #71717a;">Si necesitas programar un nuevo espacio, puedes volver a visitar la página de reservas del negocio.</p>
          <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin-top: 20px;">Gracias por usar AgendaClick.</p>
        </div>
      `
    })

    // 5. Enviar correo al Dueño
    if (ownerProfile?.email) {
      await resend.emails.send({
        from: 'AgendaClick Notificaciones <no-reply@agendaclick.com.co>',
        to: ownerProfile.email,
        subject: `Cita Cancelada por Cliente: ${serviceName} - ${appointment.client_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <h2 style="color: #ef4444; margin-top: 0;">Un cliente ha cancelado su cita</h2>
            <p>El cliente <strong>${appointment.client_name}</strong> ha cancelado su cita de <strong>${serviceName}</strong> de forma autónoma.</p>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
            <p><strong>Fecha y Hora original:</strong> ${formattedDate}</p>
            <p><strong>Datos del cliente:</strong></p>
            <ul style="list-style: none; padding-left: 0;">
              <li><strong>Nombre:</strong> ${appointment.client_name}</li>
              <li><strong>Teléfono:</strong> ${appointment.client_phone}</li>
              <li><strong>Correo:</strong> ${appointment.client_email}</li>
            </ul>
            <br/>
            <p style="font-size: 14px; color: #71717a;">El espacio de esta cita ha sido liberado automáticamente en tu agenda y ya está disponible para nuevas reservas.</p>
          </div>
        `
      })
    }
  } catch (mailError) {
    console.error('Error sending cancellation emails:', mailError)
  }

  // 6. Eliminar el evento en Google Calendar si la integración está activa
  if (ownerProfile?.google_refresh_token && ownerProfile?.google_calendar_id) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      )
      oauth2Client.setCredentials({ refresh_token: ownerProfile.google_refresh_token })
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      // Buscar el evento en ese rango de fecha/hora
      const timeMin = new Date(appointment.start_time)
      timeMin.setMinutes(timeMin.getMinutes() - 5) // margen de 5 minutos antes
      const timeMax = new Date(appointment.end_time)
      timeMax.setMinutes(timeMax.getMinutes() + 5) // margen de 5 minutos después

      const res = await calendar.events.list({
        calendarId: ownerProfile.google_calendar_id,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true
      })

      const events = res.data.items || []
      const clientNameLower = appointment.client_name.toLowerCase()
      const clientEmailLower = appointment.client_email.toLowerCase()

      // Buscar el evento correcto en Google Calendar
      const matchedEvent = events.find(event => {
        const summaryMatch = event.summary?.toLowerCase().includes(clientNameLower)
        const descMatch = event.description?.toLowerCase().includes(clientEmailLower) ||
                           event.description?.includes(appointment.client_phone)
        return summaryMatch || descMatch
      })

      if (matchedEvent && matchedEvent.id) {
        await calendar.events.delete({
          calendarId: ownerProfile.google_calendar_id,
          eventId: matchedEvent.id
        })
        console.log('Google Calendar event deleted successfully:', matchedEvent.id)
      }
    } catch (calError) {
      console.error('Error removing event from Google Calendar on client cancel:', calError)
    }
  }

  revalidatePath('/dashboard')
  return { success: true, appointment }
}
