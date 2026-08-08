import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Script from 'next/script'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  async function saveSettings(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'staff') {
      const staffName = formData.get('staff_name') as string
      if (staffName) {
        await supabase
          .from('profiles')
          .update({ name: staffName })
          .eq('id', user.id)
      }
      revalidatePath('/dashboard/settings')
      revalidatePath('/dashboard/staff')
      return
    }

    const { data: existingClinic } = await supabase
      .from('clinics')
      .select('id, logo_url, cover_image_url')
      .eq('owner_id', user.id)
      .maybeSingle()

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const slug = formData.get('slug') as string
    const businessType = formData.get('business_type') as string
    const slogan = formData.get('slogan') as string
    const country = formData.get('country') as string
    const state = formData.get('state') as string
    const city = formData.get('city') as string
    const neighborhood = formData.get('neighborhood') as string
    const instagram = formData.get('instagram') as string
    const facebook = formData.get('facebook') as string
    const tiktok = formData.get('tiktok') as string
    const youtube = formData.get('youtube') as string
    const brandColor = formData.get('brand_color') as string || '#10b981'
    const headerTextColor = formData.get('header_text_color') as string || '#ffffff'
    const fontFamily = formData.get('font_family') as string || 'Outfit'
    
    // Parse schedule
    let schedule = null
    const scheduleRaw = formData.get('schedule') as string
    if (scheduleRaw) {
      try {
        schedule = JSON.parse(scheduleRaw)
      } catch (e) {
        console.error('Error parsing schedule', e)
      }
    }
    
    // Dual Role (Owner as professional)
    const isBookable = formData.get('is_bookable') === 'on'
    const ownerName = formData.get('owner_name') as string
    
    // Update owner profile
    await supabase.from('profiles').update({
      is_bookable: isBookable,
      name: ownerName || (user.email ? user.email.split('@')[0] : 'Admin')
    }).eq('id', user.id)
    
    // Maps
    const address = formData.get('address') as string
    const latitudeRaw = formData.get('latitude') as string
    const longitudeRaw = formData.get('longitude') as string
    
    const latitude = latitudeRaw ? parseFloat(latitudeRaw) : null
    const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null
    
    // Manejo de la subida del logo
    const logoFile = formData.get('logo') as File
    let logoUrl = existingClinic?.logo_url

    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${user.id}-logo-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile)
        
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName)
        logoUrl = publicUrlData.publicUrl
      }
    }

    // Manejo de la subida de la imagen de portada
    const coverFile = formData.get('cover_image') as File
    let coverUrl = existingClinic?.cover_image_url

    if (coverFile && coverFile.size > 0) {
      const fileExt = coverFile.name.split('.').pop()
      const fileName = `${user.id}-cover-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('logos') // Usaremos el mismo bucket de logos para mayor facilidad
        .upload(fileName, coverFile)
        
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName)
        coverUrl = publicUrlData.publicUrl
      }
    }

    const payload = {
      owner_id: user.id,
      name,
      phone,
      slug,
      business_type: businessType,
      slogan,
      instagram_url: instagram,
      facebook_url: facebook,
      tiktok_url: tiktok,
      youtube_url: youtube,
      ...(schedule ? { schedule } : {}),
      logo_url: logoUrl,
      cover_image_url: coverUrl,
      address,
      country,
      state,
      city,
      neighborhood,
      latitude,
      longitude,
      brand_color: brandColor,
      header_text_color: headerTextColor,
      font_family: fontFamily
    }

    if (existingClinic?.id) {
      await supabase.from('clinics').update(payload).eq('id', existingClinic.id)
    } else {
      // Al crear la clínica, dar 14 días de prueba
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)
      await supabase.from('clinics').insert([{
        ...payload,
        subscription_status: 'trial',
        subscription_ends_at: trialEndsAt.toISOString()
      }])
    }

    revalidatePath('/dashboard/settings')
    revalidatePath(`/${slug}`)
  }

  return (
    <div>
      {/* Google Maps cargado solo donde se necesita (autocompletado de dirección) */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <h1 className="text-2xl font-semibold mb-6">
        {profile?.role === 'staff'
          ? 'Mi Perfil Profesional'
          : (clinic ? 'Edición de mi Perfil' : 'Creación del Perfil de mi Negocio')}
      </h1>

      <div className="bg-white border rounded-lg p-6 max-w-2xl shadow-sm">
        <Suspense fallback={<div>Cargando...</div>}>
          <SettingsForm clinic={clinic} profile={profile} saveAction={saveSettings} />
        </Suspense>
      </div>
    </div>
  )
}
