import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
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

  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  let clinic = null
  let clinicId = profile?.clinic_id

  if (clinicId) {
    const { data } = await adminClient
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .maybeSingle()
    clinic = data
  }

  if (!clinic) {
    const { data } = await adminClient
      .from('clinics')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    clinic = data
  }

  async function saveSettings(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, role, clinic_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'staff') {
      const staffName = formData.get('staff_name') as string
      if (staffName) {
        await adminClient
          .from('profiles')
          .update({ name: staffName })
          .eq('id', user.id)
      }
      revalidatePath('/dashboard/settings')
      revalidatePath('/dashboard/staff')
      return
    }

    let clinicId = profile?.clinic_id
    let existingClinic = null

    if (clinicId) {
      const { data } = await adminClient
        .from('clinics')
        .select('id, logo_url, cover_image_url, schedule, slug')
        .eq('id', clinicId)
        .maybeSingle()
      existingClinic = data
    }

    if (!existingClinic) {
      const { data } = await adminClient
        .from('clinics')
        .select('id, logo_url, cover_image_url, schedule, slug')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      existingClinic = data
      if (existingClinic) clinicId = existingClinic.id
    }

    const name = (formData.get('name') as string)?.trim() || 'Mi Negocio'
    const phone = formData.get('phone') as string
    const rawSlug = formData.get('slug') as string

    // Sanitización y validación de slug contra rutas del sistema
    const RESERVED_SLUGS = ['api', 'dashboard', 'login', 'cancelar', 'socios', 'privacidad', 'terminos', 'docs', 'documentacion', 'auth', 'admin']
    let baseSlug = rawSlug
      ? rawSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : (name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'mi-negocio')

    if (RESERVED_SLUGS.includes(baseSlug)) {
      baseSlug = `${baseSlug}-app`
    }

    // Verificar unicidad del slug en clinics
    let slug = baseSlug
    let counter = 1
    while (true) {
      const { data: slugExisting } = await adminClient
        .from('clinics')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (!slugExisting || slugExisting.id === existingClinic?.id) {
        break
      }
      counter++
      slug = `${baseSlug}-${counter}`
    }
    const businessType = formData.get('business_type') as string
    const slogan = formData.get('slogan') as string
    const country = formData.get('country') as string
    const state = formData.get('state') as string
    const city = formData.get('city') as string
    const neighborhood = formData.get('neighborhood') as string

    const hasSocialMedia = formData.get('has_social_media') !== 'false'
    const instagram = hasSocialMedia ? ((formData.get('instagram') as string)?.trim() || null) : null
    const facebook = hasSocialMedia ? ((formData.get('facebook') as string)?.trim() || null) : null
    const tiktok = hasSocialMedia ? ((formData.get('tiktok') as string)?.trim() || null) : null
    const youtube = hasSocialMedia ? ((formData.get('youtube') as string)?.trim() || null) : null

    const brandColor = formData.get('brand_color') as string || '#10b981'
    const headerTextColor = formData.get('header_text_color') as string || '#ffffff'
    const fontFamily = formData.get('font_family') as string || 'Outfit'
    const sidebarColor = formData.get('sidebar_color') as string || '#111827'
    const sidebarTextColor = formData.get('sidebar_text_color') as string || '#9ca3af'
    const dashboardAccentColor = formData.get('dashboard_accent_color') as string || '#10b981'
    const bookingBgColor = formData.get('booking_bg_color') as string || '#f9fafb'
    const bookingTextColor = formData.get('booking_text_color') as string || '#111827'
    const bookingCardColor = formData.get('booking_card_color') as string || '#ffffff'
    
    // Parse schedule
    let schedule: any = null
    const scheduleRaw = formData.get('schedule') as string
    if (scheduleRaw) {
      try {
        schedule = JSON.parse(scheduleRaw)
      } catch (e) {
        console.error('Error parsing schedule', e)
      }
    }

    // Vehicle brands for automotive segments
    const vehicleBrandsRaw = formData.get('vehicle_brands') as string
    if (vehicleBrandsRaw) {
      try {
        const parsedBrands = JSON.parse(vehicleBrandsRaw)
        schedule = schedule || (existingClinic?.schedule as any) || {}
        schedule.vehicle_brands = parsedBrands
      } catch (e) {
        console.error('Error parsing vehicle_brands', e)
      }
    }

    // Legal information, Terms and Habeas Data
    const isFormalizedRaw = formData.get('is_formalized') as string
    const isFormalized = isFormalizedRaw === 'true'
    const hasWebsiteRaw = formData.get('has_website') as string
    const hasWebsite = hasWebsiteRaw === 'true'

    const legalBusinessName = formData.get('legal_business_name') as string
    const legalNit = formData.get('legal_nit') as string
    const responsibleName = formData.get('responsible_name') as string
    const responsibleId = formData.get('responsible_id') as string

    const legalTermsUrl = formData.get('legal_terms_url') as string
    const legalPrivacyUrl = formData.get('legal_privacy_url') as string
    const legalCustomTermsText = formData.get('legal_custom_terms_text') as string
    const legalDataPolicy = formData.get('legal_data_policy') as string

    schedule = schedule || (existingClinic?.schedule as any) || {}
    schedule.legal = {
      is_formalized: isFormalized,
      has_website: hasWebsite,
      business_legal_name: isFormalized ? (legalBusinessName?.trim() || null) : null,
      nit: isFormalized ? (legalNit?.trim() || null) : null,
      responsible_name: !isFormalized ? (responsibleName?.trim() || null) : null,
      responsible_id: !isFormalized ? (responsibleId?.trim() || null) : null,
      terms_url: (isFormalized && hasWebsite) ? (legalTermsUrl?.trim() || null) : null,
      privacy_url: (isFormalized && hasWebsite) ? (legalPrivacyUrl?.trim() || null) : null,
      custom_terms_text: legalCustomTermsText?.trim() || null,
      data_treatment_policy: legalDataPolicy?.trim() || null,
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
    
    // Manejo seguro de la subida del logo (Validación de tipo MIME y tamaño máx 3MB)
    const ALLOWED_MIME_TYPES: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    }
    const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB

    const hasLogo = formData.get('has_logo') !== 'false'
    const logoFile = formData.get('logo') as File
    let logoUrl = hasLogo ? existingClinic?.logo_url : null

    if (hasLogo && logoFile && logoFile.size > 0 && logoFile.size <= MAX_FILE_SIZE) {
      const ext = ALLOWED_MIME_TYPES[logoFile.type]
      if (ext) {
        const fileName = `${user.id}-logo-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { contentType: logoFile.type, upsert: true })
          
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName)
          logoUrl = publicUrlData.publicUrl
        }
      }
    }

    // Manejo seguro de la subida de la imagen de portada
    const hasCover = formData.get('has_cover') !== 'false'
    const coverFile = formData.get('cover_image') as File
    let coverUrl = hasCover ? existingClinic?.cover_image_url : null

    if (hasCover && coverFile && coverFile.size > 0 && coverFile.size <= MAX_FILE_SIZE) {
      const ext = ALLOWED_MIME_TYPES[coverFile.type]
      if (ext) {
        const fileName = `${user.id}-cover-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, coverFile, { contentType: coverFile.type, upsert: true })
          
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName)
          coverUrl = publicUrlData.publicUrl
        }
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
      font_family: fontFamily,
      sidebar_color: sidebarColor,
      sidebar_text_color: sidebarTextColor,
      dashboard_accent_color: dashboardAccentColor,
      booking_bg_color: bookingBgColor,
      booking_text_color: bookingTextColor,
      booking_card_color: bookingCardColor
    }

    if (existingClinic?.id) {
      const { error: updateErr } = await adminClient
        .from('clinics')
        .update(payload)
        .eq('id', existingClinic.id)

      if (updateErr) {
        console.error('Error updating clinic in settings:', updateErr)
        throw new Error(updateErr.message)
      }
    } else {
      // Al crear la clínica, dar 14 días de prueba
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)
      const { data: newClinic, error: insertErr } = await adminClient
        .from('clinics')
        .insert([{
          ...payload,
          plan_type: 'independiente',
          staff_limit: 1,
          subscription_status: 'trial',
          subscription_ends_at: trialEndsAt.toISOString()
        }])
        .select('id')
        .single()

      if (insertErr || !newClinic) {
        console.error('Error inserting clinic in settings:', insertErr)
        throw new Error(insertErr?.message || 'Error al crear el negocio')
      }

      // Vincular siempre la clínica creada al perfil del dueño
      await adminClient
        .from('profiles')
        .update({
          clinic_id: newClinic.id,
          role: 'owner'
        })
        .eq('id', user.id)
    }

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/services')
    revalidatePath(`/${slug}`)
  }

  return (
    <div>
      {/* Google Maps cargado solo donde se necesita (autocompletado de dirección) */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        {profile?.role === 'staff'
          ? 'Mi Perfil Profesional'
          : (clinic ? 'Edición de mi Perfil' : 'Creación del Perfil de mi Negocio')}
      </h1>

      <div className="bg-white border rounded-2xl p-3.5 sm:p-6 max-w-2xl shadow-sm overflow-hidden">
        <Suspense fallback={<div>Cargando...</div>}>
          <SettingsForm clinic={clinic} profile={profile} saveAction={saveSettings} />
        </Suspense>
      </div>
    </div>
  )
}
