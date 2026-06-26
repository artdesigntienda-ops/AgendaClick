'use client'

import { useEffect, useCallback } from 'react'

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000 // 15 minutos

export function AutoLogout() {
  const logout = useCallback(() => {
    // Para cerrar sesión de forma segura y borrar cookies, hacemos un submit al endpoint de signout de supabase
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/signout'
    document.body.appendChild(form)
    form.submit()
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(logout, INACTIVITY_LIMIT_MS)
    }

    // Escuchar eventos de actividad del usuario
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Iniciar el temporizador por primera vez
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [logout])

  // Este componente es invisible, solo corre lógica en segundo plano
  return null
}
