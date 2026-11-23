'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CopyButton } from './CopyButton'
import { Trash2, Clock, MessageCircle, UserPlus, CheckCircle2, ShieldCheck, Sparkles, Send, Copy, Check, ArrowRight, Info, Percent, Settings2, Target, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { removeStaffMember, addStaffMemberByEmail } from './actions'
import { StaffScheduleModal } from './StaffScheduleModal'
import { StaffCompensationModal } from './StaffCompensationModal'
import { toast } from 'sonner'

export default function StaffClient({ clinic, staff, isOwner, appointments = [] }: { clinic: any, staff: any[], isOwner: boolean, appointments?: any[] }) {
  const currentStaffCount = staff.filter(s => s.role !== 'owner').length
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [selectedStaffForSchedule, setSelectedStaffForSchedule] = useState<any | null>(null)
  const [selectedStaffForCompensation, setSelectedStaffForCompensation] = useState<any | null>(null)
  const [commissionPeriod, setCommissionPeriod] = useState<'month' | 'last_month' | 'year'>('month')
  
  const [directName, setDirectName] = useState('')
  const [directEmail, setDirectEmail] = useState('')
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<{ name: string; email: string } | null>(null)
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null)

  const buildInviteMessage = (staffName: string, staffEmail: string) => {
    return `¡Hola ${staffName}! 👋 Te he agregado como profesional en el equipo de *${clinic?.name || 'nuestro negocio'}* en *AgendaClick*.\n\nPara acceder a tu agenda y ver tus citas asignadas:\n1️⃣ Entra a: https://agendaclick.com.co/login\n2️⃣ Inicia sesión con tu correo (*${staffEmail}*) o pulsa en *"Continuar con Google"*.\n\n¡Listo! Tu panel de trabajo se abrirá de inmediato sin necesidad de contraseñas complejas ni enlaces que caduquen.`
  }

  const handleCopyInvite = async (staffName: string, staffEmail: string, identifier: string) => {
    const text = buildInviteMessage(staffName, staffEmail)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStaffId(identifier)
      toast.success('Instrucciones copiadas al portapapeles.')
      setTimeout(() => setCopiedStaffId(null), 2500)
    } catch {
      toast.error('No se pudo copiar el texto.')
    }
  }

  const handleWhatsAppInvite = (staffName: string, staffEmail: string) => {
    const text = encodeURIComponent(buildInviteMessage(staffName, staffEmail))
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const handleDirectRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!directEmail.trim() || !directName.trim()) return

    const trimmedName = directName.trim()
    const trimmedEmail = directEmail.trim()

    try {
      setIsSubmittingDirect(true)
      await addStaffMemberByEmail(trimmedEmail, trimmedName)
      toast.success('¡Profesional pre-registrado correctamente! Ahora puede unirse registrándose con este correo.')
      setRecentlyAdded({ name: trimmedName, email: trimmedEmail })
      setDirectEmail('')
      setDirectName('')
    } catch (error: any) {
      toast.error(error.message || 'Error al pre-registrar al profesional.')
    } finally {
      setIsSubmittingDirect(false)
    }
  }

  const getFilteredAppointmentsForCommissions = () => {
    const now = new Date()
    return appointments.filter((apt: any) => {
      if (!apt.start_time) return false
      const aptDate = new Date(apt.start_time)
      if (commissionPeriod === 'month') {
        return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
      } else if (commissionPeriod === 'last_month') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
        return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === year
      } else {
        return aptDate.getFullYear() === now.getFullYear()
      }
    })
  }

  const filteredApts = getFilteredAppointmentsForCommissions()

  const getMemberPayout = (member: any, totalSales: number, completedCount: number) => {
    const comp = member.bank_payout_info?.compensation
    const compType = comp?.compensation_type || 'percentage'

    if (compType === 'fixed_salary') {
      const salary = Number(comp?.base_salary) || 0
      return {
        type: 'fixed_salary',
        badge: 'Salario Fijo',
        rateText: 'Fijo',
        totalPayout: salary,
        baseSalary: salary,
        commissionPayout: 0,
        targetProgress: null
      }
    }

    if (compType === 'base_plus_target') {
      const base = Number(comp?.base_salary) || 0
      const target = Number(comp?.target_amount) || 0
      const rate = Number(comp?.target_commission_rate) || 0
      const achieved = target > 0 && totalSales >= target
      const commissionBonus = achieved ? Math.round(totalSales * (rate / 100)) : 0
      const totalPayout = base + commissionBonus
      const percentAchieved = target > 0 ? Math.min(100, Math.round((totalSales / target) * 100)) : 100

      return {
        type: 'base_plus_target',
        badge: `Básico + ${rate}% Meta`,
        rateText: `Básico + ${rate}%`,
        totalPayout,
        baseSalary: base,
        commissionPayout: commissionBonus,
        targetProgress: {
          target,
          achieved,
          percentAchieved,
          difference: Math.max(0, target - totalSales)
        }
      }
    }

    // Porcentaje estándar (0% a 100%)
    const rate = comp?.commission_rate !== undefined 
      ? Number(comp.commission_rate) 
      : (member.default_commission_rate !== undefined 
          ? Number(member.default_commission_rate) 
          : (member.role === 'owner' ? 0 : 50))

    const totalPayout = Math.round(totalSales * (rate / 100))
    return {
      type: 'percentage',
      badge: `${rate}% Comisión`,
      rateText: `${rate}%`,
      totalPayout,
      baseSalary: 0,
      commissionPayout: totalPayout,
      targetProgress: null
    }
  }

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
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="bg-white border border-gray-200 text-black p-6 sm:p-7 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Formulario de Pre-registro */}
              <div className="flex-1 max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold">Pre-registrar Profesional</h2>
                </div>
                
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  Ingresa el nombre y correo de tu colaborador. El sistema lo vinculará de inmediato a tu negocio y ya podrá recibir citas en la agenda.
                </p>
                
                <form onSubmit={handleDirectRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nombre Completo
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: Laura Gómez" 
                        value={directName}
                        onChange={(e) => setDirectName(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-300 text-black rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Correo Electrónico (Gmail recomendado)
                      </label>
                      <input 
                        type="email" 
                        placeholder="ejemplo@gmail.com" 
                        value={directEmail}
                        onChange={(e) => setDirectEmail(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-300 text-black rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmittingDirect}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmittingDirect ? 'Pre-registrando...' : 'Pre-registrar Profesional'}</span>
                  </button>
                </form>
              </div>

              {/* Guía Explicativa Paso a Paso */}
              <div className="w-full md:w-80 lg:w-96 bg-gray-50 border border-gray-200/80 rounded-xl p-4 sm:p-5 text-xs space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¿Cómo funciona el acceso de tu equipo?</span>
                </div>

                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-gray-900 block font-semibold">Lo pre-registras aquí</strong>
                      <span>Escribe su nombre y el correo que usa habitualmente (por ejemplo, su Gmail).</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-gray-900 block font-semibold">Queda activo de inmediato</strong>
                      <span>Aparecerá en tu lista y tus clientes ya podrán agendar citas con él/ella.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-gray-900 block font-semibold">Tu profesional entra sin enlaces</strong>
                      <span>
                        Solo debe ingresar a <strong className="text-black">agendaclick.com.co/login</strong> con ese correo (o con Google). El sistema lo reconoce al instante y le abre su agenda sin mostrarle facturación ni datos privados.
                      </span>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            {/* Banner de Invitación Inmediata por WhatsApp / Copiar */}
            {recentlyAdded && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-emerald-950">
                      ¡{recentlyAdded.name} ha sido pre-registrado con éxito!
                    </p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Ya está activo en tu equipo. Puedes enviarle las instrucciones de acceso con un solo clic:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppInvite(recentlyAdded.name, recentlyAdded.email)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar por WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyInvite(recentlyAdded.name, recentlyAdded.email, 'recent')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    title="Copiar instrucciones"
                  >
                    {copiedStaffId === 'recent' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedStaffId === 'recent' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecentlyAdded(null)}
                    className="text-emerald-700 hover:text-emerald-950 text-xs p-2 hover:bg-emerald-100 rounded-lg cursor-pointer"
                    title="Descartar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {isOwner && currentStaffCount >= clinic.staff_limit && (
        <motion.div variants={itemVariants} className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-yellow-900 mb-1">Límite de profesionales alcanzado</h2>
            <p className="text-sm text-yellow-800">
              Has alcanzado el límite de {clinic.staff_limit} profesionales de tu plan actual. Para invitar a más colaboradores a tu equipo, amplía tu plan de suscripción.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-sm"
          >
            <span>Mejorar Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
                      <div className="flex justify-end items-center gap-1.5">
                        {member.role !== 'owner' && (
                          <>
                            <button
                              onClick={() => handleWhatsAppInvite(member.name || 'Profesional', member.email)}
                              className="text-emerald-600 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="Enviar instrucciones de acceso por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyInvite(member.name || 'Profesional', member.email, member.id)}
                              className="text-gray-500 hover:text-black p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Copiar instrucciones de acceso"
                            >
                              {copiedStaffId === member.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedStaffForCompensation(member)}
                          className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                          title="Configurar Esquema de Comisión / Salario"
                        >
                          <Percent className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedStaffForSchedule(member)}
                          className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar Horario"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
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
                      </div>
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

      {/* Reporte de Comisiones */}
      {isOwner && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Liquidación & Comisiones de Staff</h2>
              <p className="text-sm text-gray-500 mt-1">Calcula los pagos y comisiones acumuladas de tu equipo en el período seleccionado.</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              {(['month', 'last_month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setCommissionPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    commissionPeriod === period 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {period === 'month' ? 'Este Mes' : period === 'last_month' ? 'Mes Pasado' : 'Todo el Año'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => {
              const memberApts = filteredApts.filter((a: any) => a.staff_id === member.id && a.status === 'completed')
              const totalSales = memberApts.reduce((sum: number, a: any) => sum + (a.total_price || 0), 0)
              const payout = getMemberPayout(member, totalSales, memberApts.length)
              
              return (
                <div key={member.id} className="p-5 border border-gray-200 rounded-2xl space-y-4 bg-gray-50/50 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{member.name || member.email.split('@')[0]}</h3>
                        <p className="text-xs text-gray-500 capitalize">{member.role === 'owner' ? 'Dueño' : 'Staff'}</p>
                      </div>
                      <span className="bg-black text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0">
                        {memberApts.length} {memberApts.length === 1 ? 'servicio' : 'servicios'}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white border border-gray-200 text-gray-800 shadow-2xs mb-3">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{payout.badge}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t text-xs">
                      <div>
                        <span className="text-gray-500 block mb-0.5 font-medium">Total Recaudado</span>
                        <strong className="text-sm font-black text-gray-900">${totalSales.toLocaleString('es-CO')} COP</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5 font-medium">Pago a Liquidar</span>
                        <strong className="text-sm font-black text-emerald-700">${payout.totalPayout.toLocaleString('es-CO')} COP</strong>
                      </div>
                    </div>

                    {/* Barra de Meta si es base_plus_target */}
                    {payout.targetProgress && (
                      <div className="mt-3 pt-3 border-t space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-gray-500">Meta: ${payout.targetProgress.target.toLocaleString('es-CO')} COP</span>
                          <span className={payout.targetProgress.achieved ? 'text-emerald-600' : 'text-gray-700'}>
                            {payout.targetProgress.percentAchieved}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              payout.targetProgress.achieved ? 'bg-emerald-500' : 'bg-black'
                            }`}
                            style={{ width: `${Math.min(100, payout.targetProgress.percentAchieved)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {payout.targetProgress.achieved ? (
                            <span className="text-emerald-700 font-bold">
                              🎉 Meta superada: Básico (${payout.baseSalary.toLocaleString('es-CO')}) + Comisión (${payout.commissionPayout.toLocaleString('es-CO')})
                            </span>
                          ) : (
                            <span>
                              Básico garantizado (${payout.baseSalary.toLocaleString('es-CO')}). Faltan ${payout.targetProgress.difference.toLocaleString('es-CO')} COP para comisión.
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botón para configurar comisión / salario */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setSelectedStaffForCompensation(member)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 hover:border-gray-300 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>Configurar Comisión / Salario</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {selectedStaffForSchedule && (
        <StaffScheduleModal
          isOpen={!!selectedStaffForSchedule}
          onClose={() => setSelectedStaffForSchedule(null)}
          member={selectedStaffForSchedule}
          clinicName={clinic.name}
        />
      )}

      {selectedStaffForCompensation && (
        <StaffCompensationModal
          isOpen={!!selectedStaffForCompensation}
          onClose={() => setSelectedStaffForCompensation(null)}
          member={selectedStaffForCompensation}
          clinicName={clinic.name}
        />
      )}
    </motion.div>
  )
}
