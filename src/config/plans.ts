export interface PlanConfig {
  id: string
  name: string
  priceCOP: number
  limit: number
  badge: string
  target: string
  features: string[]
}

export const PLANS: PlanConfig[] = [
  {
    id: 'independiente',
    name: 'Independiente',
    priceCOP: 35000,
    limit: 1,
    badge: '1 Profesional / Bahía',
    target: 'Ideal para personas que trabajan solas en su propio consultorio o espacio.',
    features: [
      '1 Profesional / Bahía / Cancha',
      'Agendamiento 24/7 con código OTP de seguridad',
      'Selección de 1 servicio por cita',
      'Enlace y confirmación directa a WhatsApp',
      'Página de reservas pública personalizada',
      'Soporte estándar por correo'
    ]
  },
  {
    id: 'boutique', // 'profesional' mapeado históricamente como 'boutique'
    name: 'Profesional',
    priceCOP: 75000,
    limit: 4,
    badge: 'Hasta 4 Profesionales',
    target: 'Para negocios con equipo que necesitan agendar múltiples servicios.',
    features: [
      'Hasta 4 Profesionales / Técnicos / Bahías',
      '✨ Agendamiento Multi-Servicio Simultáneo',
      '🚗 Campos Especiales (Placa, Marcas, Odómetro)',
      '📅 Sincronización Google Calendar por empleado',
      '🎨 Personalización de Marca (Colores y Logotipo)',
      '⚡ Soporte prioritario por WhatsApp'
    ]
  },
  {
    id: 'salon', // 'negocio' mapeado históricamente como 'salon'
    name: 'Negocio',
    priceCOP: 125000,
    limit: 8,
    badge: '🚀 MÁS POPULAR / MEJOR VALOR',
    target: 'Para empresas consolidadas, talleres, clínicas y spas con equipo.',
    features: [
      'Hasta 8 Profesionales / Técnicos / Bahías',
      'Todo lo del Plan Profesional',
      '💰 Módulo de Finanzas y Comisiones de Empleados',
      '🏷️ Marca Blanca 100% (Sin logo de AgendaClick)',
      '📊 Exportación de Base de Clientes a Excel / CSV',
      '💳 Habilitado para cobros y anticipos en línea',
      '⭐ Soporte VIP Inmediato 24/7'
    ]
  },
  {
    id: 'elite',
    name: 'Élite',
    priceCOP: 199000,
    limit: 999,
    badge: 'Capacidad Ilimitada',
    target: 'Para grandes concesionarios, franquicias y centros de alto volumen.',
    features: [
      '🚀 Staff, Técnicos y Bahías Ilimitadas (999+)',
      'Todo lo del Plan Negocio',
      '🏢 Soporte Multi-Sede y Múltiples Ubicaciones',
      '🤝 Onboarding y Configuración VIP Asistida',
      '📞 Asesor y Línea de Atención Dedicada',
      '🛡️ Garantía de Disponibilidad y SLA 99.9%'
    ]
  }
]

export function getPlanById(planId: string): PlanConfig | undefined {
  const normalized = planId?.toLowerCase()
  if (normalized === 'profesional') return PLANS.find(p => p.id === 'boutique')
  if (normalized === 'negocio') return PLANS.find(p => p.id === 'salon')
  return PLANS.find(p => p.id === normalized)
}

export function calculatePlanPrice(planId: string, billingPeriod: 'monthly' | 'annual'): number {
  const plan = getPlanById(planId)
  if (!plan) throw new Error(`Plan no válido: ${planId}`)

  if (billingPeriod === 'annual') {
    return Math.floor(plan.priceCOP * 12 * 0.9) // 10% de descuento anual
  }
  return plan.priceCOP
}

export function calculateProratedAmount(
  targetPlanId: string,
  billingPeriod: 'monthly' | 'annual',
  currentPlanId: string | null,
  currentEndsAtIso: string | null,
  isSubscriptionActive: boolean
): { basePrice: number; unusedCredit: number; finalPrice: number } {
  const basePrice = calculatePlanPrice(targetPlanId, billingPeriod)

  if (!isSubscriptionActive || !currentEndsAtIso || !currentPlanId || currentPlanId === targetPlanId) {
    return { basePrice, unusedCredit: 0, finalPrice: basePrice }
  }

  const currentPlan = getPlanById(currentPlanId)
  if (!currentPlan) {
    return { basePrice, unusedCredit: 0, finalPrice: basePrice }
  }

  const endsAt = new Date(currentEndsAtIso)
  const now = new Date()
  const diffTime = endsAt.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysLeft <= 0) {
    return { basePrice, unusedCredit: 0, finalPrice: basePrice }
  }

  // Si le quedan más de 31 días, asumimos que su plan actual fue anual
  const currentPlanIsAnnual = daysLeft > 31
  const currentDailyRate = currentPlanIsAnnual
    ? (currentPlan.priceCOP * 12 * 0.9) / 365
    : currentPlan.priceCOP / 30

  const maxDays = currentPlanIsAnnual ? 365 : 30
  const creditDays = Math.min(daysLeft, maxDays)
  const unusedCredit = Math.floor(creditDays * currentDailyRate)
  
  // Wompi exige mínimo 1,000 COP
  const finalPrice = Math.max(1000, basePrice - unusedCredit)

  return { basePrice, unusedCredit, finalPrice }
}
