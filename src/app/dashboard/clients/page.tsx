import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { HeartHandshake } from 'lucide-react'
import ClientsTable from './ClientsTable'

export default async function ClientsCRMPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener clínica del dueño
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!clinic) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Aún no has creado tu perfil</h2>
        <p className="text-gray-500">Ve a Configuración para crear el perfil de tu negocio primero.</p>
      </div>
    )
  }

  // Obtener todas las citas para armar la base de clientes
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      client_name,
      client_email,
      client_phone,
      start_time,
      service_id,
      services:service_id ( name ),
      staff_id,
      profiles:staff_id ( name )
    `)
    .eq('clinic_id', clinic.id)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: false })

  // Procesar para obtener el "último contacto" de cada cliente
  const clientsMap: Record<string, any> = {}

  if (appointments) {
    appointments.forEach(app => {
      // Usamos el email como identificador único de cliente por ahora
      const key = app.client_email?.toLowerCase().trim()
      if (!key) return

      if (!clientsMap[key]) {
        clientsMap[key] = {
          name: app.client_name,
          email: app.client_email,
          phone: app.client_phone,
          lastVisit: app.start_time,
          // @ts-ignore
          lastService: app.services?.name || 'Desconocido',
          // @ts-ignore
          lastStaff: app.profiles?.name || 'Desconocido'
        }
      } else {
        // Como están ordenadas descendente, la primera que encontramos es la más reciente,
        // no necesitamos sobreescribir.
      }
    })
  }

  const clients = Object.values(clientsMap)

      <ClientsTable clients={clients} />
    </div>
  )
}
