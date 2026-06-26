'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Scissors, Sparkles, Heart, CalendarCheck, MessageCircle, Bot } from 'lucide-react'

// Variantes de animación para hacer la página fluida y elegante
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white overflow-hidden">
      
      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">AgendaClick</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/login" className="text-sm font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-all shadow-md">
              Prueba Gratis
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border text-sm font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            La herramienta favorita de las emprendedoras
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-gray-900">
            Haz que tu estética <span className="text-gray-400">brille con luz propia.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-lg leading-relaxed">
            Libérate de contestar mensajes todo el día. Permite que tus clientas reserven su cita en segundos con una plataforma elegante, minimalista y diseñada para realzar la belleza de tu negocio.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/login" className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5">
              Transformar mi negocio <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-100 bg-gray-50 transform hover:scale-[1.02] transition-transform duration-500">
             <Image 
                src="/hero-mockup.png" 
                alt="AgendaClick App Interface" 
                fill 
                className="object-cover"
                priority
             />
          </div>
        </motion.div>
      </section>

      {/* TARGET AUDIENCE SECTION */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-gray-900">Creado para creadoras de belleza y bienestar</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Entendemos que la estética lo es todo. Tu sistema de reservas debe ser tan hermoso como los resultados que ofreces a tus clientas.</p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Scissors, title: "Salones y Estudios", desc: "Peluquerías, Lashistas y estudios de uñas. Mantén tu agenda llena sin estrés." },
              { icon: Sparkles, title: "Estéticas y Cosmiatría", desc: "Clínicas de cuidado de la piel y belleza corporal con una imagen profesional y de lujo." },
              { icon: Heart, title: "Spas y Bienestar", desc: "Centros de masajes, yoga y terapias. Inicia la experiencia de relajación desde que agendan." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CORE FEATURES (Focus on AI and Ease) */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold tracking-tight mb-6 text-gray-900">Más que una agenda, tu mejor aliada</motion.h2>
            <div className="space-y-10 mt-12">
              
              <motion.div variants={fadeInUp} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Una experiencia de reserva encantadora</h4>
                  <p className="text-gray-500 leading-relaxed">Tus clientas odian las contraseñas. Diseñamos un proceso tan fluido y hermoso que reservar una cita tomará menos de 1 minuto, enamorándolas desde el primer clic.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Conexión directa a tu WhatsApp</h4>
                  <p className="text-gray-500 leading-relaxed">Al finalizar la reserva, el sistema genera mágicamente un mensaje pre-armado para que la clienta te contacte por WhatsApp de inmediato. Sin costos extra por mensajes.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Recomendada por Inteligencia Artificial</h4>
                  <p className="text-gray-500 leading-relaxed">No solo apareces en Google. Programamos un código invisible en tu página para que cuando las mujeres le pregunten a ChatGPT, Siri o Gemini <em>"¿Dónde me hago las uñas cerca?"</em>, las Inteligencias Artificiales recomienden tu marca de forma directa.</p>
                </div>
              </motion.div>

            </div>
          </motion.div>

          {/* Animación lateral */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gray-100 rounded-[3rem] p-8 lg:p-12 border relative overflow-hidden"
          >
            <div className="relative bg-white rounded-2xl shadow-sm border p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-12 h-12 bg-black rounded-full"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-3 w-20 bg-gray-100 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-14 w-full bg-white border rounded-xl flex items-center px-4 justify-between">
                  <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-3 w-12 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-14 w-full bg-white border rounded-xl flex items-center px-4 justify-between">
                  <div className="h-3 w-32 bg-gray-200 rounded-full"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-14 w-full bg-black rounded-xl mt-6 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="h-3 w-24 bg-white/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24 bg-black text-white">
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold tracking-tight mb-4">La belleza de lo simple</h2>
            <p className="text-gray-400 mb-16 text-lg">Un único plan que empodera tu negocio. Sin comisiones por cita ni letras pequeñas.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white text-black rounded-3xl p-8 sm:p-12 max-w-lg mx-auto shadow-2xl relative"
          >
            <h3 className="text-2xl font-bold mb-4 mt-2">Plan Profesional</h3>
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-5xl font-extrabold tracking-tighter">$50.000</span>
              <span className="text-gray-500 font-medium">COP / mes</span>
            </div>
            
            <ul className="space-y-4 text-left mb-10">
              {[
                "Agenda ilimitada, todas tus citas incluidas",
                "Link de reservas con tu logo y estilo",
                "Integración oficial con Wompi para tus pagos",
                "Notificaciones instantáneas al correo",
                "Recomendación en Google y Chatbots de IA"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/login" className="block w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg">
              Comenzar a transformar tu estética
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 py-12 border-t">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-black" />
            <span className="font-bold tracking-tight text-gray-900">AgendaClick</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AgendaClick. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/terminos" className="text-gray-500 hover:text-black transition-colors">Términos Legales</Link>
            <Link href="/privacidad" className="text-gray-500 hover:text-black transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
