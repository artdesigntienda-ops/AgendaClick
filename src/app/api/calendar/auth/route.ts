import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  // Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${new URL(request.url).origin}/api/calendar/callback`
  )

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Necesario para obtener refresh_token
    prompt: 'consent', // Forzamos que siempre pregunte para garantizar el refresh_token
    scope: scopes,
  })

  return NextResponse.redirect(url)
}
