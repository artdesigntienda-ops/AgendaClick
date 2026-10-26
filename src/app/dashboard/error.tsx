'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error)
  }, [error])

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
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
          <Link
            href="/dashboard"
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
