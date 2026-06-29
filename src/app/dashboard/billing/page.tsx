import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener la clínica del dueño
  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!clinic) {
    // Si no tiene clínica, debe crear una primero
    redirect('/dashboard/settings?tutorial=true')
  }

  // Obtener cuántos profesionales hay actualmente para mostrar validaciones si quieren bajar de plan
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('clinic_id', clinic.id)
    .neq('role', 'owner')

  const staffCount = count || 0

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black tracking-tight mb-2">Planes y Facturación</h1>
        <p className="text-black/60">
          Administra tu suscripción, cambia de plan y asegura el acceso continuo a AgendaClick.
        </p>
      </div>

      <BillingClient 
        clinic={clinic} 
        currentStaffCount={staffCount}
        wompiPubKey={process.env.NEXT_PUBLIC_WOMPI_PUB_KEY!}
      />
    </div>
  )
}
