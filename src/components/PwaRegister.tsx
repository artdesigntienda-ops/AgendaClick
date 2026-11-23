'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('[PWA] Service Worker registrado con éxito:', registration.scope)
          },
          (err) => {
            console.warn('[PWA] Error registrando Service Worker:', err)
          }
        )
      })
    }
  }, [])

  return null
}
