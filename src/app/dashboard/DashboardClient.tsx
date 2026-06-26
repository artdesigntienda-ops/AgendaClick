'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, TrendingUp, Users, Clock, MessageCircle, X, AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cancelAppointment, cancelAppointmentsForStaff } from './actions'
import { toast } from 'sonner'

type Appointment = {
  id: string
  client_name: string
  client_phone: string
  client_email: string
  start_time: string
  status: string
  services: { name: string } | null
  profiles: { name: string } | null
}

const COLORS = [
  'bg-black text-white',
  'bg-gray-200 text-black',
  'bg-gray-100 text-gray-600',
  'bg-gray-800 text-white',
]

export default function DashboardClient({ appointments, clinicSlug }: { appointments: Appointment[], clinicSlug?: string }) {
  const [mounted, setMounted] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  // Emergencia State
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)
  const [affectedClients, setAffectedClients] = useState<any[]>([])
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null 

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  const uniqueStaff = Array.from(new Set(appointments.map(a => a.profiles?.name || 'Sin Asignar')))
  const staffColors: Record<string, string> = {}
  uniqueStaff.forEach((name, i) => {
    staffColors[name] = COLORS[i % COLORS.length]
  })

  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const pendingCount = appointments.filter(a => a.status === 'pending').length

  const handleWhatsApp = (phone: string, name: string, service: string, time: string, isCancellation = false) => {
    const formattedTime = format(parseISO(time), 'hh:mm a')
    const msg = isCancellation 
      ? `Hola ${name}, te escribimos para informarte que por un motivo de fuerza mayor tuvimos que cancelar tu cita de ${service} de hoy a las ${formattedTime}. Te pedimos disculpas y te invitamos a reagendar en agendaclick.com/${clinicSlug}`
      : `Hola ${name}, te escribimos de la estética para confirmar tu cita de ${service} a las ${formattedTime}.`
    const encoded = encodeURIComponent(msg)
    const cleanPhone = phone?.replace(/[^0-9]/g, '') || ''
    window.open(`https://wa.me/57${cleanPhone}?text=${encoded}`, '_blank')
  }

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return
    setIsCancelling(true)
    const res = await cancelAppointment(id)
    setIsCancelling(false)
    if (res.success) {
      toast.success('Cita cancelada. No olvides avisarle al cliente por WhatsApp.')
      setSelectedAppointment(null)
    } else {
      toast.error('Error al cancelar la cita')
    }
  }

  const handleEmergencyCancel = async () => {
    if (!confirm(`¿Estás seguro de cancelar TODAS las citas de hoy ${selectedStaff ? `para ${selectedStaff}` : 'para todos'}?`)) return
    setIsCancelling(true)
    const todayIso = new Date().toISOString()
    const res = await cancelAppointmentsForStaff(selectedStaff, clinicSlug || '', todayIso)
    setIsCancelling(false)
    
    if (res.success) {
      toast.success('Citas canceladas.')
      if (res.affected && res.affected.length > 0) {
        setAffectedClients(res.affected)
      } else {
        setIsEmergencyMode(false)
        toast.info('No había citas para cancelar hoy.')
      }
    } else {
      toast.error(res.error || 'Error al cancelar citas masivamente')
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 relative">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Recepción & Agenda</h1>
          <p className="text-gray-500 mt-2">Visión global de tu estética hoy, {format(new Date(), "d 'de' MMMM", { locale: es })}</p>
        </div>
        <div className="flex gap-2">
          {clinicSlug ? (
            <a href={`/${clinicSlug}`} target="_blank" rel="noreferrer" className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-900 transition-colors shadow-lg shadow-black/10 text-center">
              Nueva Cita Manual
            </a>
          ) : (
            <button disabled className="bg-gray-200 text-gray-400 px-6 py-3 font-medium cursor-not-allowed">
              Configura tu negocio primero
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Citas Hoy (Confirmadas)', value: confirmedCount.toString(), icon: TrendingUp },
          { title: 'Citas Pendientes', value: pendingCount.toString(), icon: CalendarIcon },
          { title: 'Nuevos Clientes', value: '+0', icon: Users },
          { title: 'Ocupación', value: '0%', icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-24 h-24" />
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-3xl font-black mt-2">{stat.value}</h3>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight">Calendario Maestro (Hoy)</h2>
          <div className="flex flex-wrap items-center gap-2">
            {uniqueStaff.map(staffName => {
              const isSelected = selectedStaff === staffName
              const isFaded = selectedStaff !== null && !isSelected
              return (
                <button 
                  key={staffName} 
                  onClick={() => setSelectedStaff(isSelected ? null : staffName)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${staffColors[staffName]} ${isFaded ? 'opacity-30' : 'opacity-100 hover:scale-105'}`}
                >
                  {staffName}
                </button>
              )
            })}
            {selectedStaff && (
              <button onClick={() => setSelectedStaff(null)} className="px-2 py-1 text-xs text-gray-500 hover:text-black underline ml-2">
                Limpiar filtro
              </button>
            )}
            
            <button 
              onClick={() => setIsEmergencyMode(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition-colors"
            >
              <AlertTriangle className="w-3 h-3" /> Calamidad / Emergencia
            </button>
          </div>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 border-b font-semibold">Hora</th>
                <th className="p-4 border-b font-semibold">Cliente</th>
                <th className="p-4 border-b font-semibold">Servicio</th>
                <th className="p-4 border-b font-semibold">Staff</th>
                <th className="p-4 border-b font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.filter(apt => selectedStaff ? (apt.profiles?.name || 'Sin Asignar') === selectedStaff : true).filter(apt => apt.status !== 'cancelled').length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay citas programadas para hoy {selectedStaff ? `con ${selectedStaff}` : ''}.
                  </td>
                </tr>
              ) : (
                appointments
                  .filter(apt => selectedStaff ? (apt.profiles?.name || 'Sin Asignar') === selectedStaff : true)
                  .filter(apt => apt.status !== 'cancelled')
                  .map((apt) => {
                    const staffName = apt.profiles?.name || 'Sin Asignar'
                    return (
                      <tr key={apt.id} onClick={() => setSelectedAppointment(apt)} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                        <td className="p-4 font-bold text-gray-900">
                          {format(parseISO(apt.start_time), 'hh:mm a')}
                        </td>
                        <td className="p-4 font-medium">{apt.client_name}</td>
                        <td className="p-4 text-gray-500">{apt.services?.name || 'Cita General'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold ${staffColors[staffName]}`}>
                            {staffName}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${apt.status === 'confirmed' ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`}></span>
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                              {apt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                            </span>
                          </span>
                        </td>
                      </tr>
                    )
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                <div>
                  <h3 className="text-2xl font-black">{selectedAppointment.client_name}</h3>
                  <p className="text-gray-500 mt-1">{selectedAppointment.services?.name || 'Cita General'}</p>
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Hora</span>
                    <span className="font-bold text-lg">{format(parseISO(selectedAppointment.start_time), 'hh:mm a')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Estado</span>
                    <span className="font-bold text-lg uppercase tracking-wider text-green-600">{selectedAppointment.status}</span>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm"><span className="text-gray-500 w-20 inline-block">Teléfono:</span> <span className="font-medium">{selectedAppointment.client_phone || 'No registrado'}</span></p>
                  <p className="text-sm"><span className="text-gray-500 w-20 inline-block">Correo:</span> <span className="font-medium">{selectedAppointment.client_email || 'No registrado'}</span></p>
                </div>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <button 
                  onClick={() => handleWhatsApp(selectedAppointment.client_phone, selectedAppointment.client_name, selectedAppointment.services?.name || 'Cita', selectedAppointment.start_time)}
                  className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Contactar por WhatsApp
                </button>
                <button 
                  disabled={isCancelling}
                  onClick={() => handleCancelAppointment(selectedAppointment.id)}
                  className="w-full py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelando...' : 'Cancelar Cita'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency Mode Modal */}
      <AnimatePresence>
        {isEmergencyMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-100"
            >
              <div className="p-6 border-b bg-red-50 flex gap-4 items-start">
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-red-900">Modo Calamidad</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Esto cancelará todas las citas de hoy {selectedStaff ? `para ${selectedStaff}` : 'para todos los profesionales'}.
                  </p>
                </div>
                <button onClick={() => setIsEmergencyMode(false)} className="p-2 text-red-400 hover:text-red-900 hover:bg-red-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {affectedClients.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">Al confirmar, las citas se marcarán como canceladas en el sistema. Luego, se te presentará una lista para notificar a los clientes afectados por WhatsApp uno por uno.</p>
                    <button 
                      disabled={isCancelling}
                      onClick={handleEmergencyCancel}
                      className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isCancelling ? 'Cancelando citas...' : 'Confirmar y Cancelar Todo'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm mb-4">
                      <strong>¡Citas canceladas!</strong> Ahora por favor haz clic en cada cliente para enviarle el mensaje de disculpas por WhatsApp.
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {affectedClients.map(client => (
                        <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div>
                            <p className="font-bold text-sm">{client.client_name}</p>
                            <p className="text-xs text-gray-500">{client.services?.name} - {format(parseISO(client.start_time), 'hh:mm a')}</p>
                          </div>
                          <button 
                            onClick={() => handleWhatsApp(client.client_phone, client.client_name, client.services?.name || 'Cita', client.start_time, true)}
                            className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        setIsEmergencyMode(false)
                        setAffectedClients([])
                      }}
                      className="w-full py-3 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition-colors mt-4"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
