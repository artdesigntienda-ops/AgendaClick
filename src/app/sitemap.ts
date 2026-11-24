import { MetadataRoute } from 'next'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adminClient = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agendaclick.com.co'
  const staticLastMod = new Date('2026-11-24T00:00:00Z')

  // Rutas estáticas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/socios`,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vendedores`,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/documentacion`,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: staticLastMod,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: staticLastMod,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Rutas dinámicas de los negocios (Tenants)
  const { data: clinics } = await adminClient
    .from('clinics')
    .select('slug, created_at')
    .not('slug', 'is', null)
  
  const dynamicRoutes: MetadataRoute.Sitemap = clinics?.map((clinic) => ({
    url: `${baseUrl}/${clinic.slug}`,
    lastModified: clinic.created_at ? new Date(clinic.created_at) : staticLastMod,
    changeFrequency: 'daily',
    priority: 0.8,
  })) || []

  return [...staticRoutes, ...dynamicRoutes]
}
