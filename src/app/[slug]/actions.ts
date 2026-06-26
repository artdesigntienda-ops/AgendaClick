'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  const ownerEmail = clinicInfo?.profiles?.email
  
  if (ownerEmail) {
    const formattedDate = format(new Date(data.startTime), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
    
    try {
      await resend.emails.send({
        from: 'AgendaClick Notificaciones <onboarding@resend.dev>', // Usar correo verificado en prod
        to: ownerEmail,
        subject: `¡Nueva Cita Agendada! - ${data.clientName}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #000;">Tienes una nueva cita en ${clinicInfo?.name}</h2>
            <p><strong>Cliente:</strong> ${data.clientName}</p>
            <p><strong>Teléfono:</strong> ${data.clientPhone}</p>
            <p><strong>Correo:</strong> ${data.clientEmail}</p>
            <p><strong>Servicio:</strong> ${serviceInfo?.name}</p>
            <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
            <br/>
            <p>El cliente también tiene la instrucción de contactarte vía WhatsApp.</p>
          </div>
        `
      })
    } catch (e) {
      console.error('Error sending email via Resend:', e)
      // No devolvemos error al cliente porque la cita sí se guardó en DB
    }
  }

  revalidatePath('/dashboard') // Refrescar el dashboard del dueño
  
  return { success: true }
}
