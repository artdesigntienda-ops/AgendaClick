'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { google } from 'googleapis'
import { generateCancellationHash, verifyCancellationHash, decryptSensitiveToken } from '@/utils/securityTokens'

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
  
  // 1.5 Rate Limiting: Evitar spam de códigos al mismo correo (mínimo 60 segundos)
  const normalizedEmail = email.trim().toLowerCase()
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { data: recentOtp } = await getSupabaseAdmin()
    .from('otp_verifications')
    .select('id')
    .eq('email', normalizedEmail)
    .gt('created_at', oneMinuteAgo)
    .limit(1)

  if (recentOtp && recentOtp.length > 0) {
    return { success: false, error: 'Por favor espera 1 minuto antes de solicitar otro código de seguridad.' }
  }

  // Generar código de 6 dígitos
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Fecha de expiración (5 min)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 5)

  // Guardar en base de datos
  const { error } = await getSupabaseAdmin().from('otp_verifications').insert({
    email: normalizedEmail,
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

  // 0. Validar existencia y suscripción activa o prueba vigente del negocio
  const { data: clinicInfo } = await getSupabaseAdmin()
    .from('clinics')
    .select('id, name, owner_id, subscription_status, subscription_ends_at')
    .eq('id', data.clinicId)
    .maybeSingle()

  if (!clinicInfo) {
    return { error: true, message: 'Negocio no encontrado.' }
  }

  const now = new Date()
  const endsAt = clinicInfo.subscription_ends_at ? new Date(clinicInfo.subscription_ends_at) : null
  const isExpired = endsAt ? now > endsAt : false
  if (clinicInfo.subscription_status !== 'active' && (clinicInfo.subscription_status !== 'trial' || isExpired)) {
    return { error: true, message: 'Las reservas en línea para este negocio se encuentran temporalmente pausadas.' }
  }

  // 0.5 Validar que el profesional asignado pertenece a este negocio
  if (data.staffId) {
    const { data: staffMember } = await getSupabaseAdmin()
      .from('profiles')
      .select('id')
      .eq('id', data.staffId)
      .eq('clinic_id', data.clinicId)
      .maybeSingle()

    if (!staffMember) {
      return { error: true, message: 'El profesional seleccionado no pertenece a este negocio.' }
    }
  }

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

  // 1.8 Calcular el precio total de forma segura desde la base de datos (Anti-Tampering)
  const serviceIdsToQuery = data.serviceIds && data.serviceIds.length > 0
    ? data.serviceIds
    : [data.serviceId]

  const { data: dbServices } = await getSupabaseAdmin()
    .from('services')
    .select('id, price, name')
    .in('id', serviceIdsToQuery)
    .eq('clinic_id', data.clinicId)

  let calculatedTotalPrice = 0
  let calculatedServiceNames = ''
  if (dbServices && dbServices.length > 0) {
    calculatedTotalPrice = dbServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
    calculatedServiceNames = dbServices.map(s => s.name).join(', ')
  }

  // 1.9 Calcular comisión estimada ganada por el profesional si aplica
  let calculatedCommissionEarned = 0
  if (data.staffId) {
    const { data: staffMember } = await getSupabaseAdmin()
      .from('profiles')
      .select('default_commission_rate, bank_payout_info, role')
      .eq('id', data.staffId)
      .maybeSingle()

    if (staffMember && staffMember.role !== 'owner') {
      const comp = staffMember.bank_payout_info?.compensation
      const compType = comp?.compensation_type || 'percentage'
      if (compType === 'percentage') {
        const rate = comp?.commission_rate !== undefined 
          ? Number(comp.commission_rate) 
          : (staffMember.default_commission_rate !== undefined ? Number(staffMember.default_commission_rate) : 50)
        calculatedCommissionEarned = Math.round(calculatedTotalPrice * (rate / 100))
      }
    }
  }

  // 2. Guardar en la DB (usamos admin para saltar RLS, ya que la legitimidad fue validada por el OTP)
  const appointmentPayload: any = {
    clinic_id: data.clinicId,
    service_id: data.serviceId,
    staff_id: data.staffId || null,
    client_name: data.clientName,
    client_email: data.clientEmail,
    client_phone: data.clientPhone,
    start_time: data.startTime,
    end_time: data.endTime,
    status: 'confirmed',
    total_price: calculatedTotalPrice,
    commission_earned: calculatedCommissionEarned
  }

  const { data: newApp, error } = await getSupabaseAdmin()
    .from('appointments')
    .insert(appointmentPayload)
    .select('id')
    .maybeSingle()

  if (error || !newApp) {
    console.error('Error creating appointment:', error)
    if ((error as any)?.code === '23P01' || error?.message?.includes('prevent_overlapping_appointments')) {
      return { error: true, message: 'Lo sentimos, este horario acaba de ser ocupado. Por favor elige otro turno.' }
    }
    return { error: true, message: 'Error interno guardando la cita.' }
  }

  const appointmentId = newApp.id

  // Borramos el OTP que ya se usó para evitar reusos (fire and forget)
  getSupabaseAdmin().from('otp_verifications').delete().eq('id', verifications[0].id).then()

  // 3. Obtener info del servicio si no vino en dbServices
  const serviceName = calculatedServiceNames || data.serviceNames || 'Cita'
  const clinicName = clinicInfo?.name || 'AgendaClick'
  
  // Buscar el perfil adecuado (profesional asignado o dueño de la clínica) que tenga Google Calendar conectado
  let targetProfile: any = null

  if (data.staffId) {
    const { data: staffProf } = await getSupabaseAdmin()
      .from('profiles')
      .select('email, google_refresh_token, google_calendar_id')
      .eq('id', data.staffId)
      .maybeSingle()
    if (staffProf?.google_refresh_token) {
      targetProfile = staffProf
    }
  }

  if (!targetProfile && clinicInfo?.owner_id) {
    const { data: ownerProf } = await getSupabaseAdmin()
      .from('profiles')
      .select('email, google_refresh_token, google_calendar_id')
      .eq('id', clinicInfo.owner_id)
      .maybeSingle()
    targetProfile = ownerProf
  }

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
  
  // Extraemos tokens de google si existen (descifrado seguro con AES-256-GCM)
  const ownerEmail = targetProfile?.email || null
  const googleRefreshToken = decryptSensitiveToken(targetProfile?.google_refresh_token || null)
  const googleCalendarId = targetProfile?.google_calendar_id || null

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

    const cancelToken = generateCancellationHash(appointmentId, data.clientEmail)
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://agendaclick.com.co'}/cancelar/${appointmentId}?token=${cancelToken}`

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

export async function cancelAppointmentFromClient(appointmentId: string, token?: string) {
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

  // 1.5 VALIDACIÓN CRÍTICA DE AUTORIZACIÓN (Anti-IDOR):
  // Verificar token criptográfico del cliente O sesión activa del negocio
  const isTokenValid = verifyCancellationHash(appointment.id, appointment.client_email, token)
  let isAuthorizedBusinessUser = false

  if (!isTokenValid) {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (user) {
      if (appointment.clinics?.owner_id === user.id) {
        isAuthorizedBusinessUser = true
      } else {
        const { data: staffMember } = await sessionClient
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .eq('clinic_id', appointment.clinic_id)
          .maybeSingle()
        if (staffMember) {
          isAuthorizedBusinessUser = true
        }
      }
    }
  }

  if (!isTokenValid && !isAuthorizedBusinessUser) {
    console.warn(`[Seguridad] Intento no autorizado de cancelar cita ID: ${appointmentId}`)
    return { success: false, error: 'Enlace de cancelación no válido o expirado.' }
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

  // 3. Obtener el perfil del dueño y del profesional asignado para notificaciones y calendario
  let staffProfile: any = null
  if (appointment.staff_id) {
    const { data: sProf } = await supabase
      .from('profiles')
      .select('email, google_refresh_token, google_calendar_id')
      .eq('id', appointment.staff_id)
      .maybeSingle()
    staffProfile = sProf
  }

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

  // 6. Eliminar el evento en Google Calendar si la integración está activa (en calendario de staff o de dueño)
  const calendarProfilesToClean = []
  if (staffProfile?.google_refresh_token && staffProfile?.google_calendar_id) {
    calendarProfilesToClean.push(staffProfile)
  }
  if (ownerProfile?.google_refresh_token && ownerProfile?.google_calendar_id) {
    if (!calendarProfilesToClean.some(p => p.google_calendar_id === ownerProfile.google_calendar_id)) {
      calendarProfilesToClean.push(ownerProfile)
    }
  }

  for (const calProf of calendarProfilesToClean) {
    const rawRefreshToken = decryptSensitiveToken(calProf.google_refresh_token)
    if (rawRefreshToken && calProf.google_calendar_id) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        )
        oauth2Client.setCredentials({ refresh_token: rawRefreshToken })
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        // Buscar el evento en ese rango de fecha/hora
        const timeMin = new Date(appointment.start_time)
        timeMin.setMinutes(timeMin.getMinutes() - 5) // margen de 5 minutos antes
        const timeMax = new Date(appointment.end_time)
        timeMax.setMinutes(timeMax.getMinutes() + 5) // margen de 5 minutos después

        const res = await calendar.events.list({
          calendarId: calProf.google_calendar_id,
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
            calendarId: calProf.google_calendar_id,
            eventId: matchedEvent.id
          })
          console.log(`Google Calendar event deleted successfully from calendar ${calProf.google_calendar_id}:`, matchedEvent.id)
        }
      } catch (calError) {
        console.error('Error removing event from Google Calendar on client cancel:', calError)
      }
    }
  }

  revalidatePath('/dashboard')
  return { success: true, appointment }
}

/**
 * Consulta de horarios disponibles para reprogramar una cita existente
 */
export async function getAvailableRescheduleSlots(
  appointmentId: string, 
  targetDateIso: string, 
  token?: string
) {
  const supabase = getSupabaseAdmin()

  // 1. Obtener cita y clínica
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, client_email, clinic_id, staff_id, services(duration_minutes), clinics(schedule)')
    .eq('id', appointmentId)
    .maybeSingle()

  if (!appointment) return { success: false, error: 'Cita no encontrada' }

  // Validar token anti-IDOR
  const isTokenValid = verifyCancellationHash(appointment.id, appointment.client_email, token)
  if (!isTokenValid) {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado' }
  }

  // 2. Horario del día según la clínica
  const targetDate = new Date(targetDateIso)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = dayNames[targetDate.getDay()]
  const clinicSchedule = (appointment.clinics as any)?.schedule || {}
  const daySchedule = clinicSchedule[dayName]

  if (!daySchedule || !daySchedule.isOpen) {
    return { success: true, slots: [], message: 'El negocio no labora en este día' }
  }

  // 3. Duración del servicio en minutos
  const durationMinutes = (appointment.services as any)?.duration_minutes || 30

  // 4. Citas existentes ese día para la clínica y staff
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  let existingQuery = supabase
    .from('appointments')
    .select('id, start_time, end_time, staff_id')
    .eq('clinic_id', appointment.clinic_id)
    .neq('status', 'cancelled')
    .neq('id', appointment.id)
    .gte('start_time', startOfDay.toISOString())
    .lt('start_time', endOfDay.toISOString())

  if (appointment.staff_id) {
    existingQuery = existingQuery.or(`staff_id.eq.${appointment.staff_id},staff_id.is.null`)
  }

  const { data: existingApts } = await existingQuery
  const existingList = existingApts || []

  // 5. Generar slots de tiempo
  const [openH, openM] = (daySchedule.openTime || '08:00').split(':').map(Number)
  const [closeH, closeM] = (daySchedule.closeTime || '18:00').split(':').map(Number)

  let slotCursor = new Date(targetDate)
  slotCursor.setHours(openH, openM, 0, 0)

  const closingTime = new Date(targetDate)
  closingTime.setHours(closeH, closeM, 0, 0)

  const now = new Date()
  const slots: Array<{ startTime: string; endTime: string; label: string }> = []

  while (slotCursor < closingTime) {
    const slotEnd = new Date(slotCursor.getTime() + durationMinutes * 60 * 1000)
    if (slotEnd > closingTime) break

    // Si la fecha es hoy, no permitir horarios en el pasado (+20 min de margen)
    if (slotCursor > new Date(now.getTime() + 20 * 60 * 1000)) {
      // Verificar descanso
      let inBreak = false
      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const [bStartH, bStartM] = daySchedule.breakStart.split(':').map(Number)
        const [bEndH, bEndM] = daySchedule.breakEnd.split(':').map(Number)
        const breakStart = new Date(targetDate)
        breakStart.setHours(bStartH, bStartM, 0, 0)
        const breakEnd = new Date(targetDate)
        breakEnd.setHours(bEndH, bEndM, 0, 0)

        if (slotCursor < breakEnd && slotEnd > breakStart) {
          inBreak = true
        }
      }

      // Verificar si choca con otra cita
      const hasOverlap = existingList.some(apt => {
        const aStart = new Date(apt.start_time)
        const aEnd = new Date(apt.end_time)
        return slotCursor < aEnd && slotEnd > aStart
      })

      if (!inBreak && !hasOverlap) {
        const hh = String(slotCursor.getHours()).padStart(2, '0')
        const mm = String(slotCursor.getMinutes()).padStart(2, '0')
        slots.push({
          startTime: slotCursor.toISOString(),
          endTime: slotEnd.toISOString(),
          label: `${hh}:${mm}`
        })
      }
    }

    slotCursor = new Date(slotCursor.getTime() + 30 * 60 * 1000)
  }

  return { success: true, slots }
}

/**
 * Reprogramación autónoma de cita por parte del cliente
 */
export async function rescheduleAppointmentFromClient(
  appointmentId: string,
  newStartTime: string,
  newEndTime: string,
  token?: string
) {
  const supabase = getSupabaseAdmin()

  // 1. Obtener la cita
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, services(name, duration_minutes), clinics(name, owner_id)')
    .eq('id', appointmentId)
    .maybeSingle()

  if (!appointment) {
    return { success: false, error: 'Cita no encontrada.' }
  }

  // 2. Validar token anti-IDOR
  const isTokenValid = verifyCancellationHash(appointment.id, appointment.client_email, token)
  let isAuthorized = isTokenValid

  if (!isAuthorized) {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (user && (appointment.clinics?.owner_id === user.id)) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return { success: false, error: 'Enlace no autorizado o token de seguridad inválido.' }
  }

  // 3. Validar disponibilidad del nuevo horario (anti-colisión)
  let overlapQuery = supabase
    .from('appointments')
    .select('id')
    .eq('clinic_id', appointment.clinic_id)
    .neq('status', 'cancelled')
    .neq('id', appointmentId)
    .lt('start_time', newEndTime)
    .gt('end_time', newStartTime)

  if (appointment.staff_id) {
    overlapQuery = overlapQuery.or(`staff_id.eq.${appointment.staff_id},staff_id.is.null`)
  }

  const { data: overlapping } = await overlapQuery
  if (overlapping && overlapping.length > 0) {
    return { success: false, error: 'El horario seleccionado acaba de ser ocupado. Por favor elige otro turno.' }
  }

  // 4. Actualizar en Supabase
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      start_time: newStartTime,
      end_time: newEndTime,
      status: 'confirmed'
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('Error al actualizar fecha de cita:', updateError)
    return { success: false, error: 'No se pudo actualizar el horario de la cita.' }
  }

  // 5. Enviar correos de confirmación
  const serviceName = appointment.services?.name || 'Cita'
  const clinicName = appointment.clinics?.name || 'AgendaClick'
  const formattedNewDate = format(new Date(newStartTime), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })

  const appointmentUid = `${appointmentId}@agendaclick.com`
  const icsContent = generateICS(
    appointmentUid,
    newStartTime,
    newEndTime,
    `${serviceName} - ${appointment.client_name}`,
    `Cita reprogramada vía AgendaClick.\nCliente: ${appointment.client_name}\nTeléfono: ${appointment.client_phone}`,
    clinicName
  )

  try {
    const resend = getResend()
    const cancelToken = generateCancellationHash(appointmentId, appointment.client_email)
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://agendaclick.com.co'}/cancelar/${appointmentId}?token=${cancelToken}`

    // Correo al cliente
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: appointment.client_email,
      subject: `Cita Reprogramada con éxito en ${clinicName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #10b981; margin-top: 0;">¡Tu cita ha sido reprogramada con éxito!</h2>
          <p>Te confirmamos que tu cita para <strong>${serviceName}</strong> en <strong>${clinicName}</strong> ha sido reprogramada.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p><strong>Nuevo Horario Confirmado:</strong> ${formattedNewDate}</p>
          <br/>
          <p style="font-size: 14px; color: #71717a;">Abre el archivo adjunto (cita.ics) para guardar tu nuevo horario en tu calendario de Google o Apple.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
          <p style="font-size: 13px; color: #71717a; text-align: center; margin-bottom: 0;">
            ¿Necesitas hacer otro cambio? 
            <a href="${cancelUrl}" style="color: #ef4444; font-weight: bold; text-decoration: underline; margin-left: 5px;">Gestiona tu cita aquí</a>
          </p>
        </div>
      `,
      attachments: [{
        filename: 'cita-reprogramada.ics',
        content: Buffer.from(icsContent).toString('base64'),
        contentType: 'text/calendar'
      }]
    })

    // Correo al dueño
    const { data: ownerProf } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', appointment.clinics.owner_id)
      .maybeSingle()

    if (ownerProf?.email) {
      await resend.emails.send({
        from: 'AgendaClick Notificaciones <no-reply@agendaclick.com.co>',
        to: ownerProf.email,
        subject: `Cita Reprogramada por Cliente: ${serviceName} - ${appointment.client_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <h2 style="color: #10b981; margin-top: 0;">Un cliente reprogramó su cita</h2>
            <p>El cliente <strong>${appointment.client_name}</strong> ha actualizado el horario de su cita para <strong>${serviceName}</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
            <p><strong>Nuevo Horario:</strong> ${formattedNewDate}</p>
            <p><strong>Datos del cliente:</strong> ${appointment.client_name} (${appointment.client_phone})</p>
          </div>
        `
      })
    }
  } catch (mailErr) {
    console.error('Error enviando correos de reprogramación:', mailErr)
  }

  revalidatePath('/dashboard')
  return { success: true, newStartTime, newEndTime }
}
