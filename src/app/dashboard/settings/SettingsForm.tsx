'use client'

import { useState } from 'react'
import AddressAutocomplete from '@/components/AddressAutocomplete'

export default function SettingsForm({ clinic, saveAction }: { clinic: any, saveAction: (formData: FormData) => void }) {
  const [name, setName] = useState(clinic?.name || '')
  const [slug, setSlug] = useState(clinic?.slug || '')
  const [phonePrefix, setPhonePrefix] = useState('+57')
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (!clinic?.phone) return ''
    if (clinic.phone.startsWith('+57')) return clinic.phone.slice(3)
    // fallback genérico si empieza con +
    const match = clinic.phone.match(/^(\+\d{1,3})(.*)$/)
    if (match) {
      setPhonePrefix(match[1])
      return match[2]
    }
    return clinic.phone
  })

  // Generador de URL automático
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    // Solo auto-generar si el usuario no ha forzado un slug propio 
    // o si es un negocio nuevo
    const generated = newName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, '') // trim dashes
    setSlug(generated)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Consolidar teléfono
    formData.set('phone', `${phonePrefix}${phoneNumber}`)
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Redes Sociales (Opcional)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Instagram (URL)</label>
            <input name="instagram" defaultValue={clinic?.instagram_url || ''} placeholder="https://instagram.com/..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Facebook (URL)</label>
            <input name="facebook" defaultValue={clinic?.facebook_url || ''} placeholder="https://facebook.com/..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">TikTok (URL)</label>
            <input name="tiktok" defaultValue={clinic?.tiktok_url || ''} placeholder="https://tiktok.com/@..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">YouTube (URL)</label>
            <input name="youtube" defaultValue={clinic?.youtube_url || ''} placeholder="https://youtube.com/..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
          </div>
        </div>
      </div>

      <div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select name="business_type" defaultValue={clinic?.business_type || 'belleza'} className="w-full border rounded-md px-3 py-2 bg-white focus:ring-black focus:border-black">
              <option value="belleza">Estética y Belleza</option>
              <option value="salud">Salud y Clínicas</option>
              <option value="bienestar">Spas y Bienestar</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              <strong>Estética:</strong> Peluquerías, barberías, uñas. <strong>Salud:</strong> Odontología, fisio. <strong>Spas:</strong> Masajes, yoga.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Notificaciones y Reservas)</label>
            <div className="flex gap-2">
              <select 
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección del Negocio</label>
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
