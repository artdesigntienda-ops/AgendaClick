import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

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

  // Generar state criptográfico con ID del usuario y firma HMAC para prevenir ataques CSRF
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    console.error('[Google Calendar Auth] Falta SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.redirect(new URL('/dashboard/settings?error=ConfigError', request.url))
  }
  const signature = crypto.createHmac('sha256', secret).update(user.id).digest('hex')
  const state = `${user.id}:${signature}`

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Necesario para obtener refresh_token
    prompt: 'consent', // Forzamos que siempre pregunte para garantizar el refresh_token
    scope: scopes,
    state
  })

  return NextResponse.redirect(url)
}
