const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const clean = line.trim();
  if (!clean || clean.startsWith('#')) return;
  const idx = clean.indexOf('=');
  if (idx > 0) {
    const key = clean.slice(0, idx).trim();
    let val = clean.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function main() {
  console.log('=== Iniciando configuración de Mlec.rave@gmail.com ===');
  const targetEmail = 'mlec.rave@gmail.com';

  const userId = '7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a';
  const clinicId = '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b';

  const scheduleJson = {
    monday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '20:00', breakStart: '13:00', breakEnd: '14:00' },
    saturday: { isOpen: true, openTime: '08:00', closeTime: '20:00', breakStart: null, breakEnd: null },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '14:00', breakStart: null, breakEnd: null }
  };

  const staffSchedule = { useClinicSchedule: true };

  // PASO 1: Crear perfil del dueño primero (para satisfacer foreign key de clinics.owner_id)
  console.log('Paso 1: Creando perfil de dueño...');
  const { error: profErr1 } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: targetEmail,
      name: 'Marly Rave - Master Stylist & Colorista',
      role: 'owner',
      clinic_id: null,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      schedule: staffSchedule
    });

  if (profErr1) {
    console.error('Error en Paso 1 (profiles owner):', profErr1);
    return;
  }
  console.log('✅ Perfil de dueño creado/actualizado.');

  // PASO 2: Crear o Actualizar el Negocio (Clínica / Salón) con PLAN ILIMITADO
  console.log('Paso 2: Creando negocio de estilistas...');
  const clinicData = {
    id: clinicId,
    owner_id: userId,
    name: 'Mlec Rave Studio - Salón de Belleza & Estilistas',
    slug: 'mlec-rave-studio',
    phone: '+573104508923',
    business_type: 'belleza',
    slogan: 'Alta Peluquería, Balayage, Keratinas y Tratamientos Capilares Exclusivos en Medellín',
    address: 'Calle 10 # 43E-20, El Poblado',
    country: 'CO',
    state: 'Antioquia',
    city: 'Medellín',
    neighborhood: 'El Poblado',
    latitude: 6.2088,
    longitude: -75.5684,
    brand_color: '#db2777', // Fucsia / Rosa de salón de belleza elegante
    header_text_color: '#ffffff',
    font_family: 'Outfit',
    sidebar_color: '#18181b',
    sidebar_text_color: '#f4f4f5',
    dashboard_accent_color: '#db2777',
    booking_bg_color: '#fdf2f8',
    booking_text_color: '#18181b',
    booking_card_color: '#ffffff',
    subscription_status: 'active', // PLAN ACTIVO
    plan_type: 'elite',            // PLAN ÉLITE (Ilimitado)
    subscription_ends_at: '2099-12-31T23:59:59Z', // Vitalicio / Ilimitado
    staff_limit: 999,              // Sin límite de profesionales
    schedule: scheduleJson
  };

  const { error: clErr } = await supabase.from('clinics').upsert(clinicData);
  if (clErr) {
    console.error('Error en Paso 2 (clinics):', clErr);
    return;
  }
  console.log('✅ Negocio de estilistas creado:', clinicData.name);

  // PASO 3: Vincular clinic_id en el perfil del dueño
  await supabase
    .from('profiles')
    .update({ clinic_id: clinicId })
    .eq('id', userId);
  console.log('✅ Perfil del dueño vinculado a la clínica.');

  // PASO 4: Crear Staff de Profesionales Estilistas
  console.log('Paso 4: Creando equipo de estilistas...');
  const staffMembers = [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Valentina Restrepo - Especialista en Balayage & Rubio',
      email: 'valentina.restrepo@mlecrave.com',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      schedule: staffSchedule
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      name: 'Daniela Zapata - Keratinas Orgánicas & Alisados',
      email: 'daniela.zapata@mlecrave.com',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      schedule: staffSchedule
    },
    {
      id: 'e3333333-3333-3333-3333-333333333333',
      name: 'Camila Muñoz - Maquillaje Social & Peinados Novia',
      email: 'camila.munoz@mlecrave.com',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      schedule: staffSchedule
    },
    {
      id: 'e4444444-4444-4444-4444-444444444444',
      name: 'Sofia Henao - Manicure Ruso & Nail Art Spa',
      email: 'sofia.henao@mlecrave.com',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      schedule: staffSchedule
    }
  ];

  for (const st of staffMembers) {
    const { error: sErr } = await supabase.from('profiles').upsert(st);
    if (sErr) console.error('Error insertando staff:', st.name, sErr);
  }
  console.log('✅ Staff de estilistas creado:', staffMembers.length, 'profesionales.');

  // PASO 5: Crear Catálogo de Servicios
  console.log('Paso 5: Creando catálogo de servicios...');
  await supabase.from('services').delete().eq('clinic_id', clinicId);

  const servicesList = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      clinic_id: clinicId,
      name: 'Balayage Premium + Matización + Corte de Puntas',
      duration_minutes: 180,
      price: 320000
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      clinic_id: clinicId,
      name: 'Alisado Orgánico con Keratina y Nanoplastia',
      duration_minutes: 150,
      price: 260000
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      clinic_id: clinicId,
      name: 'Diseño de Corte de Cabello Estilo Visagismo + Cepillado',
      duration_minutes: 45,
      price: 65000
    },
    {
      id: 'a4444444-4444-4444-4444-444444444444',
      clinic_id: clinicId,
      name: 'Terapia de Botox Capilar & Reparación Molecular',
      duration_minutes: 60,
      price: 140000
    },
    {
      id: 'a5555555-5555-5555-5555-555555555555',
      clinic_id: clinicId,
      name: 'Tinte Raíz + Cobertura Total de Canas + Brillo Glow',
      duration_minutes: 90,
      price: 130000
    },
    {
      id: 'a6666666-6666-6666-6666-666666666666',
      clinic_id: clinicId,
      name: 'Maquillaje Social HD & Peinado de Gala',
      duration_minutes: 90,
      price: 180000
    },
    {
      id: 'a7777777-7777-7777-7777-777777777777',
      clinic_id: clinicId,
      name: 'Manicure Ruso Semipermanente + Nail Art Foil',
      duration_minutes: 60,
      price: 75000
    },
    {
      id: 'a8888888-8888-8888-8888-888888888888',
      clinic_id: clinicId,
      name: 'Diseño y Laminado de Cejas + Henna Orgánica',
      duration_minutes: 45,
      price: 60000
    }
  ];

  const { error: servErr } = await supabase.from('services').insert(servicesList);
  if (servErr) {
    console.error('Error insertando servicios:', servErr);
  } else {
    console.log('✅ Servicios creados exitosamente:', servicesList.length);
  }

  // PASO 6: Generar Citas de Demostración a 6 Meses
  console.log('Paso 6: Generando citas a lo largo de 6 meses...');
  await supabase.from('appointments').delete().eq('clinic_id', clinicId);

  const clientNames = [
    { name: 'Dra. Carolina Montoya', email: 'carolina.montoya@gmail.com', phone: '3128945612' },
    { name: 'Juliana Restrepo Gómez', email: 'juli.restrepo@outlook.com', phone: '3157849201' },
    { name: 'Mariana Duque Echeverri', email: 'marianad@bancolombia.com.co', phone: '3104523698' },
    { name: 'Valentina Osorio', email: 'valen.osorio92@gmail.com', phone: '3187456123' },
    { name: 'Dra. Claudia Patricia Gómez', email: 'claudia.gomez@clinica.com', phone: '3209874561' },
    { name: 'Isabella Botero Saldarriaga', email: 'isa.botero@hotmail.com', phone: '3148596321' },
    { name: 'Laura Camila Henao', email: 'laura.henao@sura.com.co', phone: '3164589721' },
    { name: 'Catalina Vélez Arango', email: 'cata.velez@gmail.com', phone: '3004561234' },
    { name: 'Paulina Morales', email: 'pau.morales@outlook.com', phone: '3017485962' },
    { name: 'Daniela Giraldo Castro', email: 'dani.giraldo@yahoo.com', phone: '3219876543' },
    { name: 'Luciana Echavarría', email: 'luciana.echa@gmail.com', phone: '3115478962' },
    { name: 'Manuela Londoño Ortiz', email: 'manuela.londono@gmail.com', phone: '3024589632' },
    { name: 'Sara Victoria Builes', email: 'sara.builes@hotmail.com', phone: '3178523694' },
    { name: 'Maria Fernanda Uribe', email: 'mafe.uribe@gmail.com', phone: '3136547891' },
    { name: 'Camila Andrea Posada', email: 'camila.posada@eafit.edu.co', phone: '3198521478' }
  ];

  const allStaffIds = [
    userId,
    'e1111111-1111-1111-1111-111111111111',
    'e2222222-2222-2222-2222-222222222222',
    'e3333333-3333-3333-3333-333333333333',
    'e4444444-4444-4444-4444-444444444444'
  ];

  const now = new Date();
  const appointmentsToInsert = [];

  function makeDate(daysFromNow, hour, minute) {
    const d = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  function addMinutesIso(isoStart, durationMinutes) {
    const d = new Date(isoStart);
    d.setMinutes(d.getMinutes() + durationMinutes);
    return d.toISOString();
  }

  // A) Citas pasadas (para historial de ingresos en Finanzas y CRM)
  const pastDays = [-15, -12, -10, -7, -5, -3, -2, -1];
  for (let i = 0; i < pastDays.length; i++) {
    const day = pastDays[i];
    const client = clientNames[i % clientNames.length];
    const service = servicesList[i % servicesList.length];
    const staffId = allStaffIds[i % allStaffIds.length];
    const start = makeDate(day, 10 + (i % 5), 0);
    const end = addMinutesIso(start, service.duration_minutes);

    appointmentsToInsert.push({
      clinic_id: clinicId,
      service_id: service.id,
      staff_id: staffId,
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      start_time: start,
      end_time: end,
      status: 'completed',
      total_price: service.price
    });
  }

  // B) Citas de Hoy (Para la agenda en vivo)
  const todayServices = [servicesList[0], servicesList[2], servicesList[6]];
  const todayHours = [9, 14, 17];
  todayServices.forEach((serv, idx) => {
    const client = clientNames[(idx + 4) % clientNames.length];
    const start = makeDate(0, todayHours[idx], 30);
    const end = addMinutesIso(start, serv.duration_minutes);

    appointmentsToInsert.push({
      clinic_id: clinicId,
      service_id: serv.id,
      staff_id: allStaffIds[idx % allStaffIds.length],
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      start_time: start,
      end_time: end,
      status: idx === 0 ? 'completed' : 'confirmed',
      total_price: serv.price
    });
  });

  // C) Citas de los próximos 6 MESES (distribuidas semanal y mensualmente)
  const futureDaysOffsets = [
    // Mes 1 (próximos 30 días)
    1, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 29,
    // Mes 2 (31 a 60 días)
    32, 35, 38, 41, 44, 48, 51, 55, 59,
    // Mes 3 (61 a 90 días)
    62, 66, 70, 75, 80, 85, 89,
    // Mes 4 (91 a 120 días)
    93, 98, 104, 110, 116, 120,
    // Mes 5 (121 a 150 días)
    125, 131, 138, 144, 150,
    // Mes 6 (151 a 180 días)
    155, 162, 169, 175, 180
  ];

  const possibleHours = [9, 10, 11, 14, 15, 16, 17];

  futureDaysOffsets.forEach((dayOffset, idx) => {
    const client = clientNames[idx % clientNames.length];
    const service = servicesList[idx % servicesList.length];
    const staffId = allStaffIds[idx % allStaffIds.length];
    const hour = possibleHours[idx % possibleHours.length];
    const start = makeDate(dayOffset, hour, 0);
    const end = addMinutesIso(start, service.duration_minutes);

    appointmentsToInsert.push({
      clinic_id: clinicId,
      service_id: service.id,
      staff_id: staffId,
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      start_time: start,
      end_time: end,
      status: 'confirmed',
      total_price: service.price
    });
  });

  const { data: insertedApps, error: appErr } = await supabase
    .from('appointments')
    .insert(appointmentsToInsert)
    .select('id');

  if (appErr) {
    console.error('Error insertando citas:', appErr);
  } else {
    console.log('✅ Citas insertadas con éxito:', insertedApps.length, 'citas a lo largo de 6 meses.');
  }

  console.log('\n======================================================');
  console.log('🎉 CONFIGURACIÓN 100% COMPLETADA');
  console.log('======================================================');
  console.log('👤 Administradora:', 'Marly Rave (Mlec.rave@gmail.com)');
  console.log('🏢 Salón de Belleza:', clinicData.name);
  console.log('🔗 URL Pública de Reservas:', `https://www.agendaclick.com.co/${clinicData.slug}`);
  console.log('💎 Plan Asignado:', 'Plan Élite (Ilimitado / Vitalicio hasta 2099)');
  console.log('✂️ Catálogo:', `${servicesList.length} servicios de estilistas configurados con precios y tiempos`);
  console.log('👥 Equipo:', `${staffMembers.length} profesionales estilistas en el staff`);
  console.log('📅 Citas:', `${appointmentsToInsert.length} citas activas e históricas a lo largo de 6 meses`);
}

main().catch(console.error);
