'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import * as crypto from 'crypto'

/**
 * Genera un código de vendedor amigable, corto y fácil de dictar o escribir.
 * Ejemplo: CARLOS24, LAURA85, ANDRES19
 */
export async function generateUniquePartnerCode(name: string): Promise<string> {
  const adminClient = createAdminClient()
  
  const cleanBase = (name || 'ASESOR')
    .trim()
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) || 'ASESOR'

  // Probar con un número aleatorio de 2 dígitos
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(10 + Math.random() * 89) // 10 a 98
    const candidate = `${cleanBase}${num}`
    
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('partner_code', candidate)
      .maybeSingle()

    if (!existing) {
      return candidate
    }
  }

  // Si hubo muchas colisiones, añadir 3 dígitos
  const fallbackNum = Math.floor(100 + Math.random() * 899)
  return `${cleanBase}${fallbackNum}`
}

/**
 * Valida si un código de vendedor existe y está activo.
 * Retorna los datos básicos del vendedor para confirmación visual en el formulario de la empresa.
 */
export async function validatePartnerCode(code: string) {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Código requerido' }
  }

  const cleanCode = code.trim().toUpperCase()
  const adminClient = createAdminClient()

  const { data: partner, error } = await adminClient
    .from('profiles')
    .select('id, name, partner_code')
    .ilike('partner_code', cleanCode)
    .maybeSingle()

  if (error || !partner) {
    return { valid: false, error: 'Código de asesor no encontrado' }
  }

  return {
    valid: true,
    partnerId: partner.id,
    partnerName: partner.name || 'Asesor Comercial AgendaClick',
    partnerCode: partner.partner_code
  }
}

/**
 * Obtiene los datos del socio comercial autenticado, sus métricas y todas las empresas que refirió.
 */
export async function getPartnerData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const adminClient = createAdminClient()

  // 1. Obtener perfil del socio
  let { data: profile } = await adminClient
    .from('profiles')
    .select('id, name, email, role, partner_code, partner_commission_rate, bank_payout_info')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const defaultCode = await generateUniquePartnerCode(user.user_metadata?.name || user.email?.split('@')[0] || 'ASESOR')
    const { data: newProf } = await adminClient
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Asesor Comercial',
        role: 'partner',
        partner_code: defaultCode,
        partner_commission_rate: 30.0
      })
      .select('id, name, email, role, partner_code, partner_commission_rate, bank_payout_info')
      .single()
    profile = newProf
  }

  // Si no tiene código aún, asignarle uno amigable
  let partnerCode = profile?.partner_code
  if (!partnerCode) {
    partnerCode = await generateUniquePartnerCode(profile?.name || user.email?.split('@')[0] || 'ASESOR')
    await adminClient
      .from('profiles')
      .update({ partner_code: partnerCode })
      .eq('id', user.id)
  }

  const commissionRate = profile?.partner_commission_rate || 30.0

  // 2. Obtener negocios/peluquerías referidas por este vendedor
  const { data: referredClinics } = await adminClient
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

  // Precios oficiales de planes en COP
  const planInfoMap: Record<string, { label: string; price: number }> = {
    independiente: { label: 'Independiente', price: 59000 },
    profesional: { label: 'Profesional', price: 189000 },
    boutique: { label: 'Profesional', price: 189000 },
    negocio: { label: 'Negocio', price: 349000 },
    salon: { label: 'Negocio', price: 349000 },
    elite: { label: 'Élite', price: 499000 }
  }

  const now = new Date()
  let trialCount = 0
  let activeCount = 0
  let expiredCount = 0
  let estimatedMonthlyCommission = 0
  let totalCommissionsEarned = 0

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

    const rawPlan = (c.plan_type || 'negocio').toLowerCase()
    const planDetails = planInfoMap[rawPlan] || { label: 'Negocio', price: 349000 }
    const planPrice = planDetails.price
    const calculatedCommission = Math.round(planPrice * (commissionRate / 100))

    if (c.subscription_status === 'active' && !isExpired) {
      statusLabel = 'Activo (Pagado)'
      activeCount++
      estimatedMonthlyCommission += calculatedCommission
      totalCommissionsEarned += calculatedCommission
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
      planType: planDetails.label,
      planPrice,
      calculatedCommission,
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
      name: profile?.name || 'Asesor Comercial',
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
      estimatedMonthlyCommission: Math.round(estimatedMonthlyCommission),
      totalCommissionsEarned: Math.round(totalCommissionsEarned)
    },
    clinics: processedClinics
  }
}

/**
 * Registro de un nuevo vendedor desde la landing o formulario de vendedores.
 */
export async function registerPartnerAccount(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const phone = (formData.get('phone') as string)?.trim()
  const city = (formData.get('city') as string)?.trim() || 'Medellín'
  const customCode = (formData.get('custom_code') as string)?.trim().toUpperCase()

  const bankName = (formData.get('bank_name') as string)?.trim() || 'Nequi'
  const accountType = (formData.get('account_type') as string)?.trim() || 'Billetera'
  const accountNumber = (formData.get('account_number') as string)?.trim() || phone
  const accountHolderName = (formData.get('account_holder_name') as string)?.trim() || name
  const documentId = (formData.get('document_id') as string)?.trim() || ''

  if (!name || !email || !password) {
    return { success: false, error: 'Nombre, correo y contraseña son obligatorios' }
  }

  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const adminClient = createAdminClient()

  // 1. Determinar el código del vendedor
  let finalPartnerCode = ''
  if (customCode && customCode.length >= 3) {
    const cleanCustom = customCode.replace(/[^A-Z0-9]/g, '')
    const { data: existingCode } = await adminClient
      .from('profiles')
      .select('id')
      .eq('partner_code', cleanCustom)
      .maybeSingle()

    if (existingCode) {
      return { success: false, error: `El código "${cleanCustom}" ya está en uso. Por favor elige otro.` }
    }
    finalPartnerCode = cleanCustom
  } else {
    finalPartnerCode = await generateUniquePartnerCode(name)
  }

  // 2. Crear o actualizar usuario en Supabase Auth
  let userId = null

  // Verificar si ya existe en profiles
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, email, partner_code')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile) {
    // Si ya existe y ya tiene código, avisar
    if (existingProfile.partner_code) {
      return { 
        success: false, 
        error: `Ya existe una cuenta con este correo y su código es ${existingProfile.partner_code}. Inicia sesión en el portal.` 
      }
    }
    userId = existingProfile.id
  } else {
    // Crear en Auth
    const { data: newAuth, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, city }
    })

    if (authError || !newAuth?.user) {
      return { success: false, error: authError?.message || 'Error creando usuario' }
    }
    userId = newAuth.user.id
  }

  // 3. Guardar datos básicos y datos bancarios en el perfil
  const payoutData = {
    phone,
    city,
    bankName,
    accountType,
    accountNumber,
    accountHolderName,
    documentId,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      id: userId,
      email,
      name,
      role: 'partner',
      partner_code: finalPartnerCode,
      partner_commission_rate: 30.0,
      bank_payout_info: payoutData
    })

  if (profileError) {
    console.error('Error guardando perfil de vendedor:', profileError)
    return { success: false, error: 'Error guardando datos del asesor' }
  }

  // Iniciar sesión en el navegador cliente
  return {
    success: true,
    partnerCode: finalPartnerCode,
    email,
    message: `¡Registro exitoso! Tu código de asesor es: ${finalPartnerCode}`
  }
}

/**
 * Permite a una peluquería o empresa vincular a su vendedor después de haberse registrado.
 */
export async function linkPartnerToClinic(clinicId: string, partnerCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const validation = await validatePartnerCode(partnerCode)
  if (!validation.valid || !validation.partnerId) {
    return { success: false, error: 'Código de asesor inválido' }
  }

  const adminClient = createAdminClient()

  // Verificar pertenencia de la clínica (Anti-IDOR)
  const { data: clinic } = await adminClient
    .from('clinics')
    .select('id, owner_id')
    .eq('id', clinicId)
    .maybeSingle()

  if (!clinic || clinic.owner_id !== user.id) {
    return { success: false, error: 'No tienes permisos sobre este negocio' }
  }

  const { error: updateErr } = await adminClient
    .from('clinics')
    .update({ referred_by_partner_id: validation.partnerId })
    .eq('id', clinicId)

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { 
    success: true, 
    partnerName: validation.partnerName,
    message: `¡Asesor ${validation.partnerName} (${validation.partnerCode}) vinculado exitosamente!` 
  }
}

/**
 * Permite al vendedor registrar un cliente directamente desde su portal.
 */
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
    .select('id, clinic_id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    if (existingUser.clinic_id) {
      return { success: false, error: 'Este correo ya pertenece a un negocio activo en AgendaClick.' }
    }

    const { data: existingClinic } = await adminClient
      .from('clinics')
      .select('id, name')
      .eq('owner_id', existingUser.id)
      .maybeSingle()

    if (existingClinic) {
      return { success: false, error: `Este correo ya es dueño del negocio "${existingClinic.name}".` }
    }

    clientUserId = existingUser.id
  } else {
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

/**
 * Guarda o actualiza los datos básicos y de pago del vendedor.
 */
export async function savePayoutInfo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const city = (formData.get('city') as string)?.trim()
  const bankName = formData.get('bank_name') as string
  const accountType = formData.get('account_type') as string
  const accountNumber = formData.get('account_number') as string
  const accountHolderName = formData.get('account_holder_name') as string
  const documentId = formData.get('document_id') as string

  const adminClient = createAdminClient()

  // Obtener datos existentes
  const { data: profile } = await adminClient
    .from('profiles')
    .select('name, bank_payout_info')
    .eq('id', user.id)
    .single()

  const existingPayout = profile?.bank_payout_info || {}

  const payoutData = {
    ...existingPayout,
    phone: phone || existingPayout.phone,
    city: city || existingPayout.city,
    bankName,
    accountType,
    accountNumber,
    accountHolderName,
    documentId,
    updatedAt: new Date().toISOString()
  }

  const updateFields: any = { bank_payout_info: payoutData }
  if (name) {
    updateFields.name = name
  }

  const { error } = await adminClient
    .from('profiles')
    .update(updateFields)
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Error guardando datos de pago' }
  }

  revalidatePath('/dashboard/partners')
  return { success: true, message: 'Datos guardados correctamente.' }
}
