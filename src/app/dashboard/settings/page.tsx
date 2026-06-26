import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import AddressAutocomplete from '@/components/AddressAutocomplete'

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
      latitude,
      longitude
    }, { onConflict: 'owner_id' })

    revalidatePath('/dashboard/settings')
    revalidatePath(`/${slug}`)
  }

  const AMOUNT_IN_CENTS = "5000000" 
  const currentTimestamp = Date.now()
  const wompiReference = `SUB_${clinic?.id}_${currentTimestamp}`

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Configuración del Negocio</h1>

      <div className="bg-white border rounded-lg p-6 max-w-2xl shadow-sm">
        <form action={saveSettings} className="space-y-6">
          
          <div className="border-b pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Identidad de Marca</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo (Cuadrado o Circular recomendado)</label>
                <div className="flex items-center gap-4">
                  {clinic?.logo_url && (
                    <img src={clinic.logo_url} alt="Logo" className="w-16 h-16 rounded-full object-cover border" />
                  )}
                  <input type="file" name="logo" accept="image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slogan o Descripción Corta</label>
                <input 
                  name="slogan" 
                  defaultValue={clinic?.slogan || ''} 
                  placeholder="Ej. Realzando tu belleza natural" 
                  className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" 
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Redes Sociales (Opcional)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Instagram (URL)</label>
                <input name="instagram" defaultValue={clinic?.instagram_url || ''} placeholder="https://instagram.com/..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Facebook (URL)</label>
                <input name="facebook" defaultValue={clinic?.facebook_url || ''} placeholder="https://facebook.com/..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">TikTok (URL)</label>
                <input name="tiktok" defaultValue={clinic?.tiktok_url || ''} placeholder="https://tiktok.com/@..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">YouTube (URL)</label>
                <input name="youtube" defaultValue={clinic?.youtube_url || ''} placeholder="https://youtube.com/..." className="w-full border rounded-md px-3 py-2 text-sm focus:ring-black focus:border-black" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Datos Principales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                <input name="name" required defaultValue={clinic?.name || ''} placeholder="Ej. Centro Médico Vida" className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Pública</label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">agendaclick.com/</span>
                  <input name="slug" required defaultValue={clinic?.slug || ''} placeholder="centro-vida" className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-black focus:border-black" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select name="business_type" defaultValue={clinic?.business_type || 'belleza'} className="w-full border rounded-md px-3 py-2 bg-white focus:ring-black focus:border-black">
                  <option value="belleza">Estética y Belleza</option>
                  <option value="salud">Salud</option>
                  <option value="bienestar">Bienestar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Notificaciones)</label>
                <input name="phone" required defaultValue={clinic?.phone || ''} placeholder="+57300..." className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección del Negocio</label>
                <AddressAutocomplete 
                  defaultAddress={clinic?.address || ''} 
                  defaultLat={clinic?.latitude || ''}
                  defaultLng={clinic?.longitude || ''}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button type="submit" className="bg-black hover:bg-gray-800 transition-colors text-white px-6 py-2 rounded-lg font-medium w-full sm:w-auto">
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
