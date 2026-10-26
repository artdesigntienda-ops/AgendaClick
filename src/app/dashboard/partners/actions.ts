'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import * as crypto from 'crypto'

export async function getPartnerData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // 1. Obtener perfil del socio
  let { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, role, partner_code, partner_commission_rate, bank_payout_info')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const admin = createAdminClient()
    const { data: newProf } = await admin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Socio Comercial',
        role: 'owner'
      })
      .select('id, name, email, role, partner_code, partner_commission_rate, bank_payout_info')
      .single()
    profile = newProf
  }

  // Generar partner_code si no tiene
  const partnerCode = profile?.partner_code || `SOCIO-${user.id.slice(0, 6).toUpperCase()}`
  const commissionRate = profile?.partner_commission_rate || 70.0

  // 2. Obtener negocios referidos
  const adminClient = createAdminClient()
  const { data: referredClinics, error: clinErr } = await adminClient
    .from('clinics')
    .select(`
      id,
      name,
      slug,
      phone,
      business_type,
      subscription_status,
      plan_type,
      subscription_ends_at,
      created_at,
      owner_id,
      profiles:owner_id (
        name,
        email
      )
    `)
    .eq('referred_by_partner_id', user.id)
    .order('created_at', { ascending: false })

  const clinicsList = referredClinics || []

  // Calcular métricas
  const now = new Date()
  let trialCount = 0
  let activeCount = 0
  let expiredCount = 0
  let estimatedMonthlyCommission = 0

  const planPrices: Record<string, number> = {
    independiente: 59000,
    profesional: 189000,
    negocio: 349000,
    elite: 499000
  }

  const processedClinics = clinicsList.map((c: any) => {
    const endsAt = c.subscription_ends_at ? new Date(c.subscription_ends_at) : null
    let daysRemaining = 0
    let statusLabel = 'Prueba'
    let isExpired = false

    if (endsAt) {
      const diffTime = endsAt.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (daysRemaining < 0) {
        daysRemaining = 0
        isExpired = true
      }
    }

    if (c.subscription_status === 'active' && !isExpired) {
      statusLabel = 'Activo (Pagado)'
      activeCount++
      const planPrice = planPrices[c.plan_type?.toLowerCase()] || 349000
      estimatedMonthlyCommission += planPrice * (commissionRate / 100)
    } else if (c.subscription_status === 'trial' && !isExpired) {
      statusLabel = `En Prueba (${daysRemaining}d restantes)`
      trialCount++
    } else {
      statusLabel = 'Vencido (Pendiente Pago)'
      expiredCount++
    }

    const ownerName = c.profiles?.name || 'Propietario'
    const ownerEmail = c.profiles?.email || 'Sin correo'

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      phone: c.phone || '',
      businessType: c.business_type,
      planType: c.plan_type || 'negocio',
      subscriptionStatus: c.subscription_status,
      statusLabel,
      daysRemaining,
      isExpired,
      subscriptionEndsAt: c.subscription_ends_at,
      createdAt: c.created_at,
      ownerName,
      ownerEmail
    }
  })

  return {
    partner: {
      id: user.id,
      name: profile?.name || 'Socio Comercial',
      email: user.email,
      partnerCode,
      commissionRate,
      bankPayoutInfo: profile?.bank_payout_info || null
    },
    metrics: {
      totalReferred: processedClinics.length,
      trialCount,
      activeCount,
      expiredCount,
      estimatedMonthlyCommission: Math.round(estimatedMonthlyCommission)
    },
    clinics: processedClinics
  }
}

export async function registerClientByPartner(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' }
  }

  const businessName = formData.get('business_name') as string
  const ownerName = formData.get('owner_name') as string
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const phone = (formData.get('phone') as string)?.trim()
  const businessType = formData.get('business_type') as string || 'belleza'
  const city = formData.get('city') as string || 'Medellín'

  if (!businessName || !email) {
    return { success: false, error: 'Nombre del negocio y correo son obligatorios' }
  }

  // Generar slug
  const baseSlug = businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`

  const adminClient = createAdminClient()

  // 1. Crear o buscar usuario para el cliente
  let clientUserId = null
  let secureTempPassword: string | null = null
  const { data: existingUser } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    clientUserId = existingUser.id
  } else {
    // Generar contraseña temporal segura única por cliente
    secureTempPassword = `${crypto.randomBytes(6).toString('hex')}Ac9!`
    const { data: newAuthUser, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password: secureTempPassword,
      email_confirm: true,
      user_metadata: { name: ownerName }
    })

    if (!authErr && newAuthUser?.user) {
      clientUserId = newAuthUser.user.id
    } else {
      // Fallback: perfil directo
      const fallbackId = crypto.randomUUID()
      clientUserId = fallbackId
      await adminClient.from('profiles').insert({
        id: fallbackId,
        email,
        name: ownerName,
        role: 'owner'
      })
    }
  }

  // 2. Dar 14 días de prueba gratis
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  const scheduleJson = {
    monday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakStart: '12:30', breakEnd: '14:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakStart: '12:30', breakEnd: '14:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakStart: '12:30', breakEnd: '14:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakStart: '12:30', breakEnd: '14:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakStart: '12:30', breakEnd: '14:00' },
    saturday: { isOpen: true, openTime: '08:00', closeTime: '13:00', breakStart: null, breakEnd: null },
    sunday: { isOpen: false, openTime: '08:00', closeTime: '13:00', breakStart: null, breakEnd: null }
  }

  // 3. Crear negocio vinculado al socio (referred_by_partner_id)
  const { data: newClinic, error: clinError } = await adminClient
    .from('clinics')
    .insert({
      owner_id: clientUserId,
      referred_by_partner_id: user.id, // ASIGNACIÓN DEL SOCIO COMERCIAL
      name: businessName,
      slug,
      phone,
      business_type: businessType,
      city,
      country: 'CO',
      subscription_status: 'trial',
      plan_type: 'negocio',
      subscription_ends_at: trialEndsAt.toISOString(),
      schedule: scheduleJson
    })
    .select('id, slug')
    .single()

  if (clinError) {
    console.error('Error creating referred clinic:', clinError)
    return { success: false, error: `Error creando el negocio: ${clinError.message}` }
  }

  // 4. Vincular clinic_id en profile
  await adminClient
    .from('profiles')
    .update({ clinic_id: newClinic.id })
    .eq('id', clientUserId)

  // 5. Enviar correo de bienvenida con credenciales si fue usuario nuevo
  if (secureTempPassword && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'AgendaClick <no-reply@agendaclick.com.co>',
        to: email,
        subject: `Bienvenido a AgendaClick - Tu cuenta para ${businessName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>¡Hola ${ownerName}!</h2>
            <p>Tu negocio <strong>${businessName}</strong> ha sido dado de alta en AgendaClick con 14 días de prueba gratis.</p>
            <p>Tus credenciales de acceso iniciales son:</p>
            <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0;"><strong>Usuario:</strong> ${email}</p>
              <p style="margin: 8px 0 0 0;"><strong>Contraseña temporal:</strong> ${secureTempPassword}</p>
            </div>
            <p>Inicia sesión aquí: <a href="https://agendaclick.com.co/login">Iniciar Sesión</a></p>
            <p style="color: #71717a; font-size: 13px;">Te recomendamos cambiar tu contraseña una vez ingreses a tu panel.</p>
          </div>
        `
      })
    } catch (e) {
      console.error('Error enviando credenciales al cliente referido:', e)
    }
  }

  revalidatePath('/dashboard/partners')
  return { 
    success: true, 
    slug: newClinic.slug,
    message: `¡Negocio ${businessName} registrado con éxito! Tiene 14 días de prueba.` 
  }
}

export async function savePayoutInfo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const bankName = formData.get('bank_name') as string
  const accountType = formData.get('account_type') as string
  const accountNumber = formData.get('account_number') as string
  const accountHolderName = formData.get('account_holder_name') as string
  const documentId = formData.get('document_id') as string

  const payoutData = {
    bankName,
    accountType,
    accountNumber,
    accountHolderName,
    documentId,
    updatedAt: new Date().toISOString()
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ bank_payout_info: payoutData })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Error guardando datos de pago' }
  }

  revalidatePath('/dashboard/partners')
  return { success: true, message: 'Datos de pago guardados correctamente.' }
}
