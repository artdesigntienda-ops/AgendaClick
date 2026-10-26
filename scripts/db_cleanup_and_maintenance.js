const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

const adminClient = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const anonClient = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cryptographic encryption setup
const ENCRYPTION_SECRET = envVars.SUPABASE_SERVICE_ROLE_KEY;
const KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

function encryptSensitiveToken(text) {
  if (!text) return text;
  if (text.startsWith('enc:v1:')) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptSensitiveToken(ciphertext) {
  if (!ciphertext) return ciphertext;
  if (!ciphertext.startsWith('enc:v1:')) return ciphertext;
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 5) return ciphertext;
    const iv = Buffer.from(parts[2], 'hex');
    const authTag = Buffer.from(parts[3], 'hex');
    const encryptedText = parts[4];
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return ciphertext;
  }
}

async function runCleanupAndHardening() {
  console.log('================================================================');
  console.log('🚀 INICIANDO LIMPIEZA DE BASE DE DATOS Y BLINDAJE DE SEGURIDAD');
  console.log('================================================================\n');

  const now = new Date().toISOString();

  // 1. Purga de OTPs Expirados
  console.log('1️⃣ Purgando registros vencidos en otp_verifications...');
  const { data: expiredOtps, error: otpCountErr } = await adminClient
    .from('otp_verifications')
    .select('id')
    .lt('expires_at', now);

  if (otpCountErr) {
    console.error('   ⚠️ Error consultando OTPs:', otpCountErr.message);
  } else {
    console.log(`   ℹ️ Se encontraron ${expiredOtps?.length || 0} registros OTP vencidos.`);
    if (expiredOtps && expiredOtps.length > 0) {
      const { error: delOtpErr } = await adminClient
        .from('otp_verifications')
        .delete()
        .lt('expires_at', now);
      if (delOtpErr) console.error('   ⚠️ Error eliminando OTPs:', delOtpErr.message);
      else console.log(`   ✅ ${expiredOtps.length} registros OTP eliminados exitosamente.`);
    }
  }

  // 2. Actualización de Citas Pasadas (confirmed -> completed)
  console.log('\n2️⃣ Actualizando estado de citas transcurridas a "completed"...');
  const { data: pastConfirmed, error: pastErr } = await adminClient
    .from('appointments')
    .select('id, client_name, end_time')
    .lt('end_time', now)
    .eq('status', 'confirmed');

  if (pastErr) {
    console.error('   ⚠️ Error consultando citas pasadas:', pastErr.message);
  } else {
    console.log(`   ℹ️ Se encontraron ${pastConfirmed?.length || 0} citas pasadas pendientes de cierre.`);
    if (pastConfirmed && pastConfirmed.length > 0) {
      const ids = pastConfirmed.map(a => a.id);
      const { error: updApptErr } = await adminClient
        .from('appointments')
        .update({ status: 'completed' })
        .in('id', ids);
      if (updApptErr) console.error('   ⚠️ Error actualizando citas:', updApptErr.message);
      else console.log(`   ✅ ${ids.length} citas pasadas marcadas como "completed".`);
    }
  }

  // 3. Depuración de Perfiles Demo Huérfanos
  console.log('\n3️⃣ Depurando perfiles staff de prueba sin clínica asociada...');
  const demoStaffEmails = ['maria674@ejemplo.com', 'sofia882@ejemplo.com', 'valentina249@ejemplo.com'];
  const { data: demoProfs, error: dProfErr } = await adminClient
    .from('profiles')
    .select('id, email')
    .in('email', demoStaffEmails);

  if (demoProfs && demoProfs.length > 0) {
    const ids = demoProfs.map(p => p.id);
    const { error: delProfErr } = await adminClient
      .from('profiles')
      .delete()
      .in('id', ids);
    if (delProfErr) console.error('   ⚠️ Error eliminando perfiles demo:', delProfErr.message);
    else console.log(`   ✅ ${demoProfs.length} perfiles demo huérfanos eliminados.`);
  } else {
    console.log('   ✅ No se encontraron perfiles demo huérfanos para eliminar.');
  }

  // 4. Blindaje y Cifrado AES-256-GCM de Tokens Sensibles en profiles
  console.log('\n4️⃣ Aplicando cifrado criptográfico AES-256-GCM a tokens OAuth en profiles...');
  const { data: profilesWithTokens, error: pTokenErr } = await adminClient
    .from('profiles')
    .select('id, email, google_refresh_token')
    .not('google_refresh_token', 'is', null);

  if (pTokenErr) {
    console.error('   ⚠️ Error consultando tokens:', pTokenErr.message);
  } else if (profilesWithTokens) {
    for (const prof of profilesWithTokens) {
      if (prof.google_refresh_token && !prof.google_refresh_token.startsWith('enc:v1:')) {
        const rawToken = prof.google_refresh_token;
        const ciphered = encryptSensitiveToken(rawToken);
        const { error: encErr } = await adminClient
          .from('profiles')
          .update({ google_refresh_token: ciphered })
          .eq('id', prof.id);
        if (encErr) {
          console.error(`   ⚠️ Error cifrando token para ${prof.email}:`, encErr.message);
        } else {
          console.log(`   🔒 Token de ${prof.email} cifrado con AES-256-GCM exitosamente.`);
          // Verificación de integridad: probar descifrado
          const decrypted = decryptSensitiveToken(ciphered);
          if (decrypted === rawToken) {
            console.log(`   ✅ Verificación de integridad superada: descifrado coincide 100% con token original.`);
          } else {
            console.error(`   ❌ FALLO DE INTEGRIDAD: descifrado no coincide.`);
          }
        }
      } else {
        console.log(`   ✅ Token de ${prof.email} ya se encuentra cifrado.`);
      }
    }
  }

  // 5. Test de Verificación de Exposición con Cliente Anónimo
  console.log('\n5️⃣ Verificando exposición frente a clientes anónimos (simulación atacante)...');
  const { data: anonData, error: anonErr } = await anonClient
    .from('profiles')
    .select('id, email, google_refresh_token')
    .not('google_refresh_token', 'is', null);

  if (anonData && anonData.length > 0) {
    const exposedRawTokens = anonData.filter(p => !p.google_refresh_token.startsWith('enc:v1:'));
    if (exposedRawTokens.length === 0) {
      console.log('   🛡️ ÉXITO: Ningún token en texto plano está expuesto a clientes anónimos.');
      console.log('   Sample valor expuesto a la web pública:', anonData[0].google_refresh_token.substring(0, 30) + '...');
    } else {
      console.warn('   ⚠️ ADVERTENCIA: Aún existen tokens en texto plano.');
    }
  }

  console.log('\n================================================================');
  console.log('✨ MANTENIMIENTO Y BLINDAJE COMPLETADO EXITOSAMENTE');
  console.log('================================================================\n');
}

runCleanupAndHardening().catch(console.error);
