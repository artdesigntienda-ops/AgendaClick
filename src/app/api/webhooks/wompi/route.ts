import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as crypto from 'crypto'
import { getPlanById, calculateProratedAmount } from '@/config/plans'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Wompi Webhook] Configuración de Supabase incompleta')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const rawBody = await req.text()
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { event, data, timestamp, signature } = body

    // 1. VALIDACIÓN CRIPTOGRÁFICA DE LA FIRMA (HMAC-SHA256 EN TIEMPO CONSTANTE)
    if (!eventsSecret) {
      console.error('[Wompi Webhook] WOMPI_EVENTS_SECRET no está configurada')
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
    }

    if (!signature || !signature.checksum || !signature.properties || !timestamp) {
      console.warn('[Wompi Webhook] Payload sin firma o propiedades de integridad')
      return NextResponse.json({ error: 'Missing signature or timestamp' }, { status: 400 })
    }

    // Extraer propiedades según la lista enviada por Wompi (ej: ["transaction.id", "transaction.status", "transaction.amount_in_cents"])
    let concatenatedValues = ''
    for (const prop of signature.properties) {
      const parts = prop.split('.')
      let curr = data
      for (const part of parts) {
        curr = curr?.[part]
      }
      concatenatedValues += `${curr ?? ''}`
    }

    // Fórmula Wompi: concat(prop1 + prop2 + ... + timestamp + eventsSecret)
    const stringToHash = `${concatenatedValues}${timestamp}${eventsSecret}`
    const calculatedChecksum = crypto.createHash('sha256').update(stringToHash).digest('hex')

    const calculatedBuffer = Buffer.from(calculatedChecksum, 'hex')
    const receivedBuffer = Buffer.from(signature.checksum, 'hex')

    if (
      calculatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(calculatedBuffer, receivedBuffer)
    ) {
      console.error('[Wompi Webhook] Firma inválida. Intento de falsificación o llave errónea.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. PROCESAMIENTO DE TRANSACCIÓN APROBADA
    if (event === 'transaction.updated' && data?.transaction?.status === 'APPROVED') {
      const transaction = data.transaction
      const reference = transaction.reference as string
      const transactionId = transaction.id as string
      const amountInCents = transaction.amount_in_cents as number

      if (!reference || !reference.startsWith('SUB_')) {
        return NextResponse.json({ received: true, ignored: 'Not a subscription reference' })
      }

      const parts = reference.split('_')
      const clinicId = parts[1]
      const planId = parts[2]
      const billingPeriod = parts[3] || 'monthly'

      if (!clinicId || !planId) {
        return NextResponse.json({ error: 'Malformed reference' }, { status: 400 })
      }

      // Validar que el plan exista
      const plan = getPlanById(planId)
      if (!plan) {
        console.error(`[Wompi Webhook] Plan desconocido en referencia: ${planId}`)
        return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
      }

      // 3. IDEMPOTENCIA ESTRICTA: Evitar reprocesar la misma transacción
      const { data: existingClinic } = await supabase
        .from('clinics')
        .select('id, wompi_subscription_id, plan_type, subscription_ends_at, subscription_status')
        .eq('id', clinicId)
        .maybeSingle()

      if (!existingClinic) {
        console.error(`[Wompi Webhook] Clínica no encontrada: ${clinicId}`)
        return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
      }

      if (existingClinic.wompi_subscription_id === transactionId) {
        // Ya fue procesada previamente
        return NextResponse.json({ received: true, message: 'Transaction already processed' })
      }

      // 4. VALIDACIÓN DE MONTO EXACTO / PRORRATEADO (Anti-Bypass Financiero)
      const period = (billingPeriod === 'annual' ? 'annual' : 'monthly') as 'monthly' | 'annual'
      const { finalPrice } = calculateProratedAmount(
        plan.id,
        period,
        existingClinic.plan_type,
        existingClinic.subscription_ends_at,
        existingClinic.subscription_status === 'active'
      )
      const expectedAmountInCents = finalPrice * 100

      // Si el monto pagado es menor al precio calculado (con margen de 100 centavos / 1 COP por redondeo), rechazar
      if (amountInCents < (expectedAmountInCents - 100)) {
        console.error(`[Wompi Webhook] Monto insuficiente o manipulado para clínica ${clinicId}. Esperado: ${expectedAmountInCents} centavos, Recibido: ${amountInCents} centavos`)
        return NextResponse.json({ error: 'Insufficient payment amount' }, { status: 400 })
      }

      // 5. CALCULAR FECHA DE VENCIMIENTO
      const endsAt = new Date()
      if (billingPeriod === 'annual') {
        endsAt.setDate(endsAt.getDate() + 365)
      } else {
        endsAt.setDate(endsAt.getDate() + 30)
      }

      // 6. ACTUALIZACIÓN ATÓMICA DE LA CLÍNICA
      const { error: updateError } = await supabase
        .from('clinics')
        .update({
          subscription_status: 'active',
          plan_type: plan.id,
          staff_limit: plan.limit,
          subscription_ends_at: endsAt.toISOString(),
          wompi_subscription_id: transactionId
        })
        .eq('id', clinicId)

      if (updateError) {
        console.error('[Wompi Webhook] Error al actualizar suscripción:', updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log(`[Wompi Webhook] Suscripción activada para clínica ${clinicId}: Plan ${plan.name} (${billingPeriod}) hasta ${endsAt.toISOString()}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Wompi Webhook Error]:', err)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}
