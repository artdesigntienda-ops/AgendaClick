'use client'

import { useState, useEffect } from 'react'
import { 
  cancelAppointmentFromClient, 
  getAvailableRescheduleSlots, 
  rescheduleAppointmentFromClient 
} from '@/app/[slug]/actions'
import { 
  XCircle, 
  Loader2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  AlertTriangle 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CancelButton({ 
  appointmentId, 
  initialStatus, 
  clinicName,
  token
}: { 
  appointmentId: string
  initialStatus: string
  clinicName: string
  token?: string
}) {
  const [viewMode, setViewMode] = useState<'options' | 'reschedule' | 'confirm_cancel'>('options')
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reschedule state
  const [availableDays, setAvailableDays] = useState<Date[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slots, setSlots] = useState<Array<{ startTime: string; endTime: string; label: string }>>([])
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string; label: string } | null>(null)
  const [rescheduledInfo, setRescheduledInfo] = useState<{ dateLabel: string; timeLabel: string } | null>(null)

  useEffect(() => {
    // Generar los próximos 14 días disponibles para reprogramar
    const days: Date[] = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i))
    }
    setAvailableDays(days)
    setSelectedDay(days[0])
  }, [])

  // Cargar slots cuando cambia el día seleccionado
  useEffect(() => {
    if (!selectedDay || viewMode !== 'reschedule') return

    let isMounted = true
    setLoadingSlots(true)
    setError(null)
    setSlots([])
    setSelectedSlot(null)

    getAvailableRescheduleSlots(appointmentId, selectedDay.toISOString(), token)
      .then((res) => {
        if (!isMounted) return
        if (res.success && res.slots) {
          setSlots(res.slots)
        } else {
          setError(res.error || res.message || 'No se pudieron cargar los horarios.')
        }
      })
      .catch((err) => {
        if (isMounted) setError('Error consultando horarios disponibles.')
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedDay, viewMode, appointmentId, token])

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await cancelAppointmentFromClient(appointmentId, token)
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

  const handleConfirmReschedule = async () => {
    if (!selectedSlot || !selectedDay) return

    setLoading(true)
    setError(null)
    try {
      const res = await rescheduleAppointmentFromClient(
        appointmentId,
        selectedSlot.startTime,
        selectedSlot.endTime,
        token
      )

      if (res.success) {
        const formattedDate = format(new Date(selectedSlot.startTime), "EEEE, d 'de' MMMM", { locale: es })
        setRescheduledInfo({
          dateLabel: formattedDate,
          timeLabel: selectedSlot.label
        })
        setStatus('rescheduled')
      } else {
        setError(res.error || 'No se pudo reprogramar la cita. El horario puede haber sido ocupado.')
      }
    } catch (e) {
      console.error(e)
      setError('Ocurrió un error inesperado al reprogramar tu turno.')
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de cita cancelada exitosamente
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
          <p className="text-gray-500 max-w-xs mx-auto text-sm">
            Esta cita ha sido cancelada con éxito. El espacio ha sido liberado en la agenda de <strong>{clinicName}</strong> y el negocio ha sido notificado.
          </p>
        </div>
      </motion.div>
    )
  }

  // Pantalla de cita reprogramada exitosamente
  if (status === 'rescheduled' && rescheduledInfo) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6 space-y-4"
      >
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">¡Cita Reprogramada con Éxito!</h2>
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 max-w-xs mx-auto text-emerald-950 text-sm space-y-1">
            <p className="font-bold capitalize">{rescheduledInfo.dateLabel}</p>
            <p className="text-xs text-emerald-700">Hora: <strong>{rescheduledInfo.timeLabel}</strong></p>
          </div>
          <p className="text-gray-500 max-w-xs mx-auto text-xs mt-3">
            Te hemos enviado los nuevos datos de tu reserva a tu correo electrónico junto al nuevo archivo de calendario.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Modo 1: Opciones principales (Reprogramar vs Cancelar) */}
      {viewMode === 'options' && (
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setViewMode('reschedule')}
            className="w-full py-4 px-5 bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl flex items-center justify-between transition-all shadow-md group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold">Cambiar Fecha u Hora</p>
                <p className="text-[11px] text-zinc-400">Reprograma tu turno sin perder tu cita</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setViewMode('confirm_cancel')}
            className="w-full py-3.5 px-5 bg-gray-50 hover:bg-red-50 text-red-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors border border-gray-100 hover:border-red-100"
          >
            <span>Cancelar cita definitivamente</span>
          </button>
        </div>
      )}

      {/* Modo 2: Interfaz de Reprogramación Interactiva */}
      {viewMode === 'reschedule' && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-black" /> Elige un nuevo día:
            </span>
            <button
              onClick={() => setViewMode('options')}
              className="text-xs text-gray-400 hover:text-black font-semibold"
            >
              Volver
            </button>
          </div>

          {/* Carrusel de Días */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {availableDays.map((d, idx) => {
              const isSelected = selectedDay && format(d, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(d)}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    {format(d, 'EEE', { locale: es })}
                  </span>
                  <span className="text-base font-black my-0.5">{format(d, 'd')}</span>
                  <span className="text-[9px] uppercase text-zinc-400">
                    {format(d, 'MMM', { locale: es })}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Selector de Horarios */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-black" /> Horarios disponibles:
            </span>

            {loadingSlots ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-black" />
                <span className="text-xs">Buscando turnos libres...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                No hay turnos disponibles para este día. Por favor selecciona otra fecha.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {slots.map((slot, idx) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-gray-900'
                      }`}
                    >
                      {slot.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botón de Confirmación de Reprogramación */}
          <button
            onClick={handleConfirmReschedule}
            disabled={!selectedSlot || loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reprogramando cita...</span>
              </>
            ) : selectedSlot ? (
              <span>Confirmar Cambio a las {selectedSlot.label}</span>
            ) : (
              <span>Selecciona un Horario</span>
            )}
          </button>
        </div>
      )}

      {/* Modo 3: Confirmación de Cancelación Definitiva */}
      {viewMode === 'confirm_cancel' && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-gray-500 text-center">
            ¿Estás completamente seguro/a? Se liberará el turno para otros clientes.
          </p>

          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cancelando cita...</span>
              </>
            ) : (
              <span>Sí, Cancelar Cita Definitivamente</span>
            )}
          </button>

          <button
            onClick={() => setViewMode('options')}
            className="w-full py-2.5 text-xs text-gray-400 hover:text-black font-semibold text-center transition-colors"
          >
            Volver a opciones
          </button>
        </div>
      )}
    </div>
  )
}
