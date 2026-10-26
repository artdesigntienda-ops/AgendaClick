'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  Smartphone, 
  Copy, 
  Check, 
  CreditCard,
  Building,
  Tag,
  Lock,
  Mail,
  User,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'
import { registerPartnerAccount, validatePartnerCode } from '@/app/dashboard/partners/actions'
import { createClient } from '@/utils/supabase/client'

export default function VendedoresClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Medellín')
  const [customCode, setCustomCode] = useState('')
  const [suggestedCode, setSuggestedCode] = useState('')
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null)

  // Datos bancarios
  const [bankName, setBankName] = useState('Nequi')
  const [accountType, setAccountType] = useState('Billetera')
  const [accountNumber, setAccountNumber] = useState('')
  const [documentId, setDocumentId] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredSuccess, setRegisteredSuccess] = useState<{ code: string; email: string } | null>(null)

  // Autogenerar código amigable en vivo al escribir el nombre
  useEffect(() => {
    if (!name.trim()) {
      setSuggestedCode('')
      return
    }
    const clean = name
      .trim()
      .split(' ')[0]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'ASESOR'

    // Semilla aleatoria fija basada en longitud para que no parpadee a cada letra
    const suffix = (name.length * 7 % 89) + 10
    const code = `${clean}${suffix}`
    setSuggestedCode(code)
    if (!customCode) {
      checkCodeAvailability(code)
    }
  }, [name])

  const checkCodeAvailability = async (codeToCheck: string) => {
    if (!codeToCheck.trim() || codeToCheck.length < 3) {
      setCodeAvailable(null)
      return
    }
    setIsCheckingCode(true)
    try {
      const res = await validatePartnerCode(codeToCheck)
      // Si valid es true significa que el código YA existe, por lo tanto NO está disponible
      setCodeAvailable(!res.valid)
    } catch {
      setCodeAvailable(null)
    } finally {
      setIsCheckingCode(false)
    }
  }

  const handleCustomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCustomCode(val)
    checkCodeAvailability(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Completa los campos obligatorios')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener mínimo 6 caracteres')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.set('name', name.trim())
    formData.set('email', email.trim().toLowerCase())
    formData.set('password', password)
    formData.set('phone', phone.trim())
    formData.set('city', city.trim())
    formData.set('custom_code', customCode || suggestedCode)
    formData.set('bank_name', bankName)
    formData.set('account_type', accountType)
    formData.set('account_number', accountNumber.trim() || phone.trim())
    formData.set('account_holder_name', name.trim())
    formData.set('document_id', documentId.trim())

    try {
      const res = await registerPartnerAccount(formData)
      if (res.success && res.partnerCode) {
        setRegisteredSuccess({ code: res.partnerCode, email: res.email || email })
        toast.success(res.message)
        
        // Iniciar sesión con el cliente Supabase
        const supabase = createClient()
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        })

        if (!signInErr) {
          setTimeout(() => {
            router.push('/dashboard/partners')
          }, 1500)
        }
      } else {
        toast.error(res.error || 'No se pudo crear la cuenta de vendedor')
      }
    } catch (err) {
      toast.error('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/full-logo.png" alt="AgendaClick Logo" className="h-10 object-contain brightness-200 invert" />
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Vendedores
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/socios" className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:block">
              Ver Ganancias y Comisiones
            </Link>
            <Link 
              href="/login?next=/dashboard/partners" 
              className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/10 transition-colors"
            >
              Ya soy Vendedor → Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER HERO */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Programa Oficial de Asesores Comerciales & Afiliados
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Crea tu cuenta de vendedor y obtén tu <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">código comercial único</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Recomienda AgendaClick a peluquerías, salones, canchas y talleres. Cuando se registren ingresan tu código y ganas comisiones recurrentes mensuales directamente en tu cuenta.
        </p>
      </div>

      {/* FORMULARIO DE REGISTRO */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        
        {registeredSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-[0_0_60px_rgba(16,185,129,0.2)]"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">¡Cuenta de Vendedor Creada!</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Tu Código de Asesor está Activo</h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                Las empresas que registres o que ingresen este código quedarán asignadas a tu cuenta de por vida.
              </p>
            </div>

            {/* Código asignado */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 max-w-sm mx-auto shadow-inner">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Tu Código para compartir</p>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-widest">
                {registeredSuccess.code}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/dashboard/partners"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3.5 rounded-xl transition-all shadow-lg hover:scale-105"
              >
                Entrar a mi Portal Comercial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <User className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">1. Tus Datos Básicos</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Nombre Completo *</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Carlos Andrés Pérez"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">WhatsApp / Celular *</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej: 310 123 4567"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Correo Electrónico *</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Contraseña de Acceso *</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Ciudad o Municipio *</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Medellín, Pasto, Bogotá, Cali..."
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* SECCIÓN 2: TU CÓDIGO DE VENDEDOR */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">2. Tu Código de Vendedor</h3>
                </div>

                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Código Asignado</p>
                      <p className="text-xs text-gray-400">
                        Este es el código fácil de escribir que le darás a las empresas o peluquerías.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-xl inline-block">
                        {customCode || suggestedCode || 'ASESOR24'}
                      </span>
                    </div>
                  </div>

                  {/* Personalizar código */}
                  <div className="pt-2 border-t border-white/5">
                    <label className="block text-xs text-gray-400 mb-1">
                      ¿Quieres personalizarlo? (Opcional, sin espacios ni caracteres especiales):
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={customCode}
                        onChange={handleCustomCodeChange}
                        placeholder={suggestedCode || 'Ej: CARLOS77'}
                        maxLength={12}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-white focus:outline-none focus:border-emerald-500"
                      />
                      {isCheckingCode ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">
                          Verificando...
                        </span>
                      ) : codeAvailable === true ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-400">
                          ✓ Disponible
                        </span>
                      ) : codeAvailable === false ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-rose-400">
                          ✗ Ya está en uso
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: DATOS PARA PAGO DE COMISIONES */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">3. Cuenta para Consignar tus Comisiones</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Banco o Billetera *</label>
                    <select 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
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
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Tipo de Cuenta *</label>
                    <select 
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Billetera">Billetera Digital (Nequi / Daviplata)</option>
                      <option value="Ahorros">Cuenta de Ahorros</option>
                      <option value="Corriente">Cuenta Corriente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Número de Cuenta o Celular *</label>
                    <input 
                      type="text" 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Ej: 310 123 4567 o 123456789"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Cédula o NIT del Titular *</label>
                    <input 
                      type="text" 
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="Ej: 1020304050"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* BOTÓN ENVIAR */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Sin costos de afiliación. Comisión mensual recurrente garantizada.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting || codeAvailable === false}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando...' : 'Crear mi Cuenta de Vendedor →'}
                </button>
              </div>

            </form>

          </div>
        )}

      </div>

    </div>
  )
}
