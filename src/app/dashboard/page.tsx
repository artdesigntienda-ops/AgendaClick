'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, TrendingUp, Users, Clock } from 'lucide-react'

// Simulando datos para el Master Calendar mientras conectamos la DB
const MOCK_APPOINTMENTS = [
  { id: 1, client: 'Ana García', service: 'Manicura Acrílica', time: '10:00 AM', staff: 'María', status: 'confirmed', color: 'bg-black text-white' },
  { id: 2, client: 'Laura Gómez', service: 'Corte y Cepillado', time: '11:30 AM', staff: 'Diana', status: 'pending', color: 'bg-gray-200 text-black' },
  { id: 3, client: 'Sofia Ruiz', service: 'Masaje Relajante', time: '02:00 PM', staff: 'Carlos', status: 'confirmed', color: 'bg-black text-white' },
  { id: 4, client: 'Carmen López', service: 'Pedicura Spa', time: '04:00 PM', staff: 'María', status: 'confirmed', color: 'bg-black text-white' },
]

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null // Evitar hidratación mismatch

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Torre de Control</h1>
          <p className="text-gray-500 mt-2">Visión global de tu negocio hoy, 26 de Junio</p>
        </div>
        <button className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-900 transition-colors shadow-lg shadow-black/10">
          Nueva Cita Manual
        </button>
      </motion.div>

      {/* Métricas Financieras / CRM */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Ingresos Proyectados', value: '$1.250.000', icon: TrendingUp },
          { title: 'Citas Hoy', value: '12', icon: CalendarIcon },
          { title: 'Nuevos Clientes', value: '+4', icon: Users },
          { title: 'Horas Ocupadas', value: '85%', icon: Clock },
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
            <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full">María</span>
            <span className="px-3 py-1 bg-gray-200 text-black text-xs font-bold rounded-full">Diana</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Carlos</span>
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
              {MOCK_APPOINTMENTS.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                  <td className="p-4 font-bold text-gray-900">{apt.time}</td>
                  <td className="p-4 font-medium">{apt.client}</td>
                  <td className="p-4 text-gray-500">{apt.service}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold ${apt.color}`}>
                      {apt.staff}
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
