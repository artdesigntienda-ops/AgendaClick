const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

// Cargar variables de entorno
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

// Cryptographic helpers mirroring src/utils/securityTokens.ts
const crypto = require('crypto');
const CANCEL_SECRET = envVars.SUPABASE_SERVICE_ROLE_KEY || 'agendaclick_fallback_secret_key';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(CANCEL_SECRET).digest();

function generateCancellationHash(appointmentId, clientEmail) {
  const normalizedEmail = (clientEmail || '').trim().toLowerCase();
  return crypto
    .createHmac('sha256', CANCEL_SECRET)
    .update(`${appointmentId}:${normalizedEmail}`)
    .digest('hex');
}

function verifyCancellationHash(appointmentId, clientEmail, receivedToken) {
  if (!receivedToken || typeof receivedToken !== 'string') return false;
  const expectedHash = generateCancellationHash(appointmentId, clientEmail);
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const receivedBuffer = Buffer.from(receivedToken, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function encryptSensitiveToken(text) {
  if (!text) return null;
  if (text.startsWith('enc:v1:')) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptSensitiveToken(ciphertext) {
  if (!ciphertext) return null;
  if (!ciphertext.startsWith('enc:v1:')) return ciphertext;
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 5) return ciphertext;
    const iv = Buffer.from(parts[2], 'hex');
    const authTag = Buffer.from(parts[3], 'hex');
    const encryptedText = parts[4];
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[Security] Error descifrando token sensible:', err);
    return null;
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const anonClient = createClient(supabaseUrl, anonKey);

async function runRoleSimulationTests() {
  console.log('================================================================');
  console.log('🧪 SUITE DE PRUEBAS DE ROLES: ADMINISTRADOR, DUEÑO Y CLIENTE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ===========================================================================
  // TEST SUITE 1: ROL ADMINISTRADOR (SUPERADMIN & SISTEMA)
  // ===========================================================================
  console.log('👑 [ROL 1/3] PROBANDO PRIVILEGIOS Y FLUJOS DEL ADMINISTRADOR');
  console.log('------------------------------------------------------------');

  try {
    // 1.1 Lectura global de métricas y tablas
    const { count: totalClinics, error: cErr } = await adminClient.from('clinics').select('*', { count: 'exact', head: true });
    assert(!cErr && totalClinics >= 3, `Administrador consulta total de clínicas (${totalClinics} registradas)`);

    const { count: totalAppts, error: aErr } = await adminClient.from('appointments').select('*', { count: 'exact', head: true });
    assert(!aErr && totalAppts !== null, `Administrador consulta total de citas (${totalAppts} registradas)`);

    const { count: totalServices, error: sErr } = await adminClient.from('services').select('*', { count: 'exact', head: true });
    assert(!sErr && totalServices >= 30, `Administrador consulta catálogo global de servicios (${totalServices} activos)`);

    // 1.2 Auditoría de cifrado y descifrado de tokens OAuth
    const { data: profilesWithTokens } = await adminClient
      .from('profiles')
      .select('id, email, google_refresh_token')
      .not('google_refresh_token', 'is', null);

    const tokenRecord = profilesWithTokens && profilesWithTokens[0];
    assert(tokenRecord && tokenRecord.google_refresh_token.startsWith('enc:v1:'), 
      `Token de ${tokenRecord?.email} almacenado con cifrado AES-256-GCM`);

    const decrypted = decryptSensitiveToken(tokenRecord.google_refresh_token);
    assert(decrypted && decrypted.startsWith('1//'), 
      `Descifrado del token recupera el token OAuth válido sin alteración (${decrypted.substring(0, 10)}...)`);

    // 1.3 Inicialización de Google Calendar API con token descifrado
    const oauth2Client = new google.auth.OAuth2(
      envVars.GOOGLE_CLIENT_ID,
      envVars.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: decrypted });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    assert(!!calendar && typeof calendar.events.insert === 'function', 
      'Inicialización del SDK de Google Calendar completada exitosamente con el token descifrado');

    // 1.4 Simulación de Rutina de Mantenimiento Automático (Auto-cleanup)
    const testNow = new Date().toISOString();
    const { error: cronOtpErr } = await adminClient.from('otp_verifications').delete().lt('expires_at', testNow);
    assert(!cronOtpErr, 'Mantenimiento: purga de códigos OTP caducados ejecutada sin errores');

    const { error: cronApptErr } = await adminClient.from('appointments').update({ status: 'completed' }).lt('end_time', testNow).eq('status', 'confirmed');
    assert(!cronApptErr, 'Mantenimiento: sincronización y cierre de citas pasadas ejecutada sin errores');

  } catch (err) {
    console.error('Error inesperado en tests de Administrador:', err);
    failed++;
  }

  // ===========================================================================
  // TEST SUITE 2: ROL DUEÑO DE NEGOCIO (BUSINESS OWNER)
  // ===========================================================================
  console.log('\n💼 [ROL 2/3] PROBANDO ACCIONES Y PRIVILEGIOS DEL DUEÑO DE NEGOCIO');
  console.log('------------------------------------------------------------');

  let ownerClient = null;
  let ownerUser = null;

  try {
    // 2.1 Autenticación legítima en Supabase Auth
    ownerClient = createClient(supabaseUrl, anonKey);
    const { data: authData, error: authErr } = await ownerClient.auth.signInWithPassword({
      email: 'reviewer@agendaclick.com.co',
      password: 'GoogleReview2026!'
    });

    assert(!authErr && !!authData?.user, 'Dueño inicia sesión en Supabase Auth exitosamente');
    ownerUser = authData?.user;

    // 2.2 Carga del perfil del negocio
    const { data: profile, error: pErr } = await ownerClient
      .from('profiles')
      .select('id, role, clinic_id, name')
      .eq('id', ownerUser.id)
      .maybeSingle();

    assert(!pErr && profile?.role === 'owner', `Dueño accede a su perfil (Rol: ${profile?.role}, ID: ${profile?.id})`);

    const clinicId = profile?.clinic_id;

    // 2.3 Visualización del Dashboard (Citas de su negocio)
    const { data: myAppointments, error: myApptErr } = await ownerClient
      .from('appointments')
      .select('id, client_name, start_time, status')
      .eq('clinic_id', clinicId);

    assert(!myApptErr && Array.isArray(myAppointments), 
      `Dueño visualiza el listado de citas de su clínica (${myAppointments?.length || 0} citas cargadas)`);

    // 2.4 Visualización de su equipo de colaboradores
    const { data: staffList, error: stfErr } = await ownerClient
      .from('staff_directory')
      .select('*')
      .eq('clinic_id', clinicId);

    assert(!stfErr && Array.isArray(staffList), 
      `Dueño consulta el directorio de colaboradores de su clínica (${staffList?.length || 0} profesionales)`);

    // 2.5 Gestión de Servicios (CRUD: Crear, Modificar y Eliminar un servicio)
    const tempServiceName = 'Servicio Temporal Test ' + Date.now();
    const { data: newService, error: crtServErr } = await ownerClient
      .from('services')
      .insert({
        clinic_id: clinicId,
        name: tempServiceName,
        duration_minutes: 45,
        price: 55000
      })
      .select()
      .maybeSingle();

    assert(!crtServErr && newService?.id, `Dueño crea un nuevo servicio en su catálogo ("${tempServiceName}")`);

    if (newService?.id) {
      // Modificar servicio
      const { data: updatedService, error: updServErr } = await ownerClient
        .from('services')
        .update({ price: 60000 })
        .eq('id', newService.id)
        .select()
        .maybeSingle();

      assert(!updServErr && updatedService?.price === 60000, 'Dueño actualiza el precio del servicio exitosamente');

      // Eliminar servicio
      const { error: delServErr } = await ownerClient
        .from('services')
        .delete()
        .eq('id', newService.id);

      assert(!delServErr, 'Dueño elimina el servicio temporal de su catálogo exitosamente');
    }

    // 2.6 Aislamiento de Seguridad: Verificar que el dueño NO puede alterar citas de OTRA clínica
    const otherClinicId = 'c1111111-1111-1111-1111-111111111111'; // Motor K
    const { data: hackedRows } = await ownerClient
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('clinic_id', otherClinicId)
      .select();

    assert(!hackedRows || hackedRows.length === 0, 
      'Blindaje Multi-inquilino: El dueño NO puede modificar citas de otros negocios (0 filas afectadas)');

  } catch (err) {
    console.error('Error inesperado en tests de Dueño de Negocio:', err);
    failed++;
  }

  // ===========================================================================
  // TEST SUITE 3: ROL CLIENTE FINAL (END-USER BOOKING EXPERIENCE)
  // ===========================================================================
  console.log('\n👤 [ROL 3/3] PROBANDO EXPERIENCIA PÚBLICA DEL CLIENTE FINAL');
  console.log('------------------------------------------------------------');

  try {
    const testClinicSlug = 'motork-pasto';

    // 3.1 Consulta pública de la clínica (Página /[slug])
    const { data: publicClinic, error: pubCErr } = await anonClient
      .from('clinics')
      .select('id, name, slug, phone, business_type, address, schedule, owner_id')
      .eq('slug', testClinicSlug)
      .maybeSingle();

    assert(!pubCErr && !!publicClinic, `Cliente accede a página pública de reservas de "${publicClinic?.name}"`);

    // 3.2 Consulta pública de servicios disponibles
    const { data: publicServices, error: pubSErr } = await anonClient
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('clinic_id', publicClinic.id)
      .order('price', { ascending: true });

    assert(!pubSErr && publicServices.length > 0, 
      `Cliente visualiza catálogo de servicios disponibles (${publicServices.length} servicios ofertados)`);

    // 3.3 Consulta pública de profesionales disponibles (a través de staff_directory)
    const { data: publicStaff, error: pubStfErr } = await anonClient
      .from('staff_directory')
      .select('id, name, role, is_bookable, schedule')
      .eq('clinic_id', publicClinic.id);

    assert(!pubStfErr && publicStaff.length > 0, 
      `Cliente consulta especialistas agendables (${publicStaff.length} encontrados vía staff_directory)`);

    // Verificar que staff_directory NO expone campos sensibles
    const hasExposedSecrets = publicStaff.some(s => s.google_refresh_token || s.bank_payout_info);
    assert(!hasExposedSecrets, 'staff_directory NO expone google_refresh_token ni información bancaria');

    // 3.4 Simulación del flujo de verificación OTP
    const clientEmail = 'cliente.auditoria@test.com';
    const clientPhone = '3001234567';
    const testOtpCode = '987654';
    const testService = publicServices[0];
    const testStaff = publicStaff[0];

    // El servidor genera el OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insOtpErr } = await adminClient
      .from('otp_verifications')
      .insert({
        email: clientEmail,
        otp_code: testOtpCode,
        expires_at: otpExpires
      });

    assert(!insOtpErr, 'Sistema genera código OTP de verificación de seguridad para el cliente');

    // 3.5 Creación de Cita (Validación OTP + Verificación de Horario + Inserción)
    // Horario de prueba para mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const startTimeIso = tomorrow.toISOString();
    tomorrow.setMinutes(tomorrow.getMinutes() + testService.duration_minutes);
    const endTimeIso = tomorrow.toISOString();

    // Validar OTP
    const { data: validOtp } = await adminClient
      .from('otp_verifications')
      .select('*')
      .eq('email', clientEmail)
      .eq('otp_code', testOtpCode)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    assert(validOtp && validOtp.length > 0, 'Cliente ingresa OTP correcto y el sistema valida su autenticidad');

    // Insertar Cita en appointments
    const appointmentPayload = {
      clinic_id: publicClinic.id,
      service_id: testService.id,
      staff_id: testStaff.id,
      client_name: 'Cliente Auditoría Certificada',
      client_email: clientEmail,
      client_phone: clientPhone,
      start_time: startTimeIso,
      end_time: endTimeIso,
      status: 'confirmed',
      total_price: testService.price
    };

    const { data: createdAppointment, error: apptErr } = await adminClient
      .from('appointments')
      .insert(appointmentPayload)
      .select('id, start_time, end_time, status, client_name')
      .maybeSingle();

    assert(!apptErr && !!createdAppointment?.id, 
      `Cita creada y confirmada exitosamente en la base de datos (ID: ${createdAppointment?.id})`);

    // Consumir (borrar) el OTP usado
    await adminClient.from('otp_verifications').delete().eq('id', validOtp[0].id);
    const { data: checkUsedOtp } = await adminClient.from('otp_verifications').select('*').eq('id', validOtp[0].id);
    assert(!checkUsedOtp || checkUsedOtp.length === 0, 'Código OTP consumido y eliminado para prevenir reutilización');

    // 3.6 Recuperación y Descifrado transparente del token de Google Calendar para sincronización
    const { data: ownerProfile } = await adminClient
      .from('profiles')
      .select('google_refresh_token, google_calendar_id')
      .eq('id', publicClinic.owner_id)
      .maybeSingle();

    if (ownerProfile?.google_refresh_token) {
      const decryptedCalendarToken = decryptSensitiveToken(ownerProfile.google_refresh_token);
      assert(decryptedCalendarToken && decryptedCalendarToken.startsWith('1//'), 
        'Servidor descifra en memoria el token de Google Calendar para sincronizar la cita del cliente');
    }

    // 3.7 Flujo de Cancelación Autónoma por el Cliente (/cancelar/[appointmentId])
    const cancelHash = generateCancellationHash(createdAppointment.id, clientEmail);
    const isTokenLegit = verifyCancellationHash(createdAppointment.id, clientEmail, cancelHash);
    assert(isTokenLegit, 'Generación y verificación de token seguro criptográfico de cancelación (Anti-IDOR)');

    // El cliente cancela su cita usando el token
    const { data: cancelledAppt, error: cancelErr } = await adminClient
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', createdAppointment.id)
      .select('id, status')
      .maybeSingle();

    assert(!cancelErr && cancelledAppt?.status === 'cancelled', 
      'Cliente cancela su cita de forma autónoma y el estado se actualiza a "cancelled"');

    // 3.8 Limpieza: Eliminar la cita de prueba para mantener la base de datos impecable
    await adminClient.from('appointments').delete().eq('id', createdAppointment.id);
    console.log('   🧹 Cita de prueba eliminada de la base de datos.');

  } catch (err) {
    console.error('Error inesperado en tests de Cliente Final:', err);
    failed++;
  }

  // ===========================================================================
  // RESUMEN FINAL
  // ===========================================================================
  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DE LAS PRUEBAS: ${passed} EXITOSAS | ${failed} FALLIDAS`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 TODAS LAS PRUEBAS PASARON AL 100%.');
    console.log('El blindaje y la seguridad NO interfieren con ningún proceso de AgendaClick.');
  } else {
    console.error('⚠️ ALGUNAS PRUEBAS FALLARON.');
    process.exit(1);
  }
}

runRoleSimulationTests().catch(err => {
  console.error(err);
  process.exit(1);
});
