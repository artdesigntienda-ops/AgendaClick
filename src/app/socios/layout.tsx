import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Programa de Socios & Distribuidores | Gana hasta 70% de Comisión',
  description: 'Conviértete en distribuidor oficial de AgendaClick. Gana comisiones recurrentes mensuales por cada salón, barbería, clínica o cancha que afilies en Colombia.',
  alternates: {
    canonical: '/socios',
  },
  openGraph: {
    title: 'Gana hasta 70% de Comisión Recurrente | Socios AgendaClick',
    description: 'Genera ingresos pasivos mensuales afiliando negocios locales a la plataforma de agendamiento líder en Colombia.',
    url: 'https://agendaclick.com.co/socios',
  },
}

export default function SociosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
