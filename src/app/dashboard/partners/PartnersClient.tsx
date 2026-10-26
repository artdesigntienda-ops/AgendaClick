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
  Filter,
  Share2,
  Tag,
  User,
  MapPin,
  Calendar
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
      message = `Hola ${clinic.ownerName}, te escribe ${partner.name || 'tu asesor'} de AgendaClick 👋. Veo que tienes activo tu período de prueba en ${clinic.name} (quedan ${clinic.daysRemaining} días). ¿Cómo te ha ido configurando tus servicios? ¿Tienes alguna duda para apoyarte?`
    } else if (clinic.isExpired) {
      message = `Hola ${clinic.ownerName}, un gusto saludarte. Tu período de prueba de AgendaClick para ${clinic.name} ha finalizado. Para mantener tu agenda activa y seguir recibiendo reservas de tus clientes, puedes activar tu plan aquí: https://www.agendaclick.com.co/dashboard/billing. ¡Quedo muy atento para cualquier duda!`
    } else {
      message = `Hola ${clinic.ownerName}, ¡gracias por confiar en AgendaClick para ${clinic.name}! ¿Cómo va todo con tus citas y clientes? Cualquier duda que tengas, aquí estoy para ayudarte.`
    }

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`
  }

  // Mensaje para compartir tu código general por WhatsApp
  const shareWhatsAppGeneral = () => {
    const msg = `¡Hola! Si tienes una peluquería, barbería, cancha sintética o negocio de citas, te recomiendo AgendaClick. Automatiza tus reservas por WhatsApp y Google Calendar. Regístrate con 14 días gratis usando mi código de asesor comercial: *${partner.partnerCode}* ingresando aquí: ${referralLink}`
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
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
        window.location.reload()
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
            Portal de Asesor Comercial Oficial
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Panel de Vendedor & Cartera de Empresas
          </h1>
          <p className="text-sm text-gray-400 max-w-xl">
            Asesor: <strong className="text-white">{partner.name}</strong> • Comisión comercial del <strong className="text-emerald-400">{partner.commissionRate}% mensual recurrente</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsPayoutOpen(true)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            {partner.bankPayoutInfo?.accountNumber ? 'Mis Datos & Cuenta de Pago' : 'Configurar Cuenta de Pago (Nequi/Banco)'}
          </button>
          
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Registrar Empresa
          </button>
        </div>
      </div>

      {/* TARJETA DESTACADA: CÓDIGO DE ASESOR Y ENLACE DE COMPARTIR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CÓDIGO DE ASESOR (GRANDE Y FÁCIL DE COPIAR O DICTAR) */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 rounded-3xl border-2 border-emerald-500/40 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tu Código de Vendedor
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Fácil de dictar
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Dile a tu cliente que ingrese este código al registrar su peluquería o negocio:
            </p>
          </div>

          <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-400">
              {partner.partnerCode}
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => copyToClipboard(partner.partnerCode, true)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? '¡Código Copiado!' : 'Copiar Código'}
            </button>

            <a
              href={shareWhatsAppGeneral()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
              title="Compartir por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* ENLACE DE REFERIDO DIRECTO */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              Tu Enlace de Invitación Directa
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Envía este link por WhatsApp o colócalo en tus redes. Al dar clic, el negocio se registra y tu código de asesor queda asignado automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={referralLink}
              className="flex-1 bg-gray-50 border border-gray-300 text-xs font-mono text-gray-800 rounded-xl px-3.5 py-3 focus:outline-none"
            />
            <button 
              onClick={() => copyToClipboard(referralLink)}
              className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shadow-sm shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copiado' : 'Copiar Link'}
            </button>
          </div>

          {/* Demos en vivo para clientes */}
          <div className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Demos para mostrar a tus prospectos:</span>
            <div className="flex items-center gap-3">
              <a href="/mlec-rave-studio" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                💇‍♀️ Demo Salón <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-gray-300">•</span>
              <a href="/motork-pasto" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                🚗 Demo Taller <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* TARJETAS DE MÉTRICAS (KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Empresas</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{metrics.totalReferred || 0}</p>
          <p className="text-[11px] text-gray-400 mt-1">Registradas con tu código</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En Prueba Gratis</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-900">{metrics.trialCount || 0}</p>
          <p className="text-[11px] text-amber-700 mt-1">14 días de prueba activos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Empresas Pagando</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-900">{metrics.activeCount || 0}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Suscripción paga al día</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Por Cobrar / Vencidas</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-900">{metrics.expiredCount || 0}</p>
          <p className="text-[11px] text-rose-700 mt-1">Listas para recordar pago</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 p-5 rounded-2xl border border-emerald-500/30 text-white shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Comisión Mensual</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{formatCOP(metrics.estimatedMonthlyCommission || 0)}</p>
          <p className="text-[11px] text-gray-300 mt-1">Ingreso pasivo mensual</p>
        </div>

      </div>

      {/* TABLA CRM: EMPRESAS, PLANES Y COMISIÓN CALCULADA */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Empresas & Negocios Referidos</h2>
            <p className="text-xs text-gray-500">
              Conoce qué plan tiene cada empresa, su estado de pago y el valor exacto de comisión que te corresponde.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar empresa o dueño..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Filtro */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo Activos (Pagando)</option>
              <option value="trial">Solo En Prueba (14 días)</option>
              <option value="expired">Solo Vencidos</option>
            </select>
          </div>
        </div>

        {/* TABLA DETALLADA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Empresa / Negocio</th>
                <th className="py-3.5 px-4">Segmento</th>
                <th className="py-3.5 px-4">Plan & Precio</th>
                <th className="py-3.5 px-4">Estado de Pago</th>
                <th className="py-3.5 px-4">Tu Comisión</th>
                <th className="py-3.5 px-4 text-right">Seguimiento WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredClinics.length > 0 ? (
                filteredClinics.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    
                    {/* Empresa & Dueño */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                      <div className="text-[11px] text-gray-500">
                        {c.ownerName} • {c.ownerEmail}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Registrado: {c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-CO') : 'Reciente'}
                      </div>
                    </td>

                    {/* Segmento */}
                    <td className="py-3.5 px-4 uppercase font-mono text-[10px] text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {c.businessType || 'General'}
                      </span>
                    </td>

                    {/* Plan & Precio */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{c.planType}</div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {formatCOP(c.planPrice || 0)} / mes
                      </div>
                    </td>

                    {/* Estado de Pago */}
                    <td className="py-3.5 px-4">
                      {c.subscriptionStatus === 'active' && !c.isExpired ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Activo (Pagado)
                        </span>
                      ) : c.subscriptionStatus === 'trial' && !c.isExpired ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          <Clock className="w-3 h-3" /> En Prueba ({c.daysRemaining}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Vencido (Por pagar)
                        </span>
                      )}
                    </td>

                    {/* Comisión del Vendedor */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-emerald-700 text-sm">
                        {formatCOP(c.calculatedCommission || 0)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {partner.commissionRate}% de {formatCOP(c.planPrice || 0)}
                      </div>
                    </td>

                    {/* Botón WhatsApp */}
                    <td className="py-3.5 px-4 text-right">
                      {c.phone ? (
                        <a 
                          href={getWhatsAppLink(c)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold px-3 py-1.5 rounded-xl text-[11px] transition-colors shadow-sm"
                          title="Contactar al dueño por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Escribir
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Sin teléfono</span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-medium">Aún no tienes empresas registradas con tu código.</p>
                    <p className="text-xs text-gray-400 mt-1">Comparte tu código <strong>{partner.partnerCode}</strong> para empezar a recibir comisiones.</p>
                    <button 
                      onClick={() => setIsRegisterOpen(true)}
                      className="mt-4 inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      + Registrar tu primer cliente manualmente
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
                <h3 className="text-lg font-black text-gray-900">Dar de Alta Nuevo Negocio</h3>
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

      {/* MODAL: CONFIGURAR DATOS BÁSICOS & CUENTA DE PAGO */}
      {isPayoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Tus Datos Básicos & Pago</h3>
                <p className="text-xs text-gray-500">Consignación mensual automática de tus comisiones.</p>
              </div>
              <button onClick={() => setIsPayoutOpen(false)} className="text-gray-400 hover:text-black text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={partner.name || ''}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">WhatsApp / Celular *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    defaultValue={partner.bankPayoutInfo?.phone || ''}
                    placeholder="3101234567"
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ciudad *</label>
                  <input 
                    type="text" 
                    name="city" 
                    defaultValue={partner.bankPayoutInfo?.city || 'Medellín'}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

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
                  defaultValue={partner.bankPayoutInfo?.accountType || 'Billetera'}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none"
                >
                  <option value="Billetera">Billetera Móvil (Nequi / Daviplata)</option>
                  <option value="Ahorros">Cuenta de Ahorros</option>
                  <option value="Corriente">Cuenta Corriente</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Número de Cuenta o Celular (Sólo Números) *</label>
                <input 
                  type="text" 
                  name="account_number" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e: any) => e.target.value = e.target.value.replace(/\D/g, '')}
                  defaultValue={partner.bankPayoutInfo?.accountNumber || ''}
                  placeholder="Ej: 3101234567 o 12345678901"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">Sin espacios, guiones ni letras</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre del Titular *</label>
                <input 
                  type="text" 
                  name="account_holder_name" 
                  defaultValue={partner.bankPayoutInfo?.accountHolderName || partner.name}
                  placeholder="Nombre de la cuenta"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Cédula o NIT del Titular (Sólo Números) *</label>
                <input 
                  type="text" 
                  name="document_id" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e: any) => e.target.value = e.target.value.replace(/\D/g, '')}
                  defaultValue={partner.bankPayoutInfo?.documentId || ''}
                  placeholder="Ej: 1020304050"
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">Sin puntos ni letras</p>
              </div>

              {/* AVISO DE SEGURIDAD Y BLINDAJE LEGAL */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  ⚠️ Atención: Verifica bien tu número de cuenta y cédula
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Por seguridad jurídica y blindaje contractual, los pagos de comisiones se giran de manera automatizada a estos datos exactos. Un error en la digitación causará el envío de tus fondos a otra persona sin posibilidad de reembolso por parte de AgendaClick.
                </p>
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
                  {isSubmitting ? 'Guardando...' : 'Guardar Datos'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
