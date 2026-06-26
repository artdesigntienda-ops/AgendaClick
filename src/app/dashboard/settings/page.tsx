import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('owner_id', user?.id)
    .single()

  async function saveSettings(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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
    
    // Maps
    const address = formData.get('address') as string
    const latitudeRaw = formData.get('latitude') as string
    const longitudeRaw = formData.get('longitude') as string
    
    const latitude = latitudeRaw ? parseFloat(latitudeRaw) : null
    const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null
    
    // Manejo de la subida del logo
    const logoFile = formData.get('logo') as File
    let logoUrl = clinic?.logo_url

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

    await supabase.from('clinics').upsert({
      id: clinic?.id, 
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
    }, { onConflict: 'owner_id' })

    revalidatePath('/dashboard/settings')
    revalidatePath(`/${slug}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Configuración del Negocio</h1>

      <div className="bg-white border rounded-lg p-6 max-w-2xl shadow-sm">
        <SettingsForm clinic={clinic} saveAction={saveSettings} />
      </div>
    </div>
  )
}
