import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // Inicializar dentro de la función para que las env vars estén disponibles en runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body = await req.json()
    const { event, data } = body

    if (event === 'transaction.updated' && data?.transaction?.status === 'APPROVED') {
      const reference = data.transaction.reference as string
      // El formato de la referencia será: SUB_clinicId_timestamp
      if (reference.startsWith('SUB_')) {
        const parts = reference.split('_')
        const clinicId = parts[1]

        if (clinicId) {
          // Actualizar estado de la suscripción a 'active'
          await supabase
            .from('clinics')
            .update({ 
              subscription_status: 'active',
              wompi_subscription_id: data.transaction.id
            })
            .eq('id', clinicId)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Wompi Webhook Error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
