'use client'

import { useState } from 'react'
import { LogOut, HelpCircle, Coffee, PlayCircle, Menu } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function TopNavbar({ profile }: { profile?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [isOnBreak, setIsOnBreak] = useState(profile?.is_on_break || false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleMobileSidebar = () => {
    document.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }

  const toggleBreak = async () => {
    if (!profile?.id) return
    const newStatus = !isOnBreak
    setIsOnBreak(newStatus)
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_on_break: newStatus })
      .eq('id', profile.id)

    if (error) {
      setIsOnBreak(!newStatus) // revertir si falla
      toast.error('Error al actualizar estado')
    } else {
      toast.success(newStatus ? '¡Estás en un descanso! Tu agenda temporalmente pausada.' : '¡De vuelta al trabajo! Tu agenda está activa.')
    }
  }

  const startTour = () => {
    document.dispatchEvent(new CustomEvent('start-tour'))
  }

  return (
    <header className="h-16 bg-white border-b border-black/10 flex items-center justify-between px-3 sm:px-4 md:px-8 z-30 shrink-0 shadow-xs relative">
      {/* Izquierda: Hamburguesa en móvil + Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 -ml-1 text-gray-800 hover:text-black hover:bg-gray-100 rounded-xl transition-colors focus:outline-none cursor-pointer"
          aria-label="Abrir Menú de Navegación"
          title="Menú"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <Link href="/dashboard" className="flex items-center">
          <img src="/full-logo.png" alt="AgendaClick Logo" className="h-7 sm:h-8 md:h-10 object-contain" />
        </Link>
      </div>

      {/* Derecha: Botones de Acción (Visibles tanto en Móvil como en Desktop) */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {/* Tomar un Descanso */}
        {profile && (profile.role === 'staff' || profile.is_bookable) && (
          <button
            onClick={toggleBreak}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              isOnBreak 
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-inner' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
            title={isOnBreak ? 'Estás en descanso (Agenda pausada)' : 'Tomar un descanso (Pausa tu agenda)'}
          >
            <Coffee className={`w-4 h-4 ${isOnBreak ? 'text-amber-700 animate-pulse' : 'text-gray-600'}`} />
            <span className="hidden md:inline font-semibold">{isOnBreak ? 'En Descanso' : 'Tomar un Descanso'}</span>
          </button>
        )}

        {/* Tutorial AgendaClick */}
        <button 
          onClick={startTour}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black border border-gray-200 rounded-full transition-all shadow-2xs shrink-0 cursor-pointer"
          title="Iniciar Tutorial Guiado de AgendaClick"
        >
          <PlayCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline font-medium">Tutorial AgendaClick</span>
          <span className="sm:hidden text-[11px] font-semibold">Tutorial</span>
        </button>

        {/* Soporte WhatsApp */}
        <a 
          href="https://wa.me/573239306599" 
          target="_blank"
          rel="noreferrer"
          className="p-1.5 sm:p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          title="Soporte técnico por WhatsApp (+57 323 9306599)"
        >
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </a>

        <div className="w-px h-5 sm:h-6 bg-gray-200 mx-0.5 sm:mx-1"></div>

        {/* Cerrar Sesión / Salir */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0 cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden md:inline text-xs sm:text-sm font-bold">Salir</span>
        </button>
      </div>
    </header>
  )
}
