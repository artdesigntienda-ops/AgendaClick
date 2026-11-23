'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error)

    // Si el error es por actualización de chunks tras nuevo deploy en Vercel, auto-recargar
    const isChunkError = 
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('ChunkLoadError') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('loading chunk')

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('last_chunk_reload')
      const now = Date.now()
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('last_chunk_reload', now.toString())
        window.location.reload()
      }
    }
  }, [error])

  const handleHardReload = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">Ocurrió un problema temporal</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            No te preocupes, tus datos están a salvo. Puedes intentar recargar la página o volver al panel principal.
          </p>

          {error?.digest && (
            <p className="text-[10px] text-gray-400 font-mono mt-2 bg-gray-50 py-1 px-2 rounded-lg inline-block">
              Código: {error.digest}
            </p>
          )}

          {error?.message && (
            <div className="mt-3 text-left">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1 mx-auto transition-colors font-medium"
              >
                <span>Detalle técnico</span>
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showDetails && (
                <div className="mt-2 p-3 bg-red-50/60 border border-red-100 rounded-xl text-[11px] text-red-800 font-mono break-all max-h-32 overflow-y-auto">
                  {error.message}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => {
              reset()
              handleHardReload()
            }}
            className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recargar Panel
          </button>
          <Link
            href="/dashboard"
            onClick={() => handleHardReload()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            Inicio Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
