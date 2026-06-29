import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AutoLogout } from './AutoLogout'
import Sidebar from './Sidebar'

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
    .select('role, clinic_id')
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
    <div className="flex h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <AutoLogout />
      
      <Sidebar clinic={clinic} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  )
}
