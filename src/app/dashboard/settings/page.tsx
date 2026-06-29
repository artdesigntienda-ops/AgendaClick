import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
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
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  async function saveSettings(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existingClinic } = await supabase
      .from('clinics')
      .select('id, logo_url')
      .eq('owner_id', user.id)
      .single()

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
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile)
        
      if (!uploadError) {
        // Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName)
        logoUrl = publicUrlData.publicUrl
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
      logo_url: logoUrl,
      address,
      country,
      state,
      city,
      neighborhood,
      latitude,
      longitude
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
      <h1 className="text-2xl font-semibold mb-6">
        {clinic ? 'Edición de mi Perfil' : 'Creación del Perfil de mi Negocio'}
      </h1>

      <div className="bg-white border rounded-lg p-6 max-w-2xl shadow-sm">
        <Suspense fallback={<div>Cargando...</div>}>
          <SettingsForm clinic={clinic} profile={profile} saveAction={saveSettings} />
        </Suspense>
      </div>
    </div>
  )
}
