import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
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

  // FALLBACK / CREACIÓN AUTOMÁTICA DE PERFIL SI NO EXISTE
  if (!profile) {
    const inviteCode = user.user_metadata?.invite_code || null
    let resolvedRole = 'owner'
    let resolvedClinicId = null

    if (inviteCode) {
      const { data: clinicExists } = await supabase
        .from('clinics')
        .select('id')
        .eq('id', inviteCode)
        .maybeSingle()

      if (clinicExists) {
        resolvedRole = 'staff'
        resolvedClinicId = inviteCode
      }
    }

    const { data: newProfile } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        role: resolvedRole,
        clinic_id: resolvedClinicId,
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

  // FALLBACK / REPARACIÓN AUTOMÁTICA DE INVITACIÓN
  if (profile && !profile.clinic_id && user.user_metadata?.invite_code) {
    const inviteCode = user.user_metadata.invite_code
    const { data: clinicExists } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', inviteCode)
      .maybeSingle()

    if (clinicExists) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({
          role: 'staff',
          clinic_id: inviteCode
        })
        .eq('id', user.id)
        .select('id, role, clinic_id, has_seen_tutorial, is_on_break, is_bookable')
        .maybeSingle()

      if (updatedProfile) {
        profile = updatedProfile
      }
    }
  }

  let clinic = null
  let clinicId = profile?.clinic_id

  if (!clinicId && profile?.role === 'owner') {
    const { data } = await supabase
      .from('clinics')
      .select('name, slug')
      .eq('owner_id', user.id)
      .single()
    clinic = data
  } else if (clinicId) {
    const { data } = await supabase
      .from('clinics')
      .select('name, slug')
      .eq('id', clinicId)
      .single()
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
        <Sidebar clinic={clinic} role={profile?.role as 'owner' | 'staff'} />

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
