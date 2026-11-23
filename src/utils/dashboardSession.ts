import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export interface DashboardUserContext {
  user: any
  profile: any
  clinic: any
  clinicId: string | null
  clinicSlug: string
  role: 'owner' | 'staff' | 'partner'
}

/**
 * Obtiene y cachea por ciclo de vida de la petición (React.cache) la sesión,
 * el perfil y la clínica activa del usuario actual.
 * Evita que layout.tsx y las subpáginas hagan de 4 a 6 consultas idénticas a Supabase.
 */
export const getCachedDashboardContext = cache(async (): Promise<DashboardUserContext | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const adminClient = createAdminClient()

  // 1. Obtener perfil
  let { data: profile } = await adminClient
    .from('profiles')
    .select('id, name, email, role, clinic_id, partner_code, has_seen_tutorial, is_on_break, is_bookable, google_refresh_token, google_calendar_id')
    .eq('id', user.id)
    .maybeSingle()

  // Si no existe por ID, buscar si fue pre-registrado por email
  if (!profile && user.email) {
    const { data: existingEmailProfile } = await adminClient
      .from('profiles')
      .select('id, name, email, role, clinic_id, partner_code, has_seen_tutorial, is_on_break, is_bookable, google_refresh_token, google_calendar_id')
      .eq('email', user.email)
      .maybeSingle()

    if (existingEmailProfile) {
      const { data: linked } = await adminClient
        .from('profiles')
        .update({ id: user.id })
        .eq('id', existingEmailProfile.id)
        .select('id, name, email, role, clinic_id, partner_code, has_seen_tutorial, is_on_break, is_bookable, google_refresh_token, google_calendar_id')
        .maybeSingle()
      if (linked) profile = linked
    } else {
      const { data: newProf } = await adminClient
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0] || 'Usuario',
          role: 'owner',
          clinic_id: null,
          is_bookable: true,
          is_on_break: false,
          has_seen_tutorial: false
        }])
        .select('id, name, email, role, clinic_id, partner_code, has_seen_tutorial, is_on_break, is_bookable, google_refresh_token, google_calendar_id')
        .maybeSingle()
      if (newProf) profile = newProf
    }
  }

  let clinicId = profile?.clinic_id || null
  let clinic: any = null

  // 2. Obtener datos de la clínica
  if (clinicId) {
    const { data: cData } = await adminClient
      .from('clinics')
      .select('id, name, slug, phone, business_type, schedule, subscription_status, subscription_ends_at, plan_type, staff_limit, sidebar_color, sidebar_text_color, dashboard_accent_color, booking_bg_color, booking_text_color, booking_card_color')
      .eq('id', clinicId)
      .maybeSingle()
    clinic = cData
  }

  if (!clinic && profile?.role === 'owner') {
    const { data: cData } = await adminClient
      .from('clinics')
      .select('id, name, slug, phone, business_type, schedule, subscription_status, subscription_ends_at, plan_type, staff_limit, sidebar_color, sidebar_text_color, dashboard_accent_color, booking_bg_color, booking_text_color, booking_card_color')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (cData) {
      clinic = cData
      clinicId = cData.id
    }
  }

  return {
    user,
    profile,
    clinic,
    clinicId,
    clinicSlug: clinic?.slug || '',
    role: (profile?.role || 'owner') as 'owner' | 'staff' | 'partner'
  }
})
