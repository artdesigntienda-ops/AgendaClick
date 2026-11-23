import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

export async function requireActiveSubscription() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const adminClient = createAdminClient()

  // Obtener la clínica (ya sea como dueño o empleado)
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .maybeSingle()

  let clinicId = profile?.clinic_id

  if (!clinicId && profile?.role === 'owner') {
    const { data } = await adminClient
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()
    if (data) clinicId = data.id
  }

  if (clinicId) {
    const { data: clinic } = await adminClient
      .from('clinics')
      .select('subscription_status, subscription_ends_at')
      .eq('id', clinicId)
      .maybeSingle()

    if (clinic) {
      const now = new Date()
      const endsAt = clinic.subscription_ends_at ? new Date(clinic.subscription_ends_at) : null

      // Si está activo (vitalicio sin fecha, o con fecha vigente), permitir
      if (clinic.subscription_status === 'active') {
        if (!endsAt || now <= endsAt) {
          return
        }
      }

      // Si está en periodo de prueba y aún no vence, permitir
      if (clinic.subscription_status === 'trial' && endsAt && now <= endsAt) {
        return
      }

      // Si la fecha venció o no está activo, bloquear y redirigir a facturación
      redirect('/dashboard/billing')
    }
  }
}
