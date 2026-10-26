'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import { State, City } from 'country-state-city'
import ScheduleManager from '@/components/ScheduleManager'
import { 
  Building, 
  Palette, 
  Share2, 
  Calendar, 
  CreditCard, 
  Scale, 
  MessageCircle, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  ShieldCheck
} from 'lucide-react'

const PHONE_PREFIX_TO_COUNTRY: Record<string, string> = {
  '+57': 'CO',
  '+52': 'MX',
  '+34': 'ES',
  '+1': 'US',
  '+54': 'AR',
  '+56': 'CL',
  '+51': 'PE'
}

const PRESET_PALETTES = [
  {
    name: 'Elegante Oscuro',
    icon: '🖤',
    brand: '#0f172a',
    headerText: '#ffffff',
    sidebar: '#090d16',
    sidebarText: '#94a3b8',
    accent: '#38bdf8',
    bookingBg: '#f8fafc',
    bookingCard: '#ffffff',
    bookingText: '#0f172a'
  },
  {
    name: 'Rosa Belleza & Nails',
    icon: '🌸',
    brand: '#db2777',
    headerText: '#ffffff',
    sidebar: '#500724',
    sidebarText: '#fbcfe8',
    accent: '#f472b6',
    bookingBg: '#fdf2f8',
    bookingCard: '#ffffff',
    bookingText: '#1f2937'
  },
  {
    name: 'Azul Médico / Salud',
    icon: '💙',
    brand: '#2563eb',
    headerText: '#ffffff',
    sidebar: '#1e3a8a',
    sidebarText: '#bfdbfe',
    accent: '#60a5fa',
    bookingBg: '#eff6ff',
    bookingCard: '#ffffff',
    bookingText: '#1e293b'
  },
  {
    name: 'Dorado Spa & Estética',
    icon: '✨',
    brand: '#b45309',
    headerText: '#ffffff',
    sidebar: '#291e0a',
    sidebarText: '#fde68a',
    accent: '#f59e0b',
    bookingBg: '#fffbeb',
    bookingCard: '#ffffff',
    bookingText: '#1f2937'
  },
  {
    name: 'Verde Natural & Relax',
    icon: '🌿',
    brand: '#059669',
    headerText: '#ffffff',
    sidebar: '#064e3b',
    sidebarText: '#a7f3d0',
    accent: '#34d399',
    bookingBg: '#f0fdf4',
    bookingCard: '#ffffff',
    bookingText: '#1f2937'
  }
]

function GoogleCalendarSync({ profile, isDisconnecting, onDisconnect }: { profile: any, isDisconnecting: boolean, onDisconnect: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 border rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${profile?.google_calendar_id ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {profile?.google_calendar_id ? 'Google Calendar Conectado' : 'Google Calendar Sin Conectar'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {profile?.google_calendar_id 
              ? 'Las citas se sincronizan automáticamente en tu calendario.' 
              : 'Conecta tu cuenta para sincronizar tus citas en tiempo real.'}
          </p>
        </div>
      </div>

      {profile?.google_calendar_id ? (
        <button 
          type="button"
          onClick={onDisconnect}
          disabled={isDisconnecting}
          className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDisconnecting ? 'Desconectando...' : 'Desconectar Cuenta'}
        </button>
      ) : (
        <a 
          href="/api/calendar/auth" 
          className="inline-flex text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 border border-blue-200 rounded-lg transition-colors"
        >
          Conectar Calendario
        </a>
      )}
    </div>
  )
}

export default function SettingsForm({ clinic, profile, saveAction }: { clinic: any, profile?: any, saveAction: (formData: FormData) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(clinic?.name || '')
  const [slug, setSlug] = useState(clinic?.slug || '')
  const [slogan, setSlogan] = useState(clinic?.slogan || '')
  const [isBookable, setIsBookable] = useState(profile?.is_bookable || false)
  const searchParams = useSearchParams()

  const [brandColor, setBrandColor] = useState(clinic?.brand_color || '#10b981')
  const [headerTextColor, setHeaderTextColor] = useState(clinic?.header_text_color || '#ffffff')
  const [sidebarColor, setSidebarColor] = useState(clinic?.sidebar_color || '#111827')
  const [sidebarTextColor, setSidebarTextColor] = useState(clinic?.sidebar_text_color || '#9ca3af')
  const [dashboardAccentColor, setDashboardAccentColor] = useState(clinic?.dashboard_accent_color || '#10b981')
  const [bookingBgColor, setBookingBgColor] = useState(clinic?.booking_bg_color || '#f9fafb')
  const [bookingTextColor, setBookingTextColor] = useState(clinic?.booking_text_color || '#111827')
  const [bookingCardColor, setBookingCardColor] = useState(clinic?.booking_card_color || '#ffffff')

  const [coverPreview, setCoverPreview] = useState<string | null>(clinic?.cover_image_url || null)
  const [logoPreview, setLogoPreview] = useState<string | null>(clinic?.logo_url || null)
  const [activeTab, setActiveTab] = useState<'basic' | 'design' | 'social' | 'integrations' | 'legal'>('basic')
  const [isCopied, setIsCopied] = useState(false)

  // Estado para la sección Legal
  const [isFormalized, setIsFormalized] = useState<boolean>(() => {
    if (clinic?.schedule?.legal?.is_formalized !== undefined) {
      return !!clinic.schedule.legal.is_formalized
    }
    return !!(clinic?.schedule?.legal?.nit || clinic?.schedule?.legal?.business_legal_name)
  })

  const [hasWebsite, setHasWebsite] = useState<boolean>(() => {
    if (clinic?.schedule?.legal?.has_website !== undefined) {
      return !!clinic.schedule.legal.has_website
    }
    return !!(clinic?.schedule?.legal?.terms_url || clinic?.schedule?.legal?.privacy_url)
  })

  const [responsibleName, setResponsibleName] = useState(
    clinic?.schedule?.legal?.responsible_name || profile?.name || clinic?.name || ''
  )
  const [responsibleId, setResponsibleId] = useState(
    clinic?.schedule?.legal?.responsible_id || ''
  )
  const [legalBusinessName, setLegalBusinessName] = useState(
    clinic?.schedule?.legal?.business_legal_name || ''
  )
  const [legalNit, setLegalNit] = useState(
    clinic?.schedule?.legal?.nit || ''
  )
  const [legalTermsUrl, setLegalTermsUrl] = useState(
    clinic?.schedule?.legal?.terms_url || ''
  )
  const [legalPrivacyUrl, setLegalPrivacyUrl] = useState(
    clinic?.schedule?.legal?.privacy_url || ''
  )
  const [customTermsText, setCustomTermsText] = useState(
    clinic?.schedule?.legal?.custom_terms_text || 
    'Las citas deben cancelarse o reprogramarse con al menos 2 horas de anticipación. Se agradece puntualidad (tolerancia máxima de 15 minutos de retraso). AgendaClick no cobra penalidades por cancelación.'
  )
  const [dataPolicyText, setDataPolicyText] = useState(
    clinic?.schedule?.legal?.data_treatment_policy || 
    'Autorizo el tratamiento de mis datos personales únicamente para la gestión, recordatorio, confirmación y control de citas conforme a la Ley 1581 de 2012 de Habeas Data. En ningún momento mis datos serán compartidos con terceros.'
  )

  const [staffName, setStaffName] = useState(profile?.name || '')
  const [isSavingStaff, setIsSavingStaff] = useState(false)
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState(clinic?.business_type || 'belleza')
  const [brands, setBrands] = useState<string[]>(() => {
    if (clinic?.schedule?.vehicle_brands && Array.isArray(clinic.schedule.vehicle_brands)) {
      return clinic.schedule.vehicle_brands
    }
    return [
      'JAC Motors (Combustión y Eléctricos)',
      'DFSK (Utilitarios y Eléctricos)',
      'Honda',
      'Foton (Camiones y Pickups)',
      'KGM / SsangYong',
      'Great Wall / Haval',
      'Toyota',
      'Renault',
      'Chevrolet',
      'Mazda',
      'Nissan',
      'Kia',
      'BYD (Eléctricos e Híbridos)',
      'Otra Marca / Multimarca'
    ]
  })
  const [newBrandInput, setNewBrandInput] = useState('')

  const addBrand = () => {
    if (!newBrandInput.trim()) return
    if (!brands.includes(newBrandInput.trim())) {
      setBrands(prev => [...prev, newBrandInput.trim()])
    }
    setNewBrandInput('')
  }

  const removeBrand = (brandToRemove: string) => {
    setBrands(prev => prev.filter(b => b !== brandToRemove))
  }

  const handleStaffSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!staffName.trim()) return
    setIsSavingStaff(true)
    try {
      const formData = new FormData()
      formData.set('staff_name', staffName)
      await saveAction(formData)
      toast.success('Perfil guardado con éxito')
    } catch (error) {
      toast.error('Error al guardar perfil')
    } finally {
      setIsSavingStaff(false)
    }
  }

  const handleDisconnectCalendar = async () => {
    if (!confirm('¿Estás seguro de desconectar Google Calendar? Se dejarán de sincronizar las citas automáticamente.')) return
    setIsDisconnectingCalendar(true)
    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' })
      if (res.ok) {
        toast.success('Google Calendar desconectado exitosamente')
        window.location.reload()
      } else {
        toast.error('Error al desconectar Google Calendar')
      }
    } catch (e) {
      toast.error('Error de red al desconectar')
    } finally {
      setIsDisconnectingCalendar(false)
    }
  }

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const successParam = searchParams.get('success')

    if (errorParam === 'calendar_auth_failed') {
      toast.error('Error al vincular con Google Calendar. Intenta nuevamente.')
    } else if (errorParam === 'calendar_access_denied') {
      toast.error('Permisos de Google Calendar no concedidos.')
    } else if (successParam === 'calendar_connected') {
      toast.success('¡Google Calendar vinculado exitosamente!')
    }
  }, [searchParams])

  const [phonePrefix, setPhonePrefix] = useState('+57')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    if (clinic?.phone) {
      const match = clinic.phone.match(/^(\+\d{1,3})(.*)$/)
      if (match) {
        setPhonePrefix(match[1])
        setPhoneNumber(match[2].trim())
      } else {
        setPhoneNumber(clinic.phone)
      }
    }
  }, [clinic?.phone])

  const [countryCode, setCountryCode] = useState(clinic?.country || 'CO')
  const [stateCode, setStateCode] = useState(clinic?.state || '')
  const [cityName, setCityName] = useState(clinic?.city || '')
  const [neighborhood, setNeighborhood] = useState(clinic?.neighborhood || '')

  const handlePhonePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prefix = e.target.value
    setPhonePrefix(prefix)
    if (PHONE_PREFIX_TO_COUNTRY[prefix]) {
      setCountryCode(PHONE_PREFIX_TO_COUNTRY[prefix])
      setStateCode('')
      setCityName('')
    }
  }

  const availableStates = State.getStatesOfCountry(countryCode)
  const availableCities = stateCode ? City.getCitiesOfState(countryCode, stateCode) : []

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    const generated = newName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]+/g, '-') 
      .replace(/^-+|-+$/g, '') 
    setSlug(generated)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const applyPalette = (p: typeof PRESET_PALETTES[0]) => {
    setBrandColor(p.brand)
    setHeaderTextColor(p.headerText)
    setSidebarColor(p.sidebar)
    setSidebarTextColor(p.sidebarText)
    setDashboardAccentColor(p.accent)
    setBookingBgColor(p.bookingBg)
    setBookingCardColor(p.bookingCard)
    setBookingTextColor(p.bookingText)
    toast.success(`Paleta "${p.name}" aplicada`)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set('phone', `${phonePrefix}${phoneNumber}`)
    formData.set('country', countryCode)
    
    try {
      await saveAction(formData)
      toast.success('Configuración guardada con éxito')
    } catch (error: any) {
      toast.error(error?.message || 'Ocurrió un error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (profile?.role === 'staff') {
    return (
      <div className="space-y-6">
        <form onSubmit={handleStaffSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Público</label>
            <input 
              type="text" 
              name="staff_name" 
              value={staffName} 
              onChange={(e) => setStaffName(e.target.value)}
              required
              placeholder="Ej. Dra. Carolina Gómez"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-black focus:border-black" 
            />
            <p className="text-xs text-gray-500 mt-1">Este es el nombre que verán los clientes al agendar una cita contigo.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico (Solo Lectura)</label>
            <input 
              type="email" 
              readOnly 
              value={profile?.email || ''} 
              className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none cursor-not-allowed" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSavingStaff}
            className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            {isSavingStaff ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Sincronización con Google Calendar</h3>
          <p className="text-sm text-gray-500">Sincroniza tus citas de AgendaClick en tu calendario personal de Google automáticamente para evitar que se te crucen con compromisos personales.</p>
          <GoogleCalendarSync 
            profile={profile} 
            isDisconnecting={isDisconnectingCalendar} 
            onDisconnect={handleDisconnectCalendar} 
          />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Banner de Asistencia Concierge WhatsApp */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">¿Prefieres que lo configuremos por ti gratis?</h3>
            <p className="text-[11px] sm:text-xs text-gray-600">Si no conoces de sistemas, envíanos tu lista o fotos a WhatsApp y te lo dejamos listo en 10 minutos.</p>
          </div>
        </div>
        <a
          href="https://wa.me/573239306599?text=Hola%2C%20quiero%20ayuda%20para%20configurar%20mi%20negocio%20en%20AgendaClick"
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto justify-center shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          Pedir ayuda por WhatsApp
        </a>
      </div>

      {/* Selector de Pestañas Simplificado */}
      <div className="flex border-b border-gray-200 gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'basic' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Building className="w-4 h-4 shrink-0" />
          1. Datos Básicos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'design' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          2. Logo y Colores
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'social' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          3. Redes Sociales
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'integrations' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          4. Pagos y Calendario
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'legal' 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Scale className="w-4 h-4 shrink-0" />
          5. Legal & Políticas
        </button>
      </div>

      {/* PESTAÑA 1: DATOS BÁSICOS DEL NEGOCIO */}
      <div className={activeTab === 'basic' ? 'space-y-6' : 'hidden'}>
        <div className="border-b pb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Datos Principales del Negocio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">Nombre del Negocio *</label>
              <input 
                name="name" 
                required 
                value={name} 
                onChange={handleNameChange}
                placeholder="Ej. Barbería Don Carlos, Diana Nails Studio" 
                className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm focus:ring-black focus:border-black" 
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
                Enlace web de tu negocio (para tus clientes) *
              </label>
              <div className="flex rounded-xl shadow-xs overflow-hidden border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black w-full">
                <span className="inline-flex items-center px-2.5 sm:px-3.5 bg-gray-50 text-gray-500 text-xs sm:text-sm font-medium border-r border-gray-200 shrink-0">
                  agendaclick.com.co/
                </span>
                <input 
                  name="slug" 
                  required 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="mi-negocio" 
                  className="flex-1 min-w-0 block w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none bg-white font-mono" 
                />
                {slug && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://agendaclick.com.co'}/${slug}`
                      navigator.clipboard.writeText(url)
                      setIsCopied(true)
                      toast.success('¡Enlace copiado!')
                      setTimeout(() => setIsCopied(false), 2000)
                    }}
                    className="px-2.5 sm:px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 border-l border-gray-200 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Copiar enlace"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Este es el enlace que tus clientes abrirán desde WhatsApp o Instagram para agendar sus citas.</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">WhatsApp de Contacto (Notificaciones y Reservas) *</label>
              <div className="flex gap-2 w-full">
                <select 
                  value={phonePrefix}
                  onChange={handlePhonePrefixChange}
                  className="shrink-0 border border-gray-300 rounded-xl px-2 py-2 bg-white focus:ring-black focus:border-black text-xs sm:text-sm w-28 sm:w-36"
                >
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+56">🇨🇱 +56</option>
                  <option value="+51">🇵🇪 +51</option>
                </select>
                <input 
                  type="tel"
                  required 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="300 123 4567" 
                  className="flex-1 min-w-0 w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm focus:ring-black focus:border-black" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">Categoría de tu Negocio</label>
              <select 
                name="business_type" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full max-w-full border border-gray-300 rounded-xl px-2.5 sm:px-3 py-2.5 bg-white focus:ring-black focus:border-black text-xs sm:text-sm truncate"
              >
                <option value="belleza">💅 Estética y Belleza (Peluquerías, Barberías, Cejas, Uñas)</option>
                <option value="bienestar">🧘 Spas y Bienestar (Masajes, Terapias, Yoga, Relajación)</option>
                <option value="salud">🏥 Clínicas y Centros de Salud (Fisioterapia, Nutrición)</option>
                <option value="psicologia">🧠 Psicología y Terapia (Consultas, Terapia de Pareja, Coaching)</option>
                <option value="odontologia">🦷 Odontología y Ortodoncia (Limpiezas, Estética Dental)</option>
                <option value="quiropractica">🦴 Quiropráctica y Masajes Terapéuticos</option>
                <option value="medicina_general">🩺 Consulta Médica y Especialistas</option>
                <option value="deportes">🏆 Deportes y Canchas (Sintéticas, Tenis, Pádel, Squash)</option>
                <option value="automotriz">🚗 Automotriz y Carga Eléctrica (Lavaderos, Talleres, Estaciones)</option>
                <option value="educacion">🎓 Educación y Clases (Tutorías, Idiomas, Autoescuelas, Música)</option>
                <option value="mascotas">🐾 Mascotas y Veterinarias (Peluquería Canina, Guardería)</option>
                <option value="profesional">💼 Servicios Profesionales (Abogados, Fotógrafos, Tatuadores, Consultoría)</option>
              </select>
            </div>

            {/* Gestión de Marcas para Talleres y Concesionarios */}
            {selectedCategory === 'automotriz' && (
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      🚗 Marcas de Vehículos Atendidas
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Estas son las marcas que tus clientes podrán elegir al momento de reservar su cita.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {brands.map(brand => (
                    <span 
                      key={brand}
                      className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xs"
                    >
                      {brand}
                      <button
                        type="button"
                        onClick={() => removeBrand(brand)}
                        className="text-red-500 hover:text-red-700 font-bold ml-0.5"
                        title="Eliminar marca"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newBrandInput}
                    onChange={(e) => setNewBrandInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBrand(); } }}
                    placeholder="Escribe una nueva marca (Ej. Mercedes-Benz, Ford)..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-black focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={addBrand}
                    className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-xs"
                  >
                    + Añadir Marca
                  </button>
                </div>
                <input type="hidden" name="vehicle_brands" value={JSON.stringify(brands)} />
              </div>
            )}
          </div>
        </div>

        {/* Tu Perfil como Profesional */}
        <div className="border-b pb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Tu Perfil como Profesional</h2>
          <div className="bg-blue-50 border border-blue-100 p-3.5 sm:p-4 rounded-xl space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="is_bookable" 
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black mt-0.5 shrink-0"
                checked={isBookable}
                onChange={(e) => setIsBookable(e.target.checked)}
              />
              <span className="text-xs sm:text-sm font-semibold text-blue-900 leading-snug">
                Yo también atiendo clientes (Quiero aparecer en la lista de profesionales para recibir reservas)
              </span>
            </label>
            
            {isBookable && (
              <div className="pt-2 sm:pl-8">
                <label className="block text-xs sm:text-sm font-medium text-blue-900 mb-1">Tu Nombre Público</label>
                <input 
                  name="owner_name" 
                  defaultValue={profile?.name || ''} 
                  placeholder="Ej. Dra. María o Estilista Juan" 
                  required={isBookable}
                  className="w-full min-w-0 border border-blue-200 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm focus:ring-black focus:border-black bg-white" 
                />
                <p className="text-[11px] sm:text-xs text-blue-700 mt-1">Así te verán los clientes al agendar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Horarios de Atención */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Horario de Atención</h2>
          <p className="text-xs text-gray-500 mb-4">Define los días y horas en que tu negocio abre para recibir clientes.</p>
          <div className="bg-white">
            <ScheduleManager initialSchedule={clinic?.schedule} />
          </div>
        </div>

        {/* Ubicación */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ubicación y Dirección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento / Estado *</label>
              <select 
                name="state" 
                value={stateCode}
                onChange={(e) => {
                  setStateCode(e.target.value)
                  setCityName('')
                }}
                className="w-full border rounded-xl px-3 py-2.5 bg-white focus:ring-black focus:border-black text-sm"
                required
              >
                <option value="">Selecciona un departamento...</option>
                {availableStates.map(state => (
                  <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad / Municipio *</label>
              <select 
                name="city" 
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 bg-white focus:ring-black focus:border-black text-sm"
                required
                disabled={!stateCode}
              >
                <option value="">Selecciona una ciudad...</option>
                {availableCities.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
              <input 
                name="neighborhood" 
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ej. El Poblado, Chapinero, San Fernando..." 
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-black focus:border-black" 
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Exacta (Google Maps)</label>
              <AddressAutocomplete 
                defaultAddress={clinic?.address || ''} 
                defaultLat={clinic?.latitude || ''}
                defaultLng={clinic?.longitude || ''}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PESTAÑA 2: LOGO, COLORES Y DISEÑO */}
      <div className={activeTab === 'design' ? 'space-y-6' : 'hidden'}>
        <div className="border-b pb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Logo e Imágenes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Logotipo (Cuadrado o Circular recomendado)</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover border bg-white shadow-xs shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold border border-gray-200 uppercase shrink-0">
                    {name ? name.charAt(0) : 'N'}
                  </div>
                )}
                <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer max-w-full" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Imagen de Portada (Fondo del Encabezado)</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {coverPreview ? (
                  <img src={coverPreview} alt="Portada" className="w-24 h-16 rounded-xl object-cover border shadow-xs shrink-0" />
                ) : (
                  <div className="w-24 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center border border-gray-200 shrink-0">
                    Sin Portada
                  </div>
                )}
                <input type="file" name="cover_image" accept="image/*" onChange={handleCoverChange} className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer max-w-full" />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Sube una imagen horizontal (paisaje) para mostrar como fondo en tu página de reservas.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slogan o Frase de Presentación</label>
              <input 
                name="slogan" 
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Ej. Expertos en transformar tu estilo" 
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-black focus:border-black" 
                maxLength={100}
              />
            </div>
          </div>
        </div>

        {/* Paletas de Colores Rápidas en 1 Clic */}
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border border-purple-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900">Paletas de Colores Rápidas en 1 Clic</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            ¿No quieres complicarte eligiendo colores uno por uno? Elige una de nuestras combinaciones listas:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {PRESET_PALETTES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPalette(p)}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:border-purple-400 hover:shadow-xs transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-[11px] font-bold text-gray-800 leading-tight">{p.name}</span>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: p.brand }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: p.sidebar }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: p.accent }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ajustes Manuales de Colores (Opcional) */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ajuste Manual de Colores y Tipografía</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Principal (Botones)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="brand_color" 
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{brandColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color de Texto (Cabecera)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="header_text_color" 
                  value={headerTextColor}
                  onChange={(e) => setHeaderTextColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{headerTextColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Letra (Tipografía)</label>
              <select 
                name="font_family" 
                defaultValue={clinic?.font_family || 'Outfit'} 
                className="w-full border rounded-xl px-3 py-2 bg-white focus:ring-black focus:border-black text-sm"
              >
                <option value="Outfit">Outfit (Moderna & Redondeada)</option>
                <option value="Inter">Inter (Limpia & Corporativa)</option>
                <option value="Montserrat">Montserrat (Negrita & Geométrica)</option>
                <option value="Playfair Display">Playfair Display (Elegante & Clásica)</option>
                <option value="Roboto">Roboto (Sencilla & Estándar)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fondo Barra Lateral</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="sidebar_color" 
                  value={sidebarColor}
                  onChange={(e) => setSidebarColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{sidebarColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto Barra Lateral</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="sidebar_text_color" 
                  value={sidebarTextColor}
                  onChange={(e) => setSidebarTextColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{sidebarTextColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Acento (Hover)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="dashboard_accent_color" 
                  value={dashboardAccentColor}
                  onChange={(e) => setDashboardAccentColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{dashboardAccentColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fondo de Reservas</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="booking_bg_color" 
                  value={bookingBgColor}
                  onChange={(e) => setBookingBgColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{bookingBgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto de Reservas</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="booking_text_color" 
                  value={bookingTextColor}
                  onChange={(e) => setBookingTextColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{bookingTextColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarjetas de Reservas</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="booking_card_color" 
                  value={bookingCardColor}
                  onChange={(e) => setBookingCardColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-xs text-gray-500 font-mono uppercase">{bookingCardColor}</span>
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Vista Previa en Vivo</h3>
            <div className="border border-gray-200 rounded-2xl overflow-hidden max-w-sm mx-auto shadow-lg relative bg-white h-[360px] flex flex-col">
              <div 
                className="relative p-6 text-center flex flex-col items-center transition-colors duration-300 min-h-[220px] justify-center"
                style={{
                  backgroundColor: coverPreview ? undefined : brandColor,
                  backgroundImage: coverPreview ? `url(${coverPreview})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {coverPreview && (
                  <div className="absolute inset-0 bg-black/40" />
                )}
                <div className="relative z-10 w-full flex flex-col items-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover mb-3 border-2 shadow-lg bg-white" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-black mb-3 border-2 border-white/20 shadow-lg">
                      {name ? name.charAt(0).toUpperCase() : 'N'}
                    </div>
                  )}
                  <h1 className="text-xl font-light tracking-tight" style={{ color: headerTextColor }}>
                    {name || 'Nombre de tu Negocio'}
                  </h1>
                  <p className="mt-1 text-xs italic" style={{ color: headerTextColor, opacity: 0.8 }}>
                    {slogan || 'Tu slogan aparecerá aquí'}
                  </p>
                </div>
              </div>
              <div className="p-4 flex-1 bg-white flex flex-col items-center justify-center text-gray-400">
                <span className="text-xs">Así se verá la cabecera en los celulares de tus clientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PESTAÑA 3: REDES SOCIALES */}
      <div className={activeTab === 'social' ? 'space-y-6' : 'hidden'}>
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Share2 className="w-5 h-5 text-pink-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Redes Sociales de tu Negocio</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Estos enlaces se mostrarán en tu página de reservas y en los correos automáticos de confirmación para que tus clientes te sigan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <div className="flex rounded-xl shadow-xs overflow-hidden border border-gray-300 w-full focus-within:border-black">
                <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-xs sm:text-sm border-r shrink-0">@</span>
                <input 
                  name="instagram" 
                  defaultValue={clinic?.instagram_url || ''}
                  placeholder="usuario" 
                  className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm focus:outline-none bg-white" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input 
                name="facebook" 
                defaultValue={clinic?.facebook_url || ''}
                placeholder="Enlace o nombre de página" 
                className="w-full min-w-0 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm focus:ring-black focus:border-black bg-white" 
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">TikTok</label>
              <div className="flex rounded-xl shadow-xs overflow-hidden border border-gray-300 w-full focus-within:border-black">
                <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-xs sm:text-sm border-r shrink-0">@</span>
                <input 
                  name="tiktok" 
                  defaultValue={clinic?.tiktok_url || ''}
                  placeholder="usuario" 
                  className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm focus:outline-none bg-white" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">YouTube</label>
              <input 
                name="youtube" 
                defaultValue={clinic?.youtube_url || ''}
                placeholder="Enlace del canal" 
                className="w-full min-w-0 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm focus:ring-black focus:border-black bg-white" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* PESTAÑA 4: CONEXIONES (PAGOS Y CALENDARIO) */}
      <div className={activeTab === 'integrations' ? 'space-y-6' : 'hidden'}>
        {/* Pasarela de Pagos */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Cobro de Citas en Línea (Pasarela de Pagos)</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Permite que tus clientes paguen sus servicios antes de asistir mediante Wompi, ePayco o MercadoPago.
          </p>
          <div className="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-2xl space-y-3">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              ¿Quieres recibir pagos online de tus clientes al agendar? Activamos pasarelas colombianas de forma 100% segura para tu portal.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
              <a 
                href="https://wa.me/573239306599?text=Hola%20Nexora%20Digital,%20me%20gustar%C3%ADa%20solicitar%20la%20integraci%C3%B3n%20segura%20de%20la%20pasarela%20de%20pagos%20de%20citas%20para%20mi%20portal%20de%20AgendaClick."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Contactar Soporte para Integrar Pagos
              </a>
              <span className="text-[11px] text-gray-400">
                La integración es realizada directamente por nuestro equipo para garantizar la seguridad de tus cuentas bancarias.
              </span>
            </div>
          </div>
        </div>

        {/* Sincronización con Google Calendar */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Sincronización con Google Calendar</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Sincroniza tus citas de AgendaClick en tu calendario personal de Google automáticamente para evitar cruces de horario.
          </p>
          <GoogleCalendarSync 
            profile={profile} 
            isDisconnecting={isDisconnectingCalendar} 
            onDisconnect={handleDisconnectCalendar} 
          />
        </div>
      </div>

      {/* PESTAÑA 5: INFORMACIÓN LEGAL Y POLÍTICAS */}
      <div className={activeTab === 'legal' ? 'space-y-6' : 'hidden'}>
        <input type="hidden" name="is_formalized" value={isFormalized ? 'true' : 'false'} />
        <input type="hidden" name="has_website" value={hasWebsite ? 'true' : 'false'} />

        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Scale className="w-5 h-5 text-indigo-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Información Legal y Habeas Data</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Configura la identidad legal de tu negocio y las políticas de cancelación para tus clientes con total claridad y respaldo de la Ley 1581.
          </p>

          {/* Pregunta Clave: ¿Formalizado o Independiente? */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2.5">
              ¿Tu negocio está registrado ante Cámara de Comercio?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción 1: No formalizado / Independiente */}
              <button
                type="button"
                onClick={() => setIsFormalized(false)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  !isFormalized 
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Soy Independiente / Sin Cámara de Comercio
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    !isFormalized ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {!isFormalized && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  Para profesionales independientes, estilistas, barberos, consultores o negocios que operan a título personal sin empresa formal constituida.
                </p>
                <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full w-fit">
                  ⚡ Recomendado para la mayoría de negocios
                </span>
              </button>

              {/* Opción 2: Empresa formalizada */}
              <button
                type="button"
                onClick={() => setIsFormalized(true)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isFormalized 
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Sí, somos Empresa Formalizada (S.A.S. / NIT)
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isFormalized ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                  }`}>
                    {isFormalized && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  Para personas jurídicas registradas en Cámara de Comercio con Razón Social, NIT y representante legal.
                </p>
                <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full w-fit">
                  🏢 Sociedades, Clínicas & Franquicias
                </span>
              </button>
            </div>
          </div>

          {/* SUB-MENÚ A: PARA NEGOCIOS INDEPENDIENTES / SIN CÁMARA DE COMERCIO */}
          {!isFormalized && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">¡Tranquilo(a)! No necesitas Cámara de Comercio ni página web para usar AgendaClick.</span>
                  <p className="mt-0.5 text-emerald-800">
                    AgendaClick genera automáticamente los términos legales y la cláusula de protección de datos (Habeas Data Ley 1581) a tu nombre o nombre comercial. Tus clientes estarán 100% informados y protegidos al agendar.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nombre del Responsable del Negocio *
                    </label>
                    <input
                      type="text"
                      name="responsible_name"
                      value={responsibleName}
                      onChange={(e) => setResponsibleName(e.target.value)}
                      placeholder="Ej. Diana Marcela Rodríguez"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Este nombre aparecerá en la política de datos y términos de tus clientes.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Cédula o RUT Personal (Opcional)
                    </label>
                    <input
                      type="text"
                      name="responsible_id"
                      value={responsibleId}
                      onChange={(e) => setResponsibleId(e.target.value)}
                      placeholder="Ej. C.C. 1.085.123.456"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Para mayor transparencia con tus clientes al momento de agendar.</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Regla de Cancelación y Puntualidad para tus Clientes
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setCustomTermsText('Las citas deben cancelarse o reprogramarse con al menos 2 horas de anticipación. Se agradece puntualidad (tolerancia máxima de 15 minutos). AgendaClick no cobra penalidades por cancelación.')}
                      className="text-[11px] font-medium bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      ⏱️ 2 horas antes (Estándar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomTermsText('Las citas deben cancelarse o reprogramarse con al menos 24 horas de anticipación para permitir ceder el espacio a otro cliente. Tolerancia de 10 minutos.')}
                      className="text-[11px] font-medium bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      📅 24 horas antes
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomTermsText('Sin penalidad por cancelación. Si no puedes asistir, por favor avísanos por WhatsApp lo antes posible para liberar tu turno.')}
                      className="text-[11px] font-medium bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      🤝 Flexible / Sin penalidad
                    </button>
                  </div>
                  <textarea
                    name="legal_custom_terms_text"
                    rows={2}
                    value={customTermsText}
                    onChange={(e) => setCustomTermsText(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tratamiento de Datos Personales (Habeas Data Automático)
                  </label>
                  <textarea
                    name="legal_data_policy"
                    rows={2}
                    value={dataPolicyText}
                    onChange={(e) => setDataPolicyText(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Con este texto tus clientes autorizan el uso de su celular y nombre exclusivamente para la reserva, cumpliendo la Ley 1581 de 2012.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-MENÚ B: PARA EMPRESAS FORMALIZADAS (CÁMARA DE COMERCIO / S.A.S. / NIT) */}
          {isFormalized && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Razón Social Registrada en Cámara de Comercio *
                    </label>
                    <input
                      type="text"
                      name="legal_business_name"
                      value={legalBusinessName}
                      onChange={(e) => setLegalBusinessName(e.target.value)}
                      placeholder="Ej. Inversiones Estética Integral S.A.S."
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      NIT de la Empresa *
                    </label>
                    <input
                      type="text"
                      name="legal_nit"
                      value={legalNit}
                      onChange={(e) => setLegalNit(e.target.value)}
                      placeholder="Ej. 901.234.567-8"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                {/* Pregunta sobre si tiene sitio web externo */}
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    ¿Tu empresa ya tiene una página web propia con sus propios términos y privacidad?
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input 
                        type="radio" 
                        name="has_website_radio" 
                        checked={!hasWebsite} 
                        onChange={() => setHasWebsite(false)} 
                        className="text-black focus:ring-black"
                      />
                      No tengo página web (Usar los términos integrados en AgendaClick)
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input 
                        type="radio" 
                        name="has_website_radio" 
                        checked={hasWebsite} 
                        onChange={() => setHasWebsite(true)} 
                        className="text-black focus:ring-black"
                      />
                      Sí, tengo página web externa
                    </label>
                  </div>
                </div>

                {/* Si tiene página web externa */}
                {hasWebsite ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Enlace a Términos del Servicio (URL externa)
                      </label>
                      <input
                        type="url"
                        name="legal_terms_url"
                        value={legalTermsUrl}
                        onChange={(e) => setLegalTermsUrl(e.target.value)}
                        placeholder="https://tuempresa.com/terminos"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Enlace a Política de Privacidad (URL externa)
                      </label>
                      <input
                        type="url"
                        name="legal_privacy_url"
                        value={legalPrivacyUrl}
                        onChange={(e) => setLegalPrivacyUrl(e.target.value)}
                        placeholder="https://tuempresa.com/privacidad"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>
                ) : (
                  /* Si NO tiene página web externa, usar los textareas integrados */
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Términos del Servicio y Cancelación para Clientes
                      </label>
                      <textarea
                        name="legal_custom_terms_text"
                        rows={2}
                        value={customTermsText}
                        onChange={(e) => setCustomTermsText(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tratamiento de Datos Personales (Habeas Data)
                      </label>
                      <textarea
                        name="legal_data_policy"
                        rows={2}
                        value={dataPolicyText}
                        onChange={(e) => setDataPolicyText(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 bg-white text-xs sm:text-sm focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTONES INFERIORES SIEMPRE VISIBLES */}
      <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab !== 'basic' && (
            <button
              type="button"
              onClick={() => {
                const TAB_KEYS: Array<'basic' | 'design' | 'social' | 'integrations' | 'legal'> = [
                  'basic', 'design', 'social', 'integrations', 'legal'
                ]
                const idx = TAB_KEYS.indexOf(activeTab)
                if (idx > 0) setActiveTab(TAB_KEYS[idx - 1])
              }}
              className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Paso Anterior
            </button>
          )}
          {activeTab !== 'legal' && (
            <button
              type="button"
              onClick={() => {
                const TAB_KEYS: Array<'basic' | 'design' | 'social' | 'integrations' | 'legal'> = [
                  'basic', 'design', 'social', 'integrations', 'legal'
                ]
                const idx = TAB_KEYS.indexOf(activeTab)
                if (idx < TAB_KEYS.length - 1) setActiveTab(TAB_KEYS[idx + 1])
              }}
              className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Paso Siguiente
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`flex items-center justify-center gap-2 transition-all text-white px-8 py-3 rounded-xl font-bold text-sm w-full sm:w-auto shadow-md cursor-pointer
            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando Configuración...
            </>
          ) : 'Guardar Todos los Cambios'}
        </button>
      </div>
    </form>
  )
}
