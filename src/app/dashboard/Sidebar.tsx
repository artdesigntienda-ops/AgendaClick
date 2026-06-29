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
      </aside>
    </>
  )
}
