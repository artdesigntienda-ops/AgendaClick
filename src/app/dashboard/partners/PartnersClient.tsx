'use client'

import { useState } from 'react'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  Smartphone, 
  CreditCard, 
  Building, 
  Sparkles,
  PlayCircle,
  Search,
  Filter
} from 'lucide-react'
import { registerClientByPartner, savePayoutInfo } from './actions'
import { toast } from 'sonner'

export default function PartnersClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isPayoutOpen, setIsPayoutOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const partner = data.partner || {}
  const metrics = data.metrics || {}
  const clinics = data.clinics || []

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/login?ref=${partner.partnerCode}`
    : `https://www.agendaclick.com.co/login?ref=${partner.partnerCode}`

  const copyToClipboard = (text: string, isCode = false) => {
    navigator.clipboard.writeText(text)
    if (isCode) {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
    toast.success('¡Copiado al portapapeles!')
  }

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
  }

  // Filtrado de clientes
  const filteredClinics = clinics.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'active') return matchesSearch && c.subscriptionStatus === 'active' && !c.isExpired
    if (statusFilter === 'trial') return matchesSearch && c.subscriptionStatus === 'trial' && !c.isExpired
    if (statusFilter === 'expired') return matchesSearch && c.isExpired
    return matchesSearch
  })

  // Generador de enlace WhatsApp con mensaje predeterminado
  const getWhatsAppLink = (clinic: any) => {
    const cleanPhone = clinic.phone.replace(/[^0-9]/g, '')
    const phoneWithCountry = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`
    
    let message = ''
    if (clinic.subscriptionStatus === 'trial' && !clinic.isExpired) {
      message = `Hola ${clinic.ownerName}, te escribe tu asesor de AgendaClick 👋. Veo que tienes activo tu período de prueba en ${clinic.name} (quedan ${clinic.daysRemaining} días). ¿Cómo te ha ido configurando tus servicios? ¿Tienes alguna duda?`
    } else if (clinic.isExpired) {
      message = `Hola ${clinic.ownerName}, un gusto saludarte. Tu período de prueba de AgendaClick para ${clinic.name} ha finalizado. Para mantener tu agenda activa y seguir recibiendo reservas online, puedes activar tu plan aquí: https://www.agendaclick.com.co/login. ¡Quedo atento para apoyarte!`
    } else {
      message = `Hola ${clinic.ownerName}, ¡gracias por confiar en AgendaClick para ${clinic.name}! ¿Cómo va todo con tus citas? Cualquier consulta que tengas, estoy para apoyarte.`
    }

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`
  }

  // Manejador de alta de cliente
  const handleRegisterClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await registerClientByPartner(formData)
      if (res.success) {
        toast.success(res.message)
        setIsRegisterOpen(false)
        window.location.reload()
      } else {
        toast.error(res.error || 'Error al registrar cliente')
      }
    } catch (err: any) {
      toast.error('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejador de datos de pago
  const handleSavePayout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      const res = await savePayoutInfo(formData)
      if (res.success) {
        toast.success(res.message)
        setIsPayoutOpen(false)
      } else {
        toast.error(res.error || 'Error al guardar datos')
      }
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-950 p-6 md:p-8 rounded-3xl border border-gray-800 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Portal de Distribuidor Oficial
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Panel Comercial & Cartera de Clientes
          </h1>
          <p className="text-sm text-gray-400 max-w-xl">
            Monitorea el estado de tus clientes, renovaciones y comisiones recurrentes del <strong>{partner.commissionRate}% mensual</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsPayoutOpen(true)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            {partner.bankPayoutInfo ? 'Cuenta de Pago Configurada' : 'Configurar Pago (Nequi/Banco)'}
          </button>
          
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Registrar Nuevo Cliente
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS (KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Clientes</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{metrics.totalReferred || 0}</p>
          <p className="text-[11px] text-gray-400 mt-1">Negocios en tu cartera</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En Prueba Gratis</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-900">{metrics.trialCount || 0}</p>
          <p className="text-[11px] text-amber-700 mt-1">Listos para seguimiento</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Clientes Activos</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-900">{metrics.activeCount || 0}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Suscripción paga al día</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Vencidos / Por Cobrar</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-900">{metrics.expiredCount || 0}</p>
          <p className="text-[11px] text-rose-700 mt-1">Requieren reactivación</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 p-5 rounded-2xl border border-emerald-500/30 text-white shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Comisión Mensual</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{formatCOP(metrics.estimatedMonthlyCommission || 0)}</p>
          <p className="text-[11px] text-gray-300 mt-1">Ingreso pasivo recurrente</p>
        </div>

      </div>

      {/* CAJA DE HERRAMIENTAS: ENLACE DE REFERIDO & DEMOS EN VIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ENLACE DE REFERIDO */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">🔗 Tu Enlace Único de Distribuidor</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comparte este enlace por WhatsApp o redes. Cada negocio que se registre quedará asignado a tu cuenta automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={referralLink}
              className="flex-1 bg-gray-50 border border-gray-300 text-xs font-mono text-gray-800 rounded-xl px-3 py-2.5 focus:outline-none"
            />
            <button 
              onClick={() => copyToClipboard(referralLink)}
              className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
            <span>Código de Asesor: <strong className="font-mono text-gray-900">{partner.partnerCode}</strong></span>
            <button 
              onClick={() => copyToClipboard(partner.partnerCode, true)} 
              className="text-blue-600 hover:underline font-semibold"
            >
              {copiedCode ? '¡Código Copiado!' : 'Copiar Código'}
            </button>
          </div>
        </div>

        {/* DEMOS INTERACTIVAS PARA MOSTRAR A CLIENTES */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-white/10 text-white shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <PlayCircle className="w-4 h-4" />
            Demos para Mostrar en Vivo
          </div>
          <h2 className="text-sm font-bold text-gray-200">Muéstrale cómo se ve el sistema a tus prospectos</h2>
          
          <div className="space-y-2 pt-1">
            <a 
              href="/mlec-rave-studio" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
            >
              <span>💇‍♀️ <strong>Demo Peluquería:</strong> Mlec Rave Studio</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>

            <a 
              href="/motork-pasto" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
            >
              <span>🚗 <strong>Demo Taller & EV:</strong> Motor K</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>
          </div>
        </div>

      </div>

      {/* TABLA CRM DE CLIENTES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mis Negocios & Clientes</h2>
            <p className="text-xs text-gray-500">Historial completo con estado de pago y seguimiento comercial.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar negocio o dueño..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Filtro */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo Activos (Pagando)</option>
              <option value="trial">Solo En Prueba</option>
              <option value="expired">Solo Vencidos</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Negocio / Cliente</th>
                <th className="py-3 px-4">Segmento</th>
                <th className="py-3 px-4">Estado de Pago</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Días Restantes</th>
                <th className="py-3 px-4 text-right">Contacto WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredClinics.length > 0 ? (
                filteredClinics.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    
                    {/* Negocio & Dueño */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[11px] text-gray-500">{c.ownerName} ({c.ownerEmail})</div>
                    </td>

                    {/* Segmento */}
                    <td className="py-3 px-4 uppercase font-mono text-[10px] text-gray-600">
                      {c.businessType || 'General'}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4">
                      {c.subscriptionStatus === 'active' && !c.isExpired ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Activo (Al día)
                        </span>
                      ) : c.subscriptionStatus === 'trial' && !c.isExpired ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          <Clock className="w-3 h-3" /> En Prueba ({c.daysRemaining}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Vencido (Por pagar)
                        </span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4 capitalize font-medium text-gray-800">
                      Plan {c.planType}
                    </td>

                    {/* Días Restantes */}
                    <td className="py-3 px-4 font-mono font-semibold">
                      {c.subscriptionStatus === 'active' ? 'Renovación Auto' : `${c.daysRemaining} días`}
                    </td>

                    {/* Botón WhatsApp */}
                    <td className="py-3 px-4 text-right">
                      {c.phone ? (
                        <a 
                          href={getWhatsAppLink(c)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-sm"
                          title="Abrir chat en WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Sin teléfono</span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    <p className="text-sm">No se encontraron clientes registrados con tu código aún.</p>
                    <button 
                      onClick={() => setIsRegisterOpen(true)}
                      className="mt-3 text-xs text-black font-bold underline"
                    >
                      + Registrar tu primer cliente ahora
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: REGISTRAR NUEVO CLIENTE */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Dar de Alta Nuevo Cliente</h3>
                <p className="text-xs text-gray-500">Se le otorgarán 14 días de prueba gratis y quedará vinculado a tu cuenta.</p>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="text-gray-400 hover:text-black text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleRegisterClient} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre del Negocio (Empresa) *</label>
                <input 
                  type="text" 
                  name="business_name" 
                  placeholder="Ej: Salón Glamour o Canchas El Gol"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre del Dueño / Administrador *</label>
                <input 
                  type="text" 
                  name="owner_name" 
                  placeholder="Ej: Laura Gómez"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="cliente@gmail.com"
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">WhatsApp / Teléfono *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="3101234567"
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Segmento del Negocio</label>
                  <select 
                    name="business_type" 
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none"
                  >
                    <option value="belleza">Peluquería / Barbería / Uñas</option>
                    <option value="deportes">Canchas Sintéticas / Pádel</option>
                    <option value="automotriz">Taller / Carga EV / Lavadero</option>
                    <option value="salud">Consultorio Médico / Dental</option>
                    <option value="mascotas">Veterinaria / Spa Mascotas</option>
                    <option value="bienestar">Spa / Masajes / Yoga</option>
                    <option value="educacion">Clases / Tutorías</option>
                    <option value="profesional">Estudio / Fotografía / Abogados</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ciudad</label>
                  <input 
                    type="text" 
                    name="city" 
                    defaultValue="Medellín"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-900">
                ✨ El cliente recibirá <strong>14 días gratis</strong> para probar AgendaClick con todas las funciones activadas.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-black hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando...' : 'Crear y Vincular Negocio'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAR BILLETERA / CUENTA DE PAGO */}
      {isPayoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Datos para Pago de Comisiones</h3>
                <p className="text-xs text-gray-500">Consignación mensual automática de tus comisiones del 25%.</p>
              </div>
              <button onClick={() => setIsPayoutOpen(false)} className="text-gray-400 hover:text-black text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">Banco o Billetera Digital *</label>
                <select 
                  name="bank_name" 
                  defaultValue={partner.bankPayoutInfo?.bankName || 'Nequi'}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none"
                >
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="Davivienda">Davivienda</option>
                  <option value="BBVA">BBVA</option>
                  <option value="Banco de Bogotá">Banco de Bogotá</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tipo de Cuenta *</label>
                <select 
                  name="account_type" 
                  defaultValue={partner.bankPayoutInfo?.accountType || 'Ahorros'}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none"
                >
                  <option value="Ahorros">Cuenta de Ahorros</option>
                  <option value="Corriente">Cuenta Corriente</option>
                  <option value="Billetera">Billetera Móvil (Nequi/Daviplata)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Número de Cuenta o Celular *</label>
                <input 
                  type="text" 
                  name="account_number" 
                  defaultValue={partner.bankPayoutInfo?.accountNumber || ''}
                  placeholder="Ej: 3101234567 o 12345678901"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre Completo del Titular *</label>
                <input 
                  type="text" 
                  name="account_holder_name" 
                  defaultValue={partner.bankPayoutInfo?.accountHolderName || partner.name}
                  placeholder="Ej: Marly Rave"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Cédula o NIT *</label>
                <input 
                  type="text" 
                  name="document_id" 
                  defaultValue={partner.bankPayoutInfo?.documentId || ''}
                  placeholder="Ej: 1020304050"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPayoutOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-black hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cuenta'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
