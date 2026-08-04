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
    features: ['1 Profesional', 'Tu agenda en piloto automático 24/7', 'Reduce inasistencias con recordatorios', 'Soporte estándar']
  },
  {
    id: 'boutique',
    name: 'Profesional',
    priceCOP: 75000,
    limit: 4,
    features: ['Hasta 4 Profesionales', 'Tu agenda en piloto automático 24/7', 'Reduce inasistencias con recordatorios', 'Soporte prioritario']
  },
  {
    id: 'salon',
    name: 'Negocio',
    priceCOP: 115000,
    limit: 8,
    features: ['Hasta 8 Profesionales', 'Tu agenda en piloto automático 24/7', 'Reduce inasistencias con recordatorios', 'Soporte prioritario', 'Control total de tus finanzas']
  },
  {
    id: 'elite',
    name: 'Élite',
    priceCOP: 190000,
    limit: 999, // ilimitado
    features: ['Crecimiento sin límites (Staff infinito)', 'Todo lo del plan Negocio', 'Soporte VIP inmediato 24/7', 'Te ayudamos a configurar todo paso a paso']
  }
]

export default function BillingClient({ clinic, currentStaffCount, wompiPubKey }: { clinic: any, currentStaffCount: number, wompiPubKey: string }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    // Cargar script de Wompi si no está ya presente
    if (document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')) {
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.wompi.co/widget.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const endsAt = clinic.subscription_ends_at ? new Date(clinic.subscription_ends_at) : null
  const now = new Date()
  const diffTime = endsAt ? endsAt.getTime() - now.getTime() : 0
  const daysLeft = endsAt ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0

  let daysLeftText = ''
  if (endsAt) {
    if (daysLeft > 0) {
      daysLeftText = `Quedan ${daysLeft} días`
    } else {
      daysLeftText = 'Suscripción vencida'
    }
  }

  const currentPlanObj = PLANS.find(p => p.id === clinic.plan_type) || PLANS[0]
  const currentPlanIsAnnual = daysLeft > 31

  const handleSubscribe = async (plan: typeof PLANS[0], finalPrice: number) => {
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
      const reference = `SUB_${clinic.id}_${plan.id}_${billingPeriod}_${Date.now()}`
      const amountInCents = finalPrice * 100

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

  return (
    <div className="space-y-8">
      {/* Current Status Card */}
      <div className="bg-black text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold mb-1 break-words">
            Tu Plan Actual: {currentPlanObj.name} ({currentPlanIsAnnual ? 'Anual' : 'Mensual'})
          </h2>
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

      {/* Period Selector Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex border border-gray-200/50 shadow-inner">
          <button 
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${billingPeriod === 'monthly' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-black'}`}
          >
            Facturación Mensual
          </button>
          <button 
            onClick={() => setBillingPeriod('annual')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${billingPeriod === 'annual' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-black'}`}
          >
            <span>Facturación Anual</span>
            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold">Ahorra 10%</span>
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {PLANS.map((plan) => {
          const isCurrent = clinic.plan_type === plan.id
          const basePrice = billingPeriod === 'monthly' ? plan.priceCOP : Math.floor(plan.priceCOP * 12 * 0.9)
          
          // Calcular prorrateo si es un upgrade activo
          const isUpgrade = clinic.subscription_status === 'active' && clinic.plan_type !== plan.id
          let unusedCredit = 0
          let finalPrice = basePrice

          if (isUpgrade && daysLeft > 0) {
            const currentDailyRate = currentPlanIsAnnual 
              ? (currentPlanObj.priceCOP * 12 * 0.9) / 365 
              : currentPlanObj.priceCOP / 30
            unusedCredit = Math.floor(daysLeft * currentDailyRate)
            finalPrice = Math.max(1000, basePrice - unusedCredit) // Mínimo de 1,000 COP para Wompi
          }

          const showSuscrito = isCurrent && clinic.subscription_status === 'active' && billingPeriod === (currentPlanIsAnnual ? 'annual' : 'monthly')

          const isFeatured = plan.id === 'salon'

          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col bg-white rounded-2xl p-6 transition-all duration-200 ${
                showSuscrito 
                  ? 'border-2 border-black shadow-lg scale-[1.02] z-10' 
                  : isFeatured 
                  ? 'border-[3px] border-emerald-500 shadow-xl lg:scale-[1.04] z-10' 
                  : 'border-2 border-gray-100 hover:border-gray-300'
              }`}
            >
              {showSuscrito ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-wider shadow-md uppercase">
                  PLAN ACTUAL
                </div>
              ) : isFeatured ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-wider shadow-md uppercase">
                  🚀 MEJOR VALOR
                </div>
              ) : null}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-black">
                    ${billingPeriod === 'monthly' ? plan.priceCOP.toLocaleString('es-CO') : Math.floor(plan.priceCOP * 0.9).toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm font-medium text-gray-500">/mes</span>
                </div>
                {billingPeriod === 'annual' && (
                  <p className="text-xs text-green-600 font-bold mt-1">
                    Cobrado anualmente: ${basePrice.toLocaleString('es-CO')}/año
                  </p>
                )}
              </div>

              {/* Desglose de Prorrateo Premium */}
              {isUpgrade && unusedCredit > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-800 rounded-2xl p-4 border-2 border-emerald-500/20 shadow-md space-y-2 mb-5">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-xl uppercase tracking-wider animate-pulse">
                    Oferta
                  </div>
                  
                  <p className="text-xs font-black text-emerald-950 leading-snug">
                    Si mejoras hoy tu plan, pagas solo:
                  </p>
                  
                  <div className="text-2xl font-black text-emerald-600 tracking-tight">
                    ${finalPrice.toLocaleString('es-CO')} COP
                  </div>

                  <hr className="border-emerald-500/10 my-1" />

                  <div className="space-y-1 text-[11px] text-emerald-700">
                    <div className="flex justify-between">
                      <span>Precio regular:</span>
                      <span className="font-semibold">${basePrice.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saldo a favor ({daysLeft} días):</span>
                      <span className="font-semibold">-${unusedCredit.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-emerald-600 font-medium leading-normal pt-1.5 border-t border-emerald-500/10 text-center">
                    Tu ciclo se renovará por {billingPeriod === 'annual' ? '365' : '30'} días a partir de hoy.
                  </p>
                </div>
              )}

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-black shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan, finalPrice)}
                disabled={showSuscrito || isProcessing !== null}
                className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base ${
                  showSuscrito
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-100'
                    : isFeatured
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20'
                    : 'bg-white text-black border-2 border-black hover:bg-black hover:text-white'
                } ${isProcessing === plan.id ? 'opacity-75 cursor-wait' : ''}`}
              >
                {isProcessing === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Iniciando pago...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>{showSuscrito ? 'Suscrito' : 'Quiero este plan'}</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
