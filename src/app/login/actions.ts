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

  if (invite) {
    // 1. Obtener la clínica y su límite
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id, staff_limit')
      .eq('id', invite)
      .single()

    if (clinic) {
      // 2. Contar cuántos empleados tiene actualmente
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
        invite_code: invite || null
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
  const origin = (await headers()).get('origin')

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
