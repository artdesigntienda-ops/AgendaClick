'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, addDays, startOfToday, parseISO, getDay, addMinutes, isBefore, parse, startOfMonth, getDaysInMonth, addMonths, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, ArrowRight, CheckCircle2, Video, MapPin, Link as LinkIcon, AlertCircle, Brain, Smile, Activity, Stethoscope, Heart, Leaf, Sparkles, Scissors, ChevronLeft, ChevronRight } from 'lucide-react'
import { createAppointment, sendOtpCode } from './actions'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const bookingSchema = z.object({
  clientName: z.string().min(2, 'El nombre es muy corto'),
  clientEmail: z.string().email('Correo inválido'),
  clientPhone: z.string().min(7, 'Teléfono inválido'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los Términos y Condiciones" }),
  } as any),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface Props {
  clinic: any
  services: any[]
  professionals: any[]
  appointments: any[]
}

export default function BookingClient({ clinic, services, professionals, appointments = [] }: Props) {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  useEffect(() => {
    if (step !== 5) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })

      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step])

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  })

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(startOfToday()))

  // Generar días del mes seleccionado (filtrando los días pasados si es el mes actual)
  const availableDates = Array.from({ length: getDaysInMonth(currentMonth) })
    .map((_, i) => addDays(currentMonth, i))
    .filter(date => date >= startOfToday() || isSameDay(date, startOfToday()))
  
  // Calcular horarios disponibles
  const getAvailableTimes = () => {
    if (!selectedDate || !selectedService) return []
    
    // Obtener el día de la semana
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[getDay(selectedDate)]
    
    // Determinar qué horario usar (profesional o clínica)
    let activeSchedule = clinic?.schedule
    if (selectedProfessional && selectedProfessional.schedule && !selectedProfessional.schedule.useClinicSchedule) {
      activeSchedule = selectedProfessional.schedule
    }
    
    if (!activeSchedule || !activeSchedule[dayName] || !activeSchedule[dayName].isOpen) {
      return [] // Cerrado ese día
    }
    
    const dayConfig = activeSchedule[dayName]
    const slots = []
    const durationMinutes = selectedService.duration_minutes || 30
    
    // Parse times
    let currentTime = parse(dayConfig.openTime, 'HH:mm', selectedDate)
    const endTime = parse(dayConfig.closeTime, 'HH:mm', selectedDate)
    
    let breakStart = null
    let breakEnd = null
    if (dayConfig.breakStart && dayConfig.breakEnd) {
      breakStart = parse(dayConfig.breakStart, 'HH:mm', selectedDate)
      breakEnd = parse(dayConfig.breakEnd, 'HH:mm', selectedDate)
    }
    
    const now = new Date()
    
    while (isBefore(currentTime, endTime)) {
      const slotEnd = addMinutes(currentTime, durationMinutes)
      
      // Si el slot excede la hora de cierre, no lo añadimos
      if (!isBefore(slotEnd, endTime) && slotEnd.getTime() !== endTime.getTime()) {
        break
      }
      
      // Si el slot se solapa con el almuerzo, saltamos al final del almuerzo
      if (breakStart && breakEnd && isBefore(currentTime, breakEnd) && isBefore(breakStart, slotEnd)) {
        currentTime = breakEnd
        continue
      }
      
      const timeStr = format(currentTime, 'HH:mm')
      const slotStartISOString = `${format(selectedDate, 'yyyy-MM-dd')}T${timeStr}:00`
      const slotStartISO = new Date(slotStartISOString)
      const slotEndISO = new Date(slotStartISO.getTime() + durationMinutes * 60000)

      // Verificar si hay alguna cita que se solape con este slot para el profesional seleccionado
      const isReserved = appointments.some((apt: any) => {
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)

        const overlaps = (slotStartISO < aptEnd && slotEndISO > aptStart)
        if (!overlaps) return false

        if (selectedProfessional) {
          // Si tiene profesional seleccionado, se bloquea si la cita es para él o para toda la clínica (null)
          return apt.staff_id === selectedProfessional.id || apt.staff_id === null
        } else {
          // Si es "Cualquier profesional", se bloquea si hay un bloqueo general (null)
          return apt.staff_id === null
        }
      })
      
      // Validar que la hora ya no haya pasado si es hoy
      if (!isReserved && isBefore(now, currentTime)) {
        slots.push(timeStr)
      }
      
      // Incrementamos por la duración del servicio
      currentTime = addMinutes(currentTime, durationMinutes)
    }
    
    return slots
  }

  const availableTimes = getAvailableTimes()


  const onSubmit = async (data: BookingFormData) => {
    if (!selectedService || !selectedTime) return
    setIsSubmitting(true)
    
    let token = ''
    try {
      if (executeRecaptcha) {
        token = await executeRecaptcha('booking_otp')
      }
    } catch (err) {
      console.error('Error executing reCAPTCHA', err)
    }

    // Solicitamos OTP
    const result = await sendOtpCode(data.clientEmail, data.clientName, token)
    setIsSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      setStep(5) // Move to OTP step
      setCountdown(300) // 5 minutes countdown
      setResendCooldown(60) // 60 seconds cooldown for resending
      setCanResend(false)
      toast.success('Código enviado a tu correo')
    }
  }

  const verifyOtpAndBook = async () => {
    if (otpCode.length !== 6) {
      toast.error('El código debe tener 6 dígitos')
      return
    }

    setIsVerifying(true)
    
    // Combinar fecha y hora
    const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
    const startTime = new Date(dateTimeString)
    const endTime = new Date(startTime.getTime() + (selectedService?.duration_minutes || 30) * 60000)

    const formData = getValues()

    const result = await createAppointment({
      clinicId: clinic.id,
      serviceId: selectedService.id,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      staffId: selectedProfessional?.id || null
    }, otpCode)

    setIsVerifying(false)

    if (result?.error) {
      toast.error(result.message || 'Código incorrecto o expirado')
    } else {
      toast.success('¡Cita agendada con éxito! Redirigiendo a WhatsApp...')
      window.location.href = generateWhatsAppLink(formData.clientName)
    }
  }

  // Generar enlace wa.me
  const generateWhatsAppLink = (clientName: string) => {
    const formattedDate = format(selectedDate, 'dd/MM/yyyy')
    const message = `Hola, acabo de agendar una cita para ${selectedService?.name} el ${formattedDate} a las ${selectedTime}. Mi nombre es ${clientName}.`
    const encodedMessage = encodeURIComponent(message)
    // Asegurar que el teléfono no tenga el '+' u otros caracteres raros para la URL
    const phone = clinic.phone?.replace(/[^0-9]/g, '') || ''
    return `https://wa.me/${phone}?text=${encodedMessage}`
  }

  const slideVariants = {
    enter: { x: 20, opacity: 0 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: -20, opacity: 0 }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white text-black rounded-2xl shadow-xl overflow-hidden border">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=${(clinic.font_family || 'Outfit').replace(/ /g, '+')}:wght@300;400;500;700;900&display=swap');
        :root {
          --brand-color: ${clinic.brand_color || '#10b981'};
          --font-family: '${clinic.font_family || 'Outfit'}', sans-serif;
        }
        .bg-brand {
          background-color: var(--brand-color) !important;
        }
        .text-brand {
          color: var(--brand-color) !important;
        }
        .border-brand {
          border-color: var(--brand-color) !important;
        }
        .hover\:border-brand:hover {
          border-color: var(--brand-color) !important;
        }
        .hover\:bg-brand:hover {
          background-color: var(--brand-color) !important;
          filter: brightness(0.9);
        }
        .group:hover .group-hover\:bg-brand {
          background-color: var(--brand-color) !important;
        }
        .group:hover .group-hover\:text-brand {
          color: var(--brand-color) !important;
        }
        .group:hover .group-hover\:text-white {
          color: #ffffff !important;
        }
        .group:hover .group-hover\:border-brand {
          border-color: var(--brand-color) !important;
        }
        .focus\:border-brand:focus {
          border-color: var(--brand-color) !important;
        }
        .focus\:ring-brand:focus {
          --tw-ring-color: var(--brand-color) !important;
        }
        body, html, *, .font-brand {
          font-family: var(--font-family) !important;
        }
      ` }} />
      <div 
        className="relative p-8 text-center flex flex-col items-center transition-colors duration-300 overflow-hidden"
        style={{
          backgroundColor: clinic.cover_image_url ? undefined : 'var(--brand-color)',
          backgroundImage: clinic.cover_image_url ? `url(${clinic.cover_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: clinic.header_text_color || '#ffffff'
        }}
      >
        {clinic.cover_image_url && (
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        )}
        
        <div className="relative z-10 flex flex-col items-center w-full">
          {clinic.logo_url ? (
            <img src={clinic.logo_url} alt={clinic.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 shadow-lg bg-white" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-4 border-2 shadow-lg text-3xl font-black" style={{ borderColor: 'rgba(255,255,255,0.2)', color: clinic.header_text_color || '#ffffff' }}>
              {clinic.name ? clinic.name.charAt(0).toUpperCase() : 'N'}
            </div>
          )}
          <h1 className="text-2xl font-light tracking-tight">{clinic.name}</h1>
          {clinic.slogan ? (
            <p className="mt-2 text-sm italic" style={{ opacity: 0.85 }}>{clinic.slogan}</p>
          ) : (
            <p className="mt-2 text-xs uppercase tracking-widest font-semibold" style={{ opacity: 0.85 }}>
              {clinic.business_type === 'belleza' && '💅 Estética y Belleza'}
              {clinic.business_type === 'bienestar' && '🧘 Spas y Bienestar'}
              {clinic.business_type === 'salud' && '🏥 Clínica y Salud'}
              {clinic.business_type === 'psicologia' && '🧠 Psicología y Terapia'}
              {clinic.business_type === 'odontologia' && '🦷 Odontología y Ortodoncia'}
              {clinic.business_type === 'quiropractica' && '🦴 Quiropráctica y Masajes'}
              {clinic.business_type === 'medicina_general' && '🩺 Consulta Médica y Especialistas'}
              {!['belleza', 'bienestar', 'salud', 'psicologia', 'odontologia', 'quiropractica', 'medicina_general'].includes(clinic.business_type) && clinic.business_type}
            </p>
          )}
          
          {clinic.address && (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 mt-4 text-left p-3 rounded-xl transition-colors mx-auto max-w-sm border backdrop-blur-sm"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.15)'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: 'var(--brand-color)' }}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block font-medium text-sm">{clinic.address}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 mt-0.5" style={{ opacity: 0.9 }}>
                   Abrir en Google Maps <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </a>
          )}

          {/* Redes Sociales */}
          {(clinic.instagram_url || clinic.facebook_url || clinic.tiktok_url || clinic.youtube_url) && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {clinic.instagram_url && <a href={clinic.instagram_url} target="_blank" rel="noreferrer" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}><LinkIcon className="w-5 h-5" /></a>}
              {clinic.facebook_url && <a href={clinic.facebook_url} target="_blank" rel="noreferrer" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}><LinkIcon className="w-5 h-5" /></a>}
              {clinic.tiktok_url && <a href={clinic.tiktok_url} target="_blank" rel="noreferrer" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}><Video className="w-5 h-5" /></a>}
              {clinic.youtube_url && <a href={clinic.youtube_url} target="_blank" rel="noreferrer" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}><LinkIcon className="w-5 h-5" /></a>}
            </div>
          )}
        </div>
      </div>

      <div className="p-8 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <h2 className="text-lg font-medium mb-6">1. Selecciona un servicio</h2>
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Este negocio aún no ha configurado sus servicios.</p>
              ) : (
                services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      // Si hay un solo profesional (o ninguno registrado), saltamos al paso 3 (Fecha)
                      if (professionals.length <= 1) {
                        setSelectedProfessional(professionals[0] || null)
                        setStep(3)
                      } else {
                        setStep(2)
                      }
                    }}
                    className="w-full text-left p-4 rounded-xl border hover:border-brand transition-colors group flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-brand group-hover:text-white transition-colors">
                        {clinic.business_type === 'psicologia' && <Brain className="w-5 h-5" />}
                        {clinic.business_type === 'odontologia' && <Smile className="w-5 h-5" />}
                        {clinic.business_type === 'quiropractica' && <Activity className="w-5 h-5" />}
                        {clinic.business_type === 'medicina_general' && <Stethoscope className="w-5 h-5" />}
                        {clinic.business_type === 'salud' && <Heart className="w-5 h-5" />}
                        {clinic.business_type === 'bienestar' && <Leaf className="w-5 h-5" />}
                        {clinic.business_type === 'belleza' && <Scissors className="w-5 h-5" />}
                        {!['belleza', 'bienestar', 'salud', 'psicologia', 'odontologia', 'quiropractica', 'medicina_general'].includes(clinic.business_type) && <Sparkles className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-brand">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.duration_minutes} min • ${service.price}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors" />
                  </button>
                ))
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setStep(1)}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver a servicios
              </div>
              
              <h2 className="text-lg font-medium mb-6">2. ¿Con quién te gustaría agendar?</h2>
              
              <button
                onClick={() => {
                  setSelectedProfessional(null) // Cualquiera
                  setStep(3)
                }}
                className="w-full text-left p-4 rounded-xl border hover:border-brand transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Cualquier profesional disponible</h3>
                  <p className="text-sm text-gray-500">Ver horarios de todos</p>
                </div>
              </button>

              {professionals.map(prof => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setSelectedProfessional(prof)
                    setStep(3)
                  }}
                  className="w-full text-left p-4 rounded-xl border hover:border-brand transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {prof.name ? prof.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 className="font-medium">{prof.name || 'Profesional'}</h3>
                    <p className="text-sm text-gray-500 capitalize">{prof.role === 'owner' ? 'Especialista' : 'Staff'}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => {
                if (professionals.length <= 1) setStep(1)
                else setStep(2)
              }}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">
                  {professionals.length <= 1 ? '2. Fecha y Hora' : '3. Fecha y Hora'}
                </h2>
                
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button 
                    onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
                    disabled={isBefore(addMonths(currentMonth, -1), startOfMonth(startOfToday()))}
                    className="p-1.5 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs font-semibold px-2 min-w-[90px] text-center capitalize text-gray-700">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                  </span>
                  <button 
                    onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                    className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                  {availableDates.length === 0 ? (
                    <div className="text-sm text-gray-500 w-full text-center py-4">No hay días disponibles en este mes.</div>
                  ) : (
                    availableDates.map(date => (
                      <motion.button
                        key={date.toISOString()}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedDate(date)}
                        className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-colors ${
                          selectedDate.getTime() === date.getTime() 
                            ? 'bg-brand text-white border-brand shadow-md' 
                            : 'hover:border-brand bg-white'
                        }`}
                      >
                        <span className="text-xs uppercase opacity-80">{format(date, 'eee', { locale: es })}</span>
                        <span className="text-xl font-medium mt-1">{format(date, 'dd')}</span>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {availableTimes.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No hay horarios disponibles para este día.
                  </div>
                ) : (
                  availableTimes.map(time => (
                    <motion.button
                      key={time}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedTime(time)
                        setStep(4)
                      }}
                      className={`py-3 rounded-lg border text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-brand text-white border-brand shadow-lg'
                          : 'hover:border-brand hover:bg-gray-50 bg-white'
                      }`}
                    >
                      {time}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setStep(3)}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver a horarios
              </div>

              <h2 className="text-lg font-medium mb-6">
                {professionals.length <= 1 ? '3. Tus Datos' : '4. Tus Datos'}
              </h2>

              <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
                <p className="font-medium">{selectedService?.name}</p>
                {selectedProfessional && (
                  <p className="text-xs text-gray-600 mt-1">Con: {selectedProfessional.name}</p>
                )}
                <p className="text-gray-500 mt-1">
                  {format(selectedDate, "dd 'de' MMMM", { locale: es })} a las {selectedTime}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('clientName')}
                      placeholder="Tu nombre completo"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/5 focus:border-brand transition-all ${errors.clientName ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.clientName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.clientName.message}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('clientEmail')}
                      placeholder="tu@correo.com"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/5 focus:border-brand transition-all ${errors.clientEmail ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.clientEmail && <p className="text-red-500 text-xs mt-1 ml-1">{errors.clientEmail.message}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('clientPhone')}
                      placeholder="Tu teléfono (Ej. +57300...)"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/5 focus:border-brand transition-all ${errors.clientPhone ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.clientPhone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.clientPhone.message}</p>}
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...register('acceptTerms')}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-gray-500 leading-tight">
                    He leído y acepto los <a href="/terminos" target="_blank" className="underline hover:text-brand">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" className="underline hover:text-brand">Política de Privacidad</a>. Entiendo que AgendaClick es solo un intermediario tecnológico.
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-red-500 text-xs ml-1">{errors.acceptTerms.message}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-brand hover:bg-brand text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Enviando código...' : 'Enviar código de verificación'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setStep(4)}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver a mis datos
              </div>
              
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Verifica tu correo</h2>
                <p className="text-sm text-gray-500">
                  Hemos enviado un código de 6 dígitos a <br/>
                  <strong className="text-black">{getValues().clientEmail}</strong>
                </p>
                {countdown > 0 ? (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    El código expira en {formatTime(countdown)}
                  </p>
                ) : (
                  <p className="text-xs text-red-500 mt-2 font-semibold">
                    El código ha expirado. Por favor, solicita uno nuevo.
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  disabled={countdown === 0}
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/5 focus:border-brand transition-all disabled:opacity-50"
                />
              </div>

              <button
                onClick={verifyOtpAndBook}
                disabled={isVerifying || otpCode.length !== 6 || countdown === 0}
                className="w-full bg-brand hover:bg-brand text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all"
              >
                {isVerifying ? 'Verificando y Reservando...' : 'Confirmar Reserva'}
              </button>
              
              <div className="text-center text-sm mt-4 border-t pt-4">
                {canResend ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSubmitting(true)
                      await onSubmit(getValues())
                      setIsSubmitting(false)
                    }}
                    className="text-brand font-semibold underline hover:brightness-90 transition-colors"
                  >
                    Reenviar código de verificación
                  </button>
                ) : (
                  <p className="text-gray-400">
                    Puedes reenviar el código en {resendCooldown}s
                  </p>
                )}
              </div>

              <p className="text-xs text-center text-gray-400 mt-2">
                Si no encuentras el correo, revisa tu carpeta de Spam.
              </p>
            </motion.div>
          )}

          {/* Paso Invisible */}

        </AnimatePresence>
      </div>
      
      {/* Branding ArtDesign */}
      <div className="py-4 text-center border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <p className="text-xs text-gray-400">
          Powered by AgendaClick, una solución de <a href="https://jaisonrodriguez.github.io/nexora-digital-portal/" target="_blank" rel="noreferrer" className="font-bold hover:text-black transition-colors">Nexora Digital</a>
        </p>
      </div>
    </div>
  )
}
