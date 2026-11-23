'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Smartphone, 
  Video, 
  ArrowRight, 
  X, 
  HelpCircle,
  Building,
  Store
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  clinic: {
    name: string
    businessType?: string
    address?: string
    city?: string
    phone?: string
    slug?: string
  }
}

// Mapeo automático del tipo de negocio a la categoría oficial de Google Maps en español e inglés
const GOOGLE_CATEGORY_MAP: Record<string, { es: string; en: string }> = {
  barberia: { es: 'Barbería', en: 'Barber shop' },
  peluqueria: { es: 'Salón de belleza / Peluquería', en: 'Hair salon' },
  estetica: { es: 'Salón de manicura y pedicura', en: 'Nail salon' },
  spa: { es: 'Spa de día / Centro de masajes', en: 'Day spa' },
  salud: { es: 'Clínica médica / Consultorio', en: 'Medical clinic' },
  dental: { es: 'Clínica dental / Odontología', en: 'Dental clinic' },
  automotriz: { es: 'Taller mecánico de automóviles', en: 'Auto repair shop' },
  taller: { es: 'Taller de reparación', en: 'Auto repair shop' },
  lavadero: { es: 'Lavadero de autos', en: 'Car wash' },
  veterinaria: { es: 'Clínica veterinaria', en: 'Veterinary care' },
  canchas: { es: 'Complejo deportivo / Canchas sintéticas', en: 'Sports complex' },
  belleza: { es: 'Salón de belleza', en: 'Beauty salon' }
}

export default function GoogleMapsOnboardingModal({ isOpen, onClose, clinic }: Props) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)
  const [isCopied, setIsCopied] = useState(false)
  const [alreadyHasListing, setAlreadyHasListing] = useState(false)

  if (!isOpen) return null

  const rawType = (clinic.businessType || 'belleza').toLowerCase()
  const googleCategory = GOOGLE_CATEGORY_MAP[rawType] || { es: 'Negocio local', en: 'Local business' }
  const bookingUrl = clinic.slug ? `https://agendaclick.com.co/${clinic.slug}` : 'https://agendaclick.com.co'
  const fullAddress = [clinic.address, clinic.city, 'Colombia'].filter(Boolean).join(', ')

  // URL directa al portal oficial de Google Business Profile para dar de alta la empresa
  const googleCreateUrl = `https://business.google.com/create?name=${encodeURIComponent(clinic.name)}`
  
  // URL de búsqueda directa en Google Maps para verificar si ya existe
  const googleSearchMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.city || 'Colombia'}`)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl)
    setIsCopied(true)
    toast.success('¡Enlace de reservas copiado! Pégalo en tu ficha de Google Maps.')
    setTimeout(() => setIsCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Cabecera con degradado Google Maps */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <MapPin className="w-6 h-6 text-white" />
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider rounded-full">
              Asistente Oficial Google Maps
            </span>
          </div>

          <h3 className="text-xl font-black">Publica tu negocio en Google Maps</h3>
          <p className="text-xs text-white/80 mt-1">
            Permite que cualquier persona en tu ciudad encuentre tu local y reserve citas directamente.
          </p>

          {/* Stepper visual */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/20 text-xs font-bold">
            <button 
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-1.5 transition-opacity ${activeStep === 1 ? 'text-white' : 'text-white/60'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${activeStep === 1 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}>1</span>
              <span>Datos</span>
            </button>
            <div className="h-0.5 flex-1 mx-2 bg-white/20" />
            <button 
              onClick={() => setActiveStep(2)}
              className={`flex items-center gap-1.5 transition-opacity ${activeStep === 2 ? 'text-white' : 'text-white/60'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${activeStep === 2 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}>2</span>
              <span>Validación SMS</span>
            </button>
            <div className="h-0.5 flex-1 mx-2 bg-white/20" />
            <button 
              onClick={() => setActiveStep(3)}
              className={`flex items-center gap-1.5 transition-opacity ${activeStep === 3 ? 'text-white' : 'text-white/60'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${activeStep === 3 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}>3</span>
              <span>Botón Reservar</span>
            </button>
          </div>
        </div>

        {/* Contenido según el paso */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-800">
          {/* PASO 1: Datos ya preparados por AgendaClick */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">
                AgendaClick ya recopiló los datos de tu empresa. Al hacer clic abajo, Google abrirá su formulario oficial con tus datos listos:
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Nombre del negocio:</span>
                  <span className="font-extrabold text-gray-900">{clinic.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Categoría Google:</span>
                  <span className="font-bold text-blue-600">{googleCategory.es}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Dirección:</span>
                  <span className="font-semibold text-gray-800">{fullAddress || 'No especificada'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold">Teléfono para SMS:</span>
                  <span className="font-semibold text-gray-800">{clinic.phone || 'No especificado'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold">Enlace de citas:</span>
                  <span className="font-mono text-[11px] text-emerald-600 truncate max-w-[200px]">{bookingUrl}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={googleCreateUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setActiveStep(2)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>1. Abrir Alta en Google con mis datos</span>
                </a>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setAlreadyHasListing(true)
                      setActiveStep(3)
                    }}
                    className="text-xs text-gray-400 hover:text-black font-semibold underline"
                  >
                    ¿Tu negocio ya aparecía antes en Google Maps? Toca aquí
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Explicación de la validación rápida de Google (SMS o Video) */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-950 font-medium">
                  Google te pedirá confirmar que eres el dueño del local para publicar el punto.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 border rounded-2xl border-gray-200 bg-white space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Opción A: Validación rápida por SMS (30 segundos)</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-6">
                    Google enviará un código de 6 dígitos al celular <strong>{clinic.phone}</strong>. Solo debes ingresarlo en la pantalla de Google.
                  </p>
                </div>

                <div className="p-4 border rounded-2xl border-gray-200 bg-white space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span>Opción B: Video de verificación (si Google lo solicita)</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-6">
                    Graba un video corto continuo mostrando la calle, el letrero de tu negocio y la llave abriendo tu local comercial.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setActiveStep(3)}
                  className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Siguiente: Vincular el botón de Citas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Vincular el enlace de reservas de AgendaClick */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="text-xs text-gray-600 leading-relaxed">
                {alreadyHasListing
                  ? 'Si ya tienes tu ficha en Google Maps, solo necesitas agregar tu link de AgendaClick para que tus clientes puedan reservar en línea con 1 clic:'
                  : '¡Último paso! Para que el botón azul "Reservar en línea" aparezca en tu ficha de Google Maps, copia tu enlace oficial:'}
              </div>

              {/* Caja de Copiado de Enlace */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left overflow-hidden w-full">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Tu Enlace de Citas para Google Maps</span>
                  <span className="font-mono text-xs font-bold text-gray-900 break-all">{bookingUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isCopied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar Enlace'}</span>
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  ¿Dónde pegarlo en Google?
                </p>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  1. Abre tu perfil de Google Business.<br />
                  2. Toca en <strong>&quot;Editar perfil&quot;</strong> &gt; <strong>&quot;Reservas / Vínculo de citas&quot;</strong>.<br />
                  3. Pega este enlace y guarda. ¡Tu ficha mostrará el botón oficial de reservas de inmediato!
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={googleSearchMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver mi ficha en Google Maps</span>
                </a>

                <button
                  onClick={() => {
                    toast.success('¡Excelente! Tu local estará disponible para millones de usuarios.')
                    onClose()
                  }}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-black font-semibold text-center"
                >
                  Cerrar Asistente
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
