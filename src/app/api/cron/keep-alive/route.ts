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
          error: error.message,
          latencyMs,
          timestamp: new Date().toISOString()
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase keep-alive ping exitoso. El contador de inactividad ha sido reiniciado.',
      recordsFound: data?.length || 0,
      latencyMs,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error('[Supabase Keep-Alive Exception]:', err)
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Error inesperado en keep-alive',
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
