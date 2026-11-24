import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agendaclick.com.co'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/cancelar/'], // Protegemos rutas privadas, APIs y tokens de cancelación
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
