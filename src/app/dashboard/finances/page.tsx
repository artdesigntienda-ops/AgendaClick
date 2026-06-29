import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FinancesDashboard from './FinancesDashboard'
import { requireActiveSubscription } from '@/utils/billingGuard'

export default async function FinancesPage() {
  await requireActiveSubscription()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil para saber el rol y clinic_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  let clinicId = profile?.clinic_id

  if (!clinicId && profile?.role === 'owner') {
    const { data } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()
    if (data) clinicId = data.id
  }

  if (!clinicId) {
    if (profile?.role === 'owner') {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Aún no has creado tu perfil</h2>
          <p className="text-gray-500">Ve a Configuración para crear el perfil de tu negocio primero.</p>
        </div>
      )
    } else {
      redirect('/dashboard')
    }
  }

  const isOwner = profile?.role === 'owner'

  let appointmentsQuery = supabase
    .from('appointments')
    .select(`
      id,
      total_price,
      commission_earned,
      status,
      start_time,
      staff_id,
      profiles:staff_id ( name, role )
    `)
    .eq('clinic_id', clinicId)
    .neq('status', 'cancelled')

  if (!isOwner) {
    appointmentsQuery = appointmentsQuery.eq('staff_id', user.id)
  }

  const { data: appointments } = await appointmentsQuery

  return (
    <div className="space-y-8 animate-fade-in-up">
      <FinancesDashboard initialAppointments={appointments || []} isOwner={isOwner} />
    </div>
  )
}
