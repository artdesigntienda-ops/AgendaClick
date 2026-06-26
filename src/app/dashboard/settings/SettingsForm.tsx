'use client'

import { useState, useEffect } from 'react'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import { State, City } from 'country-state-city'

const PHONE_PREFIX_TO_COUNTRY: Record<string, string> = {
  '+57': 'CO',
  '+52': 'MX',
  '+34': 'ES',
  '+1': 'US',
  '+54': 'AR',
  '+56': 'CL',
  '+51': 'PE'
}

export default function SettingsForm({ clinic, saveAction }: { clinic: any, saveAction: (formData: FormData) => void }) {
  const [name, setName] = useState(clinic?.name || '')
  const [slug, setSlug] = useState(clinic?.slug || '')
  
  // Teléfono y País
  const [phonePrefix, setPhonePrefix] = useState('+57')
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (!clinic?.phone) return ''
    if (clinic.phone.startsWith('+57')) {
      return clinic.phone.slice(3)
    }
    const match = clinic.phone.match(/^(\+\d{1,3})(.*)$/)
    if (match) {
      setPhonePrefix(match[1]) // wait, this might be overwritten by useEffect if not careful. Actually it's fine.
      return match[2]
    }
    return clinic.phone
  })
  
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('phone', `${phonePrefix}${phoneNumber}`)
    // countryCode is selected programmatically
    formData.set('country', countryCode)
    saveAction(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="border-b pb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Identidad de Marca</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo (Cuadrado o Circular recomendado)</label>
            <div className="flex items-center gap-4">
              {clinic?.logo_url && (
                <img src={clinic.logo_url} alt="Logo" className="w-16 h-16 rounded-full object-cover border" />
              )}
              <input type="file" name="logo" accept="image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slogan o Descripción Corta</label>
            <input 
              name="slogan" 
              defaultValue={clinic?.slogan || ''} 
              placeholder="Ej. Realzando tu belleza natural" 
              className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" 
              maxLength={100}
            />
          </div>
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
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">agendaclick.com/</span>
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
            <select name="business_type" defaultValue={clinic?.business_type || 'belleza'} className="w-full border rounded-md px-3 py-2 bg-white focus:ring-black focus:border-black">
              <option value="belleza">Estética y Belleza (Peluquerías, Barberías, Uñas, Cejas)</option>
              <option value="salud">Salud y Clínicas (Odontología, Fisioterapia, Nutrición)</option>
              <option value="bienestar">Spas y Bienestar (Masajes, Yoga, Terapias Alternativas)</option>
            </select>
          </div>

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

      <div className="pt-4 border-t">
        <button type="submit" className="bg-black hover:bg-gray-800 transition-colors text-white px-6 py-2 rounded-lg font-medium w-full sm:w-auto">
          Guardar Configuración
        </button>
      </div>
    </form>
  )
}
