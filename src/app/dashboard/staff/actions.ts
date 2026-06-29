'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireActiveSubscription } from '@/utils/billingGuard'

export async function removeStaffMember(staffId: string) {
  await requireActiveSubscription()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify the current user is the owner of the clinic this staff belongs to
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (ownerProfile?.role !== 'owner') {
    throw new Error('Solo el administrador puede eliminar profesionales.')
  }

  // Remove the staff member from the clinic
  const { error } = await supabase
    .from('profiles')
    .update({ clinic_id: null, role: 'owner', is_bookable: false }) // Reset them to an independent user
    .eq('id', staffId)
    .eq('clinic_id', ownerProfile.clinic_id)

  if (error) {
    console.error('Error removing staff:', error)
    throw new Error('No se pudo eliminar al profesional.')
  }

  revalidatePath('/dashboard/staff')
}
