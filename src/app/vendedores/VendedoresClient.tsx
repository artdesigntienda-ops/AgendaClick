'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  MapPin,
  AlertTriangle,
  FileText,
  X,
  RefreshCw,
  Globe,
  KeyRound
} from 'lucide-react'
import { toast } from 'sonner'
import { registerPartnerAccount, validatePartnerCode, sendPartnerEmailOtp } from '@/app/dashboard/partners/actions'
import { createClient } from '@/utils/supabase/client'
import { COUNTRIES, COLOMBIA_DEPARTMENTS } from '@/lib/colombia-locations'

export default function VendedoresClient() {
  const router = useRouter()
  
  // 1. Datos personales
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  // Ubicación jerárquica
  const [country, setCountry] = useState('Colombia')
  const [department, setDepartment] = useState('Antioquia')
  const [city, setCity] = useState('Medellín')
  const [customCity, setCustomCity] = useState('')

  // 2. Código de vendedor
  const [customCode, setCustomCode] = useState('')
  const [suggestedCode, setSuggestedCode] = useState('')
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null)

  // 3. Datos bancarios
  const [bankName, setBankName] = useState('Nequi')
  const [accountType, setAccountType] = useState('Billetera')
  const [accountNumber, setAccountNumber] = useState('')
  const [documentId, setDocumentId] = useState('')

  // 4. Términos y condiciones
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  // 5. Verificación de Correo (OTP)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredSuccess, setRegisteredSuccess] = useState<{ code: string; email: string } | null>(null)

  // Cooldown timer para reenvío de OTP
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Actualizar ciudad por defecto cuando cambie el departamento
  useEffect(() => {
    if (country === 'Colombia') {
      const cities = COLOMBIA_DEPARTMENTS[department] || []
      if (cities.length > 0) {
        setCity(cities[0])
      } else {
        setCity('Otro')
      }
    }
  }, [department, country])

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

  // Validaciones antes de solicitar código de correo
  const handlePreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Nombre, correo y contraseña son obligatorios')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener mínimo 6 caracteres')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 7) {
      toast.error('Ingresa un número de celular/WhatsApp válido (sólo números, mínimo 7 dígitos)')
      return
    }

    const cleanDoc = documentId.replace(/\D/g, '')
    if (cleanDoc.length < 5) {
      toast.error('La cédula o NIT debe contener sólo números (mínimo 5 dígitos)')
      return
    }

    const cleanAccount = accountNumber.replace(/\D/g, '')
    if (cleanAccount.length < 5) {
      toast.error('El número de cuenta bancaria o Nequi debe contener sólo números')
      return
    }

    if (!acceptedTerms) {
      toast.error('Debes aceptar los Términos y Condiciones y la cláusula de responsabilidad de datos bancarios')
      return
    }

    // Solicitar código OTP al correo
    setIsSendingOtp(true)
    try {
      const res = await sendPartnerEmailOtp(email.trim().toLowerCase(), name.trim())
      if (res.success) {
        toast.success(res.message || 'Código enviado a tu correo')
        setIsOtpModalOpen(true)
        setResendCooldown(45)
      } else {
        toast.error(res.error || 'No se pudo enviar el código de verificación')
      }
    } catch {
      toast.error('Error al conectar con el servidor de correo')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setIsSendingOtp(true)
    try {
      const res = await sendPartnerEmailOtp(email.trim().toLowerCase(), name.trim())
      if (res.success) {
        toast.success('Código reenviado a tu correo')
        setResendCooldown(45)
      } else {
        toast.error(res.error || 'No se pudo reenviar el código')
      }
    } catch {
      toast.error('Error al reenviar código')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleFinalSubmitWithOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanOtp = otpCode.replace(/\D/g, '').trim()
    if (cleanOtp.length !== 6) {
      toast.error('El código debe tener exactamente 6 dígitos numéricos')
      return
    }

    setIsVerifyingOtp(true)
    const effectiveCity = city === 'Otro' ? (customCity.trim() || 'No especificada') : city

    const formData = new FormData()
    formData.set('name', name.trim())
    formData.set('email', email.trim().toLowerCase())
    formData.set('password', password)
    formData.set('phone', phone.replace(/\D/g, ''))
    formData.set('country', country)
    formData.set('department', country === 'Colombia' ? department : 'N/A')
    formData.set('city', effectiveCity)
    formData.set('custom_code', customCode || suggestedCode)
    formData.set('bank_name', bankName)
    formData.set('account_type', accountType)
    formData.set('account_number', accountNumber.replace(/\D/g, ''))
    formData.set('account_holder_name', name.trim())
    formData.set('document_id', documentId.replace(/\D/g, ''))
    formData.set('terms_accepted', 'true')
    formData.set('otp_code', cleanOtp)

    try {
      const res = await registerPartnerAccount(formData)
      if (res.success && res.partnerCode) {
        setRegisteredSuccess({ code: res.partnerCode, email: res.email || email })
        setIsOtpModalOpen(false)
        toast.success(res.message)
        
        // Iniciar sesión automáticamente
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
        toast.error(res.error || 'No se pudo verificar el código o crear la cuenta')
      }
    } catch {
      toast.error('Error de conexión al procesar el registro')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/full-logo.png" alt="AgendaClick Logo" className="h-10 object-contain brightness-200 invert" />
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Asesores
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
              Ya soy Asesor → Iniciar Sesión
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
          Crea tu cuenta de asesor y obtén tu <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">código comercial único</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Recomienda AgendaClick a negocios en tu ciudad. Cuando se suscriban ingresan tu código y recibes comisiones recurrentes mensuales directamente en tu cuenta bancaria.
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">¡Cuenta de Asesor Verificada y Creada!</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Tu Código de Asesor está Activo</h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                Las empresas que registres o que ingresen este código quedarán asignadas a tu cuenta para el pago mensual de comisiones.
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
            
            <form onSubmit={handlePreSubmit} className="space-y-8">
              
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
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">WhatsApp / Celular (Sólo Números) *</label>
                    <input 
                      type="tel" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 3101234567"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Sin espacios ni letras (ej. 3101234567)</p>
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
                    <p className="text-[11px] text-gray-500 mt-1">Te enviaremos un código de seguridad para validar tu cuenta</p>
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

                {/* SELECCIÓN JERÁRQUICA DE UBICACIÓN: PAÍS, DEPARTAMENTO Y CIUDAD */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" />
                    Ubicación Geográfica
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* País */}
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1.5">País *</label>
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Departamento (Si es Colombia) */}
                    {country === 'Colombia' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">Departamento *</label>
                          <select 
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                          >
                            {Object.keys(COLOMBIA_DEPARTMENTS).map(dep => (
                              <option key={dep} value={dep}>{dep}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">Ciudad o Municipio *</label>
                          <select 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                          >
                            {(COLOMBIA_DEPARTMENTS[department] || []).map(muni => (
                              <option key={muni} value={muni}>{muni}</option>
                            ))}
                            <option value="Otro">Otro Municipio...</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-300 mb-1.5">Ciudad / Estado / Región *</label>
                        <input 
                          type="text" 
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          placeholder="Ej: Buenos Aires, Santiago, Madrid..."
                          required
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {country === 'Colombia' && city === 'Otro' && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
                      <label className="block text-xs font-bold text-gray-300 mb-1">Escribe el nombre de tu Municipio:</label>
                      <input 
                        type="text" 
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Escribe tu municipio o corregimiento"
                        required
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* SECCIÓN 2: TU CÓDIGO DE VENDEDOR */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">2. Tu Código de Asesor</h3>
                </div>

                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Código Asignado</p>
                      <p className="text-xs text-gray-400">
                        Este es el código que compartirás con los negocios para vincular sus suscripciones a tu cuenta.
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
                      <option value="Otro Banco">Otro Banco / Entidad</option>
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
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Número de Cuenta o Celular (Sólo Números) *
                    </label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 3101234567 o 123456789"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Sólo números sin espacios ni guiones</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Cédula o NIT del Titular (Sólo Números) *
                    </label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 1020304050"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Sólo números sin puntos ni letras</p>
                  </div>
                </div>

                {/* ADVERTENCIA DE BLINDAJE SOBRE EXACTITUD DE DATOS */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-300">
                      Verificación obligatoria de tus datos de pago
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      Por favor revisa cuidadosamente tu número de cuenta, celular y cédula. Los giros de comisiones se procesan de manera automática a la información aquí registrada. En caso de error tipográfico cometido por el asesor, los fondos serán enviados a otra persona sin posibilidad de reintegro por parte de AgendaClick.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: BLINDAJE LEGAL Y ACEPTACIÓN DE TÉRMINOS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">4. Blindaje Legal y Términos de Comisiones</h3>
                </div>

                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      required
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                    />
                    <div className="text-xs text-gray-300 leading-relaxed select-none">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Declaro bajo juramento que los datos bancarios y cédula ingresados son de mi exclusiva propiedad y responsabilidad.
                      </span>{' '}
                      Acepto los Términos y Condiciones del Programa de Asesores de AgendaClick y exonero de manera total, irrevocable y expresa a AgendaClick de cualquier pago erróneo o pérdida patrimonial derivada de fallas o equivocaciones en mi digitación.{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-emerald-400 underline hover:text-emerald-300 font-bold inline"
                      >
                        Ver Términos y Condiciones Completos
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              {/* BOTÓN ENVIAR Y ACTIVAR */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Comprobación obligatoria de correo para confirmar que eres humano y titular.
                </p>

                <button
                  type="submit"
                  disabled={isSendingOtp || !acceptedTerms || codeAvailable === false}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Enviando código de verificación...
                    </>
                  ) : (
                    <>
                      Continuar y Verificar Correo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        )}

      </div>

      {/* MODAL DE VERIFICACIÓN OTP AL CORREO */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center relative"
            >
              <button 
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Comprobación de Seguridad</h3>
                <p className="text-xs text-gray-400">
                  Hemos enviado un código de 6 dígitos a <strong className="text-white">{email}</strong> para validar tu titularidad y confirmar que no eres un bot.
                </p>
              </div>

              <form onSubmit={handleFinalSubmitWithOtp} className="space-y-4">
                <div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full text-center text-3xl font-black font-mono tracking-widest bg-slate-950 border-2 border-emerald-500/40 rounded-2xl py-3.5 text-emerald-400 focus:outline-none focus:border-emerald-400 shadow-inner"
                  />
                  <p className="text-[11px] text-gray-500 mt-2">
                    Ingresa los 6 números que recibiste en tu bandeja de entrada o spam
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Validando y Activando Cuenta...
                    </>
                  ) : (
                    <>
                      Confirmar y Activar Cuenta de Asesor
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsOtpModalOpen(false)}
                    className="hover:text-white underline"
                  >
                    ← Modificar mis datos
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isSendingOtp}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE TÉRMINOS Y CONDICIONES Y BLINDAJE JURÍDICO */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Términos del Programa de Asesores Comerciales</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-4 text-xs text-gray-300 leading-relaxed pr-2">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-300">
                  <strong>IMPORTANTE:</strong> Al registrarte como Asesor/a Comercial de AgendaClick, aceptas plenamente las siguientes condiciones de operación y blindaje legal sobre la consignación de comisiones.
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">1. Responsabilidad Exclusiva sobre Datos Bancarios y Cédula</h4>
                  <p>
                    El Asesor/a Comercial declara bajo la gravedad de juramento que la entidad financiera, tipo de cuenta, número de cuenta o billetera digital (Nequi, Daviplata, Bancolombia u otros), número de cédula o NIT y nombre del titular suministrados son exactos, veraces y corresponden a su persona.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">2. Exoneración Total de Responsabilidad por Error en Digitación</h4>
                  <p>
                    AgendaClick (operado por Nexora Digital) procesa las transferencias de comisiones de manera automatizada con base estricta en los números y datos digitados por el propio Asesor. En el evento de que el Asesor cometa un error en la digitación del número de cuenta, celular o documento de identidad, y por dicha causa los fondos sean acreditados a un tercero o cuenta ajena, <strong>AgendaClick queda total, definitiva y expresamente exonerada de cualquier responsabilidad patrimonial, civil o comercial</strong>. Dicho pago se entenderá formalmente ejecutado y extinguida la obligación patrimonial para AgendaClick, debiendo el Asesor adelantar por su propia cuenta cualquier reclamación interbancaria ante la entidad receptora.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">3. Verificación de Titularidad y Retención Preventiva</h4>
                  <p>
                    AgendaClick se reserva la potestad de validar la concordancia entre la cédula registrada y el titular de la cuenta bancaria. Si se detectan discrepancias, inconsistencias o reportes de cuentas de terceros no autorizados, los pagos podrán ser preventivamente retenidos hasta que el Asesor certifique de forma fehaciente su titularidad bancaria.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">4. Independencia Comercial y Ausencia de Vínculo Laboral</h4>
                  <p>
                    El Programa de Asesores Comerciales constituye un contrato de corretaje y referenciación comercial independiente. No genera relación laboral, subordinación, societaria ni prestaciones sociales de ninguna índole entre el Asesor y AgendaClick.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">5. Política de Transparencia y Antifraude</h4>
                  <p>
                    Queda terminantemente prohibido el registro de empresas ficticias, la suplantación de identidad o el uso de autoreferidos no autorizados. Cualquier maniobra irregular acarreará el bloqueo definitivo de la cuenta comercial y la pérdida de las comisiones pendientes.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">6. Actualización de Datos Bancarios</h4>
                  <p>
                    Cualquier actualización de los datos de pago debe efectuarse en el portal con al menos cinco (5) días hábiles de anticipación a la fecha de corte mensual para surtir efecto en el ciclo inmediato de dispersión.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedTerms(true)
                    setShowTermsModal(false)
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-6 py-2.5 rounded-xl transition-all"
                >
                  Entendido y Aceptar Términos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
