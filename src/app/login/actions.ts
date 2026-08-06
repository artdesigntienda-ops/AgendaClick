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

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=No+se+pudo+iniciar+sesión')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const invite = formData.get('invite') as string | null
  
  let resolvedInviteCode: string | null = null

  if (invite) {
    let slug = invite
    if (invite.endsWith('-staff')) {
      slug = invite.slice(0, -6)
    }

    // Buscar clínica por slug o por id (como fallback para enlaces anteriores)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invite)
    
    let query = supabase.from('clinics').select('id, staff_limit')
    if (isUuid) {
      query = query.eq('id', invite)
    } else {
      query = query.eq('slug', slug)
    }

    const { data: clinic } = await query.maybeSingle()

    if (clinic) {
      resolvedInviteCode = clinic.id
      
      // Contar cuántos empleados tiene actualmente
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)
        .neq('role', 'owner')

      const currentStaff = count || 0

      if (currentStaff >= clinic.staff_limit) {
        redirect(`/login?message=Esta+clínica+ha+alcanzado+su+límite+de+profesionales`)
      }
    } else {
      redirect(`/login?message=Código+de+invitación+inválido`)
    }
  }

  const data = {
    email,
    password,
    options: {
      data: {
        invite_code: resolvedInviteCode || null
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

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
