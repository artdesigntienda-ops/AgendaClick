'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireActiveSubscription } from '@/utils/billingGuard'
import crypto from 'crypto'

export async function removeStaffMember(staffId: string) {
  await requireActiveSubscription()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  // 1. Verificar que el usuario actual es dueño
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .maybeSingle()

  if (ownerProfile?.role !== 'owner' || !ownerProfile.clinic_id) {
    throw new Error('Solo el administrador puede desvincular profesionales.')
  }

  // 2. Verificar que el profesional pertenece a esta clínica y no es el dueño mismo
  if (staffId === user.id) {
    throw new Error('No puedes desvincularte a ti mismo como dueño del negocio.')
  }

  const adminClient = createAdminClient()
  const { data: targetStaff } = await adminClient
    .from('profiles')
    .select('id, clinic_id, role')
    .eq('id', staffId)
    .eq('clinic_id', ownerProfile.clinic_id)
    .maybeSingle()

  if (!targetStaff) {
    throw new Error('El profesional no fue encontrado en tu negocio.')
  }

  // 3. Desvincular al profesional de la clínica
  const { error } = await adminClient
    .from('profiles')
    .update({
      clinic_id: null,
      is_bookable: false
    })
    .eq('id', staffId)
    .eq('clinic_id', ownerProfile.clinic_id)

  if (error) {
    console.error('Error removing staff:', error)
    throw new Error('No se pudo desvincular al profesional.')
  }

  revalidatePath('/dashboard/staff')
}

export async function addStaffMemberByEmail(email: string, name: string) {
  await requireActiveSubscription()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  // 1. Verificar que el usuario actual es dueño
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .maybeSingle()

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
    .maybeSingle()

  const currentStaff = count || 0
  const limit = clinic?.staff_limit || 1

  if (currentStaff >= limit) {
    throw new Error(`Has alcanzado el límite de ${limit} profesionales de tu plan actual. Mejora tu plan en Facturación.`)
  }

  const cleanEmail = email.toLowerCase().trim()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Por favor ingresa un correo electrónico válido.')
  }

  const cleanName = name?.trim() || cleanEmail.split('@')[0]

  // 3. PREVENCIÓN DE SECUESTRO DE CUENTAS (ANTI-HIJACKING):
  // Verificar si el correo ya tiene un perfil en el sistema
  const adminClient = createAdminClient()
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, name, clinic_id, role')
    .eq('email', cleanEmail)
    .maybeSingle()

  if (existingProfile) {
    if (existingProfile.clinic_id === ownerProfile.clinic_id) {
      throw new Error('Este profesional ya forma parte de tu equipo.')
    }

    if (existingProfile.clinic_id && existingProfile.clinic_id !== ownerProfile.clinic_id) {
      throw new Error('Este correo ya está registrado y vinculado a otro negocio en AgendaClick.')
    }

    // Verificar si es dueño de otra clínica
    const { data: ownClinic } = await adminClient
      .from('clinics')
      .select('id, name')
      .eq('owner_id', existingProfile.id)
      .maybeSingle()

    if (ownClinic) {
      throw new Error(`Este correo es el administrador de "${ownClinic.name}". No puede ser asignado como empleado.`)
    }

    // Si tiene perfil sin clínica vinculada, lo asociamos a esta clínica
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        clinic_id: ownerProfile.clinic_id,
        role: 'staff',
        is_bookable: true,
        name: cleanName
      })
      .eq('id', existingProfile.id)

    if (updateError) {
      console.error('Error asociando perfil libre:', updateError)
      throw new Error('Error al vincular al profesional.')
    }
  } else {
    // Si no tiene perfil, creamos un perfil pre-registrado seguro
    const tempId = crypto.randomUUID()
    const { error: insertError } = await adminClient
      .from('profiles')
      .insert([{
        id: tempId,
        email: cleanEmail,
        name: cleanName,
        role: 'staff',
        clinic_id: ownerProfile.clinic_id,
        is_bookable: true,
        is_on_break: false,
        has_seen_tutorial: false
      }])

    if (insertError) {
      console.error('Error insertando nuevo perfil staff:', insertError)
      throw new Error('Error al registrar el profesional.')
    }
  }

  revalidatePath('/dashboard/staff')
}
