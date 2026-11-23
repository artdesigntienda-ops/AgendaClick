'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Detectar si ya está en modo standalone (instalada)
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true

      if (isStandalone) {
        return
      }

      // Detectar iOS
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
      setIsIOS(isIosDevice)

      // Escuchar evento de instalación en Android / Chrome
      const handleBeforeInstall = (e: any) => {
        e.preventDefault()
        setDeferredPrompt(e)
        // No molestar de inmediato; esperar 3 segundos
        setTimeout(() => setShowPrompt(true), 3000)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstall)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      setShowIOSInstructions(true)
    }
  }

  if (!showPrompt && !showIOSInstructions) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-bounce-subtle">
      <div className="bg-black text-white p-4 rounded-2xl shadow-2xl border border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">Instala AgendaClick</p>
            <p className="text-[11px] text-zinc-400">Acceso rápido desde tu pantalla de inicio</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
          <button
            onClick={() => {
              setShowPrompt(false)
              setShowIOSInstructions(false)
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSInstructions && (
        <div className="mt-2 bg-zinc-900 border border-zinc-700 text-white p-3 rounded-xl text-xs space-y-1">
          <p className="font-bold text-emerald-400">Para instalar en iPhone/iPad:</p>
          <p>1. Toca el botón <strong>Compartir</strong> (cuadrado con flecha hacia arriba) en Safari.</p>
          <p>2. Selecciona <strong>&quot;Agregar a la pantalla de inicio&quot;</strong>.</p>
        </div>
      )}
    </div>
  )
}
