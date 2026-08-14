'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  MessageSquare, 
  CreditCard, 
  Users, 
  TrendingUp, 
  HelpCircle, 
  Rocket, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Sun,
  Moon
} from 'lucide-react'
import { toast } from 'sonner'

interface Article {
  id: string
  moduleId: string
  moduleTitle: string
  title: string
  readTime: string
  lead: string
  content: React.ReactNode
}

export default function DocumentacionPage() {
  const [activeArticleId, setActiveArticleId] = useState('quickstart-intro')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('¡Plantilla copiada al portapapeles!')
    setTimeout(() => setCopiedId(null), 2500)
  }

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const completedCount = useMemo(() => {
    return Object.values(checklist).filter(Boolean).length
  }, [checklist])

  const progressPercentage = Math.round((completedCount / 6) * 100)

  // Artículos de la documentación
  const articles: Article[] = [
    {
      id: 'quickstart-intro',
      moduleId: 'm1',
      moduleTitle: 'Módulo 1: Inicio Rápido',
      title: 'Primeros Pasos en AgendaClick (En 5 Minutos)',
      readTime: '4 min de lectura',
      lead: 'Aprende a configurar tu perfil de negocio, horarios y obtener tu enlace de reservas 24/7 listo para compartir con tus clientes.',
      content: (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-4 items-start">
            <div className="bg-emerald-500 text-white p-2 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base">Objetivo de este módulo:</h4>
              <p className="text-emerald-800 text-sm mt-1">
                Tener tu enlace de agendamiento <code>agendaclick.com/tu-negocio</code> activo, sincronizado con tu Google Calendar y listo para recibir citas automáticas.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-6">Paso 1: Configurar Perfil y Datos de Contacto</h3>
          <p className="text-gray-600 leading-relaxed">
            Ingresa a tu panel de administración en <strong>Configuración &gt; Perfil</strong>. Aquí debes definir:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Nombre público:</strong> El nombre con el que tus clientes te conocen (ej: <em>Clínica Dental Sonrisas</em>).</li>
            <li><strong>Logotipo o foto de perfil:</strong> Se mostrará en la cabecera de tu página de reservas para dar máxima confianza.</li>
            <li><strong>Número de WhatsApp:</strong> Desde donde coordinarás con tus clientes y recibirás consultas.</li>
            <li><strong>Moneda y Zona Horaria:</strong> Fundamental para que tus citas se sincronicen exactamente a la hora local.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-6">Paso 2: Tu Enlace Personalizado de Reservas</h3>
          <p className="text-gray-600 leading-relaxed">
            Tu enlace es tu activo principal. Puedes ponerlo en tu biografía de Instagram, enviarlo por WhatsApp o colocarlo en tu botón de Google Maps:
          </p>

          <div className="bg-gray-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <code className="text-emerald-400 font-mono text-sm">https://agendaclick.com/tu-negocio</code>
            <button
              onClick={() => copyToClipboard('https://agendaclick.com/tu-negocio', 'demo-link')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              {copiedId === 'demo-link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'demo-link' ? '¡Copiado!' : 'Copiar Enlace'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 mt-8">
            <h4 className="font-bold text-gray-900 mb-3">Checklist de inicio rápido</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!checklist['q1']} 
                  onChange={() => toggleCheck('q1')}
                  className="w-5 h-5 rounded text-black focus:ring-black accent-black" 
                />
                <span className="text-sm font-medium text-gray-700">Completé el perfil con logo y teléfono</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!checklist['q2']} 
                  onChange={() => toggleCheck('q2')}
                  className="w-5 h-5 rounded text-black focus:ring-black accent-black" 
                />
                <span className="text-sm font-medium text-gray-700">Verifiqué mi zona horaria y moneda local</span>
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quickstart-services',
      moduleId: 'm1',
      moduleTitle: 'Módulo 1: Inicio Rápido',
      title: 'Creación de Servicios, Precios y Tiempos de Colchón',
      readTime: '3 min de lectura',
      lead: 'Aprende a estructurar tus servicios para aumentar el ticket promedio y proteger tus descansos entre citas.',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Estructuración de Servicios de Alto Rendimiento</h3>
          <p className="text-gray-600 leading-relaxed">
            Un buen catálogo de servicios debe ser claro, resolver dudas frecuentes y tener duraciones realistas.
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Campo</th>
                  <th className="p-3">Ejemplo</th>
                  <th className="p-3">Consejo de Negocio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Nombre del Servicio</td>
                  <td className="p-3">Limpieza Facial Profunda + Hidratación</td>
                  <td className="p-3">Sé descriptivo; destaca el beneficio principal.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Duración</td>
                  <td className="p-3">45 minutos</td>
                  <td className="p-3">Bloquea el tiempo exacto en tu calendario.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-gray-900">Precio / Anticipo</td>
                  <td className="p-3">$75.000 COP</td>
                  <td className="p-3">Puedes solicitar pago completo o anticipo para asegurar.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-6">¿Qué es el Tiempo de Colchón (Buffer Time)?</h3>
          <p className="text-gray-600 leading-relaxed">
            Es el margen de minutos automáticos (10 o 15 min) que AgendaClick coloca entre cita y cita para limpiar tu espacio de trabajo, descansar o evitar retrasos si una atención se prolonga.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-sm">
            <strong>💡 Recomendación:</strong> Añade al menos 10 minutos de colchón entre citas para garantizar puntualidad con el siguiente cliente.
          </div>
        </div>
      )
    },
    {
      id: 'whatsapp-setup',
      moduleId: 'm2',
      moduleTitle: 'Módulo 2: WhatsApp y Notificaciones',
      title: 'Automatización de Recordatorios por WhatsApp',
      readTime: '5 min de lectura',
      lead: 'Conecta tu WhatsApp para enviar confirmaciones instantáneas y reducir las inasistencias a menos del 3%.',
      content: (
        <div className="space-y-6">
          <div className="bg-[#0b2b1d] rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Simulador de Recordatorio de WhatsApp</span>
              </div>
              <span className="text-xs text-white/50">AgendaClick Bot</span>
            </div>

            <div className="bg-[#075e54] rounded-2xl p-4 max-w-md space-y-3 text-sm">
              <p className="font-semibold text-emerald-200">🔔 ¡Hola Carlos! 👋</p>
              <p className="text-white/90">
                Te recordamos tu cita para <strong>Corte &amp; Barba Premium</strong> programada para mañana <strong>Viernes a las 10:30 AM</strong> en <em>Barbería Master</em>.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <div className="bg-[#128c7e] text-center py-2 rounded-xl text-xs font-bold text-white shadow">
                  ✅ Confirmar Asistencia
                </div>
                <div className="bg-black/20 text-center py-2 rounded-xl text-xs font-medium text-red-200">
                  🔄 Reprogramar Cita
                </div>
              </div>
              <span className="text-[10px] text-white/50 block text-right">10:00 AM • Entregado ✓✓</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-6">Flujo Recomendado de Recordatorios:</h3>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            <li><strong>Al momento de agendar:</strong> Confirmación con link de Google Maps y resumen del servicio.</li>
            <li><strong>24 horas antes:</strong> Recordatorio con botón de confirmación de asistencia.</li>
            <li><strong>2 horas antes:</strong> Alerta de último momento para que el cliente esté en camino.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'whatsapp-templates',
      moduleId: 'm2',
      moduleTitle: 'Módulo 2: WhatsApp y Notificaciones',
      title: 'Plantillas de Mensajes Listas para Copiar y Pegar',
      readTime: '3 min de lectura',
      lead: 'Copia estas plantillas diseñadas con gatillos de persuasión para garantizar la asistencia de tus prospectos.',
      content: (
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-sm">1. Plantilla de Confirmación Inmediata</span>
              <button
                onClick={() => copyToClipboard(`¡Hola {{cliente_nombre}}! 🎉 Tu cita para {{servicio_nombre}} quedó confirmada.\n📅 Fecha: {{cita_fecha}}\n⏰ Hora: {{cita_hora}}\n📍 Ubicación: {{negocio_direccion}}\nPara reagendar o ver detalles: {{link_reserva}}`, 't1')}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                {copiedId === 't1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 't1' ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-xl text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed border border-gray-100">
{`¡Hola {{cliente_nombre}}! 🎉 Tu cita para {{servicio_nombre}} quedó confirmada.
📅 Fecha: {{cita_fecha}}
⏰ Hora: {{cita_hora}}
📍 Ubicación: {{negocio_direccion}}
Para reagendar o ver detalles: {{link_reserva}}`}
            </pre>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-sm">2. Plantilla de Recordatorio 24h con Confirmación</span>
              <button
                onClick={() => copyToClipboard(`Hola {{cliente_nombre}} 👋 Te recordamos tu cita de mañana a las {{cita_hora}} en {{negocio_nombre}}.\nPor favor responde con un *SÍ* para confirmar o toca aquí si necesitas reprogramar: {{link_reprogramar}} ¡Te esperamos!`, 't2')}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                {copiedId === 't2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 't2' ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-xl text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed border border-gray-100">
{`Hola {{cliente_nombre}} 👋 Te recordamos tu cita de mañana a las {{cita_hora}} en {{negocio_nombre}}.
Por favor responde con un *SÍ* para confirmar o toca aquí si necesitas reprogramar: {{link_reprogramar}} ¡Te esperamos!`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'payments-deposits',
      moduleId: 'm3',
      moduleTitle: 'Módulo 3: Pagos y Anticipos',
      title: 'Cobro de Anticipos y Pasarelas de Pago',
      readTime: '4 min de lectura',
      lead: 'Aprende a integrar pasarelas de pago (Wompi, Mercado Pago, Stripe) y cobrar señas para asegurar tus citas.',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-5 bg-white">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                W
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Wompi / PSE / Nequi / Bancolombia</h4>
              <p className="text-xs text-gray-600">Ideal para negocios en Colombia que reciben pagos directos desde cuentas locales y tarjetas.</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5 bg-white">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                MP
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Mercado Pago / Stripe</h4>
              <p className="text-xs text-gray-600">Para cobros internacionales y tarjetas de crédito/débito con acreditación instantánea.</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-6">Estrategia de Anticipos Recomendada:</h3>
          <p className="text-gray-600 leading-relaxed">
            Solicitar entre un <strong>20% y un 50%</strong> del costo del servicio al momento de agendar incrementa la asistencia efectiva a más del <strong>98%</strong>, asegurando el tiempo de tus profesionales.
          </p>
        </div>
      )
    },
    {
      id: 'growth-instagram',
      moduleId: 'm5',
      moduleTitle: 'Módulo 5: Estrategias de Crecimiento',
      title: 'Cómo Colocar tu Link en Instagram, TikTok y Google Maps',
      readTime: '4 min de lectura',
      lead: 'Transforma a los seguidores de tus redes sociales en citas pagadas en automático.',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">1. Instagram Bio y TikTok</h3>
          <p className="text-gray-600 leading-relaxed">
            Coloca tu link en el botón oficial de enlaces de tu perfil. Añade un llamado a la acción en tu descripción:
          </p>
          <div className="bg-gray-100 p-4 rounded-xl text-sm font-medium text-gray-800">
            👉 <em>&quot;Reserva tu cita 24/7 en 1 minuto aquí: agendaclick.com/tu-negocio&quot;</em>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-6">2. Ficha de Google Mi Negocio (Google Maps)</h3>
          <p className="text-gray-600 leading-relaxed">
            En tu perfil de empresa en Google Maps, añade tu URL en la casilla <strong>&quot;Enlace para citas&quot;</strong>. Cuando los usuarios busquen servicios cerca de su ubicación, podrán agendar inmediatamente sin salir del mapa.
          </p>
        </div>
      )
    },
    {
      id: 'faq-section',
      moduleId: 'm6',
      moduleTitle: 'Módulo 6: Preguntas Frecuentes',
      title: 'Preguntas Frecuentes (FAQ) de AgendaClick',
      readTime: '3 min de lectura',
      lead: 'Respuestas directas a las inquietudes más comunes sobre el uso y configuración de la plataforma.',
      content: (
        <div className="space-y-4">
          <details className="border border-gray-200 rounded-2xl p-5 bg-white open:bg-gray-50 transition-colors">
            <summary className="font-bold text-gray-900 cursor-pointer text-base">¿Mis clientes necesitan descargar una app?</summary>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              <strong>No.</strong> Tus clientes entran desde cualquier navegador móvil o de escritorio, seleccionan el servicio y agendan en menos de 60 segundos sin contraseñas engorrosas.
            </p>
          </details>

          <details className="border border-gray-200 rounded-2xl p-5 bg-white open:bg-gray-50 transition-colors">
            <summary className="font-bold text-gray-900 cursor-pointer text-base">¿Se sincroniza con mi Google Calendar?</summary>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              <strong>Sí.</strong> Cuenta con sincronización bidireccional. Si agregas un evento personal en Google Calendar, ese horario se bloqueará automáticamente en AgendaClick.
            </p>
          </details>

          <details className="border border-gray-200 rounded-2xl p-5 bg-white open:bg-gray-50 transition-colors">
            <summary className="font-bold text-gray-900 cursor-pointer text-base">¿Puedo añadir a múltiples empleados?</summary>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              <strong>Sí.</strong> Puedes configurar a cada miembro de tu equipo con sus propios horarios de atención, servicios asignados y calendario individual.
            </p>
          </details>
        </div>
      )
    }
  ]

  // Búsqueda en tiempo real
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles
    const q = searchQuery.toLowerCase()
    return articles.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.lead.toLowerCase().includes(q) ||
      a.moduleTitle.toLowerCase().includes(q)
    )
  }, [searchQuery, articles])

  const currentArticle = useMemo(() => {
    return articles.find(a => a.id === activeArticleId) || articles[0]
  }, [activeArticleId, articles])

  const currentIndex = articles.findIndex(a => a.id === currentArticle.id)
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/full-logo.png" alt="AgendaClick Logo" className="h-10 w-auto object-contain" />
            </Link>
            <span className="hidden sm:inline-block bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Academia &amp; Docs
            </span>
          </div>

          {/* Buscador */}
          <div className="relative flex-1 max-w-md mx-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar en la documentación (WhatsApp, Pagos, Citas)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent focus:border-black focus:bg-white rounded-full text-sm outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="hidden md:inline-flex text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              Volver al Inicio
            </Link>
            <Link 
              href="/login" 
              className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-all shadow"
            >
              Ir a la App
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL CON SIDEBAR */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR DE NAVEGACIÓN */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          {/* Card de Progreso */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-500 uppercase tracking-wider">Tu Avance</span>
              <span className="text-black">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-emerald-500 h-full rounded-full"
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Guías interactivas para certificar tu negocio en automatización.
            </p>
          </div>

          {/* Lista de Módulos */}
          <nav className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
              Índice de Contenido
            </div>
            {filteredArticles.map((article) => {
              const isActive = article.id === currentArticle.id
              return (
                <button
                  key={article.id}
                  onClick={() => {
                    setActiveArticleId(article.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive 
                      ? 'bg-black text-white shadow' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate pr-2">{article.title}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* ARTÍCULO ACTIVO */}
        <main className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            <motion.article 
              key={currentArticle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-full">
                  {currentArticle.moduleTitle}
                </span>
                <span className="text-gray-400 font-medium">
                  {currentArticle.readTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {currentArticle.title}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed border-b border-gray-100 pb-6">
                {currentArticle.lead}
              </p>

              {/* Contenido Dinámico */}
              <div className="pt-2">
                {currentArticle.content}
              </div>

              {/* Feedback y Navegación Anterior/Siguiente */}
              <div className="border-t border-gray-100 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>¿Fue útil esta guía?</span>
                  <button 
                    onClick={() => toast.success('¡Gracias por tu valoración!')}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    title="Útil"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => toast.info('Agradecemos tu feedback para mejorar.')}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    title="No útil"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {prevArticle && (
                    <button
                      onClick={() => {
                        setActiveArticleId(prevArticle.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Anterior
                    </button>
                  )}
                  {nextArticle && (
                    <button
                      onClick={() => {
                        setActiveArticleId(nextArticle.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow"
                    >
                      Siguiente <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </motion.article>
          </AnimatePresence>
        </main>

      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} AgendaClick. Centro Oficial de Documentación y Entrenamiento.</p>
          <div className="flex gap-6 font-medium">
            <Link href="/" className="hover:text-black">Inicio</Link>
            <Link href="/terminos" className="hover:text-black">Términos</Link>
            <Link href="/privacidad" className="hover:text-black">Privacidad</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
