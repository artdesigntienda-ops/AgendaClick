import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { startOfToday } from 'date-fns'
import DashboardClient from './DashboardClient'
import { requireActiveSubscription } from '@/utils/billingGuard'

export default async function DashboardOverview() {
  await requireActiveSubscription()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Obtener la clínica (o la clínica en la que trabaja si es staff)
  let { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .maybeSingle()

  const cookieStore = await cookies()
  const cookieInvite = cookieStore.get('invite_code')?.value

  // FALLBACK / CREACIÓN AUTOMÁTICA DE PERFIL SI NO EXISTE
  if (!profile) {
    const inviteCode = user.user_metadata?.invite_code || cookieInvite || null
    let resolvedRole = 'owner'
    let resolvedClinicId = null

    if (inviteCode) {
      let slug = inviteCode
      if (inviteCode.endsWith('-staff')) {
        slug = inviteCode.slice(0, -6)
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inviteCode)

      let query = supabase.from('clinics').select('id')
      if (isUuid) {
        query = query.eq('id', inviteCode)
      } else {
        query = query.eq('slug', slug)
      }

      const { data: clinicExists } = await query.maybeSingle()

      if (clinicExists) {
        resolvedRole = 'staff'
        resolvedClinicId = clinicExists.id
      }
    }

    const { data: newProfile } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        role: resolvedRole,
        clinic_id: resolvedClinicId,
        is_bookable: true,
        is_on_break: false,
        has_seen_tutorial: false
      }])
      .select('role, clinic_id')
      .maybeSingle()

    if (newProfile) {
      profile = newProfile
    }

    if (cookieInvite) {
      cookieStore.delete('invite_code')
    }
  }

  // FALLBACK / REPARACIÓN AUTOMÁTICA DE INVITACIÓN
  const activeInviteCode = user.user_metadata?.invite_code || cookieInvite
  if (profile && !profile.clinic_id && activeInviteCode) {
    let slug = activeInviteCode
    if (activeInviteCode.endsWith('-staff')) {
      slug = activeInviteCode.slice(0, -6)
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeInviteCode)

    let query = supabase.from('clinics').select('id')
    if (isUuid) {
      query = query.eq('id', activeInviteCode)
    } else {
      query = query.eq('slug', slug)
    }

    const { data: clinicExists } = await query.maybeSingle()

    if (clinicExists) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({
          role: 'staff',
          clinic_id: clinicExists.id
        })
        .eq('id', user.id)
        .select('role, clinic_id')
        .maybeSingle()

      if (updatedProfile) {
        profile = updatedProfile
      }
    }

    if (cookieInvite) {
      cookieStore.delete('invite_code')
    }
  }

  let clinicId = profile?.clinic_id
  let clinicSlug = ''

  if (!clinicId && profile?.role === 'owner') {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id, slug')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()
    clinicId = clinic?.id
    clinicSlug = clinic?.slug || ''
  } else if (clinicId) {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('slug')
      .eq('id', clinicId)
      .single()
    clinicSlug = clinic?.slug || ''
  }

  // 2. Fetch de citas para esta clínica, desde el inicio del año para permitir vistas semanales/mensuales/anuales
  let appointments: any[] = []
  let staffMembers: any[] = []

  if (clinicId) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString()
    let aptsQuery = supabase
      .from('appointments')
      .select(`
        id,
        client_name,
        client_email,
        client_phone,
        start_time,
        status,
        services ( name ),
        profiles ( id, name ),
        staff_id,
        notes
      `)
      .eq('clinic_id', clinicId)
      .gte('start_time', startOfYear)
      .order('start_time', { ascending: true })

    if (profile?.role !== 'owner') {
      aptsQuery = aptsQuery.eq('staff_id', user.id)
    }

    const { data: apts } = await aptsQuery
    if (apts) {
      appointments = apts
    }

    // 3. Obtener listado de profesionales de la clínica
    const { data: staff } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('clinic_id', clinicId)
    if (staff) {
      staffMembers = staff
    }
  }

  return (
    <DashboardClient 
      appointments={appointments as any} 
      clinicSlug={clinicSlug} 
      staff={staffMembers}
      clinicId={clinicId}
    />
  )
}
