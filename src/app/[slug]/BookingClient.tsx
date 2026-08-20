'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, addDays, startOfToday, parseISO, getDay, addMinutes, isBefore, parse, startOfMonth, getDaysInMonth, addMonths, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, ArrowRight, CheckCircle2, Video, MapPin, Link as LinkIcon, AlertCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { getSegmentConfig } from '@/lib/segment-icons'
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
  
  // Soporte de múltiples servicios seleccionados
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Cálculo acumulado de duración y precio total
  const primaryService = selectedServices[0] || null
  const totalDuration = selectedServices.reduce((sum, s) => sum + (Number(s.duration_minutes) || 30), 0) || 30
  const totalPrice = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0)

  const toggleService = (service: any) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id)
      if (exists) {
        return prev.filter(s => s.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
  }

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
  
  // Calcular horarios disponibles considerando la duración total acumulada de todos los servicios
  const getAvailableTimes = () => {
    if (!selectedDate || selectedServices.length === 0) return []
    
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
    const durationMinutes = totalDuration
    
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
        if (apt.status === 'cancelled') return false
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time || (new Date(apt.start_time).getTime() + 30 * 60000))

        const overlaps = (slotStartISO < aptEnd && slotEndISO > aptStart)
        if (!overlaps) return false

        if (selectedProfessional) {
          return apt.staff_id === selectedProfessional.id || apt.staff_id === null
        } else {
          return apt.staff_id === null
        }
      })
      
      // Validar que la hora ya no haya pasado si es hoy
      if (!isReserved && isBefore(now, currentTime)) {
        slots.push(timeStr)
      }
      
      // Incremento de inicio flexible
      const stepIncrement = Math.min(30, durationMinutes)
      currentTime = addMinutes(currentTime, stepIncrement)
    }
    
    return slots
  }

  const availableTimes = getAvailableTimes()

  const onSubmit = async (data: BookingFormData) => {
    if (selectedServices.length === 0 || !selectedTime) return
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

    if (selectedServices.length === 0) {
      toast.error('Por favor selecciona al menos un servicio')
      return
    }

    setIsVerifying(true)
    
    // Combinar fecha y hora con duración acumulada
    const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
    const startTime = new Date(dateTimeString)
    const endTime = new Date(startTime.getTime() + totalDuration * 60000)

    const formData = getValues()
    const servicesNamesList = selectedServices.map(s => s.name).join(', ')

    const result = await createAppointment({
      clinicId: clinic.id,
      serviceId: primaryService.id,
      serviceIds: selectedServices.map(s => s.id),
      serviceNames: servicesNamesList,
      totalPrice: totalPrice,
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

  // Generar enlace wa.me con desglose de servicios
  const generateWhatsAppLink = (clientName: string) => {
    const formattedDate = format(selectedDate, 'dd/MM/yyyy')
    const servicesText = selectedServices.map(s => s.name).join(' + ')
    const message = `Hola, acabo de agendar una cita en ${clinic.name} para: ${servicesText} (Duración estimada: ${totalDuration} min, Total: $${totalPrice.toLocaleString('es-CO')}) el día ${formattedDate} a las ${selectedTime}. Mi nombre es ${clientName}.`
    const encodedMessage = encodeURIComponent(message)
    const phone = clinic.phone?.replace(/[^0-9]/g, '') || ''
    return `https://wa.me/${phone}?text=${encodedMessage}`
  }

  const slideVariants = {
    enter: { x: 20, opacity: 0 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: -20, opacity: 0 }
  }

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl shadow-xl overflow-hidden border" style={{ backgroundColor: 'var(--booking-card, #ffffff)', color: 'var(--booking-text, #111827)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=${(clinic.font_family || 'Outfit').replace(/ /g, '+')}:wght@300;400;500;700;900&display=swap');
        :root {
          --brand-color: ${clinic.brand_color || '#10b981'};
          --font-family: '${clinic.font_family || 'Outfit'}', sans-serif;
          --booking-bg: ${clinic.booking_bg_color || '#f9fafb'};
          --booking-text: ${clinic.booking_text_color || '#111827'};
          --booking-card: ${clinic.booking_card_color || '#ffffff'};
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
        .hover\\:border-brand:hover {
          border-color: var(--brand-color) !important;
        }
        .hover\\:bg-brand:hover {
          background-color: var(--brand-color) !important;
          filter: brightness(0.9);
        }
        .group:hover .group-hover\\:bg-brand {
          background-color: var(--brand-color) !important;
        }
        .group:hover .group-hover\\:text-brand {
          color: var(--brand-color) !important;
        }
        .group:hover .group-hover\\:text-white {
          color: #ffffff !important;
        }
        .group:hover .group-hover\\:border-brand {
          border-color: var(--brand-color) !important;
        }
        .focus\\:border-brand:focus {
          border-color: var(--brand-color) !important;
        }
        .focus\\:ring-brand:focus {
          --tw-ring-color: var(--brand-color) !important;
        }
        body, html, *, .font-brand {
          font-family: var(--font-family);
        }
      `}} />

      {/* Header Info */}
      <div 
        className="p-8 text-center border-b relative overflow-hidden"
        style={{
          backgroundColor: clinic.header_text_color ? clinic.brand_color : '#18181b',
          color: clinic.header_text_color || '#ffffff',
          backgroundImage: clinic.cover_image_url ? `url(${clinic.cover_image_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay si hay imagen de fondo */}
        {clinic.cover_image_url && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        )}

        <div className="relative z-10">
          {clinic.logo_url ? (
            <img 
              src={clinic.logo_url} 
              alt={clinic.name} 
              className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg border-2 border-white/20 mb-4 bg-white"
            />
          ) : (
            <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
              {(() => {
                const Icon = getSegmentConfig(clinic.business_type).mainIcon
                return <Icon className="w-8 h-8 text-white" />
              })()}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{clinic.name}</h1>
          <p className="text-sm mt-1 max-w-sm mx-auto" style={{ opacity: 0.85 }}>
            {clinic.slogan || 'Reserva tu cita en segundos sin descargar aplicaciones.'}
          </p>

          {/* Dirección Clickable a Google Maps */}
          {clinic.address && (
            <a 
              href={
                clinic.latitude && clinic.longitude 
                  ? `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.address} ${clinic.city || ''}`)}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs transition-colors border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'inherit'
              }}
            >
              <MapPin className="w-4 h-4 text-brand shrink-0" />
              <div className="text-left">
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

      <div className="p-6 sm:p-8 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* PASO 1: SELECCIÓN MÚLTIPLE DE SERVICIOS */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold">1. Selecciona los servicios</h2>
                <p className="text-xs text-gray-500 mt-0.5">Puedes elegir uno o varios servicios para tu cita</p>
              </div>

              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Este negocio aún no ha configurado sus servicios.</p>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {services.map(service => {
                    const isSelected = selectedServices.some(s => s.id === service.id)
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand'
                            : 'hover:border-brand/50 hover:bg-gray-50/50 bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            isSelected ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {(() => { const ServiceIcon = getSegmentConfig(clinic.business_type).serviceItemIcon; return <ServiceIcon className="w-5 h-5" />; })()}
                          </div>
                          <div>
                            <h3 className={`font-semibold text-sm leading-snug ${isSelected ? 'text-brand' : 'text-gray-900'}`}>{service.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{service.duration_minutes} min • ${Number(service.price).toLocaleString('es-CO')}</p>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ml-2 ${
                          isSelected ? 'bg-brand border-brand text-white' : 'border-gray-300 bg-white text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Barra inferior fija de resumen y continuación */}
              {selectedServices.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-3 border-t border-gray-100 mt-4 space-y-3"
                >
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">
                        {selectedServices.length} {selectedServices.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⏱️ {totalDuration} min • 💰 ${totalPrice.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (professionals.length <= 1) {
                        setSelectedProfessional(professionals[0] || null)
                        setStep(3)
                      } else {
                        setStep(2)
                      }
                    }}
                    className="w-full bg-brand hover:brightness-95 text-white py-3.5 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continuar con {selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <p className="text-xs text-center text-gray-400 pt-2">
                  Toca uno o más servicios arriba para seleccionarlos.
                </p>
              )}
            </motion.div>
          )}

          {/* PASO 2: SELECCIÓN DE PROFESIONAL */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setStep(1)}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver a servicios ({selectedServices.length} seleccionados)
              </div>
              
              <h2 className="text-lg font-bold mb-2">2. ¿Con quién te gustaría agendar?</h2>
              
              <button
                onClick={() => {
                  setSelectedProfessional(null) // Cualquiera
                  setStep(3)
                }}
                className="w-full text-left p-4 rounded-xl border hover:border-brand transition-colors flex items-center gap-4 bg-white"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Cualquier especialista disponible</h3>
                  <p className="text-xs text-gray-500">Ver disponibilidad inmediata</p>
                </div>
              </button>

              {professionals.map(prof => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setSelectedProfessional(prof)
                    setStep(3)
                  }}
                  className="w-full text-left p-4 rounded-xl border hover:border-brand transition-colors flex items-center gap-4 bg-white"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {prof.name ? prof.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{prof.name || 'Profesional'}</h3>
                    <p className="text-xs text-gray-500 capitalize">{prof.role === 'owner' ? 'Especialista Principal' : 'Técnico Especialista'}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* PASO 3: FECHA Y HORA */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => {
                if (professionals.length <= 1) setStep(1)
                else setStep(2)
              }}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver
              </div>

              {/* Resumen superior */}
              <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-200 text-xs">
                <span className="font-bold text-gray-900 block mb-0.5 line-clamp-1">
                  🛠️ {selectedServices.map(s => s.name).join(' + ')}
                </span>
                <span className="text-gray-600 font-medium">
                  ⏱️ Tiempo estimado: {totalDuration} min • 💰 Total: ${totalPrice.toLocaleString('es-CO')}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">
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
                    No hay horarios disponibles para este día con {totalDuration} min requeridos.
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

          {/* PASO 4: DATOS DEL CLIENTE Y RESUMEN MULTI-SERVICIO */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setStep(3)}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver a horarios
              </div>

              <h2 className="text-lg font-bold mb-4">
                {professionals.length <= 1 ? '3. Tus Datos' : '4. Tus Datos'}
              </h2>

              <div className="bg-gray-50 p-4 rounded-xl mb-5 text-sm border border-gray-200">
                <p className="font-bold text-gray-900 mb-2">Resumen de tu cita ({selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'}):</p>
                <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto">
                  {selectedServices.map(s => (
                    <div key={s.id} className="text-xs text-gray-700 flex justify-between items-center py-0.5">
                      <span>• {s.name} <span className="text-gray-400">({s.duration_minutes} min)</span></span>
                      <span className="font-semibold text-gray-900">${Number(s.price).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-300 pt-2 flex justify-between text-xs font-bold text-gray-900">
                  <span>Total estimado ({totalDuration} min)</span>
                  <span className="text-brand text-sm">${totalPrice.toLocaleString('es-CO')} COP</span>
                </div>

                {selectedProfessional && (
                  <p className="text-xs text-gray-600 mt-2">Atendido por: <strong>{selectedProfessional.name}</strong></p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  📅 {format(selectedDate, "dd 'de' MMMM", { locale: es })} a las <strong>{selectedTime}</strong>
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
                      placeholder="Tu teléfono / WhatsApp (Ej. 3158610110)"
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
                  className="w-full mt-4 bg-brand hover:brightness-95 text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? 'Enviando código...' : 'Enviar código de verificación'}
                </button>
              </form>
            </motion.div>
          )}

          {/* PASO 5: CÓDIGO OTP */}
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
                <h2 className="text-xl font-bold mb-2">Verifica tu correo</h2>
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
                className="w-full bg-brand hover:brightness-95 text-white py-4 rounded-xl font-bold disabled:opacity-50 transition-all shadow-md"
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
