'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Helper de seguridad para obtener el clinic_id y rol del usuario autenticado actual
 */
async function getAuthenticatedUserClinic() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, clinic_id')
    .eq('id', user.id)
    .maybeSingle()

  let clinicId = profile?.clinic_id

  if (!clinicId && profile?.role === 'owner') {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (clinic) clinicId = clinic.id
  }

  return { user, profile, clinicId, supabase }
}

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

export async function cancelAppointment(appointmentId: string) {
  const auth = await getAuthenticatedUserClinic()
  if (!auth || !auth.clinicId) {
    return { success: false, error: 'No autorizado' }
  }

  // Verificar que la cita pertenece a la clínica del usuario (Anti-IDOR)
  const { data: appointment } = await auth.supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)
    .maybeSingle()

  if (!appointment) {
    return { success: false, error: 'Cita no encontrada en tu negocio' }
  }

  const { error } = await auth.supabase
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

export async function updateAppointmentTime(appointmentId: string, newStartTime: string, newEndTime: string) {
  const auth = await getAuthenticatedUserClinic()
  if (!auth || !auth.clinicId) {
    return { success: false, error: 'No autorizado' }
  }

  // Verificar que la cita pertenece a la clínica del usuario (Anti-IDOR)
  const { data: appointment } = await auth.supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)
    .maybeSingle()

  if (!appointment) {
    return { success: false, error: 'Cita no encontrada en tu negocio' }
  }

  const { error } = await auth.supabase
    .from('appointments')
    .update({ start_time: newStartTime, end_time: newEndTime })
    .eq('id', appointmentId)

  if (error) {
    console.error('Error updating appointment time:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelAppointmentsForStaff(staffName: string | null, clinicSlug: string, dateIso: string) {
  const auth = await getAuthenticatedUserClinic()
  if (!auth || !auth.clinicId) {
    return { success: false, error: 'No autorizado' }
  }

  // 1. Obtener la clínica y VERIFICAR que coincida con la clínica del usuario autenticado (Anti-IDOR)
  const { data: clinic } = await auth.supabase
    .from('clinics')
    .select('id, slug')
    .eq('slug', clinicSlug)
    .eq('id', auth.clinicId)
    .maybeSingle()

  if (!clinic) {
    return { success: false, error: 'No tienes permisos para modificar este negocio' }
  }

  // 2. Si hay staffName, buscar el ID del staff dentro de esta clínica
  let staffId = null
  if (staffName) {
    const { data: staff } = await auth.supabase
      .from('profiles')
      .select('id')
      .eq('clinic_id', clinic.id)
      .eq('name', staffName)
      .maybeSingle()
    if (staff) staffId = staff.id
  }

  // 3. Obtener las citas afectadas
  const startOfDay = new Date(dateIso)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  let query = auth.supabase
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
  
  const { error: updateError } = await auth.supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .in('id', appointmentIds)
    .eq('clinic_id', clinic.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/dashboard')
  return { success: true, affected: affectedAppointments }
}

export async function assignStaffToAppointment(appointmentId: string, staffId: string) {
  const auth = await getAuthenticatedUserClinic()
  if (!auth || !auth.clinicId) {
    return { success: false, error: 'No autorizado' }
  }

  // Verificar que la cita pertenece a la clínica
  const { data: appointment } = await auth.supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)
    .maybeSingle()

  if (!appointment) {
    return { success: false, error: 'Cita no encontrada en tu negocio' }
  }

  // Verificar que el profesional pertenece a la misma clínica
  const { data: staff } = await auth.supabase
    .from('profiles')
    .select('id')
    .eq('id', staffId)
    .eq('clinic_id', auth.clinicId)
    .maybeSingle()

  if (!staff) {
    return { success: false, error: 'El profesional seleccionado no pertenece a tu negocio' }
  }

  const { error } = await auth.supabase
    .from('appointments')
    .update({ staff_id: staffId })
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)

  if (error) {
    console.error('Error assigning staff:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const auth = await getAuthenticatedUserClinic()
  if (!auth || !auth.clinicId) {
    return { success: false, error: 'No autorizado' }
  }

  // Verificar que la cita pertenece a la clínica
  const { data: appointment } = await auth.supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)
    .maybeSingle()

  if (!appointment) {
    return { success: false, error: 'Cita no encontrada en tu negocio' }
  }

  const { error } = await auth.supabase
    .from('appointments')
    .update({ status: status })
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)

  if (error) {
    console.error('Error updating status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function blockTime(data: {
  clinicId: string
  staffId: string | null
  startTime: string
  endTime: string
}) {
  const auth = await getAuthenticatedUserClinic()
  if (!auth || !auth.clinicId || auth.clinicId !== data.clinicId) {
    return { success: false, error: 'No autorizado para bloquear horarios en esta clínica' }
  }

  const { error } = await auth.supabase
    .from('appointments')
    .insert({
      clinic_id: auth.clinicId,
      staff_id: data.staffId || null,
      client_name: 'BLOQUEADO (Horario Reservado)',
      client_email: 'blocked@agendaclick.com.co',
      client_phone: '0000000000',
      start_time: data.startTime,
      end_time: data.endTime,
      status: 'confirmed'
    })

  if (error) {
    console.error('Error blocking time:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveAppointmentNotes(appointmentId: string, notes: string) {
  const auth = await getAuthenticatedUserClinic()
  if (!auth || !auth.clinicId) {
    return { success: false, error: 'No autorizado' }
  }

  // Verificar que la cita pertenece a la clínica
  const { data: appointment } = await auth.supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)
    .maybeSingle()

  if (!appointment) {
    return { success: false, error: 'Cita no encontrada en tu negocio' }
  }

  const { error } = await auth.supabase
    .from('appointments')
    .update({ notes: notes })
    .eq('id', appointmentId)
    .eq('clinic_id', auth.clinicId)

  if (error) {
    console.error('Error saving notes:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
