'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Settings, LogOut, Users, Menu, X, DollarSign, Copy, CreditCard, Sparkles, Briefcase, PlayCircle, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getSegmentConfig } from '@/lib/segment-icons'

export default function Sidebar({ clinic, role, businessType, themeColors }: { 
  clinic: any, 
  role: 'owner' | 'staff', 
  businessType?: string,
  themeColors?: { sidebarColor?: string, sidebarTextColor?: string, accentColor?: string }
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [domain, setDomain] = useState('agendaclick.com.co')
  const segmentConfig = getSegmentConfig(businessType)

  const sidebarBg = themeColors?.sidebarColor || '#ffffff'
  const sidebarText = themeColors?.sidebarTextColor || '#374151'
  const accentColor = themeColors?.accentColor || '#000000'

  useEffect(() => {
    setDomain(window.location.host)

    const handleToggle = () => setIsOpen(prev => !prev)
    const handleClose = () => setIsOpen(false)
    document.addEventListener('toggle-sidebar', handleToggle)
    document.addEventListener('close-sidebar', handleClose)
    return () => {
      document.removeEventListener('toggle-sidebar', handleToggle)
      document.removeEventListener('close-sidebar', handleClose)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const startTour = () => {
    setIsOpen(false)
    document.dispatchEvent(new CustomEvent('start-tour'))
  }

  return (
    <>
      {/* Backdrop para Móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-2xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-black/10 flex flex-col transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          md:relative md:translate-x-0 md:z-20 md:shadow-none
        `}
        style={{ backgroundColor: sidebarBg, color: sidebarText }}
      >
        <style>{`
          .sidebar-link:hover {
            background-color: ${accentColor} !important;
            color: white !important;
          }
        `}</style>

        {/* Encabezado del menú móvil con botón de cerrar */}
        <div className="flex items-center justify-between p-4 border-b border-black/10 md:hidden bg-gray-50/50">
          <img src="/full-logo.png" alt="AgendaClick Logo" className="h-7 object-contain" />
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            title="Cerrar Menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Negocio Header */}
        <div className="p-6 border-b border-black/10 hidden md:block text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt={clinic.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-sm mb-3" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold mb-3">
                {clinic?.name?.charAt(0) || 'N'}
              </div>
            )}
            <p className="text-sm font-black uppercase tracking-wide">
              {clinic?.name || 'Mi Negocio'}
            </p>
            {clinic?.slogan && (
              <p className="text-xs opacity-60 mt-1 italic">
                {clinic.slogan}
              </p>
            )}
          </div>

          {clinic?.slug && (
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl shadow-sm text-left">
              <p className="text-xs text-blue-900 font-medium leading-tight">Enlace para clientes:</p>
              <div className="flex items-center gap-1.5 mt-2">
                <a href={`/${clinic.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-[11px] font-mono text-blue-700 bg-white px-2 py-1.5 border border-blue-200 rounded-lg truncate hover:border-blue-400 transition-colors">
                  {domain}/{clinic.slug}
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${clinic.slug}`)
                    toast.success('¡Enlace copiado!')
                  }} 
                  className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                  title="Copiar enlace"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile Negocio Info */}
        <div className="p-4 border-b border-black/10 md:hidden text-center">
          <div className="flex flex-col items-center justify-center mb-3">
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt={clinic.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm mb-2" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-bold mb-2">
                {clinic?.name?.charAt(0) || 'N'}
              </div>
            )}
            <p className="text-xs font-black uppercase tracking-wide">
              {clinic?.name || 'Mi Negocio'}
            </p>
          </div>

          {clinic?.slug && (
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl shadow-2xs text-left">
              <p className="text-[11px] text-blue-900 font-medium leading-tight">Tu enlace para clientes:</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <a href={`/${clinic.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-mono text-blue-700 bg-white px-2 py-1 border border-blue-200 rounded-lg truncate">
                  {domain}/{clinic.slug}
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${clinic.slug}`)
                    toast.success('¡Enlace copiado!')
                  }} 
                  className="bg-blue-600 text-white p-1 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                  title="Copiar enlace"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link id="tour-settings" onClick={() => setIsOpen(false)} href="/dashboard/settings" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200">
            <Settings className="w-4 h-4" />
            <span>{clinic?.slug ? 'Editar Perfil' : 'Crear Perfil'}</span>
          </Link>
          <Link id="tour-calendar" onClick={() => setIsOpen(false)} href="/dashboard" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200">
            <Calendar className="w-4 h-4" />
            <span>Agenda Maestra</span>
          </Link>
          <Link id="tour-clients" onClick={() => setIsOpen(false)} href="/dashboard/clients" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200">
            <segmentConfig.clientsIcon className="w-4 h-4" />
            <span>{segmentConfig.clientLabel}</span>
          </Link>
          <Link id="tour-finances" onClick={() => setIsOpen(false)} href="/dashboard/finances" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200">
            <DollarSign className="w-4 h-4" />
            <span>Finanzas</span>
          </Link>

          {role === 'owner' && (
            <>
              <Link id="tour-services" onClick={() => setIsOpen(false)} href="/dashboard/services" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200">
                <segmentConfig.servicesIcon className="w-4 h-4" />
                <span>{segmentConfig.serviceLabel}</span>
              </Link>
              <Link id="tour-staff" onClick={() => setIsOpen(false)} href="/dashboard/staff" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200">
                <Users className="w-4 h-4" />
                <span>Profesionales</span>
              </Link>
              <Link id="tour-billing" onClick={() => setIsOpen(false)} href="/dashboard/billing" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200">
                <CreditCard className="w-4 h-4" />
                <span>Facturación</span>
              </Link>
              <Link id="tour-partners" onClick={() => setIsOpen(false)} href="/dashboard/partners" className="sidebar-link flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200 border-t border-current/10 mt-2 pt-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Socios & Ventas</span>
              </Link>
            </>
          )}

          {/* Acciones Rápidas en Móvil (Tutorial, Soporte, Salir) */}
          <div className="pt-3 mt-3 border-t border-black/10 md:hidden space-y-1">
            <button
              onClick={startTour}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <PlayCircle className="w-4 h-4 text-emerald-600" />
              <span>Tutorial AgendaClick</span>
            </button>

            <a
              href="https://wa.me/573239306599"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Soporte por WhatsApp</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>

        {/* Branding Sidebar Footer */}
        <div className="p-4 border-t text-center" style={{ borderColor: sidebarText + '1a' }}>
          <p className="text-[10px] opacity-40 uppercase tracking-widest font-semibold">
            AgendaClick
          </p>
          <p className="text-[10px] opacity-40 mt-0.5">
            Una solución de <a href="https://artdesigntienda.vercel.app/software" target="_blank" rel="noreferrer" className="font-bold hover:opacity-100 transition-opacity">ArtDesign</a>
          </p>
        </div>
      </aside>
    </>
  )
}
