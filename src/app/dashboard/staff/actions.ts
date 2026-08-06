'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireActiveSubscription } from '@/utils/billingGuard'
import crypto from 'crypto'

export async function removeStaffMember(staffId: string) {
  await requireActiveSubscription()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify the current user is the owner of the clinic this staff belongs to
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (ownerProfile?.role !== 'owner') {
    throw new Error('Solo el administrador puede eliminar profesionales.')
  }

  // Remove the staff member from the clinic
  const { error } = await supabase
    .from('profiles')
    .update({ clinic_id: null, role: 'owner', is_bookable: false }) // Reset them to an independent user
    .eq('id', staffId)
    .eq('clinic_id', ownerProfile.clinic_id)

  if (error) {
    console.error('Error removing staff:', error)
    throw new Error('No se pudo eliminar al profesional.')
  }

  revalidatePath('/dashboard/staff')
}

export async function addStaffMemberByEmail(email: string, name: string) {
  await requireActiveSubscription()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // 1. Verificar que el usuario actual es dueño
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (ownerProfile?.role !== 'owner' || !ownerProfile.clinic_id) {
    throw new Error('Solo el administrador puede agregar profesionales.')
  }

  // 2. Contar cuántos empleados tiene actualmente
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', ownerProfile.clinic_id)
    .neq('role', 'owner')

  // Obtener el límite de la clínica
  const { data: clinic } = await supabase
    .from('clinics')
    .select('staff_limit')
    .eq('id', ownerProfile.clinic_id)
    .single()

  const currentStaff = count || 0
  const limit = clinic?.staff_limit || 0

  if (currentStaff >= limit) {
    throw new Error(`Has alcanzado el límite de ${limit} profesionales en tu plan actual.`)
  }

  const cleanEmail = email.toLowerCase().trim()

  // 3. Verificar si el correo ya tiene un perfil
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, name, clinic_id')
    .eq('email', cleanEmail)
    .maybeSingle()

  if (existingProfile) {
    if (existingProfile.clinic_id === ownerProfile.clinic_id) {
      throw new Error('Este profesional ya forma parte de tu estética.')
    }
    // Si ya tiene perfil, simplemente actualizamos su clinic_id y role a staff
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        clinic_id: ownerProfile.clinic_id,
        role: 'staff',
        is_bookable: true,
        name: name || existingProfile.name
      })
      .eq('id', existingProfile.id)

    if (updateError) {
      console.error(updateError)
      throw new Error('Error al asociar el profesional existente.')
    }
  } else {
    // Si no tiene perfil, creamos un perfil pre-registrado con un UUID aleatorio
    const tempId = crypto.randomUUID()
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: tempId,
        email: cleanEmail,
        name: name,
        role: 'staff',
        clinic_id: ownerProfile.clinic_id,
        is_bookable: true,
        is_on_break: false,
        has_seen_tutorial: false
      }])

    if (insertError) {
      console.error(insertError)
      throw new Error('Error al registrar el correo del profesional.')
    }
  }

  revalidatePath('/dashboard/staff')
}
