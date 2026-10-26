import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { startOfToday } from 'date-fns'
import DashboardClient from './DashboardClient'
import { requireActiveSubscription } from '@/utils/billingGuard'

export const dynamic = 'force-dynamic'

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
    .select('role, clinic_id, google_refresh_token')
    .eq('id', user.id)
    .maybeSingle()

  // FALLBACK / CREACIÓN AUTOMÁTICA O VINCULACIÓN POR CORREO SI NO EXISTE PERFIL POR ID
  if (!profile) {
    // 1. Buscar si el administrador ya pre-registró este correo
    const { data: existingEmailProfile } = await supabase
      .from('profiles')
      .select('id, role, clinic_id, google_refresh_token')
      .eq('email', user.email)
      .maybeSingle()

    if (existingEmailProfile) {
      // Vinculamos su cuenta de auth al perfil actualizando el ID (admin para bypass RLS)
      const adminClient = createAdminClient()
      const { data: linkedProfile } = await adminClient
        .from('profiles')
        .update({ id: user.id })
        .eq('id', existingEmailProfile.id)
        .select('role, clinic_id, google_refresh_token')
        .maybeSingle()

      if (linkedProfile) {
        profile = linkedProfile
      }
    } else {
      // 2. Si no pre-registró el correo, creamos un nuevo perfil por defecto (dueño)
      const adminClient = createAdminClient()
      const { data: newProfile } = await adminClient
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          role: 'owner',
          clinic_id: null,
          is_bookable: true,
          is_on_break: false,
          has_seen_tutorial: false
        }])
        .select('role, clinic_id, google_refresh_token')
        .maybeSingle()

      if (newProfile) {
        profile = newProfile
      }
    }
  }

  let clinicId = profile?.clinic_id
  let clinicSlug = ''
  let clinicData: any = null

  // Si es un vendedor/asesor comercial registrado sin clínica, llevarlo directo a su portal comercial
  if (!clinicId && profile?.role === 'partner') {
    redirect('/dashboard/partners')
  }

  const adminClient = createAdminClient()

  if (!clinicId && profile?.role === 'owner') {
    const { data: clinic } = await adminClient
      .from('clinics')
      .select('id, name, slug, phone, business_type, schedule, subscription_status')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()
    clinicId = clinic?.id
    clinicSlug = clinic?.slug || ''
    clinicData = clinic
  } else if (clinicId) {
    const { data: clinic } = await adminClient
      .from('clinics')
      .select('id, name, slug, phone, business_type, schedule, subscription_status')
      .eq('id', clinicId)
      .maybeSingle()
    clinicSlug = clinic?.slug || ''
    clinicData = clinic
  }

  // 2. Fetch de citas para esta clínica, desde el inicio del año para permitir vistas semanales/mensuales/anuales
  let appointments: any[] = []
  let staffMembers: any[] = []
  let servicesCount = 0

  if (clinicId) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString()
    let aptsQuery = adminClient
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
        staff_id
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
    const { data: staff } = await adminClient
      .from('profiles')
      .select('id, name, role')
      .eq('clinic_id', clinicId)
    if (staff) {
      staffMembers = staff
    }

    // 4. Conteo de servicios
    const { count } = await adminClient
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
    servicesCount = count || 0
  }

  const needsSetup = profile?.role === 'owner' && (!clinicId || !clinicSlug)
  const hasGoogleCalendar = !!profile?.google_refresh_token

  return (
    <DashboardClient 
      appointments={appointments as any} 
      clinicSlug={clinicSlug} 
      staff={staffMembers}
      clinicId={clinicId}
      clinic={clinicData}
      servicesCount={servicesCount}
      hasGoogleCalendar={hasGoogleCalendar}
      initialNeedsSetup={needsSetup}
      userEmail={user.email}
    />
  )
}
