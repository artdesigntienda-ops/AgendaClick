'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CopyButton } from './CopyButton'
import { Trash2 } from 'lucide-react'
import { removeStaffMember } from './actions'
import { toast } from 'sonner'

export default function StaffClient({ clinic, staff, isOwner }: { clinic: any, staff: any[], isOwner: boolean }) {
  const currentStaffCount = staff.filter(s => s.role !== 'owner').length
  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/login?invite=${clinic.id}` : ''
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (staffId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar a este profesional? Ya no podrá acceder a la estética ni aparecerá en la agenda.')) return
    
    try {
      setIsDeleting(staffId)
      await removeStaffMember(staffId)
      toast.success('Profesional eliminado correctamente.')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar al profesional.')
    } finally {
      setIsDeleting(null)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 animate-fade-in-up">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-black tracking-tighter">Profesionales</h1>
        <p className="text-gray-500 mt-2">Gestiona tu equipo de trabajo.</p>
        <p className="text-xs font-bold text-black bg-gray-100 inline-block px-2 py-1 mt-2 rounded">
          Plan actual: {currentStaffCount} / {clinic.staff_limit === 999 ? 'Ilimitado' : clinic.staff_limit} empleados
        </p>
      </motion.div>

      {isOwner && currentStaffCount < clinic.staff_limit && (
        <motion.div variants={itemVariants} className="bg-black text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold mb-2">Invitar a un nuevo profesional</h2>
          <p className="text-sm text-gray-300 mb-4">Copia este enlace y envíaselo a tu empleado para que cree su cuenta y se una automáticamente a tu estética.</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input 
              type="text" 
              readOnly 
              value={inviteLink}
              className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 w-full text-sm font-mono focus:outline-none focus:border-white/40 transition-colors"
            />
            <CopyButton text={inviteLink} />
          </div>
        </motion.div>
      )}

      {isOwner && currentStaffCount >= clinic.staff_limit && (
        <motion.div variants={itemVariants} className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-yellow-900 mb-2">Límite de profesionales alcanzado</h2>
          <p className="text-sm text-yellow-800">
            Has alcanzado el límite de {clinic.staff_limit} profesionales de tu plan actual. Para invitar a más personas, por favor actualiza tu suscripción en la sección de Facturación.
          </p>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Google Calendar</th>
                {isOwner && <th className="px-6 py-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {member.name || member.email.split('@')[0]}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      member.role === 'owner' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role === 'owner' ? 'Dueño' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      member.google_calendar_id ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.google_calendar_id ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      {member.google_calendar_id ? 'Conectado' : 'Pendiente'}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleDelete(member.id)}
                          disabled={isDeleting === member.id}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Eliminar profesional"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No hay profesionales registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
