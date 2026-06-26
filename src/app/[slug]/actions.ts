'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export async function sendOtpCode(email: string, clientName: string) {
  const supabase = await createClient()
  
  // Generar código de 6 dígitos
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Fecha de expiración (10 min)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)

  // Guardar en base de datos
  const { error } = await supabaseAdmin.from('otp_verifications').insert({
    email: email.trim().toLowerCase(),
    otp_code: otpCode,
    expires_at: expiresAt.toISOString()
  })

  if (error) {
    console.error('Error saving OTP:', error)
    return { success: false, error: 'No se pudo generar el código. Intenta nuevamente.' }
  }

  try {
    await resend.emails.send({
      from: 'AgendaClick Seguridad <onboarding@resend.dev>',
      to: email.trim().toLowerCase(),
      subject: `Tu código de verificación es ${otpCode}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">Hola ${clientName},</h2>
          <p>Para confirmar tu cita, ingresa el siguiente código de verificación de 6 dígitos:</p>
          <div style="font-size: 32px; font-weight: bold; tracking: 4px; padding: 20px; text-align: center; background: #f4f4f5; border-radius: 8px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este correo.</p>
        </div>
      `
    })
    return { success: true }
  } catch (e) {
    console.error('Error sending OTP via Resend:', e)
    return { success: false, error: 'Error enviando el correo. Revisa que tu dirección sea correcta.' }
  }
}

export async function createAppointment(data: {
  clinicId: string
  serviceId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  startTime: string
  endTime: string
}, otpCode: string) {
  const supabase = await createClient()

  // 1. Validar OTP
  const normalizedEmail = data.clientEmail.trim().toLowerCase()
  const { data: verifications, error: otpError } = await supabaseAdmin
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

  // 2. Guardar en la DB
  const { error } = await supabase.from('appointments').insert({
    clinic_id: data.clinicId,
    service_id: data.serviceId,
    client_name: data.clientName,
    client_email: data.clientEmail,
    client_phone: data.clientPhone,
    start_time: data.startTime,
    end_time: data.endTime,
    status: 'pending' // En MVP todas inician como pending
  })

  if (error) {
    console.error('Error creating appointment:', error)
    return { error: true, message: 'Error interno guardando la cita.' }
  }

  // Borramos el OTP que ya se usó para evitar reusos (fire and forget)
  supabaseAdmin.from('otp_verifications').delete().eq('id', verifications[0].id).then()

  // 3. Obtener info adicional (correo del dueño y nombre del servicio) para el email
  const { data: clinicInfo } = await supabase
    .from('clinics')
    .select('name, profiles(email)')
    .eq('id', data.clinicId)
    .single()

  const { data: serviceInfo } = await supabase
    .from('services')
    .select('name')
    .eq('id', data.serviceId)
    .single()

  const ownerEmail = (clinicInfo?.profiles as any)?.email || (Array.isArray(clinicInfo?.profiles) ? (clinicInfo?.profiles as any)[0]?.email : null)
  const serviceName = serviceInfo?.name || 'Cita'
  const clinicName = clinicInfo?.name || 'Estética'
  
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
    content: Buffer.from(icsContent).toString('base64'),
    contentType: 'text/calendar'
  }

  const formattedDate = format(new Date(data.startTime), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
  
  try {
    // 4. Enviar correo al Dueño
    if (ownerEmail) {
      await resend.emails.send({
        from: 'AgendaClick Notificaciones <onboarding@resend.dev>',
        to: ownerEmail,
        subject: `¡Nueva Cita! ${serviceName} - ${data.clientName}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
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
        attachments: [attachment]
      })
    }

    // 5. Enviar correo a la Clienta
    await resend.emails.send({
      from: 'AgendaClick <onboarding@resend.dev>',
      to: data.clientEmail,
      subject: `Reserva Confirmada en ${clinicName}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">¡Hola ${data.clientName}, tu reserva está confirmada!</h2>
          <p>Has agendado exitosamente tu cita en <strong>${clinicName}</strong>.</p>
          <p><strong>Servicio:</strong> ${serviceName}</p>
          <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
          <br/>
          <p>Abre el archivo adjunto (cita.ics) para guardarlo en tu calendario.</p>
          <p>¡Gracias por usar AgendaClick!</p>
        </div>
      `,
      attachments: [attachment]
    })
  } catch (e) {
    console.error('Error sending emails via Resend:', e)
  }

  revalidatePath('/dashboard')
  
  return { success: true }
}
