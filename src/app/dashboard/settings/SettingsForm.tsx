'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import { State, City } from 'country-state-city'
import ScheduleManager from '@/components/ScheduleManager'

const PHONE_PREFIX_TO_COUNTRY: Record<string, string> = {
  '+57': 'CO',
  '+52': 'MX',
  '+34': 'ES',
  '+1': 'US',
  '+54': 'AR',
  '+56': 'CL',
  '+51': 'PE'
}

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
  const [coverPreview, setCoverPreview] = useState<string | null>(clinic?.cover_image_url || null)
  const [logoPreview, setLogoPreview] = useState<string | null>(clinic?.logo_url || null)

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
      toast.error('Ocurrió un error al guardar')
    } finally {
      setIsSavingStaff(false)
    }
  }

  const handleDisconnectCalendar = async () => {
    if (!window.confirm('¿Estás seguro de que deseas desconectar Google Calendar? Las citas nuevas ya no se sincronizarán.')) return
    setIsDisconnectingCalendar(true)
    try {
      const { disconnectGoogleCalendar } = await import('./actions')
      await disconnectGoogleCalendar()
      toast.success('Google Calendar desconectado correctamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al desconectar Google Calendar')
    } finally {
      setIsDisconnectingCalendar(false)
    }
  }
  
  useEffect(() => {
    if (searchParams.get('tutorial') === 'true' && !clinic) {
      toast.error('Primero debes crear el perfil de tu estética para poder acceder a Facturación.', { duration: 6000 })
    }
  }, [searchParams, clinic])
  
  // Teléfono y País
  const [phonePrefix, setPhonePrefix] = useState('+57')
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (!clinic?.phone) return ''
    if (clinic.phone.startsWith('+57')) {
      return clinic.phone.slice(3)
    }
    const match = clinic.phone.match(/^(\+\d{1,3})(.*)$/)
    if (match) {
      return match[2]
    }
    return clinic.phone
  })
  
  useEffect(() => {
    if (clinic?.phone) {
      const match = clinic.phone.match(/^(\+\d{1,3})(.*)$/)
      if (match && match[1] !== '+57') {
        setPhonePrefix(match[1])
      }
    }
  }, [clinic?.phone])

  const [countryCode, setCountryCode] = useState(clinic?.country || 'CO')
  const [stateCode, setStateCode] = useState(clinic?.state || '')
  const [cityName, setCityName] = useState(clinic?.city || '')
  const [neighborhood, setNeighborhood] = useState(clinic?.neighborhood || '')

  // Actualizar país automáticamente basado en el prefijo telefónico (si es uno de los predefinidos)
  useEffect(() => {
    if (PHONE_PREFIX_TO_COUNTRY[phonePrefix]) {
      // Si el país derivado es diferente al actual, actualizamos.
      // (En la carga inicial, respetamos lo que venga en clinic?.country si ya existe)
      if (!clinic?.country || clinic.country !== PHONE_PREFIX_TO_COUNTRY[phonePrefix]) {
        // setCountryCode(PHONE_PREFIX_TO_COUNTRY[phonePrefix])
      }
    }
  }, [phonePrefix, clinic])

  const handlePhonePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value
    setPhonePrefix(newPrefix)
    if (PHONE_PREFIX_TO_COUNTRY[newPrefix]) {
      setCountryCode(PHONE_PREFIX_TO_COUNTRY[newPrefix])
      setStateCode('')
      setCityName('')
    }
  }

  const availableStates = State.getStatesOfCountry(countryCode)
  const availableCities = stateCode ? City.getCitiesOfState(countryCode, stateCode) : []

  // Generador de URL automático
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
    } catch (error) {
      toast.error('Ocurrió un error al guardar')
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
            className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm"
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
      
      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Identidad de Marca</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Portada (Fondo del Encabezado)</label>
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <img src={coverPreview} alt="Portada" className="w-24 h-16 rounded-lg object-cover border" />
              ) : (
                <div className="w-24 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center border border-gray-200">
                  Sin Portada
                </div>
              )}
              <input type="file" name="cover_image" accept="image/*" onChange={handleCoverChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Sube una imagen horizontal (paisaje) para mostrar como fondo en la página de agendamiento.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo (Cuadrado o Circular recomendado)</label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover border bg-white" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold border border-gray-200 uppercase">
                  {name ? name.charAt(0) : 'N'}
                </div>
              )}
              <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slogan o Descripción Corta</label>
            <input 
              name="slogan" 
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ej. Realzando tu belleza natural" 
              className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" 
              maxLength={100}
            />
          </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personalización Visual (Marca Blanca)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color de Marca (Botones y Cabecera)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="brand_color" 
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500 font-mono uppercase">
                {brandColor}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Este color se usará en los botones, fechas y elementos principales.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color de Texto (Sobre la Portada)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="header_text_color" 
                value={headerTextColor}
                onChange={(e) => setHeaderTextColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500 font-mono uppercase">
                {headerTextColor}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Garantiza que el texto se lea correctamente según la imagen de portada.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Letra (Tipografía)</label>
            <select 
              name="font_family" 
              defaultValue={clinic?.font_family || 'Outfit'} 
              className="w-full border rounded-md px-3 py-2 bg-white focus:ring-black focus:border-black text-sm"
            >
              <option value="Outfit">Outfit (Premium & Redondeada)</option>
              <option value="Inter">Inter (Limpia & Corporativa)</option>
              <option value="Montserrat">Montserrat (Moderna & Negrita)</option>
              <option value="Playfair Display">Playfair Display (Elegante & Serif)</option>
              <option value="Roboto">Roboto (Clásica & Sencilla)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">La tipografía que se cargará dinámicamente en tu página de reservas.</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Vista Previa en Vivo</h3>
          <div className="border border-gray-200 rounded-2xl overflow-hidden max-w-sm mx-auto shadow-lg relative bg-white h-[400px] flex flex-col">
            <div 
              className="relative p-6 text-center flex flex-col items-center transition-colors duration-300 min-h-[250px] justify-center"
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
                  {name || 'Nombre de tu Clínica'}
                </h1>
                <p className="mt-1 text-xs italic" style={{ color: headerTextColor, opacity: 0.8 }}>
                  {slogan || 'Tu slogan aparecerá aquí'}
                </p>
                <div className="flex items-center gap-2 mt-3 p-2 rounded-xl border max-w-[90%] w-full" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandColor }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <span className="text-[10px] font-medium truncate" style={{ color: headerTextColor }}>
                    Dirección de prueba
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 flex-1 bg-white flex flex-col items-center justify-center text-gray-400">
              <span className="text-xs">Contenido de la página...</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">🎨 Personaliza tu Dashboard</h2>
        <p className="text-sm text-gray-500 mb-4">Cambia los colores de la barra lateral de tu panel de administración. Estos colores solo los verás tú y tu equipo.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fondo de la Barra Lateral</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="sidebar_color" 
                defaultValue={clinic?.sidebar_color || '#111827'}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500">Oscuro por defecto</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto e Iconos del Sidebar</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="sidebar_text_color" 
                defaultValue={clinic?.sidebar_text_color || '#9ca3af'}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500">Gris claro por defecto</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color de Acento (Hover)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="dashboard_accent_color" 
                defaultValue={clinic?.dashboard_accent_color || '#10b981'}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500">Para elementos activos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">🌐 Personaliza tu Página de Reservas</h2>
        <p className="text-sm text-gray-500 mb-4">Personaliza los colores de la página que ven tus clientes cuando van a agendar una cita.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color de Fondo</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="booking_bg_color" 
                defaultValue={clinic?.booking_bg_color || '#f9fafb'}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500">Gris muy claro</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color del Texto</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="booking_text_color" 
                defaultValue={clinic?.booking_text_color || '#111827'}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500">Oscuro por defecto</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color de Tarjetas</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="booking_card_color" 
                defaultValue={clinic?.booking_card_color || '#ffffff'}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer bg-transparent"
              />
              <span className="text-xs text-gray-500">Blanco por defecto</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Horario de Atención</h2>
        <div className="bg-white">
          <ScheduleManager initialSchedule={clinic?.schedule} />
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tu Perfil como Profesional</h2>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              name="is_bookable" 
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              checked={isBookable}
              onChange={(e) => setIsBookable(e.target.checked)}
            />
            <span className="text-sm font-semibold text-blue-900">
              Yo también ofrezco servicios (Quiero aparecer en la lista de profesionales para recibir reservas)
            </span>
          </label>
          
          {isBookable && (
            <div className="pl-8 animate-fade-in-up">
              <label className="block text-sm font-medium text-blue-900 mb-1">Tu Nombre Público</label>
              <input 
                name="owner_name" 
                defaultValue={profile?.name || ''} 
                placeholder="Ej. Dra. María o Estilista Juan" 
                required={isBookable}
                className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" 
              />
              <p className="text-xs text-blue-700 mt-1">Así te verán los clientes al agendar.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Datos Principales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
            <input 
              name="name" 
              required 
              value={name} 
              onChange={handleNameChange}
              placeholder="Ej. Centro Médico Vida" 
              className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Pública</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {typeof window !== 'undefined' ? window.location.host : 'agendaclick.com'}/
              </span>
              <input 
                name="slug" 
                required 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="centro-vida" 
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-black focus:border-black" 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Este será el link que le enviarás a tus clientes.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de tu Negocio</label>
            <select 
              name="business_type" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-white focus:ring-black focus:border-black text-sm"
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

              {/* Lista de tags/marcas */}
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

              {/* Form para agregar marca */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newBrandInput}
                  onChange={(e) => setNewBrandInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBrand(); } }}
                  placeholder="Escribe una nueva marca (Ej. Mercedes-Benz, Ford, Suzuki)..."
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Notificaciones y Reservas)</label>
            <div className="flex gap-2">
              <select 
                value={phonePrefix}
                onChange={handlePhonePrefixChange}
                className="border rounded-md px-2 py-2 bg-white focus:ring-black focus:border-black text-sm w-32"
              >
                <option value="+57">🇨🇴 +57 (Colombia)</option>
                <option value="+52">🇲🇽 +52 (México)</option>
                <option value="+34">🇪🇸 +34 (España)</option>
                <option value="+1">🇺🇸 +1 (USA)</option>
                <option value="+54">🇦🇷 +54 (Argentina)</option>
                <option value="+56">🇨🇱 +56 (Chile)</option>
                <option value="+51">🇵🇪 +51 (Perú)</option>
              </select>
              <input 
                type="tel"
                required 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="300 123 4567" 
                className="flex-1 border rounded-md px-3 py-2 focus:ring-black focus:border-black" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento / Estado</label>
            <select 
              name="state" 
              value={stateCode}
              onChange={(e) => {
                setStateCode(e.target.value)
                setCityName('')
              }}
              className="w-full border rounded-md px-3 py-2 bg-white focus:ring-black focus:border-black text-sm"
              required
            >
              <option value="">Selecciona un departamento...</option>
              {availableStates.map(state => (
                <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad / Municipio</label>
            <select 
              name="city" 
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-white focus:ring-black focus:border-black text-sm"
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
              placeholder="Ej. El Poblado, Chapinero..." 
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" 
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

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">💳 Cobro de Citas en Línea (Pasarela de Pagos)</h2>
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            ¿Quieres recibir pagos online de tus clientes al momento de agendar sus citas? Activamos la integración de pasarelas de pago colombianas como **Wompi, ePayco o MercadoPago** de forma 100% segura para tu portal.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a 
              href="https://wa.me/573239306599?text=Hola%20Nexora%20Digital,%20me%20gustar%C3%ADa%20solicitar%20la%20integraci%C3%B3n%20segura%20de%20la%20pasarela%20de%20pagos%20de%20citas%20para%20mi%20portal%20de%20AgendaClick."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md text-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.128 1.95 12.012 1.95c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.47 3.393 1.357 4.881L2.456 21.12l4.19-1.966z"/>
              </svg>
              Contactar Soporte para Integrar Pagos
            </a>
            <span className="text-xs text-gray-400 leading-normal max-w-xs">
              La integración es realizada directamente por nuestro equipo de Nexora Digital para garantizar la seguridad de tus credenciales bancarias.
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Información Legal, Términos del Servicio y Habeas Data */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">⚖️ Información Legal, Términos y Habeas Data</h2>
        <p className="text-sm text-gray-500 mb-4">
          Configura los términos de servicio, política de privacidad y tratamiento de datos de tu empresa para cumplir con la normativa legal (Ley 1581 de Habeas Data, SIC y transparencia con el consumidor).
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
          {/* Razón Social y NIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Razón Social / Nombre Legal de la Empresa <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <input
                name="legal_business_name"
                defaultValue={clinic?.schedule?.legal?.business_legal_name || ''}
                placeholder="Ej. Grupo Motor K S.A.S. o Juan Pérez"
                className="w-full border rounded-lg px-3 py-2 bg-white text-sm focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                NIT / Identificación Tributaria <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <input
                name="legal_nit"
                defaultValue={clinic?.schedule?.legal?.nit || ''}
                placeholder="Ej. 901.234.567-8"
                className="w-full border rounded-lg px-3 py-2 bg-white text-sm focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Enlaces externos a Términos y Política de Privacidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Enlace a tus Términos y Condiciones <span className="text-gray-400 font-normal">(URL externa)</span>
              </label>
              <input
                type="url"
                name="legal_terms_url"
                defaultValue={clinic?.schedule?.legal?.terms_url || ''}
                placeholder="https://tuempresa.com/terminos"
                className="w-full border rounded-lg px-3 py-2 bg-white text-sm focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Enlace a tu Política de Privacidad / Habeas Data <span className="text-gray-400 font-normal">(URL externa)</span>
              </label>
              <input
                type="url"
                name="legal_privacy_url"
                defaultValue={clinic?.schedule?.legal?.privacy_url || ''}
                placeholder="https://tuempresa.com/privacidad"
                className="w-full border rounded-lg px-3 py-2 bg-white text-sm focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Texto directo de Términos / Condiciones de Servicio y Cancelación */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Términos del Servicio y Políticas de Cancelación <span className="text-gray-400 font-normal">(Texto directo para tus clientes)</span>
            </label>
            <textarea
              name="legal_custom_terms_text"
              rows={3}
              defaultValue={clinic?.schedule?.legal?.custom_terms_text || ''}
              placeholder="Ej. Las citas deben cancelarse con al menos 2 horas de anticipación. El cliente debe presentarse 10 minutos antes. Garantía de 3 meses en reparaciones..."
              className="w-full border rounded-lg px-3 py-2 bg-white text-sm focus:ring-black focus:border-black"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Si no tienes una página web externa, redacta aquí tus condiciones y tus clientes podrán consultarlas antes de agendar.
            </p>
          </div>

          {/* Cláusula de Tratamiento de Datos Personales / Habeas Data */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Autorización de Tratamiento de Datos Personales (Habeas Data)
            </label>
            <textarea
              name="legal_data_policy"
              rows={2}
              defaultValue={clinic?.schedule?.legal?.data_treatment_policy || ''}
              placeholder="Ej. Al agendar, autorizo el tratamiento de mis datos personales (nombre, teléfono, correo y placa vehicular) conforme a la Ley 1581 de 2012 de Colombia para la gestión y confirmación de la cita."
              className="w-full border rounded-lg px-3 py-2 bg-white text-sm focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Redes Sociales (Firma para Correos)</h2>
        <p className="text-sm text-gray-500 mb-4">Estos enlaces se incluirán en los correos de confirmación de citas invitando a tus clientes a seguirte.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">@</span>
              <input 
                name="instagram" 
                defaultValue={clinic?.instagram_url || ''}
                placeholder="usuario" 
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-black focus:border-black" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input 
              name="facebook" 
              defaultValue={clinic?.facebook_url || ''}
              placeholder="Enlace o nombre de página" 
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">@</span>
              <input 
                name="tiktok" 
                defaultValue={clinic?.tiktok_url || ''}
                placeholder="usuario" 
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-black focus:border-black" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
            <input 
              name="youtube" 
              defaultValue={clinic?.youtube_url || ''}
              placeholder="Enlace del canal" 
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" 
            />
          </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sincronización con Google Calendar</h2>
        <p className="text-sm text-gray-500 mb-4">Sincroniza tus citas de AgendaClick en tu calendario personal de Google automáticamente para evitar que se te crucen con compromisos personales.</p>
        <GoogleCalendarSync 
          profile={profile} 
          isDisconnecting={isDisconnectingCalendar} 
          onDisconnect={handleDisconnectCalendar} 
        />
      </div>

      <div className="pt-4 border-t">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`flex items-center justify-center gap-2 transition-all text-white px-6 py-2 rounded-lg font-medium w-full sm:w-auto
            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  )
}
