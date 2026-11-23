import { redirect } from 'next/navigation'
import { AutoLogout } from './AutoLogout'
import Sidebar from './Sidebar'
import TopNavbar from '@/components/TopNavbar'
import { OnboardingTour } from './OnboardingTour'
import { getCachedDashboardContext } from '@/utils/dashboardSession'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getCachedDashboardContext()

  if (!context || !context.user) {
    redirect('/login')
  }

  const { profile, clinic } = context

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
          <div className="max-w-6xl mx-auto p-3 sm:p-6 md:p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
