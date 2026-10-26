import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireActiveSubscription } from '@/utils/billingGuard'

export default async function ServicesPage() {
  await requireActiveSubscription()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', user?.id)
    .maybeSingle()

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
      .maybeSingle()

    if (!clinic) return

    const name = (formData.get('name') as string)?.trim()
    const duration = parseInt(formData.get('duration') as string) || 30
    const price = parseFloat(formData.get('price') as string) || 0

    if (!name) return

    const { error: insertErr } = await supabase.from('services').insert({
      clinic_id: clinic.id,
      name,
      duration_minutes: duration,
      price
    })

    if (insertErr) {
      console.error('Error adding service:', insertErr)
    }

    revalidatePath('/dashboard/services')
  }

  async function deleteService(formData: FormData) {
    'use server'
    const id = formData.get('id')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!clinic) return

    await supabase.from('services').delete().eq('id', id).eq('clinic_id', clinic.id)
    revalidatePath('/dashboard/services')
  }

  async function addTemplateServices(formData: FormData) {
    'use server'
    const category = formData.get('category') as string
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!clinic) return

    const templates: Record<string, Array<{ name: string, price: number, duration_minutes: number }>> = {
      barberia: [
        { name: 'Corte Clásico', price: 25000, duration_minutes: 40 },
        { name: 'Arreglo de Barba / Perfilado', price: 18000, duration_minutes: 25 },
        { name: 'Combo Corte + Barba', price: 38000, duration_minutes: 60 }
      ],
      estetica: [
        { name: 'Manicura Semipermanente', price: 40000, duration_minutes: 75 },
        { name: 'Pedicura Spa', price: 35000, duration_minutes: 60 },
        { name: 'Combo Manicura + Pedicura', price: 65000, duration_minutes: 120 }
      ],
      peluqueria: [
        { name: 'Corte Dama / Cepillado', price: 35000, duration_minutes: 50 },
        { name: 'Cepillado y Planchado', price: 25000, duration_minutes: 40 },
        { name: 'Hidratación Profunda', price: 50000, duration_minutes: 60 }
      ],
      spa: [
        { name: 'Masaje Relajante Completo', price: 80000, duration_minutes: 60 },
        { name: 'Limpieza Facial Profunda', price: 70000, duration_minutes: 60 },
        { name: 'Exfoliación Corporal', price: 75000, duration_minutes: 50 }
      ]
    }

    const list = templates[category]
    if (list) {
      const rows = list.map(s => ({
        clinic_id: clinic.id,
        name: s.name,
        price: s.price,
        duration_minutes: s.duration_minutes
      }))
      await supabase.from('services').insert(rows)
      revalidatePath('/dashboard/services')
      revalidatePath('/dashboard')
    }
  }

  if (!clinic) {
    return (
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl max-w-lg mx-auto text-center space-y-4 my-8">
        <h2 className="text-xl font-bold text-gray-900">Primero necesitamos crear tu negocio</h2>
        <p className="text-sm text-gray-600">
          Para añadir servicios, primero asigna el nombre y teléfono de tu negocio en la sección de configuración.
        </p>
        <a 
          href="/dashboard/settings" 
          className="inline-block bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
        >
          Ir a Configurar mi Negocio
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Servicios</h1>
      </div>

      {services.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
              ✨ Inicio Rápido
            </div>
            <h3 className="text-base font-bold text-gray-900">¿Quieres cargar servicios típicos en 1 clic?</h3>
            <p className="text-xs text-gray-600">Elige tu categoría y precargaremos los 3 servicios más comunes con sus precios estándar. Luego podrás cambiarles el precio cuando quieras:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: 'barberia', title: 'Barbería', icon: '💈', desc: 'Corte, Barba, Combo' },
              { id: 'estetica', title: 'Uñas y Pestañas', icon: '💅', desc: 'Semipermanente, Pedicura, Combo' },
              { id: 'peluqueria', title: 'Peluquería', icon: '💇', desc: 'Corte, Cepillado, Hidratación' },
              { id: 'spa', title: 'Spa y Masajes', icon: '🧖', desc: 'Relajante, Facial, Exfoliación' },
            ].map(tpl => (
              <form key={tpl.id} action={addTemplateServices}>
                <input type="hidden" name="category" value={tpl.id} />
                <button
                  type="submit"
                  className="w-full p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between h-full cursor-pointer group"
                >
                  <div>
                    <span className="text-2xl">{tpl.icon}</span>
                    <h4 className="font-bold text-sm text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{tpl.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{tpl.desc}</p>
                  </div>
                  <span className="mt-3 text-xs font-bold text-blue-600 inline-block">+ Cargar estos 3</span>
                </button>
              </form>
            ))}
          </div>

          <div className="pt-2 border-t border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs text-gray-500">¿Prefieres que te los configuremos nosotros gratis?</span>
            <a
              href="https://wa.me/573239306599?text=Hola%2C%20tengo%20una%20lista%20de%20servicios%20y%20precios%20para%20que%20me%20ayuden%20a%20configurarla%20en%20AgendaClick"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-green-700 hover:underline inline-flex items-center gap-1"
            >
              Envíanos una foto por WhatsApp
            </a>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Añadir Nuevo Servicio</h2>
        <form action={addService} className="flex flex-col gap-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input name="name" required placeholder="Ej. Consulta General" className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
              <input type="number" name="duration" required defaultValue={30} className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" name="price" required defaultValue={0} className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción y Notas</label>
            <textarea name="description" rows={2} placeholder="Ej. El precio puede variar según el largo del cabello." className="w-full border rounded-md px-3 py-2 focus:ring-black focus:border-black"></textarea>
          </div>
          <div className="flex justify-end mt-2">
            <button type="submit" className="bg-black text-white border-2 border-black px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-black transition-colors duration-300">
              Añadir Servicio
            </button>
          </div>
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
                <td className="px-6 py-4">
                  <p className="font-medium">{service.name}</p>
                  {service.description && <p className="text-xs text-gray-500 mt-1 max-w-xs">{service.description}</p>}
                </td>
                <td className="px-6 py-4">{service.duration_minutes} min</td>
                <td className="px-6 py-4">${service.price}</td>
                <td className="px-6 py-4 text-right">
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
                    <button type="submit" className="text-red-600 hover:text-red-800 font-bold">Eliminar</button>
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
