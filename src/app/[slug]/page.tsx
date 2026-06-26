import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import BookingClient from './BookingClient'
import { Metadata } from 'next'

export const revalidate = 60 // revalidate at most every minute

// 1. SEO Avanzado Dinámico
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: clinic } = await supabase.from('clinics').select('name, business_type').eq('slug', params.slug).single()
  
  if (!clinic) return { title: 'No Encontrado | AgendaClick' }

  const description = `Agenda tu cita rápida y fácilmente en ${clinic.name}. Elige el servicio, la fecha y reserva en menos de 1 minuto sin crear cuentas.`

  return {
    title: `Agendar cita en ${clinic.name} | AgendaClick`,
    description: description,
    openGraph: {
      title: `${clinic.name} - Reserva Online`,
      description: description,
      type: 'website',
      url: `https://agendaclick.com/${params.slug}`,
      siteName: 'AgendaClick',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${clinic.name} - Agenda tu cita`,
      description: description,
    }
  }
}

export default async function PublicClinicPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Buscar el negocio por slug
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (clinicError || !clinic) {
    notFound()
  }

  // Buscar los servicios del negocio
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('clinic_id', clinic.id)
    .order('name', { ascending: true })

  // 2. AEO (Answer Engine Optimization) - Schema Markup Dinámico
  // Dependiendo del business_type, inyectamos un esquema distinto para los asistentes de IA
  const schemaType = clinic.business_type === 'belleza' ? 'HealthAndBeautyBusiness' 
                   : clinic.business_type === 'salud' ? 'MedicalClinic' 
                   : 'LocalBusiness'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: clinic.name,
    url: `https://agendaclick.com/${clinic.slug}`,
    telephone: clinic.phone,
    isAcceptingNewPatients: true,
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://agendaclick.com/${clinic.slug}`,
        inLanguage: 'es-CO',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ]
      },
      result: {
        '@type': 'Reservation',
        name: 'Reserva de cita'
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <BookingClient clinic={clinic} services={services || []} />
      </div>
    </>
  )
}
