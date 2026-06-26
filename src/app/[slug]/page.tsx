import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import BookingClient from './BookingClient'

export const revalidate = 60 // revalidate at most every minute

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <BookingClient clinic={clinic} services={services || []} />
    </div>
  )
}
