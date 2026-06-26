import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://agendaclick.com' // Cambiar por tu dominio real

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // Protegemos rutas privadas y APIs de los crawlers
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
