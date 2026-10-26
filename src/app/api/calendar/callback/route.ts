import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'
import { encryptSensitiveToken } from '@/utils/securityTokens'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=NoCode', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // VALIDACIÓN ANTI-CSRF DEL PARÁMETRO STATE
  if (!state || !state.includes(':')) {
    console.error('[Google Calendar Callback] Falta el parámetro state o está malformado')
    return NextResponse.redirect(new URL('/dashboard/settings?error=InvalidState', request.url))
  }

  const [stateUserId, stateSignature] = state.split(':')
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'oauth_calendar_state_secret'
  const expectedSignature = crypto.createHmac('sha256', secret).update(stateUserId).digest('hex')

  if (stateUserId !== user.id || stateSignature !== expectedSignature) {
    console.error('[Google Calendar Callback] State no coincide con el usuario autenticado (posible ataque CSRF)')
    return NextResponse.redirect(new URL('/dashboard/settings?error=StateMismatch', request.url))
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${url.origin}/api/calendar/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    if (!tokens.refresh_token) {
      console.warn('No se recibió refresh_token. El usuario necesita revocar permisos en su cuenta de Google.')
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Buscar si ya existe un sub-calendario para AgendaClick
    const calendarList = await calendar.calendarList.list()
    let calendarId = calendarList.data.items?.find(c => c.summary === 'AgendaClick - Trabajo')?.id

    if (!calendarId) {
      const newCalendar = await calendar.calendars.insert({
        requestBody: {
          summary: 'AgendaClick - Trabajo',
          description: 'Calendario automático para citas de AgendaClick',
          timeZone: 'America/Bogota'
        }
      })
      calendarId = newCalendar.data.id
    }

    // Guardar tokens y calendarId en Supabase
    const updateData: any = {
      google_calendar_id: calendarId
    }
    
    if (tokens.refresh_token) {
      updateData.google_refresh_token = encryptSensitiveToken(tokens.refresh_token)
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('Error saving calendar info to Supabase:', error)
      return NextResponse.redirect(new URL('/dashboard/settings?error=SupabaseSave', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard/settings?success=calendar_connected', request.url))

  } catch (error) {
    console.error('Error in Google Calendar Callback:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=GoogleApiError', request.url))
  }
}
