'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
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
    if (error.message?.includes('notes') || (error as any).code === '42703') {
      return { success: false, error: 'La funcionalidad de notas internas requiere la columna en la base de datos.' }
    }
    return { success: false, error: 'No se pudo guardar la nota.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export interface QuickSetupInput {
  name: string
  businessType: string
  phone: string
  services: Array<{
    name: string
    price: number
    duration_minutes: number
  }>
}

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'mi-negocio'
}

export async function quickSetupClinic(data: QuickSetupInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para configurar tu negocio' }
  }

  const adminClient = createAdminClient()

  // 1. Obtener perfil
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, clinic_id, role')
    .eq('id', user.id)
    .maybeSingle()

  const rawSlug = slugify(data.name)
  let candidateSlug = rawSlug
  let counter = 1

  // Verificar unicidad del slug en clinics
  while (true) {
    const { data: existing } = await adminClient
      .from('clinics')
      .select('id, owner_id')
      .eq('slug', candidateSlug)
      .maybeSingle()

    // Si no existe, o si pertenece al usuario actual, el slug es válido
    if (!existing || existing.owner_id === user.id) {
      break
    }
    counter++
    candidateSlug = `${rawSlug}-${counter}`
  }

  const defaultSchedule = {
    monday: { isOpen: true, openTime: '09:00', closeTime: '19:00', breakStart: null, breakEnd: null },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00', breakStart: null, breakEnd: null },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00', breakStart: null, breakEnd: null },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00', breakStart: null, breakEnd: null },
    friday: { isOpen: true, openTime: '09:00', closeTime: '19:00', breakStart: null, breakEnd: null },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00', breakStart: null, breakEnd: null },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '14:00', breakStart: null, breakEnd: null }
  }

  // Buscar si ya tiene una clínica
  let clinicId = profile?.clinic_id
  if (!clinicId) {
    const { data: existingClinic } = await adminClient
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (existingClinic) clinicId = existingClinic.id
  }

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  let finalClinicId = clinicId

  if (clinicId) {
    // Actualizar clínica existente
    const { error: updateErr } = await adminClient
      .from('clinics')
      .update({
        name: data.name,
        slug: candidateSlug,
        phone: data.phone,
        business_type: data.businessType,
        schedule: defaultSchedule
      })
      .eq('id', clinicId)

    if (updateErr) {
      console.error('Error updating clinic in quickSetup:', updateErr)
      return { success: false, error: updateErr.message }
    }
  } else {
    // Crear nueva clínica con 14 días de prueba
    const { data: newClinic, error: insertErr } = await adminClient
      .from('clinics')
      .insert([{
        owner_id: user.id,
        name: data.name,
        slug: candidateSlug,
        phone: data.phone,
        business_type: data.businessType,
        schedule: defaultSchedule,
        subscription_status: 'trial',
        subscription_ends_at: trialEndsAt.toISOString(),
        plan_type: 'independiente',
        staff_limit: 1
      }])
      .select('id')
      .single()

    if (insertErr || !newClinic) {
      console.error('Error inserting clinic in quickSetup:', insertErr)
      return { success: false, error: insertErr?.message || 'Error al crear la clínica' }
    }

    finalClinicId = newClinic.id

    // Vincular al perfil
    await adminClient
      .from('profiles')
      .update({
        clinic_id: finalClinicId,
        role: 'owner'
      })
      .eq('id', user.id)
  }

  // Insertar servicios seleccionados si existen
  if (data.services && data.services.length > 0 && finalClinicId) {
    const serviceRows = data.services.map(s => ({
      clinic_id: finalClinicId,
      name: s.name,
      price: Number(s.price) || 0,
      duration_minutes: Number(s.duration_minutes) || 30
    }))

    const { error: srvErr } = await adminClient
      .from('services')
      .insert(serviceRows)

    if (srvErr) {
      console.warn('Advertencia al insertar servicios sugeridos:', srvErr)
    }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/services')
  revalidatePath(`/${candidateSlug}`)

  return { 
    success: true, 
    slug: candidateSlug,
    clinicId: finalClinicId 
  }
}
