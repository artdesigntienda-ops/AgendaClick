'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, TrendingUp, Users, Clock, MessageCircle, X, AlertTriangle, ChevronLeft, ChevronRight, UserPlus, CheckCircle } from 'lucide-react'
import { 
  format, 
  parseISO, 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  isSameYear,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears 
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cancelAppointment, cancelAppointmentsForStaff, assignStaffToAppointment, updateAppointmentStatus, saveAppointmentNotes, blockTime } from './actions'
import { toast } from 'sonner'

type Appointment = {
  id: string
  client_name: string
  client_phone: string
  client_email: string
  start_time: string
  status: string
  services: { name: string } | null
  profiles: { id: string; name: string } | null
  staff_id?: string | null
  notes?: string | null
}

type StaffMember = {
  id: string
  name: string
  role: string
}

const COLORS = [
  'bg-black text-white',
  'bg-gray-200 text-black',
  'bg-gray-100 text-gray-600',
  'bg-gray-800 text-white',
]

export default function DashboardClient({ 
  appointments, 
  clinicSlug, 
  staff = [],
  clinicId
}: { 
  appointments: Appointment[]
  clinicSlug?: string
  staff?: StaffMember[] 
  clinicId?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  // Estados de vista y navegación
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments)
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAssigningStaff, setIsAssigningStaff] = useState(false)

  // Block time States
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false)
  const [blockStaffId, setBlockStaffId] = useState('')
  const [blockDate, setBlockDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [blockTimeVal, setBlockTimeVal] = useState('08:00')
  const [blockDuration, setBlockDuration] = useState(60)
  const [isSavingBlock, setIsSavingBlock] = useState(false)

  // Sincronizar el estado cuando cambie la prop
  useEffect(() => {
    setLocalAppointments(appointments)
  }, [appointments])

  // Horas de operación comercial estándar (Lunes a Sábado de 8:00 a 12:00 y 14:00 a 18:00)
  const businessHours = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  const getFreeSlotsForDay = (date: Date) => {
    if (date.getDay() === 0) return [] // Domingo cerrado
    const dayApts = localAppointments.filter(apt => {
      if (apt.status === 'cancelled') return false
      return isSameDay(parseISO(apt.start_time), date)
    })
    const reservedHours = dayApts.map(apt => format(parseISO(apt.start_time), 'HH:mm'))
    return businessHours.filter(hour => !reservedHours.includes(hour))
  }

  const getFreeSlotsForWeek = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    const weekSlots = []
    for (let i = 0; i < 6; i++) {
      const currentDay = addDays(start, i)
      const free = getFreeSlotsForDay(currentDay)
      weekSlots.push({ date: currentDay, slots: free })
    }
    return weekSlots
  }

  const getFreeSlotsForMonth = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const monthSlots = []
    let currentDay = start
    while (currentDay <= end) {
      if (currentDay.getDay() !== 0) {
        const free = getFreeSlotsForDay(currentDay)
        monthSlots.push({ date: currentDay, slotsCount: free.length })
      }
      currentDay = addDays(currentDay, 1)
    }
    return monthSlots
  }

  const handleStaffAssignment = async (appointmentId: string, staffId: string) => {
    setIsAssigningStaff(true)
    const res = await assignStaffToAppointment(appointmentId, staffId)
    setIsAssigningStaff(false)
    if (res.success) {
      toast.success('Profesional asignado correctamente.')
      const assignedStaff = staff.find(s => s.id === staffId)
      setLocalAppointments(prev => prev.map(apt => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            staff_id: staffId ? staffId : null,
            profiles: assignedStaff ? { id: assignedStaff.id, name: assignedStaff.name } : null
          }
        }
        return apt
      }))
      setSelectedAppointment(prev => {
        if (prev && prev.id === appointmentId) {
          return {
            ...prev,
            staff_id: staffId ? staffId : null,
            profiles: assignedStaff ? { id: assignedStaff.id, name: assignedStaff.name } : null
          }
        }
        return prev
      })
    } else {
      toast.error('Error al asignar el profesional')
    }
  }

  const handleStatusChange = async (appointmentId: string, status: string) => {
    setIsUpdatingStatus(true)
    const res = await updateAppointmentStatus(appointmentId, status)
    setIsUpdatingStatus(false)
    if (res.success) {
      toast.success('Estado de la cita actualizado.')
      setLocalAppointments(prev => prev.map(apt => {
        if (apt.id === appointmentId) {
          return { ...apt, status }
        }
        return apt
      }))
      setSelectedAppointment(prev => {
        if (prev && prev.id === appointmentId) {
          return { ...prev, status }
        }
        return prev
      })
    } else {
      toast.error('Error al actualizar el estado')
    }
  }

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

  const uniqueStaff = ['Sin Asignar', ...staff.map(s => s.name)]
  const staffColors: Record<string, string> = {}
  uniqueStaff.forEach((name, i) => {
    staffColors[name] = COLORS[i % COLORS.length]
  })

  // Citas filtradas por rango y por staff seleccionado
  const filteredAppointments = localAppointments.filter(apt => {
    const aptDate = parseISO(apt.start_time)
    
    if (selectedStaff) {
      const staffName = apt.profiles?.name || 'Sin Asignar'
      if (staffName !== selectedStaff) return false
    }

    if (apt.status === 'cancelled') return false

    if (viewMode === 'day') {
      return isSameDay(aptDate, currentDate)
    } else if (viewMode === 'week') {
      return isSameWeek(aptDate, currentDate, { weekStartsOn: 1 })
    } else if (viewMode === 'month') {
      return isSameMonth(aptDate, currentDate)
    } else if (viewMode === 'year') {
      return isSameYear(aptDate, currentDate)
    }
    return true
  })

  const confirmedCount = filteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length
  const pendingCount = filteredAppointments.filter(a => a.status === 'pending').length
  const uniqueClientsCount = new Set(filteredAppointments.map(a => a.client_phone || a.client_name)).size

  const getOccupancyRate = () => {
    if (filteredAppointments.length === 0) return '0%'
    if (viewMode === 'day') {
      const rate = Math.min(100, Math.round((filteredAppointments.length / businessHours.length) * 100))
      return `${rate}%`
    } else if (viewMode === 'week') {
      const totalSlots = businessHours.length * 6
      const rate = Math.min(100, Math.round((filteredAppointments.length / totalSlots) * 100))
      return `${rate}%`
    } else if (viewMode === 'month') {
      const totalSlots = businessHours.length * 26
      const rate = Math.min(100, Math.round((filteredAppointments.length / totalSlots) * 100))
      return `${rate}%`
    }
    return 'N/A'
  }

  const handleWhatsApp = (phone: string, name: string, service: string, time: string, mode: 'cancellation' | 'confirmation' | 'reminder' = 'confirmation') => {
    const formattedTime = format(parseISO(time), "d 'de' MMMM 'a las' hh:mm a", { locale: es })
    let msg = ''
    if (mode === 'cancellation') {
      msg = `Hola ${name}, te escribimos para informarte que por un motivo de fuerza mayor tuvimos que cancelar tu cita de ${service} el ${formattedTime}. Te pedimos disculpas y te invitamos a reagendar en https://agendaclick.com.co/${clinicSlug}`
    } else if (mode === 'reminder') {
      msg = `Hola ${name}, queremos recordarte tu cita de ${service} programada para el ${formattedTime}. ¡Te esperamos!`
    } else {
      msg = `Hola ${name}, te escribimos de la estética para confirmar tu cita de ${service} el ${formattedTime}.`
    }
    const encoded = encodeURIComponent(msg)
    let cleanPhone = phone?.replace(/[^0-9]/g, '') || ''
    if (cleanPhone.length === 10) {
      cleanPhone = `57${cleanPhone}`
    }
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank')
  }

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return
    setIsCancelling(true)
    const res = await cancelAppointment(id)
    setIsCancelling(false)
    if (res.success) {
      toast.success('Cita cancelada. No olvides avisarle al cliente por WhatsApp.')
      setLocalAppointments(prev => prev.map(apt => {
        if (apt.id === id) {
          return { ...apt, status: 'cancelled' }
        }
        return apt
      }))
      setSelectedAppointment(prev => prev ? { ...prev, status: 'cancelled' } : null)
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

  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate(prev => subDays(prev, 1))
    else if (viewMode === 'week') setCurrentDate(prev => subWeeks(prev, 1))
    else if (viewMode === 'month') setCurrentDate(prev => subMonths(prev, 1))
    else if (viewMode === 'year') setCurrentDate(prev => subYears(prev, 1))
  }

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(prev => addDays(prev, 1))
    else if (viewMode === 'week') setCurrentDate(prev => addWeeks(prev, 1))
    else if (viewMode === 'month') setCurrentDate(prev => addMonths(prev, 1))
    else if (viewMode === 'year') setCurrentDate(prev => addYears(prev, 1))
  }

  const handleBlockTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId) {
      toast.error('No se pudo identificar tu clínica')
      return
    }
    
    setIsSavingBlock(true)
    
    const startStr = `${blockDate}T${blockTimeVal}:00`
    const startTimeObj = new Date(startStr)
    const endTimeObj = new Date(startTimeObj.getTime() + blockDuration * 60000)
    
    const res = await blockTime({
      clinicId,
      staffId: blockStaffId || null,
      startTime: startTimeObj.toISOString(),
      endTime: endTimeObj.toISOString()
    })
    
    setIsSavingBlock(false)
    
    if (res.success) {
      toast.success('Horario bloqueado con éxito')
      setIsBlockTimeModalOpen(false)
      
      // Actualizar estado local agregando el bloqueo
      const assignedStaff = staff.find(s => s.id === blockStaffId)
      const newBlockApp: Appointment = {
        id: Math.random().toString(), // id temporal
        client_name: 'BLOQUEADO (Horario Reservado)',
        client_phone: '0000000000',
        client_email: 'blocked@agendaclick.com.co',
        start_time: startTimeObj.toISOString(),
        status: 'confirmed',
        services: { name: 'Horario Bloqueado' },
        profiles: assignedStaff ? { id: assignedStaff.id, name: assignedStaff.name } : null,
        staff_id: blockStaffId || null,
        notes: 'Horario reservado manualmente por administración'
      }
      
      setLocalAppointments(prev => [...prev, newBlockApp])
    } else {
      toast.error(res.error || 'Error al bloquear horario')
    }
  }

  const getPeriodLabel = () => {
    if (viewMode === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: es })
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `Semana del ${format(start, "d 'de' MMMM")} al ${format(end, "d 'de' MMMM")}`
    } else if (viewMode === 'month') {
      return format(currentDate, "MMMM 'de' yyyy", { locale: es })
    } else if (viewMode === 'year') {
      return format(currentDate, "yyyy")
    }
    return ''
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 relative">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Recepción & Agenda</h1>
          <p className="text-gray-500 mt-2">Visión global de tu estética - {getPeriodLabel()}</p>
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
          { title: `Citas ${viewMode === 'day' ? 'Hoy' : viewMode === 'week' ? 'Semana' : viewMode === 'month' ? 'Mes' : 'Año'} (Confirmadas)`, value: confirmedCount.toString(), icon: TrendingUp },
          { title: 'Citas Pendientes', value: pendingCount.toString(), icon: CalendarIcon },
          { title: 'Clientes Únicos', value: uniqueClientsCount.toString(), icon: Users },
          { title: 'Ocupación estimada', value: getOccupancyRate(), icon: Clock },
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
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* Fila 1: Título */}
          <h2 className="text-xl font-bold tracking-tight">Calendario Maestro</h2>

          {/* Fila 2: Navegación de fecha + Selector de vista */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Controles de navegación */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={handlePrev} 
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-black"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-2 capitalize min-w-[140px] text-center">
                {getPeriodLabel()}
              </span>
              <button 
                onClick={handleNext} 
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-black"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())} 
                className="px-2.5 py-1 hover:bg-white rounded-lg transition-colors text-[10px] font-black uppercase text-gray-500 hover:text-black border border-transparent hover:border-gray-200"
              >
                Hoy
              </button>
            </div>

            {/* Selector de vistas */}
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              {(['day', 'week', 'month', 'year'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setViewMode(mode)
                    setSelectedStaff(null)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    viewMode === mode 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : mode === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 3: Botones de acción */}
          <div className="flex gap-2">
            <button 
              onClick={() => setIsBlockTimeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-black text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <Clock className="w-3 h-3 text-white" /> Bloquear Horario
            </button>
            <button 
              onClick={() => setIsEmergencyMode(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition-colors"
            >
              <AlertTriangle className="w-3 h-3" /> Calamidad / Emergencia
            </button>
          </div>

          {/* Fila 4: Filtro por Staff — estilo igual al selector de vista */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase mr-1">Filtrar por Staff:</span>
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1 flex-wrap">
              {uniqueStaff.map(staffName => {
                const isSelected = selectedStaff === staffName
                return (
                  <button 
                    key={staffName} 
                    onClick={() => setSelectedStaff(isSelected ? null : staffName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-black text-white shadow-sm' 
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {staffName}
                  </button>
                )
              })}
            </div>
            {selectedStaff && (
              <button onClick={() => setSelectedStaff(null)} className="px-2 py-1 text-xs text-gray-500 hover:text-black underline ml-1">
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 border-b font-semibold">Hora / Fecha</th>
                <th className="p-4 border-b font-semibold">Cliente</th>
                <th className="p-4 border-b font-semibold">Servicio</th>
                <th className="p-4 border-b font-semibold">Staff</th>
                <th className="p-4 border-b font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay citas programadas para el período seleccionado.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const staffName = apt.profiles?.name || 'Sin Asignar'
                  return (
                    <tr key={apt.id} onClick={() => setSelectedAppointment(apt)} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                      <td className="p-4 font-bold text-gray-900">
                        {viewMode === 'day' 
                          ? format(parseISO(apt.start_time), 'hh:mm a')
                          : format(parseISO(apt.start_time), "eee d MMM - hh:mm a", { locale: es })
                        }
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
                          <span className={`w-2 h-2 rounded-full ${
                            apt.status === 'completed' ? 'bg-blue-500' :
                            apt.status === 'confirmed' ? 'bg-green-500 animate-pulse' :
                            apt.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-400'
                          }`}></span>
                          <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                            {apt.status === 'completed' ? 'Completado' :
                             apt.status === 'confirmed' ? 'Confirmado' :
                             apt.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
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

      {/* Sección de Horarios Libres */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> Horarios Libres Disponibles
            </h3>
            <p className="text-sm text-gray-500">Espacios comerciales sin citas asignadas en este rango</p>
          </div>
        </div>

        {viewMode === 'day' && (
          <div className="flex flex-wrap gap-2">
            {getFreeSlotsForDay(currentDate).length === 0 ? (
              <p className="text-sm text-gray-500">No hay horarios libres hoy (agenda llena o día cerrado).</p>
            ) : (
              getFreeSlotsForDay(currentDate).map(slot => (
                <span key={slot} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-bold">
                  {slot}
                </span>
              ))
            )}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {getFreeSlotsForWeek(currentDate).map(({ date, slots }) => (
              <div key={date.toISOString()} className="p-3 border rounded-xl bg-gray-50 space-y-2">
                <p className="text-xs font-bold text-gray-700 capitalize">{format(date, 'eee d', { locale: es })}</p>
                <p className="text-xs text-gray-500">{slots.length} espacios libres</p>
                <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto">
                  {slots.slice(0, 4).map(slot => (
                    <span key={slot} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] rounded font-medium">
                      {slot}
                    </span>
                  ))}
                  {slots.length > 4 && <span className="text-[10px] text-gray-400 font-bold">+{slots.length - 4}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'month' && (
          <div className="max-h-[200px] overflow-y-auto grid grid-cols-4 sm:grid-cols-7 gap-2">
            {getFreeSlotsForMonth(currentDate).map(({ date, slotsCount }) => (
              <div key={date.toISOString()} className="p-2 border rounded-lg text-center space-y-1 bg-white">
                <span className="text-[10px] text-gray-400 block">{format(date, 'd')}</span>
                <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-black ${slotsCount > 4 ? 'bg-emerald-100 text-emerald-800' : slotsCount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {slotsCount} libres
                </span>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'year' && (
          <p className="text-sm text-gray-500">Selecciona la vista de Día, Semana o Mes para ver el desglose detallado de horarios disponibles.</p>
        )}
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
                    <span className="text-gray-500 block mb-1">Fecha y Hora</span>
                    <span className="font-bold text-sm block">
                      {format(parseISO(selectedAppointment.start_time), "d 'de' MMM - hh:mm a", { locale: es })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Estado</span>
                    <span className="inline-flex items-center gap-1.5 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        selectedAppointment.status === 'completed' ? 'bg-blue-500' :
                        selectedAppointment.status === 'confirmed' ? 'bg-green-500 animate-pulse' :
                        selectedAppointment.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-400'
                      }`}></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        {selectedAppointment.status === 'completed' ? 'Completado' :
                         selectedAppointment.status === 'confirmed' ? 'Confirmado' :
                         selectedAppointment.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  {/* Cambiar Estado */}
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase block mb-1">Cambiar Estado</label>
                    <select
                      disabled={isUpdatingStatus}
                      value={selectedAppointment.status}
                      onChange={(e) => handleStatusChange(selectedAppointment.id, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    >
                      <option value="pending">⏳ Pendiente</option>
                      <option value="confirmed">✅ Confirmado</option>
                      <option value="completed">💼 Completado</option>
                      <option value="cancelled">❌ Cancelado</option>
                    </select>
                  </div>

                  {/* Asignar Profesional */}
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase block mb-1">Asignar Profesional</label>
                    <select
                      disabled={isAssigningStaff}
                      value={selectedAppointment.staff_id || ''}
                      onChange={(e) => handleStaffAssignment(selectedAppointment.id, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    >
                      <option value="">👤 Sin Asignar</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role === 'owner' ? 'Dueño' : 'Staff'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm"><span className="text-gray-500 w-20 inline-block font-bold">Cliente:</span> <span className="font-semibold text-gray-900">{selectedAppointment.client_name}</span></p>
                  <p className="text-sm"><span className="text-gray-500 w-20 inline-block font-bold">Teléfono:</span> <span className="font-medium">{selectedAppointment.client_phone || 'No registrado'}</span></p>
                  <p className="text-sm"><span className="text-gray-500 w-20 inline-block font-bold">Correo:</span> <span className="font-medium text-gray-600">{selectedAppointment.client_email || 'No registrado'}</span></p>
                </div>

                {/* Notas Clínicas / Ficha Técnica */}
                <div className="pt-4 border-t space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase block mb-1">Notas de Sesión / Ficha Técnica</label>
                  <textarea
                    key={selectedAppointment.id}
                    defaultValue={selectedAppointment.notes || ''}
                    placeholder="Escribe aquí observaciones técnicas (ej. fórmulas, evolución del tratamiento, notas clínicas)..."
                    rows={3}
                    className="w-full text-sm border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black bg-gray-50/50 resize-none font-medium"
                    onBlur={async (e) => {
                      const notesVal = e.target.value
                      const res = await saveAppointmentNotes(selectedAppointment.id, notesVal)
                      if (res.success) {
                        toast.success('Notas guardadas automáticamente')
                        setLocalAppointments(prev => prev.map(apt => {
                          if (apt.id === selectedAppointment.id) {
                            return { ...apt, notes: notesVal }
                          }
                          return apt
                        }))
                        setSelectedAppointment(prev => prev ? { ...prev, notes: notesVal } : null)
                      } else {
                        toast.error('Error al guardar las notas')
                      }
                    }}
                  />
                  <p className="text-[10px] text-gray-400">Las notas se guardan automáticamente al hacer clic fuera del cuadro.</p>
                </div>
              </div>
              
              <div className="p-6 pt-0 space-y-2.5">
                {selectedAppointment.status === 'cancelled' ? (
                  <button 
                    onClick={() => handleWhatsApp(selectedAppointment.client_phone, selectedAppointment.client_name, selectedAppointment.services?.name || 'Cita', selectedAppointment.start_time, 'cancellation')}
                    className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors text-sm"
                  >
                    <MessageCircle className="w-5 h-5" /> Avisar Cancelación por WhatsApp
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleWhatsApp(selectedAppointment.client_phone, selectedAppointment.client_name, selectedAppointment.services?.name || 'Cita', selectedAppointment.start_time, 'confirmation')}
                      className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors text-sm"
                    >
                      <MessageCircle className="w-5 h-5" /> Confirmar por WhatsApp
                    </button>
                    <button 
                      onClick={() => handleWhatsApp(selectedAppointment.client_phone, selectedAppointment.client_name, selectedAppointment.services?.name || 'Cita', selectedAppointment.start_time, 'reminder')}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <MessageCircle className="w-5 h-5" /> Enviar Recordatorio (WhatsApp)
                    </button>
                    <button 
                      disabled={isCancelling}
                      onClick={() => handleCancelAppointment(selectedAppointment.id)}
                      className="w-full py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isCancelling ? 'Cancelando...' : 'Cancelar Cita'}
                    </button>
                  </>
                )}
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
                    Esto cancelará todas las citas de la fecha seleccionada {selectedStaff ? `para ${selectedStaff}` : 'para todos los profesionales'}.
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
                            onClick={() => handleWhatsApp(client.client_phone, client.client_name, client.services?.name || 'Cita', client.start_time, 'cancellation')}
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

      {/* Block Time Modal */}
      <AnimatePresence>
        {isBlockTimeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Bloquear Horario</h3>
                  <p className="text-sm text-gray-500 mt-1">Evita reservas en este rango de tiempo</p>
                </div>
                <button onClick={() => setIsBlockTimeModalOpen(false)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBlockTimeSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase block mb-1">Profesional a Bloquear</label>
                  <select
                    value={blockStaffId}
                    onChange={(e) => setBlockStaffId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">👤 Todos los Profesionales (Clínica Completa)</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role === 'owner' ? 'Dueño' : 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase block mb-1">Fecha</label>
                    <input 
                      type="date" 
                      required
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase block mb-1">Hora de Inicio</label>
                    <select
                      value={blockTimeVal}
                      onChange={(e) => setBlockTimeVal(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {businessHours.map(hour => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase block mb-1">Duración del Bloqueo</label>
                  <select
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(parseInt(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value={30}>30 Minutos</option>
                    <option value={60}>1 Hora</option>
                    <option value={120}>2 Horas</option>
                    <option value={240}>4 Horas (Medio día)</option>
                    <option value={480}>8 Horas (Todo el día)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsBlockTimeModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingBlock}
                    className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isSavingBlock ? 'Bloqueando...' : 'Confirmar Bloqueo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
