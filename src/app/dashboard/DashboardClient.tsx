'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, TrendingUp, Users, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

type Appointment = {
  id: string
  client_name: string
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

  // Extraer staff único para los filtros visuales (chips)
  const uniqueStaff = Array.from(new Set(appointments.map(a => a.profiles?.name || 'Sin Asignar')))
  
  // Asignar un color fijo a cada staff para esta sesión
  const staffColors: Record<string, string> = {}
  uniqueStaff.forEach((name, i) => {
    staffColors[name] = COLORS[i % COLORS.length]
  })

  // Estadísticas básicas derivadas
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const pendingCount = appointments.filter(a => a.status === 'pending').length

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Recepción & Agenda</h1>
          <p className="text-gray-500 mt-2">Visión global de tu estética hoy, {format(new Date(), "d 'de' MMMM", { locale: es })}</p>
        </div>
        {clinicSlug ? (
          <a href={`/${clinicSlug}`} target="_blank" rel="noreferrer" className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-900 transition-colors shadow-lg shadow-black/10 inline-block text-center">
            Nueva Cita Manual
          </a>
        ) : (
          <button disabled className="bg-gray-200 text-gray-400 px-6 py-3 font-medium cursor-not-allowed">
            Configura tu negocio primero
          </button>
        )}
      </motion.div>

      {/* Métricas */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Citas Hoy (Confirmadas)', value: confirmedCount.toString(), icon: TrendingUp },
          { title: 'Citas Pendientes', value: pendingCount.toString(), icon: CalendarIcon },
          { title: 'Nuevos Clientes', value: '+0', icon: Users }, // Mock
          { title: 'Ocupación', value: '0%', icon: Clock }, // Mock
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

      {/* Master Calendar View */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Calendario Maestro (Hoy)</h2>
          <div className="flex gap-2">
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
          </div>
        </div>
        
        <div className="p-0">
          <table className="w-full text-left border-collapse">
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
              {appointments.filter(apt => selectedStaff ? (apt.profiles?.name || 'Sin Asignar') === selectedStaff : true).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay citas programadas para hoy {selectedStaff ? `con ${selectedStaff}` : ''}.
                  </td>
                </tr>
              ) : (
                appointments.filter(apt => selectedStaff ? (apt.profiles?.name || 'Sin Asignar') === selectedStaff : true).map((apt) => {
                  const staffName = apt.profiles?.name || 'Sin Asignar'
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
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
    </motion.div>
  )
}
