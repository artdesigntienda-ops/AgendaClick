import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Prevenir Open Redirect: permitir únicamente rutas relativas internas
  const next = (rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('\\')) ? rawNext : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      let finalNext = next
      if (finalNext === '/dashboard') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, clinic_id, partner_code')
            .eq('id', user.id)
            .maybeSingle()

          if (!profile?.clinic_id && (profile?.role === 'partner' || profile?.partner_code)) {
            finalNext = '/dashboard/partners'
          }
        }
      }
      return NextResponse.redirect(`${origin}${finalNext}`)
    }
  }

  // Si hay un error, lo enviamos al login
  return NextResponse.redirect(`${origin}/login?message=No+se+pudo+iniciar+sesion+con+Google`)
}
