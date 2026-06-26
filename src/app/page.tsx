import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Scissors, Stethoscope, Heart, CalendarCheck, MessageCircle, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Si ya hay un logo subido en public/logo.png, lo mostramos. Si no, texto. */}
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AgendaClick</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-gray-600 transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/login" className="text-sm font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-all shadow-md">
              Prueba Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border text-sm font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            El software #1 en Colombia
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1]">
            El software de agendamiento que hace <span className="text-gray-400">crecer tu estética.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
            Gestiona citas, envía notificaciones y aumenta tus ventas con un sistema Ultra-Minimalista diseñado exclusivamente para clínicas, spas y salones. Cero fricciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/login" className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Crear mi cuenta <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start px-4">
              Configura tu negocio en 3 minutos.
            </p>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          {/* MOCKUP IMAGE (Generada por IA) */}
          <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100 bg-gray-50 transform rotate-2 hover:rotate-0 transition-transform duration-500">
             <Image 
                src="/hero-mockup.png" 
                alt="AgendaClick App Interface" 
                fill 
                className="object-cover"
                priority
             />
          </div>
        </div>
      </section>

      {/* TARGET AUDIENCE SECTION */}
      <section className="py-24 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Diseñado para profesionales como tú</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Nuestra plataforma se adapta perfectamente a las necesidades de negocios basados en servicios presenciales.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Peluquerías y Barberías</h3>
              <p className="text-gray-500 leading-relaxed">Agiliza la reserva de cortes y tratamientos. Mantén tu silla siempre ocupada sin contestar llamadas todo el día.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Clínicas y Consultorios</h3>
              <p className="text-gray-500 leading-relaxed">Imagen profesional y seria. Captura datos exactos del paciente antes de que lleguen a su consulta.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Spas y Bienestar</h3>
              <p className="text-gray-500 leading-relaxed">Ofrece una experiencia de reserva relajante y sin fricciones desde el primer clic del cliente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-6">Por qué somos diferentes</h2>
            <div className="space-y-8 mt-12">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Cero Fricción para tus clientes</h4>
                  <p className="text-gray-500 leading-relaxed">A nadie le gusta crear cuentas y contraseñas solo para pedir una cita. Nuestro flujo ultra-minimalista convierte visitantes en clientes reales en menos de 60 segundos.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Notificaciones Inteligentes</h4>
                  <p className="text-gray-500 leading-relaxed">Recibe correos silenciosos al instante y usa nuestro generador de enlaces de WhatsApp para confirmar citas sin pagar costosas APIs externas.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Posicionamiento SEO Automático</h4>
                  <p className="text-gray-500 leading-relaxed">Al crear tu cuenta, te generamos una página optimizada (JSON-LD) para que Google y las Inteligencias Artificiales te recomienden automáticamente.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-3xl p-8 lg:p-12 border">
            {/* MOCKUP COMPACTO DE LA VISTA DEL CLIENTE */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-12 h-12 bg-black rounded-full"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-12 w-full border rounded-lg flex items-center px-4 justify-between">
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-12 bg-gray-100 rounded"></div>
                </div>
                <div className="h-12 w-full border rounded-lg flex items-center px-4 justify-between">
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded"></div>
                </div>
                <div className="h-12 w-full bg-black rounded-lg mt-6 flex items-center justify-center">
                  <div className="h-3 w-24 bg-white/50 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Simple y Transparente</h2>
          <p className="text-gray-400 mb-16">Sin comisiones ocultas por cita, sin sorpresas. Un solo plan con todo incluido.</p>
          
          <div className="bg-white text-black rounded-3xl p-8 sm:p-12 max-w-lg mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-2">Plan Profesional</h3>
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-5xl font-extrabold tracking-tighter">$50.000</span>
              <span className="text-gray-500 font-medium">COP / mes</span>
            </div>
            
            <ul className="space-y-4 text-left mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Agendamiento ilimitado</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Enlace público personalizado</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Integración con Wompi para tus pagos</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Notificaciones por correo (Resend)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Posicionamiento SEO Automático</span>
              </li>
            </ul>

            <Link href="/login" className="block w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg">
              Empezar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 py-12 border-t">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            <span className="font-bold tracking-tight">AgendaClick</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AgendaClick. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/terminos" className="text-gray-500 hover:text-black transition-colors">Términos y Condiciones</Link>
            <Link href="/privacidad" className="text-gray-500 hover:text-black transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
