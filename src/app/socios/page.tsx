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
  PlayCircle
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
  const averagePlanPrice = 115000 // Plan Negocio promedio ($115.000 COP)
  const commissionRate = 0.25 // 25% comisión
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
            Gana hasta el <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">25% Mensual Recurrente</span> por cada negocio que recomiendes
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
              <p className="text-emerald-400 font-extrabold text-xl">25% Fijo</p>
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
                Recibe el 25% de cada pago mensual procesado por tus clientes directamente en tu cuenta bancaria o Nequi.
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
