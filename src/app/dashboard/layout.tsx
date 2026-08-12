import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AutoLogout } from './AutoLogout'
import Sidebar from './Sidebar'
import TopNavbar from '@/components/TopNavbar'
import { OnboardingTour } from './OnboardingTour'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let { data: profile } = await supabase
    .from('profiles')
    .select('id, role, clinic_id, has_seen_tutorial, is_on_break, is_bookable')
    .eq('id', user.id)
    .maybeSingle()

  // FALLBACK / CREACIÓN AUTOMÁTICA O VINCULACIÓN POR CORREO SI NO EXISTE PERFIL POR ID
  if (!profile) {
    // 1. Buscar si el administrador ya pre-registró este correo
    const { data: existingEmailProfile } = await supabase
      .from('profiles')
      .select('id, role, clinic_id, has_seen_tutorial, is_on_break, is_bookable')
      .eq('email', user.email)
      .maybeSingle()

    if (existingEmailProfile) {
      // Vinculamos su cuenta de auth al perfil actualizando el ID (admin para bypass RLS)
      const adminClient = createAdminClient()
      const { data: linkedProfile } = await adminClient
        .from('profiles')
        .update({ id: user.id })
        .eq('id', existingEmailProfile.id)
        .select('id, role, clinic_id, has_seen_tutorial, is_on_break, is_bookable')
        .maybeSingle()

      if (linkedProfile) {
        profile = linkedProfile
      }
    } else {
      // 2. Si no pre-registró el correo, creamos un nuevo perfil por defecto (dueño)
      const adminClient = createAdminClient()
      const { data: newProfile } = await adminClient
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          role: 'owner',
          clinic_id: null,
          is_bookable: true,
          is_on_break: false,
          has_seen_tutorial: false
        }])
        .select('id, role, clinic_id, has_seen_tutorial, is_on_break, is_bookable')
        .maybeSingle()

      if (newProfile) {
        profile = newProfile
      }
    }
  }

  let clinic = null
  let clinicId = profile?.clinic_id

  if (!clinicId && profile?.role === 'owner') {
    const { data } = await supabase
      .from('clinics')
      .select('name, slug, business_type, sidebar_color, sidebar_text_color, dashboard_accent_color, booking_bg_color, booking_text_color, booking_card_color')
      .eq('owner_id', user.id)
      .maybeSingle()
    clinic = data
  } else if (clinicId) {
    const { data } = await supabase
      .from('clinics')
      .select('name, slug, business_type, sidebar_color, sidebar_text_color, dashboard_accent_color, booking_bg_color, booking_text_color, booking_card_color')
      .eq('id', clinicId)
      .maybeSingle()
    clinic = data
  }

  return (
    <div className="flex flex-col h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden">
      <AutoLogout />
      {profile && (
        <OnboardingTour 
          hasSeenTutorial={!!profile.has_seen_tutorial} 
          role={profile.role as 'owner' | 'staff'} 
        />
      )}
      
      <TopNavbar profile={profile} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          clinic={clinic} 
          role={profile?.role as 'owner' | 'staff'} 
          businessType={clinic?.business_type}
          themeColors={{
            sidebarColor: clinic?.sidebar_color,
            sidebarTextColor: clinic?.sidebar_text_color,
            accentColor: clinic?.dashboard_accent_color,
          }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
