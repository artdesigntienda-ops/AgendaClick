'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CopyButton } from './CopyButton'

export default function StaffPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // MOCK data for the UI while backend is wired
  const clinic = { name: "Mi Negocio", id: "123-abc" }
  const staff = [
    { id: 1, name: "María", email: "maria@example.com", role: "owner", google_calendar_id: "yes" },
    { id: 2, name: "Diana", email: "diana@example.com", role: "staff", google_calendar_id: null },
  ]
  const inviteLink = `http://localhost:3000/login?invite=${clinic.id}`

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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-black tracking-tighter">Profesionales</h1>
        <p className="text-gray-500 mt-2">Administra los profesionales de tu negocio.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-black p-8 shadow-xl text-white relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
        <h2 className="text-xl font-bold mb-2">Invitar Profesional</h2>
        <p className="text-gray-400 mb-6 max-w-2xl">
          Comparte este enlace con tus profesionales. Al registrarse, quedarán vinculados automáticamente a <b>{clinic.name}</b>.
        </p>
        <div className="flex items-center gap-3 max-w-xl">
          <input 
            type="text" 
            readOnly 
            value={inviteLink}
            className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white outline-none focus:border-white/50 transition-colors"
          />
          <CopyButton text={inviteLink} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 border-b font-semibold">Nombre</th>
              <th className="p-4 border-b font-semibold">Email</th>
              <th className="p-4 border-b font-semibold">Rol</th>
              <th className="p-4 border-b font-semibold text-right">Calendario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((member, i) => (
              <motion.tr 
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 font-bold text-gray-900">{member.name}</td>
                <td className="p-4 text-gray-500">{member.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${member.role === 'owner' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                    {member.role === 'owner' ? 'Dueño' : 'Profesional'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {member.google_calendar_id ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Conectado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                      Desconectado
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
