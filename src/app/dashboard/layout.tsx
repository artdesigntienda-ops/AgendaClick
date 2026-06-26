import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Scissors, Settings, LogOut, Users } from 'lucide-react'
import { AutoLogout } from './AutoLogout'

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
    <div className="flex h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <AutoLogout />
      
      {/* Sidebar Ultra Minimalista */}
      <aside className="w-64 bg-white border-r border-black/10 flex flex-col">
        <div className="p-6 border-b border-black/10">
          <img src="/full-logo.png" alt="AgendaClick Logo" className="h-12 object-contain mb-3" />
          <p className="text-xs text-black/50 truncate tracking-wider uppercase">
            {clinic?.name || 'Mi Negocio'}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="animate-fade-in-right delay-100 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Calendar className="w-4 h-4" />
            Agenda Maestra
          </Link>
          <Link href="/dashboard/services" className="animate-fade-in-right delay-200 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Scissors className="w-4 h-4" />
            Servicios
          </Link>
          <Link href="/dashboard/staff" className="animate-fade-in-right delay-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Users className="w-4 h-4" />
            Staff & Equipo
          </Link>
          <Link href="/dashboard/settings" className="animate-fade-in-right delay-400 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
        </nav>
        <div className="p-4 border-t border-black/10 animate-fade-in-right delay-500">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-none hover:bg-red-600 hover:text-white transition-colors duration-200">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  )
}
