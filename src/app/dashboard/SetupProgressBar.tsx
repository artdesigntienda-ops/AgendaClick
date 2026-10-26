'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  Scissors, 
  MessageCircle, 
  X, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  clinic: any
  servicesCount: number
  hasGoogleCalendar: boolean
  onOpenQuickSetup?: () => void
}

export function SetupProgressBar({ 
  clinic, 
  servicesCount, 
  hasGoogleCalendar,
  onOpenQuickSetup 
}: Props) {
  const [isCopied, setIsCopied] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const dismissed = localStorage.getItem('agendaclick_setup_bar_dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  if (isDismissed) return null

  const hasClinic = !!clinic?.slug
  const hasServices = servicesCount > 0

  // Puntos calculados
  let completedCount = 1 // Cuenta creada
  if (hasClinic) completedCount++
  if (hasServices) completedCount++
  if (hasGoogleCalendar) completedCount++

  const totalSteps = 4
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  // Si ya tiene todo completo, podemos permitir descartar fácilmente
  const isAllDone = completedCount >= 3 // Cuenta, clínica y servicios listos

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('agendaclick_setup_bar_dismissed', 'true')
  }

  const handleCopy = () => {
    if (!clinic?.slug) return
    const url = `${window.location.origin}/${clinic.slug}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast.success('¡Enlace de tu negocio copiado!')
    setTimeout(() => setIsCopied(false), 2500)
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 transition-all">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                {isAllDone ? '¡Tu negocio está listo para recibir citas!' : 'Tu negocio está al ' + progressPercent + '% listo'}
              </h3>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {progressPercent}%
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {isAllDone 
                ? 'Ya puedes compartir tu enlace con tus clientes en WhatsApp e Instagram.' 
                : 'Completa estos sencillos pasos para que tus clientes puedan agendarte sin complicaciones.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Ocultar esta guía"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="w-full bg-blue-100 h-2 rounded-full mt-3 overflow-hidden">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Pasos desplegables */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-blue-100/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Paso 1: Cuenta */}
          <div className="flex items-center gap-2.5 p-2.5 bg-white/80 rounded-xl border border-blue-100">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-gray-900 block">1. Cuenta creada</span>
              <span className="text-gray-500">Sesión iniciada</span>
            </div>
          </div>

          {/* Paso 2: Perfil y Negocio */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-white/80 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2.5 min-w-0">
              {hasClinic ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div className="text-xs truncate">
                <span className="font-bold text-gray-900 block">2. Perfil de Negocio</span>
                <span className="text-gray-500 truncate">{hasClinic ? clinic.name : 'Pendiente'}</span>
              </div>
            </div>
            {!hasClinic && onOpenQuickSetup && (
              <button
                onClick={onOpenQuickSetup}
                className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
              >
                Crear ya
              </button>
            )}
          </div>

          {/* Paso 3: Servicios */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-white/80 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2.5 min-w-0">
              {hasServices ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div className="text-xs truncate">
                <span className="font-bold text-gray-900 block">3. Servicios</span>
                <span className="text-gray-500">{hasServices ? `${servicesCount} creados` : 'Sin servicios'}</span>
              </div>
            </div>
            <Link
              href="/dashboard/services"
              className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
            >
              {hasServices ? 'Ver' : '+ Añadir'}
            </Link>
          </div>

          {/* Paso 4: Compartir enlace */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-white/80 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2.5 min-w-0">
              {hasClinic ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <div className="text-xs truncate">
                <span className="font-bold text-gray-900 block">4. Enlace a clientes</span>
                <span className="text-gray-500 truncate">{hasClinic ? `/${clinic.slug}` : 'Por activar'}</span>
              </div>
            </div>
            {hasClinic && (
              <button
                onClick={handleCopy}
                className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md shrink-0 flex items-center gap-1 shadow-xs"
              >
                {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {isCopied ? '¡Listo!' : 'Copiar'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Asistencia Directa Concierge WhatsApp */}
      {isExpanded && (
        <div className="mt-3 bg-white/90 border border-green-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-gray-900">¿No tienes tiempo o se te dificulta configurar?</span>
              <span className="text-gray-500 ml-1 hidden sm:inline">Envíanos tu lista o foto a WhatsApp y te lo dejamos listo en 10 minutos gratis.</span>
            </div>
          </div>
          <a
            href="https://wa.me/573239306599?text=Hola%2C%20necesito%20ayuda%20para%20configurar%20mi%20negocio%20en%20AgendaClick"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Escribir por WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
