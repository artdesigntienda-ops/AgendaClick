'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, addDays, startOfToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, ArrowRight, CheckCircle2, Instagram, Facebook, Youtube, Video } from 'lucide-react'
import { createAppointment } from './actions'

const bookingSchema = z.object({
  clientName: z.string().min(2, 'El nombre es muy corto'),
  clientEmail: z.string().email('Correo inválido'),
  clientPhone: z.string().min(7, 'Teléfono inválido'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los Términos y Condiciones" }),
  }),
})

type BookingFormData = z.infer<typeof bookingSchema>

type Props = {
  clinic: any
  services: any[]
}

export default function BookingClient({ clinic, services }: Props) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  })

  // Generar próximos 14 días para MVP
  const availableDates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i))
  
  // Horarios de ejemplo MVP (9am a 5pm)
  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedService || !selectedTime) return
    
    setIsSubmitting(true)
    
    // Combinar fecha y hora
    const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
    const startTime = new Date(dateTimeString)
    const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000)

    const result = await createAppointment({
      clinicId: clinic.id,
      serviceId: selectedService.id,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    })

    setIsSubmitting(false)

    if (result?.error) {
      toast.error('Hubo un error al agendar tu cita')
    } else {
      toast.success('¡Cita agendada con éxito!')
      setStep(4) // Success screen
    }
  }

  // Generar enlace wa.me
  const generateWhatsAppLink = () => {
    const formattedDate = format(selectedDate, 'dd/MM/yyyy')
    const message = `Hola, acabo de agendar una cita para ${selectedService?.name} el ${formattedDate} a las ${selectedTime}. Mi nombre es...`
    const encodedMessage = encodeURIComponent(message)
    // Asegurar que el teléfono no tenga el '+' u otros caracteres raros para la URL
    const phone = clinic.phone?.replace(/[^0-9]/g, '') || ''
    return `https://wa.me/${phone}?text=${encodedMessage}`
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0
    })
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border">
      <div className="bg-black text-white p-8 text-center flex flex-col items-center">
        {clinic.logo_url ? (
          <img src={clinic.logo_url} alt={clinic.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-white/20 shadow-lg" />
        ) : null}
        <h1 className="text-2xl font-light tracking-tight">{clinic.name}</h1>
        {clinic.slogan ? (
          <p className="text-gray-300 mt-2 text-sm italic">{clinic.slogan}</p>
        ) : (
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">{clinic.business_type}</p>
        )}
        
        {/* Redes Sociales */}
        {(clinic.instagram_url || clinic.facebook_url || clinic.tiktok_url || clinic.youtube_url) && (
          <div className="flex items-center justify-center gap-4 mt-6">
            {clinic.instagram_url && <a href={clinic.instagram_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
            {clinic.facebook_url && <a href={clinic.facebook_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
            {clinic.tiktok_url && <a href={clinic.tiktok_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Video className="w-5 h-5" /></a>}
            {clinic.youtube_url && <a href={clinic.youtube_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>}
          </div>
        )}
      </div>

      <div className="p-8 relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={1}>
          
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
                      setStep(2)
                    }}
                    className="w-full text-left p-4 rounded-xl border hover:border-black transition-colors group flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium group-hover:text-black">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.duration_minutes} min • ${service.price}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
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
            >
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setStep(1)}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver a servicios
              </div>
              
              <h2 className="text-lg font-medium mb-6">2. Fecha y Hora</h2>
              
              <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                  {availableDates.map(date => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-colors ${
                        selectedDate.getTime() === date.getTime() 
                          ? 'bg-black text-white border-black' 
                          : 'hover:border-black'
                      }`}
                    >
                      <span className="text-xs uppercase opacity-80">{format(date, 'eee', { locale: es })}</span>
                      <span className="text-xl font-medium mt-1">{format(date, 'dd')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {availableTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTime === time
                        ? 'bg-black text-white border-black'
                        : 'hover:border-black'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedTime}
                onClick={() => setStep(3)}
                className="w-full mt-8 bg-black text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
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
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 cursor-pointer hover:text-black" onClick={() => setStep(2)}>
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver a horarios
              </div>

              <h2 className="text-lg font-medium mb-6">3. Tus Datos</h2>

              <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
                <p className="font-medium">{selectedService?.name}</p>
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
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all ${errors.clientName ? 'border-red-500' : 'border-gray-200'}`}
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
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all ${errors.clientEmail ? 'border-red-500' : 'border-gray-200'}`}
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
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all ${errors.clientPhone ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.clientPhone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.clientPhone.message}</p>}
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...register('acceptTerms')}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-gray-500 leading-tight">
                    He leído y acepto los <a href="/terminos" target="_blank" className="underline hover:text-black">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" className="underline hover:text-black">Política de Privacidad</a>. Entiendo que AgendaClick es solo un intermediario tecnológico.
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-red-500 text-xs ml-1">{errors.acceptTerms.message}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-black text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-medium mb-2">¡Cita Confirmada!</h2>
              <p className="text-gray-500 mb-8">
                Tu turno para <strong>{selectedService?.name}</strong> ha sido agendado exitosamente.
              </p>

              <div className="bg-gray-50 p-6 rounded-2xl mb-8 border">
                <p className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-4">Siguiente paso (Importante)</p>
                <p className="text-sm text-gray-600 mb-6">
                  Por favor envía un mensaje a {clinic.name} por WhatsApp para que tengan tu contacto directo.
                </p>
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                >
                  <Phone className="w-5 h-5" />
                  Enviar WhatsApp ahora
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
