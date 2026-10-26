'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Briefcase, 
  Smartphone, 
  HelpCircle, 
  Gift, 
  Zap,
  PlayCircle,
  Download
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

export default function SociosLandingPage() {
  // Calculadora de comisiones
  const [clientCount, setClientCount] = useState<number>(20)
  const averagePlanPrice = 349000 // Plan Negocio promedio ($349.000 COP)
  const commissionRate = 0.70 // 70% comisión recurrente
  const monthlyEarnings = Math.round(clientCount * averagePlanPrice * commissionRate)
  const yearlyEarnings = monthlyEarnings * 12

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/full-logo.png" alt="AgendaClick Logo" className="h-12 object-contain brightness-200 invert" />
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Socios & Distribuidores
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Volver al Inicio
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
            >
              Acceso a Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
          
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-1.5 rounded-full font-semibold">
            <Sparkles className="w-4 h-4" />
            Programa Oficial de Distribuidores Comerciales en Colombia
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Gana hasta el <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">70% Mensual Recurrente</span> por cada negocio que recomiendes
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Peluquerías, canchas sintéticas, consultorios médicos, veterinarias y talleres mecánicos necesitan automatizar sus citas. Conviértete en asesor comercial de <strong>AgendaClick</strong> y crea una fuente de ingresos pasivos mes a mes.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-xl text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95"
            >
              Comenzar como Distribuidor Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#calculadora" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/10 transition-colors"
            >
              Calcular mis Ganancias
            </a>
          </motion.div>

          {/* BADGES DE CONFIANZA */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/10 text-left">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-emerald-400 font-extrabold text-xl">Hasta el 70%</p>
              <p className="text-xs text-gray-400">Comisión recurrente mensual</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-emerald-400 font-extrabold text-xl">1-Clic</p>
              <p className="text-xs text-gray-400">Dashboard y CRM en vivo</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-emerald-400 font-extrabold text-xl">Pagos Directos</p>
              <p className="text-xs text-gray-400">Vía Nequi, Daviplata o Banco</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-emerald-400 font-extrabold text-xl">0 Inversión</p>
              <p className="text-xs text-gray-400">Sin costos de afiliación</p>
            </div>
          </motion.div>

        </motion.div>
      </header>

      {/* CALCULADORA DE COMISIONES */}
      <section id="calculadora" className="py-20 px-6 bg-slate-900/60 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
            <DollarSign className="w-4 h-4" />
            Simulador de Ingresos Pasivos
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">¿Cuánto dinero puedes ganar cada mes?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-10">
            Mueve la barra para ver cuánto dinero recibirías mensualmente de forma pasiva a medida que tus clientes renuevan su suscripción.
          </p>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] text-left">
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-300">Número de Negocios Referidos:</label>
                <span className="text-2xl font-black text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-xl border border-emerald-500/20">
                  {clientCount} negocios
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={clientCount} 
                onChange={(e) => setClientCount(Number(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-mono">
                <span>1 negocio</span>
                <span>25 negocios</span>
                <span>50 negocios</span>
                <span>100 negocios</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Tus Ingresos Mensuales Pasivos</p>
                <p className="text-4xl sm:text-5xl font-black text-white mt-2 mb-1">{formatCOP(monthlyEarnings)}</p>
                <p className="text-xs text-gray-400">Consignados mes a mes automáticamente</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Ingreso Proyectado al Año</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300 mt-2 mb-1">{formatCOP(yearlyEarnings)}</p>
                <p className="text-xs text-gray-400">Basado en renovación anual</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:scale-105"
              >
                Quiero Crear mi Cuenta de Distribuidor →
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 4 MODELOS COMERCIALES Y MATERIAL PUBLICITARIO */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Modelos de Negocio Transparentes en Colombia
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4">4 Formas de Ganar Dinero con AgendaClick</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base">
            Elige el discurso y modelo que mejor se adapte a tu estilo de venta. Cifras reales en Pesos Colombianos, sin humo y sin letras pequeñas.
          </p>
        </div>

        {/* GRID DE LAS 4 OPCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* OPCIÓN 1 */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-xl hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden border-b border-white/10">
              <img 
                src="/promos/agendaclick_opcion_1_dinero_tangible.png" 
                alt="Opción 1: Dinero Tangible en Pesos" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  🥇 Opción 1 • La Más Efectiva
                </span>
                <h3 className="text-2xl font-black mt-3 mb-2">Dinero Tangible en Pesos COP</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  Eliminamos los porcentajes abstractos que generan dudas y mostramos cifras exactas en moneda local para metas alcanzables:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Gana hasta <strong>$244.000 COP mensuales</strong> por cada negocio.</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Con 5 negocios te aseguras <strong>+$1.200.000 COP al mes</strong> en automático.</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Con 10 negocios superas los <strong>$2.400.000 COP mensuales</strong> sin jefes.</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400">Pagos a Nequi, Daviplata o Banco</span>
                <a href="/promos/agendaclick_opcion_1_dinero_tangible.png" download target="_blank" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar Arte HD
                </a>
              </div>
            </div>
          </div>

          {/* OPCIÓN 2 */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/60 transition-all flex flex-col justify-between">
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden border-b border-white/10">
              <img 
                src="/promos/agendaclick_opcion_2_modelo_hibrido.png" 
                alt="Opción 2: El Modelo Híbrido" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                  🥈 Opción 2 • Liquidez Rápida
                </span>
                <h3 className="text-2xl font-black mt-3 mb-2">100% Primer Mes + Mensualidad Recurrente</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  El vendedor comercial en Colombia necesita liquidez inmediata. Con este modelo recibes dinero en mano el mismo día:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> <strong>El 100% del primer pago</strong> va directo a tu bolsillo (entre $189.000 y $349.000 COP).</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Renta pasiva del <strong>30% mensual de por vida</strong> desde el segundo mes.</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Cero frustración de esperar un mes para cobrar comisiones.</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400">Dinero hoy + Ingreso pasivo mañana</span>
                <a href="/promos/agendaclick_opcion_2_modelo_hibrido.png" download target="_blank" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar Arte HD
                </a>
              </div>
            </div>
          </div>

          {/* OPCIÓN 3 */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-xl hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden border-b border-white/10">
              <img 
                src="/promos/agendaclick_opcion_3_modelo_escalonado.png" 
                alt="Opción 3: Modelo Escalonado por Metas" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  🥉 Opción 3 • Carrera Comercial
                </span>
                <h3 className="text-2xl font-black mt-3 mb-2">Escalafón por Metas y Rangos</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  Genera estatus corporativo y elimina sospechas de estafa o multinivel, premiando la constancia comercial:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 🥉 <strong>Asesor Junior (1 a 3 clientes):</strong> 30% mensual recurrente.</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 🥈 <strong>Distribuidor Plata (4 a 8 clientes):</strong> 45% mensual recurrente.</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 🥇 <strong>Embajador Élite (9+ clientes):</strong> 60% mensual recurrente + Bono de cumplimiento.</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400">Estatus y crecimiento real</span>
                <a href="/promos/agendaclick_opcion_3_modelo_escalonado.png" download target="_blank" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar Arte HD
                </a>
              </div>
            </div>
          </div>

          {/* OPCIÓN 4 */}
          <div className="bg-slate-900/80 border border-blue-500/30 rounded-3xl overflow-hidden shadow-xl hover:border-blue-500/60 transition-all flex flex-col justify-between">
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden border-b border-white/10">
              <img 
                src="/promos/agendaclick_opcion_4_agencia_digital.png" 
                alt="Opción 4: Monta tu Agencia de Digitalización" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  🏅 Opción 4 • Estatus de Consultor
                </span>
                <h3 className="text-2xl font-black mt-3 mb-2">Monta tu Agencia de Citas</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  No eres un vendedor comisionista; eres el asesor tecnológico de tu ciudad. Cobras dos veces por cada cliente:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> <strong>Cobro de Instalación/Setup:</strong> Entre $100.000 y $200.000 COP (100% tuyo).</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> <strong>Ingreso Recurrente:</strong> Mensualidad del software mes a mes.</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Nosotros ponemos la tecnología, tú te quedas con el margen.</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400">Sin saber programar</span>
                <a href="/promos/agendaclick_opcion_4_agencia_digital.png" download target="_blank" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar Arte HD
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* MATERIAL PUBLICITARIO DESCARGABLE PARA REDES */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center">
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
            Material de Marketing Oficial
          </span>
          <h3 className="text-2xl sm:text-3xl font-black mt-4 mb-3">Piezas Listas para Tus Estados de WhatsApp e Instagram</h3>
          <p className="text-gray-300 max-w-xl mx-auto text-sm mb-8">
            Descarga los artes publicitarios oficiales de AgendaClick para publicar en tus redes y empezar a captar salones, barberías y negocios hoy mismo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <img src="/promos/agendaclick_afiliados_colombia_feed_1_png_1793021505003.jpg" className="w-20 h-20 rounded-xl object-cover border border-white/10" alt="Feed 1:1" />
              <div>
                <h4 className="font-bold text-white text-base">Arte Feed Cuadrado (1:1)</h4>
                <p className="text-xs text-gray-400 mb-2">Para Instagram, Facebook y Grupos</p>
                <a href="/promos/agendaclick_afiliados_colombia_feed_1_png_1793021505003.jpg" download target="_blank" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                  <Download className="w-3 h-3" /> Descargar Imagen
                </a>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <img src="/promos/agendaclick_afiliados_colombia_story_2_png_1793021525748.jpg" className="w-20 h-20 rounded-xl object-cover border border-white/10" alt="Stories 9:16" />
              <div>
                <h4 className="font-bold text-white text-base">Arte Vertical Stories (9:16)</h4>
                <p className="text-xs text-gray-400 mb-2">Para Estados de WhatsApp y Reels</p>
                <a href="/promos/agendaclick_afiliados_colombia_story_2_png_1793021525748.jpg" download target="_blank" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                  <Download className="w-3 h-3" /> Descargar Imagen
                </a>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* HERRAMIENTAS QUE INCLUYE EL DASHBOARD DEL VENDEDOR */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Todo lo que necesitas para cerrar ventas en minutos</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Te entregamos un portal profesional con herramientas inteligentes para que no tengas que preocuparte por cobros ni soporte técnico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">CRM y Alertas de Vencimiento</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Monitorea a qué clientes les quedan días de prueba gratuita. El sistema te avisa cuándo llamarlos para asegurar la compra antes de que venza.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Botón WhatsApp de 1-Clic</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Escríbele a tus clientes con plantillas comerciales pre-redactadas directamente a su WhatsApp para resolver dudas o recordarles su pago.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Demos Interactivas en Vivo</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Acceso a portales demo configurados (salones de estilistas, talleres de autos y canchas sintéticas) para mostrar el producto en vivo a tus prospectos.
            </p>
          </div>

        </div>
      </section>

      {/* CÓMO FUNCIONA EN 3 PASOS */}
      <section className="py-20 px-6 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Empieza en 3 simples pasos</h2>
            <p className="text-gray-400">Sin trámites complejos ni papeleo. Activas tu portal en 60 segundos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center mb-4 text-sm">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">Crea tu Cuenta</h3>
              <p className="text-sm text-gray-400">
                Inicia sesión en AgendaClick y accede a la sección <strong>"Programa de Socios"</strong> en tu menú lateral.
              </p>
            </div>

            <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center mb-4 text-sm">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">Registra o Comparte</h3>
              <p className="text-sm text-gray-400">
                Da de alta a tus clientes con su prueba gratis de 14 días o envíales tu enlace de recomendación único.
              </p>
            </div>

            <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center mb-4 text-sm">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">Cobra tus Comisiones</h3>
              <p className="text-sm text-gray-400">
                Recibe hasta el 70% de cada pago mensual procesado por tus clientes directamente en tu cuenta bancaria o Nequi.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-10 py-4 rounded-xl text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105"
            >
              Registrarme como Distribuidor Ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-xs text-gray-500">
        <p>© 2026 AgendaClick. Todos los derechos reservados. Plataforma SaaS de Agendamiento en Colombia.</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
        </div>
      </footer>

    </div>
  )
}
