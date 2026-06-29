import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { requireActiveSubscription } from '@/utils/billingGuard'
import StaffClient from './StaffClient'

export default async function StaffPage() {
  await requireActiveSubscription()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find clinic
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  let clinicId = profile?.clinic_id

  if (!clinicId && profile?.role === 'owner') {
    const { data } = await supabase
      .from('clinics')
      .select('id, staff_limit')
      .eq('owner_id', user.id)
      .single()
    if (data) clinicId = data.id
  }

  if (!clinicId) {
    redirect('/dashboard')
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, staff_limit')
    .eq('id', clinicId)
    .single()

  // Fetch staff
  const { data: staff } = await supabase
    .from('profiles')
    .select('id, name, email, role, google_calendar_id')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <StaffClient 
        clinic={clinic} 
        staff={staff || []} 
        isOwner={profile?.role === 'owner'}
      />
    </div>
  )
}
