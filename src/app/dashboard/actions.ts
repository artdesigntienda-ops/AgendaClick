'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markTutorialAsSeen() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase
      .from('profiles')
      .update({ has_seen_tutorial: true })
      .eq('id', user.id)
  }
}
import { revalidatePath } from 'next/cache'

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)

  if (error) {
    console.error('Error canceling appointment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelAppointmentsForStaff(staffName: string | null, clinicSlug: string, dateIso: string) {
  const supabase = await createClient()

  // 1. Obtener la clínica
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('slug', clinicSlug)
    .single()

  if (!clinic) return { success: false, error: 'Clínica no encontrada' }

  // 2. Si hay staffName, buscar el ID del staff
  let staffId = null
  if (staffName) {
    const { data: staff } = await supabase
      .from('profiles')
      .select('id')
      .eq('clinic_id', clinic.id)
      .eq('name', staffName)
      .single()
    if (staff) staffId = staff.id
  }

  // 3. Obtener las citas afectadas
  const startOfDay = new Date(dateIso)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  let query = supabase
    .from('appointments')
    .select('id, client_name, client_phone, start_time, services(name)')
    .eq('clinic_id', clinic.id)
    .gte('start_time', startOfDay.toISOString())
    .lt('start_time', endOfDay.toISOString())
    .neq('status', 'cancelled')

  if (staffId) {
    query = query.eq('staff_id', staffId)
  }

  const { data: affectedAppointments, error: queryError } = await query

  if (queryError || !affectedAppointments) {
    return { success: false, error: 'No se pudieron recuperar las citas afectadas' }
  }

  if (affectedAppointments.length === 0) {
    return { success: true, affected: [] }
  }

  // 4. Cancelarlas
  const appointmentIds = affectedAppointments.map(a => a.id)
  
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .in('id', appointmentIds)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/dashboard')

  return { success: true, affected: affectedAppointments }
}
