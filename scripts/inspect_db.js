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

async function inspect() {
  console.log('Inspecting existing profiles and clinics...');
  const { data: profs, error: pErr } = await supabase.from('profiles').select('id, email, name, role, clinic_id');
  console.log('Profiles:', profs, 'Error:', pErr);

  const { data: clins, error: cErr } = await supabase.from('clinics').select('id, owner_id, name, slug');
  console.log('Clinics:', clins, 'Error:', cErr);
}

inspect().catch(console.error);
