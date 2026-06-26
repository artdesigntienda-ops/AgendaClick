import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CopyButton } from './CopyButton'

export default async function StaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get clinic info
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!clinic) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Equipo</h1>
        <p>Debes configurar tu clínica primero.</p>
      </div>
    )
  }

  // Get staff members
  const { data: staff } = await supabase
    .from('profiles')
    .select('id, name, email, google_calendar_id, role')
    .eq('clinic_id', clinic.id)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const inviteLink = `${baseUrl}/registro?invite=${clinic.id}`

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Equipo de Trabajo</h1>
      <p className="text-gray-500 mb-8">Administra los profesionales de tu estética.</p>

      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-2">Invitar Empleado</h2>
        <p className="text-sm text-gray-500 mb-4">
          Comparte este enlace con tus empleados. Al registrarse, quedarán vinculados automáticamente a <b>{clinic.name}</b>.
        </p>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            readOnly 
            value={inviteLink}
            className="flex-1 bg-gray-50 border rounded-md px-3 py-2 text-sm text-gray-600 outline-none"
          />
          <CopyButton text={inviteLink} />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-900">Nombre</th>
              <th className="px-6 py-3 font-medium text-gray-900">Email</th>
              <th className="px-6 py-3 font-medium text-gray-900">Rol</th>
              <th className="px-6 py-3 font-medium text-gray-900">Calendario</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff?.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{member.name || 'Sin nombre'}</td>
                <td className="px-6 py-4 text-gray-500">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {member.role === 'owner' ? 'Dueño' : 'Empleado'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {member.google_calendar_id ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Conectado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                      Sin Conectar
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {(!staff || staff.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay nadie en el equipo aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
