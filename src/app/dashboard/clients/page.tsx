import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { HeartHandshake, CircleAlert, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

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

  const getRetentionStatus = (lastVisitISO: string) => {
    const lastVisit = parseISO(lastVisitISO)
    const diffDays = (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays <= 30) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'Cliente Frecuente (Activo)',
        icon: <CheckCircle2 className="w-4 h-4" />
      }
    } else if (diffDays <= 60) {
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        text: 'Riesgo (Hace > 1 Mes)',
        icon: <AlertTriangle className="w-4 h-4" />
      }
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'Perdido (Hace > 2 Meses)',
        icon: <CircleAlert className="w-4 h-4" />
      }
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-black tracking-tighter">Clientes (CRM)</h1>
        <p className="text-gray-500 mt-2">Retén a tus clientes. Usa el semáforo para saber a quién deberías volver a contactar.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <HeartHandshake className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-bold">Listado de Clientes y Retención</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Último Servicio</th>
                <th className="p-4 font-semibold">Atendido por</th>
                <th className="p-4 font-semibold">Hace Cuánto</th>
                <th className="p-4 font-semibold">Semáforo de Retención</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Aún no hay clientes registrados en las citas.
                  </td>
                </tr>
              ) : (
                clients.map((client, i) => {
                  const status = getRetentionStatus(client.lastVisit)
                  
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.phone} • {client.email}</p>
                      </td>
                      <td className="p-4 text-gray-900 font-medium">{client.lastService}</td>
                      <td className="p-4 text-gray-600">{client.lastStaff}</td>
                      <td className="p-4 text-sm text-gray-500 capitalize">
                        {formatDistanceToNow(parseISO(client.lastVisit), { addSuffix: true, locale: es })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.bgColor} ${status.color}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
