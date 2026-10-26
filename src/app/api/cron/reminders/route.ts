import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Ruta protegida por un token secreto de Vercel Cron
export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization')
    const isVercelCron = req.headers.get('x-vercel-cron') === '1'

    // Seguridad Fail-Closed: Autorizado por Vercel Cron automático o mediante header Bearer
    if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
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

    // Mantenimiento y depuración automática diaria de la base de datos
    const nowIso = now.toISOString()
    try {
      // 1. Purgar códigos OTP expirados para evitar bloat
      await supabase
        .from('otp_verifications')
        .delete()
        .lt('expires_at', nowIso)

      // 2. Marcar citas pasadas como completed automáticamente
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .lt('end_time', nowIso)
        .eq('status', 'confirmed')
    } catch (cleanupErr) {
      console.error('[Cron Maintenance Error]:', cleanupErr)
    }

    if (!clinics || clinics.length === 0) {
      return NextResponse.json({ message: 'No reminders to send today. Maintenance completed.' })
    }

    let emailsSent = 0
    for (const clinic of clinics) {
      // Obtener el correo del dueño
      const { data: owner } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', clinic.owner_id)
        .maybeSingle()

      if (owner && owner.email) {
        await resend.emails.send({
          from: 'AgendaClick <no-reply@agendaclick.com.co>',
          to: [owner.email],
          subject: 'Recordatorio: Tu suscripción vence en 3 días',
          html: `
            <div style="font-family: sans-serif; color: #000;">
              <h2>Hola, administrador de ${clinic.name}</h2>
              <p>Te recordamos que tu suscripción a AgendaClick vencerá en <strong>3 días</strong>.</p>
              <p>Asegúrate de renovar tu plan a tiempo para no perder el acceso a la gestión de tu agenda y continuar recibiendo citas en línea.</p>
              <br/>
              <p>Para renovar o cambiar tu plan, ingresa a Facturación: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://agendaclick.com.co'}/dashboard/billing">Ir a Facturación</a></p>
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
    return NextResponse.json({ error: 'Internal cron error' }, { status: 500 })
  }
}
