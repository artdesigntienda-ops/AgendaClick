import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, Users, Wallet } from 'lucide-react'

export default async function FinancesPage() {
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

  // Obtener todas las citas que ya pasaron o están pagadas
  // Por ahora traemos todas para la demostración
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      total_price,
      commission_earned,
      status,
      staff_id,
      profiles:staff_id ( name, role )
    `)
    .eq('clinic_id', clinic.id)
    .neq('status', 'cancelled')

  // Cálculos Financieros
  let ownerPersonalIncome = 0
  let commissionsFromStaff = 0

  const staffBreakdown: Record<string, { name: string, totalGenerated: number, commissionKept: number, businessCut: number }> = {}

  if (appointments) {
    appointments.forEach(app => {
      const price = app.total_price || 0
      const commission = app.commission_earned || 0
      // @ts-ignore
      const staffName = app.profiles?.name || 'Desconocido'
      // @ts-ignore
      const isOwner = app.profiles?.role === 'owner'
      const staffIdStr = app.staff_id || 'unknown'

      if (isOwner) {
        ownerPersonalIncome += price
      } else {
        // commission_earned es lo que el PROFESIONAL gana.
        // Lo que el negocio retiene es: price - commission
        const businessCut = price - commission
        commissionsFromStaff += businessCut

        if (!staffBreakdown[staffIdStr]) {
          staffBreakdown[staffIdStr] = { name: staffName, totalGenerated: 0, commissionKept: 0, businessCut: 0 }
        }
        staffBreakdown[staffIdStr].totalGenerated += price
        staffBreakdown[staffIdStr].commissionKept += commission
        staffBreakdown[staffIdStr].businessCut += businessCut
      }
    })
  }

  const totalBusinessIncome = ownerPersonalIncome + commissionsFromStaff

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-black tracking-tighter">Finanzas</h1>
        <p className="text-gray-500 mt-2">Resumen de ingresos, trabajo personal y comisiones de tu equipo.</p>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-white/10">
            <Wallet className="w-32 h-32" />
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-2">Ingreso Total Negocio</p>
          <p className="text-4xl font-black">${totalBusinessIncome.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-4 border-t border-white/20 pt-2">Tu trabajo + Comisiones de otros</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Tu Trabajo Personal</p>
          </div>
          <p className="text-3xl font-bold">${ownerPersonalIncome.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-4">100% íntegro para el dueño</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Comisiones (De Equipo)</p>
          </div>
          <p className="text-3xl font-bold">${commissionsFromStaff.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-4">La porción que retiene el local</p>
        </div>
      </div>

      {/* Desglose por Profesional */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Desglose por Profesional</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                <th className="p-4 font-semibold">Profesional</th>
                <th className="p-4 font-semibold">Total Generado</th>
                <th className="p-4 font-semibold">Pago al Profesional</th>
                <th className="p-4 font-semibold">Ganancia del Local</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.values(staffBreakdown).length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay registros de citas de profesionales aún.
                  </td>
                </tr>
              ) : (
                Object.values(staffBreakdown).map((staff, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{staff.name}</td>
                    <td className="p-4 text-gray-900">${staff.totalGenerated.toFixed(2)}</td>
                    <td className="p-4 text-gray-500">${staff.commissionKept.toFixed(2)}</td>
                    <td className="p-4 text-green-600 font-bold">+${staff.businessCut.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
