import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const startTime = Date.now()

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { status: 'error', message: 'Variables de entorno de Supabase no configuradas' },
        { status: 500 }
      )
    }

    // Usar cliente PostgREST para generar actividad directa en la base de datos
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })

    // Consulta ligera que reactiva y mantiene vivo el proyecto (resetea el contador de 7 días de inactividad)
    const { data, error } = await supabase
      .from('clinics')
      .select('id, name')
      .limit(1)

    const latencyMs = Date.now() - startTime

    if (error) {
      console.error('[Supabase Keep-Alive Error]:', error)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Error al consultar Supabase',
          latencyMs,
          timestamp: new Date().toISOString()
        },
        { status: 502 }
      )
    }

    // El mantenimiento de base de datos solo se ejecuta si la petición incluye autenticación CRON válida
    const cronSecret = process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization')
    const isVercelCron = req.headers.get('x-vercel-cron') === '1'
    const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`)

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey && isAuthorized) {
      try {
        const adminSupabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false }
        })
        const nowIso = new Date().toISOString()
        // 1. Purgar OTPs caducados
        await adminSupabase.from('otp_verifications').delete().lt('expires_at', nowIso)
        // 2. Auto-completar citas pasadas
        await adminSupabase.from('appointments').update({ status: 'completed' }).lt('end_time', nowIso).eq('status', 'confirmed')
      } catch (maintErr) {
        console.error('[Keep-Alive Maintenance Non-Fatal Error]:', maintErr)
      }
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase keep-alive ping exitoso.',
      recordsFound: data?.length || 0,
      latencyMs,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error('[Supabase Keep-Alive Exception]:', err)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error inesperado en keep-alive',
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
