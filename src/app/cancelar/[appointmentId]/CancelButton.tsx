'use client'

import { useState } from 'react'
import { cancelAppointmentFromClient } from '@/app/[slug]/actions'
import { XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CancelButton({ appointmentId, initialStatus, clinicName }: { appointmentId: string, initialStatus: string, clinicName: string }) {
  const [status, setStatus] = useState(initialStatus) // 'pending' | 'confirmed' | 'cancelled'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await cancelAppointmentFromClient(appointmentId)
      if (res.success) {
        setStatus('cancelled')
      } else {
        setError(res.error || 'No se pudo cancelar la cita. Intenta de nuevo.')
      }
    } catch (e) {
      console.error(e)
      setError('Ocurrió un error inesperado al cancelar la cita.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'cancelled') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 space-y-4"
      >
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Cita Cancelada</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            Esta cita ha sido cancelada con éxito. El espacio ha sido liberado en la agenda de <strong>{clinicName}</strong> y el negocio ha sido notificado.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cancelando cita...</span>
          </>
        ) : (
          <span>Confirmar Cancelación de la Cita</span>
        )}
      </button>
    </div>
  )
}
