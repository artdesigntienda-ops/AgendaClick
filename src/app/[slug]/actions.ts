'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

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

export async function createAppointment(data: {
  clinicId: string
  serviceId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  startTime: string
  endTime: string
}) {
  const supabase = await createClient()

  // Guardar en la DB
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
    return { error: true }
  }

  // Obtener info adicional (correo del dueño y nombre del servicio) para el email
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
    // 1. Enviar correo al Dueño
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

    // 2. Enviar correo a la Clienta
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
    // No devolvemos error al frontend porque la cita sí se guardó en DB
  }

  revalidatePath('/dashboard') // Refrescar el dashboard del dueño
  
  return { success: true }
}
