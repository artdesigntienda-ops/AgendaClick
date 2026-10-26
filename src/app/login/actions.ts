'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const nextParam = formData.get('next') as string

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const errorQuery = nextParam ? `&next=${encodeURIComponent(nextParam)}` : ''
    redirect(`/login?message=No+se+pudo+iniciar+sesión${errorQuery}`)
  }

  let targetUrl = '/dashboard'
  if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.includes('\\')) {
    targetUrl = nextParam
  } else {
    // Si no especificó ruta de destino, verificar si es un vendedor
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, clinic_id, partner_code')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile?.clinic_id && (profile?.role === 'partner' || profile?.partner_code)) {
        targetUrl = '/dashboard/partners'
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect(targetUrl)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    redirect('/login?message=No+se+pudo+registrar')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const host = (await headers()).get('host') || 'agendaclick.com.co'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?message=No+se+pudo+iniciar+sesión+con+Google')
  }

  if (data.url) {
    redirect(data.url)
  }
}
