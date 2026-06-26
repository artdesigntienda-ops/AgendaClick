import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

    // UPSERT: Si existe actualiza, sino crea
    await supabase.from('clinics').upsert({
      id: clinic?.id, // undefined en el primer guardado, genera UUID automático
      owner_id: user.id,
      name,
      phone,
      slug,
      business_type: businessType
    }, { onConflict: 'owner_id' })

    revalidatePath('/dashboard/settings')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Configuración del Negocio</h1>

      <div className="bg-white border rounded-lg p-6 max-w-2xl">
        <form action={saveSettings} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
            <input 
              name="name" 
              required 
              defaultValue={clinic?.name || ''} 
              placeholder="Ej. Centro Médico Vida" 
              className="w-full border rounded-md px-3 py-2" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Pública (Enlace para tus clientes)</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                agendaclick.com/
              </span>
              <input 
                name="slug" 
                required 
                defaultValue={clinic?.slug || ''} 
                placeholder="centro-vida" 
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300" 
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Usa letras minúsculas y guiones. Ej: centro-vida</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría del Negocio</label>
            <select 
              name="business_type" 
              defaultValue={clinic?.business_type || 'belleza'}
              className="w-full border rounded-md px-3 py-2 bg-white"
            >
              <option value="belleza">Estética y Belleza (Spas, Salones, Barberías)</option>
              <option value="salud">Salud (Clínicas, Consultas, Psicólogos)</option>
              <option value="bienestar">Bienestar (Nutrición, Yoga, Fitness)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de WhatsApp (Para notificaciones)</label>
            <input 
              name="phone" 
              required 
              defaultValue={clinic?.phone || ''} 
              placeholder="+573001234567" 
              className="w-full border rounded-md px-3 py-2" 
            />
            <p className="mt-1 text-xs text-gray-500">Incluye el código de país. A este número se redirigirá a los clientes.</p>
          </div>

          <div className="pt-4 border-t">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-md font-medium w-full sm:w-auto">
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
