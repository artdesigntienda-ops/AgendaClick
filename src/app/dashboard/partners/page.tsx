import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getPartnerData } from './actions'
import PartnersClient from './PartnersClient'

export default async function PartnersDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const partnerData = await getPartnerData()

  return (
    <div>
      <PartnersClient initialData={partnerData} />
    </div>
  )
}
