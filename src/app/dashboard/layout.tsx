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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, clinic_id, has_seen_tutorial, is_on_break, is_bookable')
    .eq('id', user.id)
    .single()

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
