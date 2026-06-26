import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { startOfToday } from 'date-fns'
import DashboardClient from './DashboardClient'

export default async function DashboardOverview() {
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
      .single()
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

  // 2. Fetch de citas para esta clínica, desde hoy en adelante
  let appointments: any[] = []
  if (clinicId) {
    const todayISO = startOfToday().toISOString()
    const { data: apts, error } = await supabase
      .from('appointments')
      .select(`
        id,
        client_name,
        start_time,
        status,
        services ( name ),
        profiles ( name )
      `)
      .eq('clinic_id', clinicId)
      .gte('start_time', todayISO)
      .order('start_time', { ascending: true })
      
    if (apts) {
      appointments = apts
    }
  }

  return <DashboardClient appointments={appointments as any} clinicSlug={clinicSlug} />
}
