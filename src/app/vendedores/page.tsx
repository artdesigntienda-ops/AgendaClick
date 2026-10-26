import type { Metadata } from 'next'
import VendedoresClient from './VendedoresClient'

export const metadata: Metadata = {
  title: 'Portal de Vendedores & Asesores Comerciales | AgendaClick',
  description: 'Regístrate como asesor comercial de AgendaClick. Obtén tu código de vendedor y gana comisiones recurrentes mensuales por cada peluquería, barbería o negocio que refieras en Colombia.',
}

export default function VendedoresPage() {
  return <VendedoresClient />
}
