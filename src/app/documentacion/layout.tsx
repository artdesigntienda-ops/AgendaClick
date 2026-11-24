import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centro de Ayuda y Documentación Oficial',
  description: 'Guías paso a paso, tutoriales y documentación técnica para configurar tu agenda, sincronizar Google Calendar y gestionar citas en AgendaClick.',
  alternates: {
    canonical: '/documentacion',
  },
  openGraph: {
    title: 'Centro de Ayuda y Documentación | AgendaClick',
    description: 'Aprende a configurar tu negocio, gestionar profesionales y sincronizar Google Calendar en minutos.',
    url: 'https://agendaclick.com.co/documentacion',
  },
}

export default function DocumentacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
