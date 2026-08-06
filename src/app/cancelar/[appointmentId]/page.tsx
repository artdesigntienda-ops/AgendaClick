import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import CancelButton from './CancelButton'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function CancelPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params

  // 1. Obtener los detalles de la cita y la clínica
  const { data: appointment, error: getError } = await supabaseAdmin
    .from('appointments')
    .select('*, services(name), clinics(name)')
    .eq('id', appointmentId)
    .maybeSingle()

  if (getError || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-red-100 text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Enlace Inválido</h1>
          <p className="text-gray-500">
            No encontramos ninguna cita asociada a este enlace. Por favor verifica que la dirección esté correcta.
          </p>
        </div>
      </div>
    )
  }

  // Formatear fecha y hora
  const dateObj = new Date(appointment.start_time)
  const formattedDate = format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  const formattedTime = format(dateObj, "hh:mm a", { locale: es })
  const clinicName = appointment.clinics?.name || 'el negocio'
  const serviceName = appointment.services?.name || 'Cita'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo superior */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-black tracking-tight">AgendaClick</h1>
          <p className="text-xs text-gray-400 mt-1">Gestión de Citas y Reservas</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 space-y-6">
          {appointment.status === 'cancelled' ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Cita Cancelada</h2>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Esta cita ya ha sido cancelada previamente. El horario se encuentra disponible para otros usuarios.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Encabezado */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">¿Deseas cancelar tu cita?</h2>
                <p className="text-sm text-gray-500">
                  Estás a punto de cancelar tu reserva en <strong>{clinicName}</strong>. Esta acción liberará tu espacio.
                </p>
              </div>

              {/* Detalles de la Cita */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 block">Fecha</span>
                    <span className="text-sm font-bold text-gray-800 capitalize">{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 block">Hora</span>
                    <span className="text-sm font-bold text-gray-800">{formattedTime}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200/60 pt-3 mt-3">
                  <span className="text-xs text-gray-400 block">Servicio</span>
                  <span className="text-sm font-bold text-black">{serviceName}</span>
                </div>
              </div>

              {/* Botón de Cancelación */}
              <CancelButton 
                appointmentId={appointment.id} 
                initialStatus={appointment.status} 
                clinicName={clinicName} 
              />
            </>
          )}
        </div>

        {/* Footer simple */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <span>Si cancelas por error, deberás agendar una nueva cita en la web.</span>
        </div>
      </div>
    </div>
  )
}
