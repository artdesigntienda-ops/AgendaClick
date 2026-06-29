'use client'

import { useState, useEffect } from 'react'
import { Check, AlertCircle, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateWompiSignature } from './actions'

const PLANS = [
  {
    id: 'independiente',
    name: 'Independiente',
    priceCOP: 35000,
    limit: 1,
    features: ['1 Profesional', 'Agenda online', 'Recordatorios por email', 'Soporte estándar']
  },
  {
    id: 'boutique',
    name: 'Boutique',
    priceCOP: 75000,
    limit: 4,
    features: ['Hasta 4 Profesionales', 'Agenda online', 'Recordatorios por email', 'Soporte prioritario']
  },
  {
    id: 'salon',
    name: 'Salón',
    priceCOP: 115000,
    limit: 8,
    features: ['Hasta 8 Profesionales', 'Agenda online', 'Recordatorios por email', 'Soporte prioritario', 'Métricas avanzadas']
  },
  {
    id: 'elite',
    name: 'Élite',
    priceCOP: 190000,
    limit: 999, // ilimitado
    features: ['Profesionales ilimitados', 'Todo lo del plan Salón', 'Atención 24/7', 'Onboarding personalizado']
  }
]

export default function BillingClient({ clinic, currentStaffCount, wompiPubKey }: { clinic: any, currentStaffCount: number, wompiPubKey: string }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    // Cargar script de Wompi
    const script = document.createElement('script')
    script.src = 'https://checkout.wompi.co/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (currentStaffCount > plan.limit) {
      toast.error(`No puedes elegir este plan porque tienes ${currentStaffCount} profesionales activos. Debes eliminar algunos primero.`)
      return
    }

    if (typeof window === 'undefined' || !(window as any).WidgetCheckout) {
      toast.error('El sistema de pagos aún se está cargando. Por favor, intenta de nuevo en unos segundos.')
      return
    }

    setIsProcessing(plan.id)

    try {
      const reference = `SUB_${clinic.id}_${plan.id}_${Date.now()}`
      const amountInCents = plan.priceCOP * 100

      // Generar firma de integridad en el servidor
      const signature = await generateWompiSignature(reference, amountInCents, 'COP')

      const config: any = {
        currency: 'COP',
        amountInCents: amountInCents,
        reference: reference,
        publicKey: wompiPubKey,
        redirectUrl: `${window.location.origin}/dashboard/billing/success`
      }

      if (signature) {
        config.signature = { integrity: signature }
      }

      // @ts-ignore
      const checkout = new WidgetCheckout(config)

      checkout.open(function (result: any) {
        setIsProcessing(null)
        const transaction = result.transaction
        if (transaction.status === 'APPROVED') {
          toast.success('¡Suscripción aprobada! Tu plan se actualizará en unos segundos.')
          setTimeout(() => window.location.reload(), 3000)
        } else {
          toast.error('El pago no fue aprobado. Estado: ' + transaction.status)
        }
      })
    } catch (error: any) {
      setIsProcessing(null)
      console.error('Wompi Error:', error)
      toast.error(`Error: ${error.message || 'Hubo un problema al iniciar el pago.'}`)
    }
  }

  const currentPlanObj = PLANS.find(p => p.id === clinic.plan_type) || PLANS[0]
  
  // Calcular días restantes si es trial o active
  let daysLeftText = ''
  if (clinic.subscription_ends_at) {
    const endsAt = new Date(clinic.subscription_ends_at)
    const now = new Date()
    const diffTime = endsAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0) {
      daysLeftText = `Quedan ${diffDays} días`
    } else {
      daysLeftText = 'Suscripción vencida'
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Status Card */}
      <div className="bg-black text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold mb-1 break-words">Tu Plan Actual: {currentPlanObj.name}</h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/70 text-sm">
            <span>Estado: 
              <strong className={`ml-1 ${clinic.subscription_status === 'active' ? 'text-green-400' : clinic.subscription_status === 'trial' ? 'text-yellow-400' : 'text-red-400'}`}>
                {clinic.subscription_status.toUpperCase()}
              </strong>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>{daysLeftText}</span>
          </div>
          <p className="text-white/50 text-xs mt-3">
            Profesionales activos: {currentStaffCount} / {currentPlanObj.limit === 999 ? 'Ilimitado' : currentPlanObj.limit}
          </p>
        </div>
        
        {clinic.subscription_status !== 'active' && (
          <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-white/90">Añade un método de pago para no perder acceso.</p>
          </div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {PLANS.map((plan) => {
          const isCurrent = clinic.plan_type === plan.id
          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col bg-white border-2 rounded-2xl p-6 transition-all duration-200 ${
                isCurrent ? 'border-black shadow-lg scale-[1.02]' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                  PLAN ACTUAL
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-black">
                    ${plan.priceCOP.toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm font-medium text-gray-500">/mes</span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-black shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={(isCurrent && clinic.subscription_status === 'active') || isProcessing !== null}
                className={`w-full py-3 px-2 sm:px-4 rounded-xl font-bold flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base ${
                  isCurrent && clinic.subscription_status === 'active'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-black text-white hover:bg-gray-800 hover:shadow-md'
                    : 'bg-white text-black border-2 border-black hover:bg-black hover:text-white'
                } ${isProcessing === plan.id ? 'opacity-75 cursor-wait' : ''}`}
              >
                {isProcessing === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {isProcessing === plan.id
                  ? 'Iniciando pago...'
                  : isCurrent && clinic.subscription_status === 'active' 
                  ? 'Suscrito' 
                  : isCurrent 
                  ? 'Activar Suscripción' 
                  : 'Elegir Plan'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
