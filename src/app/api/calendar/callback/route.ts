import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=NoCode', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${url.origin}/api/calendar/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Si Google no nos da un refresh_token, significa que el usuario ya había dado permiso antes
    // pero no forzamos el prompt=consent. En nuestra ruta de auth sí lo forzamos.
    if (!tokens.refresh_token) {
      console.warn('No se recibió refresh_token. El usuario necesita revocar permisos en su cuenta de Google.')
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Crear un sub-calendario específico para AgendaClick
    const newCalendar = await calendar.calendars.insert({
      requestBody: {
        summary: 'AgendaClick - Trabajo',
        description: 'Calendario automático para citas de AgendaClick',
        timeZone: 'America/Bogota'
      }
    })

    const calendarId = newCalendar.data.id

    // Guardar tokens y calendarId en Supabase
    // Solo guardamos el refresh_token si viene en la respuesta, de lo contrario mantenemos el anterior
    const updateData: any = {
      google_calendar_id: calendarId
    }
    
    if (tokens.refresh_token) {
      updateData.google_refresh_token = tokens.refresh_token
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
