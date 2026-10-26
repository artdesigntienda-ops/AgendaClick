'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Scissors, 
  Check, 
  Copy, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  Store, 
  HeartHandshake, 
  MessageCircle, 
  Plus, 
  Trash2,
  Smile,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'
import { quickSetupClinic, QuickSetupInput } from './actions'
import { validatePartnerCode } from '@/app/dashboard/partners/actions'

interface Props {
  isOpen: boolean
  onClose?: () => void
  userEmail?: string
}

interface ServiceTemplate {
  name: string
  price: number
  duration_minutes: number
  selected: boolean
}

const CATEGORY_TEMPLATES: Record<string, { label: string, icon: string, services: Array<{ name: string, price: number, duration_minutes: number }> }> = {
  barberia: {
    label: 'Barbería',
    icon: '💈',
    services: [
      { name: 'Corte Clásico', price: 25000, duration_minutes: 40 },
      { name: 'Arreglo de Barba / Perfilado', price: 18000, duration_minutes: 25 },
      { name: 'Combo Corte + Barba', price: 38000, duration_minutes: 60 },
      { name: 'Exfoliación / Mascarilla Negra', price: 15000, duration_minutes: 20 },
    ]
  },
  estetica: {
    label: 'Uñas y Pestañas',
    icon: '💅',
    services: [
      { name: 'Manicura Semipermanente', price: 40000, duration_minutes: 75 },
      { name: 'Pedicura Spa', price: 35000, duration_minutes: 60 },
      { name: 'Combo Manicura + Pedicura', price: 65000, duration_minutes: 120 },
      { name: 'Lifting de Pestañas', price: 50000, duration_minutes: 60 },
    ]
  },
  peluqueria: {
    label: 'Peluquería / Salón',
    icon: '💇',
    services: [
      { name: 'Corte Dama / Cepillado', price: 35000, duration_minutes: 50 },
      { name: 'Cepillado y Planchado', price: 25000, duration_minutes: 40 },
      { name: 'Tinte / Coloración', price: 90000, duration_minutes: 120 },
      { name: 'Hidratación Profunda', price: 50000, duration_minutes: 60 },
    ]
  },
  spa: {
    label: 'Spa y Masajes',
    icon: '🧖',
    services: [
      { name: 'Masaje Relajante Completo', price: 80000, duration_minutes: 60 },
      { name: 'Limpieza Facial Profunda', price: 70000, duration_minutes: 60 },
      { name: 'Masaje Descontracturante', price: 90000, duration_minutes: 60 },
      { name: 'Exfoliación Corporal', price: 75000, duration_minutes: 50 },
    ]
  },
  salud: {
    label: 'Salud / Consultorio',
    icon: '🦷',
    services: [
      { name: 'Consulta de Valoración', price: 60000, duration_minutes: 45 },
      { name: 'Sesión de Tratamiento', price: 70000, duration_minutes: 50 },
      { name: 'Control y Seguimiento', price: 45000, duration_minutes: 30 },
    ]
  },
  mascotas: {
    label: 'Mascotas / Grooming',
    icon: '🐾',
    services: [
      { name: 'Baño y Corte Raza Pequeña', price: 40000, duration_minutes: 60 },
      { name: 'Baño y Corte Raza Grande', price: 60000, duration_minutes: 90 },
      { name: 'Consulta Veterinaria', price: 45000, duration_minutes: 30 },
    ]
  },
  automotriz: {
    label: 'Taller / Automotriz',
    icon: '🔧',
    services: [
      { name: 'Mantenimiento y Cambio Aceite', price: 80000, duration_minutes: 60 },
      { name: 'Alineación y Balanceo', price: 50000, duration_minutes: 45 },
      { name: 'Diagnóstico General', price: 60000, duration_minutes: 60 },
    ]
  },
  otro: {
    label: 'Otro Servicio',
    icon: '✨',
    services: [
      { name: 'Sesión Personalizada', price: 50000, duration_minutes: 60 },
      { name: 'Asesoría / Consulta Inicial', price: 40000, duration_minutes: 45 },
    ]
  }
}

function cleanSlugPreview(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') || 'tu-negocio'
}

export function QuickSetupWizard({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('barberia')
  const [phone, setPhone] = useState('')
  const [partnerCode, setPartnerCode] = useState('')
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [partnerValidation, setPartnerValidation] = useState<{ valid: boolean; partnerName?: string; partnerCode?: string; error?: string } | null>(null)

  const [services, setServices] = useState<ServiceTemplate[]>(() => 
    CATEGORY_TEMPLATES.barberia.services.map(s => ({ ...s, selected: true }))
  )
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('30000')
  const [newServiceDuration, setNewServiceDuration] = useState('45')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdSlug, setCreatedSlug] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  // Cargar código de referido si vino por URL o cookie/localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const urlParams = new URLSearchParams(window.location.search)
    const refFromUrl = urlParams.get('ref')
    const refFromStorage = localStorage.getItem('agendaclick_ref_code')
    const initialRef = refFromUrl || refFromStorage

    if (initialRef) {
      setPartnerCode(initialRef.toUpperCase())
      handleCheckPartnerCode(initialRef.toUpperCase())
    }
  }, [])

  const handleCheckPartnerCode = async (code: string) => {
    setPartnerCode(code)
    const clean = code.trim().toUpperCase()
    if (!clean) {
      setPartnerValidation(null)
      return
    }
    setIsCheckingCode(true)
    try {
      const res = await validatePartnerCode(clean)
      setPartnerValidation(res)
    } catch {
      setPartnerValidation({ valid: false, error: 'Error al verificar' })
    } finally {
      setIsCheckingCode(false)
    }
  }

  // Actualizar los servicios sugeridos si cambia la categoría
  const handleSelectCategory = (catKey: string) => {
    setBusinessType(catKey)
    const template = CATEGORY_TEMPLATES[catKey]
    if (template) {
      setServices(template.services.map(s => ({ ...s, selected: true })))
    }
  }

  const slugPreview = useMemo(() => {
    return cleanSlugPreview(businessName)
  }, [businessName])

  const toggleService = (index: number) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s))
  }

  const updateServicePrice = (index: number, newPrice: number) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, price: newPrice } : s))
  }

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddCustomService = () => {
    if (!newServiceName.trim()) {
      toast.error('Escribe el nombre del servicio')
      return
    }
    setServices(prev => [
      ...prev,
      {
        name: newServiceName.trim(),
        price: Number(newServicePrice) || 20000,
        duration_minutes: Number(newServiceDuration) || 30,
        selected: true
      }
    ])
    setNewServiceName('')
    setShowAddForm(false)
    toast.success('Servicio agregado a la lista')
  }

  const handleNextStep1 = () => {
    if (!businessName.trim()) {
      toast.error('Por favor escribe el nombre de tu negocio')
      return
    }
    setStep(2)
  }

  const handleFinalSubmit = async () => {
    const selectedServices = services.filter(s => s.selected)
    setIsSubmitting(true)

    try {
      const finalCode = partnerValidation?.valid ? partnerValidation.partnerCode : (partnerCode.trim() ? partnerCode.trim().toUpperCase() : undefined)
      const res = await quickSetupClinic({
        name: businessName.trim(),
        businessType,
        phone: phone.trim(),
        partnerCode: finalCode,
        services: selectedServices.map(s => ({
          name: s.name,
          price: s.price,
          duration_minutes: s.duration_minutes
        }))
      })

      if (res.success && res.slug) {
        setCreatedSlug(res.slug)
        setStep(3)
        toast.success('¡Negocio configurado con éxito!')
      } else {
        toast.error(res.error || 'Ocurrió un error al guardar')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Error de conexión al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agendaclick.com.co'
    const fullUrl = `${origin}/${createdSlug}`
    navigator.clipboard.writeText(fullUrl)
    setIsCopied(true)
    toast.success('¡Enlace copiado al portapapeles!')
    setTimeout(() => setIsCopied(false), 2500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 my-8"
      >
        {/* Cabecera del Wizard con indicador de progreso */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Configuración Rápida en 60 Segundos
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {step === 1 && '¡Empecemos con tu Negocio!'}
            {step === 2 && 'Tus Servicios y Precios'}
            {step === 3 && '¡Tu Agenda está Lista! 🎉'}
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {step === 1 && 'No necesitas saber de sistemas. Solo dinos cómo se llama y qué ofreces.'}
            {step === 2 && 'Hemos sugerido tus servicios más comunes. Ajusta los precios si deseas.'}
            {step === 3 && 'Tus clientes ya pueden agendar citas desde cualquier celular.'}
          </p>

          {/* Pasos Visuales */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-white' : 'w-4 bg-white/40'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-white' : 'w-4 bg-white/40'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-white' : 'w-4 bg-white/40'}`} />
          </div>
        </div>

        {/* Contenido del Paso */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* PASO 1: Datos del negocio y categoría */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    1. ¿Cómo se llama tu negocio o estética? *
                  </label>
                  <div className="relative">
                    <Store className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ej: Barbería Don Carlos, Diana Nails Studio"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium text-gray-900 transition-all placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                  {businessName.trim() && (
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <span>Tu enlace web para clientes será:</span>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        agendaclick.com.co/{slugPreview}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    2. ¿Qué tipo de negocio tienes?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.entries(CATEGORY_TEMPLATES).map(([key, item]) => {
                      const isSelected = businessType === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectCategory(key)}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-bold shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-xs leading-tight">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    3. Número de WhatsApp para avisos de citas
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej: 300 123 4567"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-base font-medium text-gray-900 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Opcional por ahora, pero muy útil para que tus clientes te contacten.
                  </p>
                </div>

                {/* Pregunta sobre asesor comercial / vendedor */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-gray-900">
                      4. ¿Recibiste asesoría de un vendedor o comercial?
                    </label>
                    <span className="text-[11px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                      Opcional
                    </span>
                  </div>
                  <div className="relative">
                    <Tag className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={partnerCode}
                      onChange={(e) => handleCheckPartnerCode(e.target.value)}
                      placeholder="Código del asesor (Ej: CARLOS24 o MARIA10)"
                      className={`w-full pl-11 pr-24 py-3 rounded-xl border text-sm font-mono uppercase tracking-wider outline-none transition-all placeholder:normal-case placeholder:font-sans placeholder:tracking-normal ${
                        partnerValidation?.valid 
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20 font-bold' 
                          : partnerCode.trim() && !isCheckingCode && partnerValidation?.valid === false 
                            ? 'border-amber-400 bg-amber-50/40 text-amber-900' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900 font-medium'
                      }`}
                    />
                    {isCheckingCode ? (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-sans">
                        Verificando...
                      </span>
                    ) : partnerValidation?.valid ? (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Válido
                      </span>
                    ) : null}
                  </div>

                  {/* Alerta de confirmación visual del vendedor */}
                  {partnerValidation?.valid && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Asesor comercial asignado: <strong>{partnerValidation.partnerName}</strong> ({partnerValidation.partnerCode}). ¡Tu cuenta quedará respaldada con su acompañamiento!
                      </span>
                    </motion.div>
                  )}

                  {partnerCode.trim() && !isCheckingCode && partnerValidation?.valid === false && (
                    <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                      <span>⚠️ Código de asesor no encontrado. Revisa que esté bien escrito o déjalo en blanco si te registraste por tu cuenta.</span>
                    </p>
                  )}

                  <p className="mt-1 text-[11px] text-gray-400">
                    Si alguien de nuestro equipo te orientó para crear tu cuenta, escribe su código para asignarle tu atención y soporte.
                  </p>
                </div>

                {/* Botón Siguiente */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Smile className="w-4 h-4 text-amber-500" />
                    Tardarás menos de 1 minuto
                  </div>
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Siguiente: Tus Servicios</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASO 2: Plantillas de Servicios */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Servicios sugeridos para {CATEGORY_TEMPLATES[businessType]?.label || 'tu negocio'}:
                    </h3>
                    <p className="text-xs text-gray-500">
                      Marca los que ofreces y ajusta el precio si lo necesitas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear otro
                  </button>
                </div>

                {/* Formulario rápido para agregar servicio personalizado */}
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3"
                  >
                    <div className="text-xs font-bold text-gray-700">Nuevo servicio:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input 
                        type="text"
                        placeholder="Nombre del servicio"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="sm:col-span-1.5 p-2 text-xs border rounded-lg bg-white"
                      />
                      <input 
                        type="number"
                        placeholder="Precio COP"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        className="p-2 text-xs border rounded-lg bg-white"
                      />
                      <select
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        className="p-2 text-xs border rounded-lg bg-white"
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">1 hora</option>
                        <option value="90">1.5 horas</option>
                        <option value="120">2 horas</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomService}
                        className="text-xs bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700"
                      >
                        Agregar a la lista
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Lista de Servicios sugeridos */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {services.map((srv, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        srv.selected 
                          ? 'border-blue-200 bg-blue-50/30' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input 
                          type="checkbox"
                          checked={srv.selected}
                          onChange={() => toggleService(idx)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="truncate">
                          <p className={`text-sm font-semibold truncate ${srv.selected ? 'text-gray-900' : 'text-gray-500'}`}>
                            {srv.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                            <Clock className="w-3 h-3" />
                            {srv.duration_minutes} min
                          </span>
                        </div>
                      </div>

                      {/* Input de Precio */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">$</span>
                          <input 
                            type="number"
                            value={srv.price}
                            onChange={(e) => updateServicePrice(idx, Number(e.target.value))}
                            disabled={!srv.selected}
                            className="w-full pl-6 pr-2 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-300 rounded-lg text-right focus:border-blue-500 focus:outline-none"
                            step="1000"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nota de Horario precargado */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Horario listo por defecto:</span> Lunes a Sábado de 9:00 AM a 7:00 PM (Domingos cerrado). Podrás cambiarlo cuando quieras en Ajustes.
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Guardando todo...</span>
                    ) : (
                      <>
                        <span>Finalizar y Activar</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASO 3: Felicitación y Enlace Listo */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    ¡Tu enlace de reservas ya está activo!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Copia tu enlace y colócalo en tu perfil de Instagram, en tus estados o envíaselo a tus clientes por WhatsApp:
                  </p>
                </div>

                {/* Caja de Link con botón Copiar */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="text-left font-mono text-sm font-bold text-blue-900 break-all">
                    agendaclick.com.co/{createdSlug}
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className={`shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isCopied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                  </button>
                </div>

                {/* Botón Ver mi página */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`/${createdSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 bg-white text-gray-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    Ver cómo lo ven mis clientes
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose()
                      window.location.reload()
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md"
                  >
                    <span>Ir a mi Agenda</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Tarjeta de Asistencia Gratuita WhatsApp */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-left flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">¿Prefieres que te ayudemos?</p>
                      <p className="text-[11px] text-gray-500">Escríbenos y te configuramos todo en 10 min gratis.</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/573239306599?text=Hola%20AgendaClick%2C%20acabo%20de%20crear%20mi%20cuenta%20y%20necesito%20ayuda%20para%20configurarla"
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer con opción de saltar o ayuda */}
        {step < 3 && onClose && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              type="button"
              onClick={onClose}
              className="hover:text-gray-800 underline transition-colors"
            >
              Configurar más tarde
            </button>
            <a
              href="https://wa.me/573239306599?text=Hola%2C%20tengo%20dudas%20al%20configurar%20AgendaClick"
              target="_blank"
              rel="noreferrer"
              className="text-green-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ayuda por WhatsApp
            </a>
          </div>
        )}
      </motion.div>
    </div>
  )
}
