'use client'

import { useState, useEffect } from 'react'
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete'
import { MapPin } from 'lucide-react'

export default function AddressAutocomplete({ 
  defaultAddress = '', 
  defaultLat = '', 
  defaultLng = '' 
}: { 
  defaultAddress?: string
  defaultLat?: string | number
  defaultLng?: string | number
}) {
  const [lat, setLat] = useState<string | number>(defaultLat)
  const [lng, setLng] = useState<string | number>(defaultLng)

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Puedes restringir a Colombia aquí si lo deseas, pero lo dejaremos global por defecto */
      // componentRestrictions: { country: "co" }
    },
    debounce: 300,
    defaultValue: defaultAddress,
  })

  // Para asegurar que el script de Google Maps esté cargado antes de inicializar (en un caso real, 
  // es mejor cargar el script en el layout, pero Next.js App Router maneja los scripts distinto).
  // Aquí asumiremos que el script se cargará en layout.tsx.

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleSelect =
    ({ description }: { description: string }) =>
    () => {
      // Cuando el usuario selecciona una dirección
      setValue(description, false)
      clearSuggestions()

      // Obtener latitud y longitud
      getGeocode({ address: description }).then((results) => {
        const { lat, lng } = getLatLng(results[0])
        setLat(lat)
        setLng(lng)
      })
    }

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Ej: Calle 93 # 15-20, Bogotá"
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-black focus:border-black text-sm"
        />
      </div>
      
      {/* Inputs ocultos para enviar al servidor */}
      <input type="hidden" name="address" value={value} />
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />

      {/* Sugerencias de Google */}
      {status === 'OK' && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1 max-h-60 overflow-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion

            return (
              <li
                key={place_id}
                onClick={handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
              >
                <div className="font-medium text-sm text-gray-900">{main_text}</div>
                <div className="text-xs text-gray-500">{secondary_text}</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
