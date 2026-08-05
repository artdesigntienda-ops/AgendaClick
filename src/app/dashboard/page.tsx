import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
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
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

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
    />
  )
}
