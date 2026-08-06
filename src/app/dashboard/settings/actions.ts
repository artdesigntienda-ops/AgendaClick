'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function disconnectGoogleCalendar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      google_calendar_id: null,
      google_refresh_token: null
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error disconnecting calendar:', error)
    throw new Error('No se pudo desconectar Google Calendar')
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/staff')
}
