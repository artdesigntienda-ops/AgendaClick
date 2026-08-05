import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseKeys } from './config'

export function createClient() {
  const { url, anonKey } = getSupabaseKeys()
  return createBrowserClient(url, anonKey)
}
