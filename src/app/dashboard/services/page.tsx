import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  let services: any[] = []
  if (clinic) {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false })
    services = data || []
  }

  async function addService(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', user?.id)
      .single()

    if (!clinic) return

    await supabase.from('services').insert({
      clinic_id: clinic.id,
      name: formData.get('name'),
      duration_minutes: parseInt(formData.get('duration') as string),
      price: parseFloat(formData.get('price') as string)
    })

    revalidatePath('/dashboard/services')
  }

  async function deleteService(formData: FormData) {
    'use server'
    const id = formData.get('id')
    const supabase = await createClient()
    await supabase.from('services').delete().eq('id', id)
    revalidatePath('/dashboard/services')
  }

  if (!clinic) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
        Por favor, configura tu negocio primero en la pestaña de Configuración.
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Servicios</h1>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Añadir Nuevo Servicio</h2>
        <form action={addService} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input name="name" required placeholder="Ej. Consulta General" className="w-full border rounded-md px-3 py-2" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
            <input type="number" name="duration" required defaultValue={30} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input type="number" name="price" required defaultValue={0} className="w-full border rounded-md px-3 py-2" />
          </div>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-md">
            Añadir
          </button>
        </form>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-3 font-medium text-gray-500">Duración</th>
              <th className="px-6 py-3 font-medium text-gray-500">Precio</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 font-medium">{service.name}</td>
                <td className="px-6 py-4">{service.duration_minutes} min</td>
                <td className="px-6 py-4">${service.price}</td>
                <td className="px-6 py-4 text-right">
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
                    <button type="submit" className="text-red-600 hover:text-red-800">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No has añadido ningún servicio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
