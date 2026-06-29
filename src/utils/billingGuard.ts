import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function requireActiveSubscription() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Obtener la clínica (ya sea como dueño o empleado)
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
      .single()
    if (data) clinicId = data.id
  }

  if (clinicId) {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('subscription_status, subscription_ends_at')
      .eq('id', clinicId)
      .single()

    if (clinic) {
      // Check if subscription has ended
      if (clinic.subscription_ends_at) {
        const endsAt = new Date(clinic.subscription_ends_at)
        const now = new Date()
        
        if (now > endsAt && clinic.subscription_status !== 'active') {
          // Si está vencida y no está activa
          redirect('/dashboard/billing')
        }
      }
    }
  }
}
