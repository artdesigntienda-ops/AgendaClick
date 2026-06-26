import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Scissors, Settings, LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar si tiene clínica
  const { data: clinic } = await supabase
    .from('clinics')
    .select('name, slug')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar minimalista */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold tracking-tight">AgendaClick</h2>
          <p className="text-sm text-gray-500 truncate mt-1">
            {clinic?.name || 'Mi Negocio'}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-900">
            <Calendar className="w-4 h-4" />
            Citas
          </Link>
          <Link href="/dashboard/services" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-900">
            <Scissors className="w-4 h-4" />
            Servicios
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-900">
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
        </nav>
        <div className="p-4 border-t">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-red-600">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
