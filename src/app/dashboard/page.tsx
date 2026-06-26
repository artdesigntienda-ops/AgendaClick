import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Obtener negocio
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  let appointments = []
  
  if (clinic) {
    const { data } = await supabase
      .from('appointments')
      .select('*, services(name, duration_minutes)')
      .eq('clinic_id', clinic.id)
      .order('start_time', { ascending: true })
      
    appointments = data || []
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Mis Citas</h1>
      
      {!clinic ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
          Por favor, completa la configuración de tu negocio en la pestaña de Configuración.
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <p className="text-gray-500">No tienes citas agendadas aún.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Fecha y Hora</th>
                <th className="px-6 py-3 font-medium text-gray-500">Cliente</th>
                <th className="px-6 py-3 font-medium text-gray-500">Servicio</th>
                <th className="px-6 py-3 font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td className="px-6 py-4">
                    {format(new Date(apt.start_time), "dd MMM yyyy, HH:mm", { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{apt.client_name}</div>
                    <div className="text-gray-500 text-xs">{apt.client_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {apt.services?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
