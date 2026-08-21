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

async function check() {
  console.log('Testing partner columns in clinics and profiles...');
  const { data: cData, error: cErr } = await supabase.from('clinics').select('id, referred_by_partner_id').limit(1);
  console.log('Clinics referred_by_partner_id check:', cErr ? cErr.message : 'Column EXISTS ✅');

  const { data: pData, error: pErr } = await supabase.from('profiles').select('id, partner_code, partner_commission_rate, bank_payout_info').limit(1);
  console.log('Profiles partner columns check:', pErr ? pErr.message : 'Columns EXIST ✅');
}

check().catch(console.error);
