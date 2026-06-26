import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FinancesDashboard from './FinancesDashboard'

export default async function FinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener clínica del dueño
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!clinic) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Aún no has creado tu perfil</h2>
        <p className="text-gray-500">Ve a Configuración para crear el perfil de tu negocio primero.</p>
      </div>
    )
  }

  // Obtener todas las citas que ya pasaron o están pagadas
  // Por ahora traemos todas para la demostración
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      total_price,
      commission_earned,
      status,
      staff_id,
      profiles:staff_id ( name, role )
    `)
    .eq('clinic_id', clinic.id)
    .neq('status', 'cancelled')

  return (
    <div className="space-y-8 animate-fade-in-up">
      <FinancesDashboard initialAppointments={appointments} />
    </div>
  )
}
