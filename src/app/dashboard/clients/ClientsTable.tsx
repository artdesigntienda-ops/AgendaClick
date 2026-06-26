'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartHandshake, CircleAlert, CheckCircle2, AlertTriangle, ArrowDownUp } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ClientsTable({ clients }: { clients: any[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'risk' | 'lost'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  const getRetentionStatus = (lastVisitISO: string) => {
    const lastVisit = parseISO(lastVisitISO)
    const diffDays = (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays <= 30) {
      return {
        id: 'active',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Cliente Frecuente (Activo)',
        icon: <CheckCircle2 className="w-4 h-4" />
      }
    } else if (diffDays <= 60) {
      return {
        id: 'risk',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        text: 'Riesgo (Hace > 1 Mes)',
        icon: <AlertTriangle className="w-4 h-4" />
      }
    } else {
      return {
        id: 'lost',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'Perdido (Hace > 2 Meses)',
        icon: <CircleAlert className="w-4 h-4" />
      }
    }
  }

  // Enrich clients with status
  const enrichedClients = clients.map(c => ({
    ...c,
    statusInfo: getRetentionStatus(c.lastVisit)
  }))

  let filtered = enrichedClients
  if (filter !== 'all') {
    filtered = enrichedClients.filter(c => c.statusInfo.id === filter)
  }

  if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    filtered.sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HeartHandshake className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-bold">Listado de Clientes y Retención</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Activos
          </button>
          <button 
            onClick={() => setFilter('risk')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${filter === 'risk' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            En Riesgo
          </button>
          <button 
            onClick={() => setFilter('lost')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${filter === 'lost' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Perdidos
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block"></div>
          
          <button 
            onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black bg-white border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
          >
            <ArrowDownUp className="w-3 h-3" />
            Ordenar por {sortBy === 'date' ? 'Fecha' : 'Nombre'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Último Servicio</th>
              <th className="p-4 font-semibold">Atendido por</th>
              <th className="p-4 font-semibold">Hace Cuánto</th>
              <th className="p-4 font-semibold">Semáforo de Retención</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="empty"
                >
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay clientes que coincidan con estos filtros.
                  </td>
                </motion.tr>
              ) : (
                filtered.map((client, i) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={client.email} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.phone} • {client.email}</p>
                    </td>
                    <td className="p-4 text-gray-900 font-medium">{client.lastService}</td>
                    <td className="p-4 text-gray-600">{client.lastStaff}</td>
                    <td className="p-4 text-sm text-gray-500 capitalize">
                      {formatDistanceToNow(parseISO(client.lastVisit), { addSuffix: true, locale: es })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${client.statusInfo.bgColor} ${client.statusInfo.color}`}>
                        {client.statusInfo.icon}
                        {client.statusInfo.text}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
