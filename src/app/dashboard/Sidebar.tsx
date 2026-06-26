'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Scissors, Settings, LogOut, Users, Menu, X, DollarSign, HeartHandshake, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function Sidebar({ clinic }: { clinic: any }) {
  const [isOpen, setIsOpen] = useState(false)

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
        <div className="p-6 border-b border-black/10 hidden md:block">
          <img src="/full-logo.png" alt="AgendaClick Logo" className="h-16 w-full object-contain mb-6 object-left" />
          <p className="text-xs text-black/50 truncate tracking-wider uppercase font-bold">
            {clinic?.name || 'Mi Negocio'}
          </p>
          {clinic?.slug && (
            <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-xl shadow-sm">
              <p className="text-xs text-blue-900 font-medium leading-tight">Este enlace es para que tus clientes agenden cita:</p>
              <div className="flex items-center gap-1.5 mt-2">
                <a href={`/${clinic.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-[11px] font-mono text-blue-700 bg-white px-2 py-1.5 border border-blue-200 rounded-lg truncate hover:border-blue-400 transition-colors">
                  agendaclick.com/{clinic.slug}
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
        <div className="p-6 border-b border-black/10 md:hidden mt-16">
          <p className="text-xs text-black/50 truncate tracking-wider uppercase font-bold">
            {clinic?.name || 'Mi Negocio'}
          </p>
          {clinic?.slug && (
            <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-xl shadow-sm">
              <p className="text-xs text-blue-900 font-medium leading-tight">Este enlace es para que tus clientes agenden cita:</p>
              <div className="flex items-center gap-1.5 mt-2">
                <a href={`/${clinic.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-[11px] font-mono text-blue-700 bg-white px-2 py-1.5 border border-blue-200 rounded-lg truncate hover:border-blue-400 transition-colors">
                  agendaclick.com/{clinic.slug}
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
          <Link onClick={() => setIsOpen(false)} href="/dashboard" className="animate-fade-in-right anim-delay-100 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Calendar className="w-4 h-4" />
            Agenda Maestra
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/services" className="animate-fade-in-right anim-delay-200 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Scissors className="w-4 h-4" />
            Servicios
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/staff" className="animate-fade-in-right anim-delay-300 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Users className="w-4 h-4" />
            Profesionales
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/finances" className="animate-fade-in-right anim-delay-400 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <DollarSign className="w-4 h-4" />
            Finanzas
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/clients" className="animate-fade-in-right anim-delay-400 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <HeartHandshake className="w-4 h-4" />
            Clientes (CRM)
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/settings" className="animate-fade-in-right anim-delay-500 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-none hover:bg-black hover:text-white transition-colors duration-200">
            <Settings className="w-4 h-4" />
            {clinic?.slug ? 'Editar Perfil' : 'Crear Perfil'}
          </Link>
        </nav>
        <div className="p-4 border-t border-black/10 animate-fade-in-right anim-delay-500">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-none hover:bg-red-600 hover:text-white transition-colors duration-200">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
