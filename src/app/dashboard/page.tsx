import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { startOfToday } from 'date-fns'
import DashboardClient from './DashboardClient'
import { requireActiveSubscription } from '@/utils/billingGuard'
import { getCachedDashboardContext } from '@/utils/dashboardSession'

export const dynamic = 'force-dynamic'

export default async function DashboardOverview() {
  await requireActiveSubscription()

  const context = await getCachedDashboardContext()

  if (!context || !context.user) {
    redirect('/login')
  }

  const { user, profile, clinic, clinicId, clinicSlug, role } = context
  let clinicData = clinic

  // Si es un vendedor/asesor comercial registrado sin clínica, llevarlo directo a su portal comercial
  if (!clinicId && role === 'partner') {
    redirect('/dashboard/partners')
  }

  const adminClient = createAdminClient()

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
      clinicId={clinicId || undefined}
      clinic={clinicData}
      servicesCount={servicesCount}
      hasGoogleCalendar={hasGoogleCalendar}
      initialNeedsSetup={needsSetup}
      userEmail={user.email}
    />
  )
}
