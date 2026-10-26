'use client'

import { useState } from 'react'
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
      /* Restringir o dejar global */
    },
    debounce: 300,
    defaultValue: defaultAddress,
  })

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleSelect =
    (suggestion: any) =>
    () => {
      const description = suggestion?.description || ''
      setValue(description, false)
      clearSuggestions()

      if (!description) return

      // Obtener latitud y longitud con manejo seguro de errores
      try {
        getGeocode({ address: description })
          .then((results) => {
            if (results && results.length > 0 && results[0]) {
              const { lat, lng } = getLatLng(results[0])
              setLat(lat)
              setLng(lng)
            }
          })
          .catch((err) => {
            console.warn('[AddressAutocomplete] Error obteniendo geocodificación:', err)
          })
      } catch (err) {
        console.warn('[AddressAutocomplete] Excepción al geocodificar:', err)
      }
    }

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={value}
          onChange={handleInput}
          placeholder="Ej: Calle 93 # 15-20, Bogotá"
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-black focus:border-black text-sm"
        />
      </div>
      
      {/* Inputs ocultos para enviar al servidor */}
      <input type="hidden" name="address" value={value} />
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />

      {/* Sugerencias de Google */}
      {status === 'OK' && Array.isArray(data) && data.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1 max-h-60 overflow-auto">
          {data.map((suggestion) => {
            if (!suggestion) return null
            const placeId = suggestion.place_id || suggestion.description || Math.random().toString()
            const mainText = suggestion.structured_formatting?.main_text || suggestion.description || ''
            const secondaryText = suggestion.structured_formatting?.secondary_text || ''

            return (
              <li
                key={placeId}
                onClick={handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
              >
                <div className="font-medium text-sm text-gray-900">{mainText}</div>
                {secondaryText && <div className="text-xs text-gray-500">{secondaryText}</div>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
