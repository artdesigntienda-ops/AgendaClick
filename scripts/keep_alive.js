const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local no encontrado.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
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
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

async function keepAlive() {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] Enviando ping de actividad a Supabase...`);

  const { data, error } = await supabase
    .from('clinics')
    .select('id, name')
    .limit(1);

  const duration = Date.now() - start;

  if (error) {
    console.error('❌ Error en ping a Supabase:', error.message);
    process.exit(1);
  }

  console.log(`✅ Ping exitoso en ${duration}ms.`);
  console.log('Negocio consultado:', data?.[0]?.name || 'Sin registros');
  console.log('El contador de inactividad de Supabase (7 días) ha sido reiniciado.');
}

keepAlive().catch(console.error);
