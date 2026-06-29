'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Scissors, Settings, LogOut, Users, Menu, X, DollarSign, HeartHandshake, Copy, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

export default function Sidebar({ clinic, role }: { clinic: any, role: 'owner' | 'staff' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [domain, setDomain] = useState('agendaclick.com')

  useEffect(() => {
    setDomain(window.location.host)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Header & Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-black/10 fixed top-0 w-full z-50">
        <img src="/full-logo.png" alt="AgendaClick Logo" className="h-8 object-contain" />
        <button onClick={toggleSidebar} className="p-2 -mr-2 text-black focus:outline-none">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-black/10 flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b border-black/10 hidden md:block text-center">
          <img src="/full-logo.png" alt="AgendaClick Logo" className="h-10 w-full object-contain mb-8 opacity-50" />
          
          <div className="flex flex-col items-center justify-center mb-6">
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt={clinic.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-sm mb-3" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold mb-3">
                {clinic?.name?.charAt(0) || 'N'}
              </div>
            )}
            <p className="text-sm text-black font-black uppercase tracking-wide">
              {clinic?.name || 'Mi Negocio'}
            </p>
            {clinic?.slogan && (
              <p className="text-xs text-gray-500 mt-1 italic">
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
                  className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  title="Copiar enlace"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile Info */}
        <div className="p-6 border-b border-black/10 md:hidden mt-16 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt={clinic.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm mb-3" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold mb-3">
                {clinic?.name?.charAt(0) || 'N'}
              </div>
            )}
            <p className="text-sm text-black font-black uppercase tracking-wide">
              {clinic?.name || 'Mi Negocio'}
            </p>
            {clinic?.slogan && (
              <p className="text-xs text-gray-500 mt-1 italic">
                {clinic.slogan}
              </p>
            )}
          </div>

          {clinic?.slug && (
            <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-xl shadow-sm">
              <p className="text-xs text-blue-900 font-medium leading-tight">Este enlace es para que tus clientes agenden cita:</p>
              <div className="flex items-center gap-1.5 mt-2">
                <a href={`/${clinic.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-[11px] font-mono text-blue-700 bg-white px-2 py-1.5 border border-blue-200 rounded-lg truncate hover:border-blue-400 transition-colors">
                  {domain}/{clinic.slug}
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${clinic.slug}`)
                    toast.success('¡Enlace copiado!')
                  }} 
                  className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  title="Copiar enlace"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link id="tour-settings" onClick={() => setIsOpen(false)} href="/dashboard/settings" className="animate-fade-in-right anim-delay-100 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Settings className="w-4 h-4" />
            {clinic?.slug ? 'Editar Perfil' : 'Crear Perfil'}
          </Link>
          <Link id="tour-calendar" onClick={() => setIsOpen(false)} href="/dashboard" className="animate-fade-in-right anim-delay-100 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Calendar className="w-4 h-4" />
            Agenda Maestra
          </Link>
          <Link id="tour-clients" onClick={() => setIsOpen(false)} href="/dashboard/clients" className="animate-fade-in-right anim-delay-400 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <HeartHandshake className="w-4 h-4" />
            Clientas (CRM)
          </Link>
          <Link id="tour-finances" onClick={() => setIsOpen(false)} href="/dashboard/finances" className="animate-fade-in-right anim-delay-500 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <DollarSign className="w-4 h-4" />
            Finanzas
          </Link>

          {role === 'owner' && (
            <>
              <Link id="tour-services" onClick={() => setIsOpen(false)} href="/dashboard/services" className="animate-fade-in-right anim-delay-200 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
                <Scissors className="w-4 h-4" />
                Servicios
              </Link>
              <Link id="tour-staff" onClick={() => setIsOpen(false)} href="/dashboard/staff" className="animate-fade-in-right anim-delay-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
                <Users className="w-4 h-4" />
                Profesionales
              </Link>
              <Link id="tour-billing" onClick={() => setIsOpen(false)} href="/dashboard/billing" className="animate-fade-in-right anim-delay-600 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
                <CreditCard className="w-4 h-4" />
                Facturación
              </Link>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-black/10 flex flex-col gap-2">
          <button id="tour-help" onClick={() => document.dispatchEvent(new CustomEvent('start-tour'))} className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-none hover:bg-gray-100 text-gray-700 transition-colors duration-200 w-full text-left">
            <span className="w-4 h-4 flex items-center justify-center border border-gray-400 rounded-full text-xs font-serif italic text-gray-500">i</span>
            Tutorial
          </button>
          
          <a 
            href={`https://wa.me/573239306599?text=${encodeURIComponent('¡Hola equipo de AgendaClick! Necesito soporte con mi cuenta.')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-none hover:bg-green-50 text-green-700 transition-colors duration-200 w-full text-left"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Soporte por WhatsApp
          </a>

          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-none hover:bg-red-50 text-red-600 transition-colors duration-200 w-full text-left">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
