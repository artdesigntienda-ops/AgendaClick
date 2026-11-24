import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReferralTracker from "@/components/ReferralTracker";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendaclick.com.co";

// 1. SEO Base Fuerte
export const metadata: Metadata = {
  title: {
    default: "AgendaClick | Software de Reservas y Citas Online en Colombia",
    template: "%s | AgendaClick",
  },
  description: "Software de agendamiento y reservas online para peluquerías, barberías, spas, clínicas y canchas sintéticas en Colombia. Sincronización en tiempo real con Google Calendar y WhatsApp.",
  keywords: ["software de citas", "agendamiento de turnos", "gestión de clínicas", "software estética", "agendamiento colombia", "SaaS citas", "reservas online", "documentación agendamiento", "tutoriales software citas", "academia de ventas whatsapp", "reservar cancha sintética", "agendar cancha de fútbol", "citas veterinaria online", "agendar carga vehículo eléctrico", "reservar clases particulares", "software agendamiento deportivo", "citas médicas online colombia", "agenda peluquería", "reservar turno barbería"],
  authors: [{ name: "AgendaClick" }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: "AgendaClick | Software de Reservas y Citas Online en Colombia",
    description: "Automatiza tus reservas 24/7 con agenda inteligente, control de empleados y CRM para negocios de servicios en Colombia.",
    url: siteUrl,
    siteName: "AgendaClick",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: `${siteUrl}/full-logo.png`,
        width: 1200,
        height: 630,
        alt: "AgendaClick - Software de Agendamiento",
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgendaClick'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// 2. Schema.org Oficial (@graph con Organization y SoftwareApplication)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'AgendaClick',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/full-logo.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+57-323-9306599',
        contactType: 'customer support',
        areaServed: 'CO',
        availableLanguage: 'Spanish',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#software`,
      name: 'AgendaClick',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '59000.00',
        priceCurrency: 'COP',
      },
      description: "Plataforma SaaS B2B de agendamiento y reservas online para negocios de servicios: salones, estéticas, barberías, spas, consultorios médicos, canchas sintéticas y veterinarias en Colombia.",
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect para mejorar LCP */}
        <link rel="preconnect" href="https://www.transparenttextures.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        {children}

        {children}
        <ReferralTracker />
        <PwaRegister />
        <PwaInstallPrompt />
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
