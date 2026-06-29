'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, Users, Wallet, Filter } from 'lucide-react'

export default function FinancesDashboard({ initialAppointments, isOwner }: { initialAppointments: any[], isOwner: boolean }) {
  const [filter, setFilter] = useState<'all' | 'this_month' | 'last_month'>('all')

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime()

  // Filter appointments
  const filteredApps = initialAppointments.filter(app => {
    if (filter === 'all') return true
    const appTime = new Date(app.start_time).getTime()
    if (filter === 'this_month') return appTime >= thisMonthStart
    if (filter === 'last_month') return appTime >= lastMonthStart && appTime <= lastMonthEnd
    return true
  })

  // Calculations
  let ownerPersonalIncome = 0
  let commissionsFromStaff = 0
  const staffBreakdown: Record<string, { name: string, totalGenerated: number, commissionKept: number, businessCut: number }> = {}

  filteredApps.forEach(app => {
    const price = app.total_price || 0
    const commission = app.commission_earned || 0
    const staffName = app.profiles?.name || 'Desconocido'
    const isOwner = app.profiles?.role === 'owner'
    const staffIdStr = app.staff_id || 'unknown'

    if (isOwner) {
      ownerPersonalIncome += price
    } else {
      const businessCut = price - commission
      commissionsFromStaff += businessCut

      if (!staffBreakdown[staffIdStr]) {
        staffBreakdown[staffIdStr] = { name: staffName, totalGenerated: 0, commissionKept: 0, businessCut: 0 }
      }
      staffBreakdown[staffIdStr].totalGenerated += price
      staffBreakdown[staffIdStr].commissionKept += commission
      staffBreakdown[staffIdStr].businessCut += businessCut
    }
  })

  const totalBusinessIncome = ownerPersonalIncome + commissionsFromStaff

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-500 mr-2" />
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Histórico Total
        </button>
        <button 
          onClick={() => setFilter('this_month')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${filter === 'this_month' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Este Mes
        </button>
        <button 
          onClick={() => setFilter('last_month')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${filter === 'last_month' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Mes Anterior
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isOwner && (
          <motion.div variants={cardVariants} className="bg-black text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-white/10">
              <Wallet className="w-32 h-32" />
            </div>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-2">Ingreso Total Negocio</p>
            <AnimatePresence mode="popLayout">
              <motion.p 
                key={totalBusinessIncome}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black"
              >
                ${totalBusinessIncome.toFixed(2)}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs text-gray-400 mt-4 border-t border-white/20 pt-2">Tu trabajo + Comisiones de otros</p>
          </motion.div>
        )}

        <motion.div variants={cardVariants} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              {isOwner ? 'Tu Trabajo Personal' : 'Total Generado por Mí'}
            </p>
          </div>
          <AnimatePresence mode="popLayout">
            <motion.p 
              key={isOwner ? ownerPersonalIncome : commissionsFromStaff}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold"
            >
              ${(isOwner ? ownerPersonalIncome : commissionsFromStaff).toFixed(2)}
            </motion.p>
          </AnimatePresence>
          <p className="text-xs text-gray-500 mt-4">
            {isOwner ? '100% íntegro para el dueño' : 'Monto total de mis servicios (antes de comisión)'}
          </p>
        </motion.div>

        {isOwner && (
          <motion.div variants={cardVariants} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Users className="w-5 h-5" /></div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Comisiones (De Equipo)</p>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.p 
                key={commissionsFromStaff}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold"
              >
                ${commissionsFromStaff.toFixed(2)}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs text-gray-500 mt-4">La porción que retiene el local</p>
          </motion.div>
        )}

        {!isOwner && (
          <motion.div variants={cardVariants} className="bg-black text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500 text-black rounded-lg"><Wallet className="w-5 h-5" /></div>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Mi Ganancia a Recibir</p>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.p 
                key={Object.values(staffBreakdown)[0]?.commissionKept || 0}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold"
              >
                ${(Object.values(staffBreakdown)[0]?.commissionKept || 0).toFixed(2)}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs text-gray-400 mt-4 border-t border-white/20 pt-2">Tu corte tras comisión del local</p>
          </motion.div>
        )}
      </motion.div>

      {/* Desglose por Profesional (Solo Dueño) */}
      {isOwner && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Desglose por Profesional</h2>
          </div>
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                  <th className="p-4 font-semibold">Profesional</th>
                  <th className="p-4 font-semibold">Total Generado</th>
                  <th className="p-4 font-semibold">Pago al Profesional</th>
                  <th className="p-4 font-semibold">Ganancia del Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {Object.values(staffBreakdown).length === 0 ? (
                    <motion.tr
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        No hay registros en este periodo de tiempo.
                      </td>
                    </motion.tr>
                  ) : (
                    Object.values(staffBreakdown).map((staff, i) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={staff.name} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-bold text-gray-900">{staff.name}</td>
                        <td className="p-4 text-gray-900">${staff.totalGenerated.toFixed(2)}</td>
                        <td className="p-4 text-gray-500">${staff.commissionKept.toFixed(2)}</td>
                        <td className="p-4 text-green-600 font-bold">+${staff.businessCut.toFixed(2)}</td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
