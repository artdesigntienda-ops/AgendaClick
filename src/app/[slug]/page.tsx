import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import BookingClient from './BookingClient'
import ReCaptchaWrapper from './ReCaptchaWrapper'
import { Metadata } from 'next'

export const revalidate = 60 // revalidate at most every minute

// 1. SEO Avanzado Dinámico
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient()
  const { data: clinic } = await supabase.from('clinics').select('name, business_type').eq('slug', slug).single()
  
  if (!clinic) return { title: 'No Encontrado | AgendaClick' }

  const description = `Agenda tu cita rápida y fácilmente en ${clinic.name}. Elige el servicio, la fecha y reserva en menos de 1 minuto sin crear cuentas.`

  return {
    title: `Agendar cita en ${clinic.name} | AgendaClick`,
    description: description,
    openGraph: {
      title: `${clinic.name} - Reserva Online`,
      description: description,
      type: 'website',
      url: `https://agendaclick.com/${slug}`,
      siteName: 'AgendaClick',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${clinic.name} - Agenda tu cita`,
      description: description,
    }
  }
}

export default async function PublicClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient()

  // Buscar el negocio por slug
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', slug)
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

  const sameAsLinks = []
  if (clinic.instagram_url) sameAsLinks.push(clinic.instagram_url)
  if (clinic.facebook_url) sameAsLinks.push(clinic.facebook_url)
  if (clinic.tiktok_url) sameAsLinks.push(clinic.tiktok_url)
  if (clinic.youtube_url) sameAsLinks.push(clinic.youtube_url)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: clinic.name,
    url: `https://agendaclick.com/${clinic.slug}`,
    telephone: clinic.phone,
    address: clinic.address ? {
      "@type": "PostalAddress",
      "streetAddress": clinic.address,
      "addressCountry": "CO"
    } : undefined,
    geo: clinic.latitude && clinic.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": clinic.latitude,
      "longitude": clinic.longitude
    } : undefined,
    ...(clinic.logo_url && { image: clinic.logo_url }),
    ...(sameAsLinks.length > 0 && { sameAs: sameAsLinks }),
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg">
          <ReCaptchaWrapper siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}>
            <BookingClient clinic={clinic} services={services || []} />
          </ReCaptchaWrapper>
          
          <div className="mt-8 text-center">
            <a 
              href="https://agendaclick.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors"
            >
              <span>⚡ Potenciado por</span>
              <span className="font-bold text-black tracking-tight">AgendaClick</span>
              <span>— Crea tu agenda gratis aquí</span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
