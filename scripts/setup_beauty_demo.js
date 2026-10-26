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

const supabaseAdmin = createClient(
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
  console.log('================================================================');
  console.log('✨ CONFIGURANDO DEMO PROFESIONAL: SALÓN DE BELLEZA, UÑAS & SPA');
  console.log('================================================================\n');

  const DEMO_PASSWORD = 'DemoPassword2026*';
  const clinicId = '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b';
  const ownerUserId = '7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a';
  const ownerEmail = 'mlec.rave@gmail.com';

  // 1. Configurar Usuarios en Supabase Auth
  console.log('1️⃣ Configurando credenciales de autenticación (auth.users)...');

  const usersToConfigure = [
    {
      id: ownerUserId,
      email: ownerEmail,
      fullName: 'Marly Rave - Master Stylist & Colorista (Directora)'
    },
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      email: 'valentina.restrepo@mlecrave.com',
      fullName: 'Valentina Restrepo - Colorista Balayage'
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      email: 'daniela.zapata@mlecrave.com',
      fullName: 'Daniela Zapata - Keratinas & Alisados'
    },
    {
      id: 'e3333333-3333-3333-3333-333333333333',
      email: 'camila.munoz@mlecrave.com',
      fullName: 'Camila Muñoz - Cejas, Pestañas & Maquillaje'
    },
    {
      id: 'e4444444-4444-4444-4444-444444444444',
      email: 'sofia.henao@mlecrave.com',
      fullName: 'Sofia Henao - Nail Artist & Manicura Rusa'
    }
  ];

  for (const u of usersToConfigure) {
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(u.id);
    if (existingUser && existingUser.user) {
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(u.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.fullName }
      });
      if (updErr) console.error(`   ⚠️ Error actualizando password para ${u.email}:`, updErr.message);
      else console.log(`   ✅ Password actualizado para: ${u.email}`);
    } else {
      const { error: crtErr } = await supabaseAdmin.auth.admin.createUser({
        id: u.id,
        email: u.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.fullName }
      });
      if (crtErr) console.error(`   ⚠️ Error creando usuario ${u.email}:`, crtErr.message);
      else console.log(`   ✅ Usuario auth creado para: ${u.email}`);
    }
  }

  // 2. Configurar el Negocio (Clínica / Salón) en clinics con Plan Élite Ilimitado
  console.log('\n2️⃣ Configurando Salón de Belleza en base de datos (clinics)...');
  const scheduleJson = {
    monday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '20:00', breakStart: '13:00', breakEnd: '14:00' },
    saturday: { isOpen: true, openTime: '08:00', closeTime: '20:00', breakStart: null, breakEnd: null },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '14:00', breakStart: null, breakEnd: null }
  };

  const clinicData = {
    id: clinicId,
    owner_id: ownerUserId,
    name: 'Mlec Rave Studio - Salón de Belleza, Uñas & Spa',
    slug: 'mlec-rave-studio',
    phone: '+573104508923',
    business_type: 'belleza',
    slogan: 'Alta Peluquería, Balayage, Manicura Rusa, Uñas Acrílicas, Keratinas y Spa en El Poblado',
    address: 'Calle 10 # 43E-20, El Poblado',
    country: 'CO',
    state: 'Antioquia',
    city: 'Medellín',
    neighborhood: 'El Poblado',
    latitude: 6.2088,
    longitude: -75.5684,
    brand_color: '#db2777', // Rose luxury
    header_text_color: '#ffffff',
    font_family: 'Outfit',
    sidebar_color: '#18181b',
    sidebar_text_color: '#f4f4f5',
    dashboard_accent_color: '#db2777',
    booking_bg_color: '#fdf2f8',
    booking_text_color: '#18181b',
    booking_card_color: '#ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80',
    logo_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
    instagram_url: 'https://instagram.com/mlecravestudio',
    tiktok_url: 'https://tiktok.com/@mlecravestudio',
    subscription_status: 'active',
    plan_type: 'elite',
    subscription_ends_at: '2099-12-31T23:59:59Z',
    staff_limit: 999,
    schedule: scheduleJson
  };

  const { error: clErr } = await supabaseAdmin.from('clinics').upsert(clinicData);
  if (clErr) {
    console.error('❌ Error al actualizar salón:', clErr);
    return;
  }
  console.log(`   ✅ Salón configurado: "${clinicData.name}" con Plan Élite Ilimitado.`);

  // 3. Configurar Perfiles en profiles (Staff y Dueña)
  console.log('\n3️⃣ Configurando perfiles de profesionales y comisiones (profiles)...');
  const staffSchedule = { useClinicSchedule: true };

  const profilesToUpsert = [
    {
      id: ownerUserId,
      email: ownerEmail,
      name: 'Marly Rave - Master Stylist & Colorista',
      role: 'owner',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      default_commission_rate: 0,
      schedule: staffSchedule
    },
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      email: 'valentina.restrepo@mlecrave.com',
      name: 'Valentina Restrepo - Colorista Balayage & Rubios',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      default_commission_rate: 50,
      schedule: staffSchedule
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      email: 'daniela.zapata@mlecrave.com',
      name: 'Daniela Zapata - Keratinas & Alisados Orgánicos',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      default_commission_rate: 50,
      schedule: staffSchedule
    },
    {
      id: 'e3333333-3333-3333-3333-333333333333',
      email: 'camila.munoz@mlecrave.com',
      name: 'Camila Muñoz - Cejas, Pestañas & Maquillaje HD',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      default_commission_rate: 50,
      schedule: staffSchedule
    },
    {
      id: 'e4444444-4444-4444-4444-444444444444',
      email: 'sofia.henao@mlecrave.com',
      name: 'Sofia Henao - Nail Artist Master & Manicura Rusa',
      role: 'staff',
      clinic_id: clinicId,
      is_bookable: true,
      is_on_break: false,
      has_seen_tutorial: true,
      default_commission_rate: 50,
      schedule: staffSchedule
    }
  ];

  for (const prof of profilesToUpsert) {
    const { error: pErr } = await supabaseAdmin.from('profiles').upsert(prof);
    if (pErr) console.error(`   ⚠️ Error en perfil ${prof.name}:`, pErr.message);
    else console.log(`   ✅ Perfil configurado: ${prof.name} (Comisión: ${prof.default_commission_rate}%)`);
  }

  // 4. Catálogo Especializado de Servicios de Belleza, Peluquería y Uñas
  console.log('\n4️⃣ Configurando catálogo de servicios de peluquería, uñas y estética...');
  await supabaseAdmin.from('services').delete().eq('clinic_id', clinicId);

  const servicesList = [
    // Peluquería & Color
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      clinic_id: clinicId,
      name: 'Balayage Blonde & Morena Iluminada + Olaplex + Peinado',
      duration_minutes: 180,
      price: 350000
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      clinic_id: clinicId,
      name: 'Alisado Progresivo Orgánico Nanoplastia (Cero Formol)',
      duration_minutes: 150,
      price: 280000
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      clinic_id: clinicId,
      name: 'Diseño de Corte Visagismo Femenino + Lavado Spa + Cepillado',
      duration_minutes: 45,
      price: 70000
    },
    {
      id: 'a4444444-4444-4444-4444-444444444444',
      clinic_id: clinicId,
      name: 'Terapia de Reconstrucción Capilar Botox & Colágeno',
      duration_minutes: 60,
      price: 150000
    },
    {
      id: 'a5555555-5555-5555-5555-555555555555',
      clinic_id: clinicId,
      name: 'Tinte Raíz + Cobertura Total + Baño de Brillo Gloss',
      duration_minutes: 90,
      price: 140000
    },
    // Uñas & Nail Spa
    {
      id: 'a6666666-6666-6666-6666-666666666666',
      clinic_id: clinicId,
      name: 'Manicura Rusa Combinada con Nivelación Rubber & Esmaltado Semipermanente',
      duration_minutes: 75,
      price: 85000
    },
    {
      id: 'a7777777-7777-7777-7777-777777777777',
      clinic_id: clinicId,
      name: 'Uñas Acrílicas / Polygel Esculpidas + Efecto Baby Boomer / Cristales',
      duration_minutes: 120,
      price: 130000
    },
    {
      id: 'a8888888-8888-8888-8888-888888888888',
      clinic_id: clinicId,
      name: 'Pedicura Spa Rusa Profunda + Exfoliación Sales Minerales y Masaje',
      duration_minutes: 60,
      price: 75000
    },
    // Cejas, Pestañas & Maquillaje
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      clinic_id: clinicId,
      name: 'Diseño & Laminado de Cejas HD + Henna Orgánica',
      duration_minutes: 45,
      price: 65000
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      clinic_id: clinicId,
      name: 'Lifting de Pestañas con Queratina + Tinte Negro Intenso',
      duration_minutes: 60,
      price: 80000
    },
    {
      id: 'b3333333-3333-3333-3333-333333333333',
      clinic_id: clinicId,
      name: 'Maquillaje Social HD & Peinado Glamour para Eventos',
      duration_minutes: 90,
      price: 190000
    }
  ];

  const { error: servErr } = await supabaseAdmin.from('services').insert(servicesList);
  if (servErr) {
    console.error('❌ Error insertando servicios:', servErr);
  } else {
    console.log(`   ✅ ${servicesList.length} servicios de alta estética y uñas insertados con éxito.`);
  }

  // 5. Generar Citas Realistas (Hoy, Semanas Pasadas y Próximas Semanas)
  console.log('\n5️⃣ Generando citas realistas para la agenda, métricas de finanzas y CRM...');
  await supabaseAdmin.from('appointments').delete().eq('clinic_id', clinicId);

  const clients = [
    { name: 'Dra. Carolina Montoya', email: 'carolina.montoya@gmail.com', phone: '3128945612' },
    { name: 'Juliana Restrepo Gómez', email: 'juli.restrepo@outlook.com', phone: '3157849201' },
    { name: 'Mariana Duque Echeverri', email: 'marianad@bancolombia.com.co', phone: '3104523698' },
    { name: 'Valentina Osorio Botero', email: 'valen.osorio92@gmail.com', phone: '3187456123' },
    { name: 'Dra. Claudia Patricia Gómez', email: 'claudia.gomez@clinica.com', phone: '3209874561' },
    { name: 'Isabella Botero Saldarriaga', email: 'isa.botero@hotmail.com', phone: '3148596321' },
    { name: 'Laura Camila Henao', email: 'laura.henao@sura.com.co', phone: '3164589721' },
    { name: 'Catalina Vélez Arango', email: 'cata.velez@gmail.com', phone: '3004561234' },
    { name: 'Paulina Morales Maya', email: 'pau.morales@outlook.com', phone: '3017485962' },
    { name: 'Daniela Giraldo Castro', email: 'dani.giraldo@yahoo.com', phone: '3219876543' },
    { name: 'Luciana Echavarría Gil', email: 'luciana.echa@gmail.com', phone: '3115478962' },
    { name: 'Manuela Londoño Ortiz', email: 'manuela.londono@gmail.com', phone: '3024589632' },
    { name: 'Sara Victoria Builes', email: 'sara.builes@hotmail.com', phone: '3178523694' },
    { name: 'Maria Fernanda Uribe', email: 'mafe.uribe@gmail.com', phone: '3136547891' },
    { name: 'Camila Andrea Posada', email: 'camila.posada@eafit.edu.co', phone: '3198521478' },
    { name: 'Estefanía Gaviria', email: 'estefa.gaviria@hotmail.com', phone: '3134567890' },
    { name: 'Alejandra Muñoz', email: 'aleja.munoz@gmail.com', phone: '3167890123' },
    { name: 'Verónica Jaramillo', email: 'vero.jaramillo@outlook.com', phone: '3112345678' }
  ];

  // Especialidades del staff
  const staffByService = {
    'a1111111-1111-1111-1111-111111111111': 'e1111111-1111-1111-1111-111111111111', // Balayage -> Valentina
    'a2222222-2222-2222-2222-222222222222': 'e2222222-2222-2222-2222-222222222222', // Keratina -> Daniela
    'a3333333-3333-3333-3333-333333333333': ownerUserId,                              // Corte -> Marly (Dueña)
    'a4444444-4444-4444-4444-444444444444': ownerUserId,                              // Botox -> Marly
    'a5555555-5555-5555-5555-555555555555': 'e1111111-1111-1111-1111-111111111111', // Tinte -> Valentina
    'a6666666-6666-6666-6666-666666666666': 'e4444444-4444-4444-4444-444444444444', // Manicura Rusa -> Sofia
    'a7777777-7777-7777-7777-777777777777': 'e4444444-4444-4444-4444-444444444444', // Uñas Acrílicas -> Sofia
    'a8888888-8888-8888-8888-888888888888': 'e4444444-4444-4444-4444-444444444444', // Pedicura Spa -> Sofia
    'b1111111-1111-1111-1111-111111111111': 'e3333333-3333-3333-3333-333333333333', // Cejas -> Camila
    'b2222222-2222-2222-2222-222222222222': 'e3333333-3333-3333-3333-333333333333', // Pestañas -> Camila
    'b3333333-3333-3333-3333-333333333333': 'e3333333-3333-3333-3333-333333333333'  // Maquillaje -> Camila
  };

  const appointmentsToInsert = [];
  const baseDate = new Date(); // Fecha actual del sistema

  function makeDate(daysOffset, hour, minute) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  function addMinutes(isoString, minutes) {
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString();
  }

  // A) Citas PASADAS (Septiembre y Octubre 2026): 45 citas completadas para alimentar Finanzas y CRM
  const pastDays = [
    -40, -38, -35, -33, -30, -28, -25, -24, -22, -20,
    -19, -18, -16, -15, -14, -13, -12, -11, -10, -9,
    -8, -7, -6, -5, -4, -3, -2, -1
  ];

  let clientCounter = 0;
  for (let i = 0; i < pastDays.length; i++) {
    const day = pastDays[i];
    // 2 a 3 citas por cada día pasado
    const countForDay = (i % 2 === 0) ? 2 : 1;
    for (let c = 0; c < countForDay; c++) {
      const client = clients[clientCounter % clients.length];
      const service = servicesList[(i + c) % servicesList.length];
      const staffId = staffByService[service.id] || ownerUserId;
      const startHour = 9 + (c * 4);
      const start = makeDate(day, startHour, 0);
      const end = addMinutes(start, service.duration_minutes);

      // Si es del staff, el staff gana el 50% de comisión. Si es de la dueña, comisión = 0
      const commission = (staffId === ownerUserId) ? 0 : Math.round(service.price * 0.50);

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
        total_price: service.price,
        commission_earned: commission,
        is_paid: true
      });
      clientCounter++;
    }
  }

  // B) Citas de HOY (Día 0) - Para que la agenda se vea activa y en vivo hoy
  const todayAppointments = [
    { hour: 9, min: 0, serviceIdx: 5, staffId: 'e4444444-4444-4444-4444-444444444444', clientIdx: 0, status: 'completed' }, // Sofia: Manicura Rusa
    { hour: 10, min: 30, serviceIdx: 0, staffId: 'e1111111-1111-1111-1111-111111111111', clientIdx: 1, status: 'completed' }, // Valentina: Balayage
    { hour: 11, min: 0, serviceIdx: 1, staffId: 'e2222222-2222-2222-2222-222222222222', clientIdx: 2, status: 'confirmed' }, // Daniela: Keratina
    { hour: 14, min: 0, serviceIdx: 6, staffId: 'e4444444-4444-4444-4444-444444444444', clientIdx: 3, status: 'confirmed' }, // Sofia: Uñas Acrílicas
    { hour: 15, min: 30, serviceIdx: 8, staffId: 'e3333333-3333-3333-3333-333333333333', clientIdx: 4, status: 'confirmed' }, // Camila: Diseño de Cejas
    { hour: 16, min: 30, serviceIdx: 2, staffId: ownerUserId, clientIdx: 5, status: 'confirmed' }                               // Marly: Corte Visagismo
  ];

  todayAppointments.forEach(t => {
    const service = servicesList[t.serviceIdx];
    const client = clients[t.clientIdx];
    const start = makeDate(0, t.hour, t.min);
    const end = addMinutes(start, service.duration_minutes);
    const commission = (t.staffId === ownerUserId) ? 0 : Math.round(service.price * 0.50);

    appointmentsToInsert.push({
      clinic_id: clinicId,
      service_id: service.id,
      staff_id: t.staffId,
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      start_time: start,
      end_time: end,
      status: t.status,
      total_price: service.price,
      commission_earned: commission,
      is_paid: t.status === 'completed'
    });
  });

  // C) Citas de los PRÓXIMOS 30 DÍAS (Semanas y meses venideros)
  const futureDaysOffsets = [
    1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30
  ];

  futureDaysOffsets.forEach((dayOffset, idx) => {
    const service = servicesList[idx % servicesList.length];
    const client = clients[(idx + 6) % clients.length];
    const staffId = staffByService[service.id] || ownerUserId;
    const hour = 9 + ((idx * 2) % 9);
    const start = makeDate(dayOffset, hour, 0);
    const end = addMinutes(start, service.duration_minutes);
    const commission = (staffId === ownerUserId) ? 0 : Math.round(service.price * 0.50);

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
      total_price: service.price,
      commission_earned: commission,
      is_paid: false
    });
  });

  console.log(`   Preparadas ${appointmentsToInsert.length} citas. Insertando en lotes...`);
  
  // Insertar en lotes de 25
  const batchSize = 25;
  for (let i = 0; i < appointmentsToInsert.length; i += batchSize) {
    const batch = appointmentsToInsert.slice(i, i + batchSize);
    const { error: insErr } = await supabaseAdmin.from('appointments').insert(batch);
    if (insErr) {
      console.error(`❌ Error insertando lote ${i}:`, insErr);
      return;
    }
  }

  console.log(`   ✅ ${appointmentsToInsert.length} citas insertadas exitosamente.`);

  // 6. Verificar y Mostrar Resumen
  console.log('\n================================================================');
  console.log('🎉 ¡ENTORNO DEMO 100% LISTO PARA PRESENTACIONES DE VENTAS!');
  console.log('================================================================');
  console.log('🏢 Salón de Belleza:', clinicData.name);
  console.log('📍 Dirección:', `${clinicData.address}, ${clinicData.neighborhood}, ${clinicData.city}`);
  console.log('💎 Plan Asignado:', 'Plan Élite (Ilimitado / Vitalicio hasta 2099)');
  console.log('🔗 Enlace Público de Reservas:', `https://www.agendaclick.com.co/${clinicData.slug}`);
  console.log('----------------------------------------------------------------');
  console.log('🔑 CREDENCIALES DE ACCESO AL DASHBOARD:');
  console.log('👑 Dueña / Directora General:');
  console.log(`   - Correo: ${ownerEmail}`);
  console.log(`   - Contraseña: ${DEMO_PASSWORD}`);
  console.log('   - Acceso: Total (Calendario, Staff, Finanzas, Comisiones, Clientes CRM, Ajustes)');
  console.log('\n💅 Acceso Demostrativo para Empleada (Nail Artist):');
  console.log('   - Correo: sofia.henao@mlecrave.com');
  console.log(`   - Contraseña: ${DEMO_PASSWORD}`);
  console.log('   - Acceso: Staff (Solo ve su agenda personal y sus comisiones)');
  console.log('\n💇‍♀️ Acceso Demostrativo para Colorista (Balayage):');
  console.log('   - Correo: valentina.restrepo@mlecrave.com');
  console.log(`   - Contraseña: ${DEMO_PASSWORD}`);
  console.log('================================================================\n');
}

main().catch(console.error);
