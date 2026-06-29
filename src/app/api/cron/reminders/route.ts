import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Ruta protegida por un token secreto de Vercel Cron
// o abierta si no configuras el token, pero se recomienda protegerla
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    // Vercel manda un Bearer token definido en CRON_SECRET (opcional)
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const resend = new Resend(process.env.RESEND_API_KEY!)

    // Buscar clínicas que vencen en exactamente 3 días (entre 72 y 96 horas a partir de ahora)
    const now = new Date()
    const inThreeDays = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
    const inFourDays = new Date(now.getTime() + (4 * 24 * 60 * 60 * 1000))

    const { data: clinics, error } = await supabase
      .from('clinics')
      .select('id, name, owner_id, subscription_ends_at')
      .gte('subscription_ends_at', inThreeDays.toISOString())
      .lt('subscription_ends_at', inFourDays.toISOString())

    if (error) throw error

    if (!clinics || clinics.length === 0) {
      return NextResponse.json({ message: 'No reminders to send today.' })
    }

    let emailsSent = 0
    for (const clinic of clinics) {
      // Obtener el correo del dueño
      const { data: owner } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', clinic.owner_id)
        .single()

      if (owner && owner.email) {
        await resend.emails.send({
          from: 'AgendaClick <soporte@agendaclick.com>',
          to: [owner.email],
          subject: 'Recordatorio: Tu suscripción vence en 3 días',
          html: `
            <div style="font-family: sans-serif; color: #000;">
              <h2>Hola, dueño de ${clinic.name}</h2>
              <p>Te recordamos que tu suscripción a AgendaClick se renovará automáticamente en <strong>3 días</strong>.</p>
              <p>Asegúrate de contar con saldo disponible en tu método de pago registrado para que no pierdas acceso al control de tu negocio y tus reservas no se detengan.</p>
              <br/>
              <p>Si deseas cambiar de plan o revisar tu facturación, visita tu panel de control: <a href="https://agendaclick.vercel.app/dashboard/billing">Ir a Facturación</a></p>
              <br/>
              <p>Gracias por confiar en nosotros,</p>
              <p><strong>El equipo de AgendaClick</strong></p>
            </div>
          `
        })
        emailsSent++
      }
    }

    return NextResponse.json({ success: true, emailsSent })
  } catch (err: any) {
    console.error('Cron Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
