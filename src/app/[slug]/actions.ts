'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

  // TODO: Integración con Resend para notificar al dueño
  // Esta llamada a resend iría aquí (asíncrona)

  revalidatePath('/dashboard') // Refrescar el dashboard del dueño
  
  return { success: true }
}
