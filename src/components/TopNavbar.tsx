'use client'

import { useState } from 'react'
import { LogOut, HelpCircle, Coffee, PlayCircle } from 'lucide-react'
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
    <header className="h-16 bg-white border-b border-black/10 flex items-center justify-between px-4 md:px-8 z-50 shrink-0 shadow-sm relative">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center">
          <img src="/full-logo.png" alt="AgendaClick Logo" className="h-8 md:h-10 object-contain" />
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {profile && (profile.role === 'staff' || profile.is_bookable) && (
          <button
            onClick={toggleBreak}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isOnBreak 
                ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-inner' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span className="hidden md:inline">{isOnBreak ? 'En Descanso' : 'Tomar un Descanso'}</span>
          </button>
        )}

        <button 
          onClick={startTour}
          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
          title="Ver Tutorial"
        >
          <PlayCircle className="w-5 h-5" />
        </button>

        <a 
          href="https://wa.me/573000000000" // Cambiar por número real de soporte
          target="_blank"
          rel="noreferrer"
          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
          title="Soporte técnico"
        >
          <HelpCircle className="w-5 h-5" />
        </a>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline text-sm font-medium">Salir</span>
        </button>
      </div>
    </header>
  )
}
