'use server'

import * as crypto from 'crypto'
import { createClient } from '@/utils/supabase/server'
import { calculateProratedAmount, getPlanById } from '@/config/plans'

export async function generateWompiSignature(
  targetPlanId: string,
  billingPeriod: 'monthly' | 'annual'
) {
  try {
    const secret = process.env.WOMPI_INTEGRITY_SECRET
    if (!secret) {
      return { error: true, message: 'La llave WOMPI_INTEGRITY_SECRET no está configurada en las variables de entorno.' }
    }

    // 1. Validar autenticación de usuario
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: true, message: 'Debes iniciar sesión para realizar pagos.' }
    }

    // 2. Obtener la clínica que posee este usuario
    const { data: clinic, error: clinicErr } = await supabase
      .from('clinics')
      .select('id, plan_type, subscription_status, subscription_ends_at, staff_limit')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (clinicErr || !clinic) {
      return { error: true, message: 'No se encontró la clínica asociada a tu cuenta.' }
    }

    const plan = getPlanById(targetPlanId)
    if (!plan) {
      return { error: true, message: 'El plan seleccionado no es válido.' }
    }

    // 3. Validar límite de staff actual antes de permitir el pago
    const { count: staffCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinic.id)
      .neq('role', 'owner')

    if ((staffCount || 0) > plan.limit) {
      return {
        error: true,
        message: `Tienes ${staffCount} profesionales activos. Este plan solo permite hasta ${plan.limit}. Reduce tu equipo primero.`
      }
    }

    // 4. Calcular el precio EXACTO y SEGURO en el servidor (con prorrateo verificado)
    const { finalPrice } = calculateProratedAmount(
      plan.id,
      billingPeriod,
      clinic.plan_type,
      clinic.subscription_ends_at,
      clinic.subscription_status === 'active'
    )

    const amountInCents = finalPrice * 100
    const currency = 'COP'
    // Formato de referencia: SUB_[clinicId]_[planId]_[billingPeriod]_[timestamp]
    const reference = `SUB_${clinic.id}_${plan.id}_${billingPeriod}_${Date.now()}`

    // Fórmula Wompi: concat(reference, amountInCents, currency, secret)
    const cadena = `${reference}${amountInCents}${currency}${secret}`
    const hash = crypto.createHash('sha256').update(cadena).digest('hex')

    return {
      success: true,
      hash,
      reference,
      amountInCents,
      finalPrice
    }
  } catch (error: any) {
    console.error('Error in generateWompiSignature:', error)
    return { error: true, message: error.message || 'Error generando la firma de integridad de Wompi.' }
  }
}
