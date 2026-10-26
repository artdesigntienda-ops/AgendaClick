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
    .maybeSingle()

  let clinicId = profile?.clinic_id

  if (!clinicId && profile?.role === 'owner') {
    const { data } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (data) clinicId = data.id
  }

  if (clinicId) {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('subscription_status, subscription_ends_at')
      .eq('id', clinicId)
      .maybeSingle()

    if (clinic) {
      const now = new Date()
      const endsAt = clinic.subscription_ends_at ? new Date(clinic.subscription_ends_at) : null

      // Si está en periodo de prueba y aún no vence, permitir
      if (clinic.subscription_status === 'trial' && endsAt && now <= endsAt) {
        return
      }

      // Si la fecha venció o no está activo, bloquear y redirigir a facturación
      const isExpired = endsAt ? now > endsAt : true
      const isNotActive = clinic.subscription_status !== 'active'

      if (isExpired || isNotActive) {
        redirect('/dashboard/billing')
      }
    }
  }
}
