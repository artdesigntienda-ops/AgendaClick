import { createClient } from '@/utils/supabase/server'
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

  const cookieStore = await cookies()
  const cookieInvite = cookieStore.get('invite_code')?.value

  // FALLBACK / CREACIÓN AUTOMÁTICA DE PERFIL SI NO EXISTE
  if (!profile) {
    const inviteCode = user.user_metadata?.invite_code || cookieInvite || null
    let resolvedRole = 'owner'
    let resolvedClinicId = null

    if (inviteCode) {
      let slug = inviteCode
      if (inviteCode.endsWith('-staff')) {
        slug = inviteCode.slice(0, -6)
      }
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inviteCode)

      let query = supabase.from('clinics').select('id')
      if (isUuid) {
        query = query.eq('id', inviteCode)
      } else {
        query = query.eq('slug', slug)
      }

      const { data: clinicExists } = await query.maybeSingle()

      if (clinicExists) {
        resolvedRole = 'staff'
        resolvedClinicId = clinicExists.id
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

    if (cookieInvite) {
      cookieStore.delete('invite_code')
    }
  }

  // FALLBACK / REPARACIÓN AUTOMÁTICA DE INVITACIÓN
  const activeInviteCode = user.user_metadata?.invite_code || cookieInvite
  if (profile && !profile.clinic_id && activeInviteCode) {
    let slug = activeInviteCode
    if (activeInviteCode.endsWith('-staff')) {
      slug = activeInviteCode.slice(0, -6)
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeInviteCode)

    let query = supabase.from('clinics').select('id')
    if (isUuid) {
      query = query.eq('id', activeInviteCode)
    } else {
      query = query.eq('slug', slug)
    }

    const { data: clinicExists } = await query.maybeSingle()

    if (clinicExists) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({
          role: 'staff',
          clinic_id: clinicExists.id
        })
        .eq('id', user.id)
        .select('id, role, clinic_id, has_seen_tutorial, is_on_break, is_bookable')
        .maybeSingle()

      if (updatedProfile) {
        profile = updatedProfile
      }
    }

    if (cookieInvite) {
      cookieStore.delete('invite_code')
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
