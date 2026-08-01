const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function provisionCleanSysadmin() {
  const adminEmail = 'sysadmin@alnoor.sa';
  const adminPass = 'admin123!';

  console.log(`Provisioning Super Admin (${adminEmail})...`);

  // Create via Admin API
  const { data: newAuth, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPass,
    email_confirm: true,
    user_metadata: {
      full_name: 'Eng. Ibrahim Al-Mansoor',
      username: 'admin',
      role: 'Super Admin',
      position: 'Chief Enterprise Admin',
    },
  });

  if (createErr || !newAuth?.user) {
    console.error('Failed to create sysadmin:', createErr?.message);
    return;
  }

  const authUuid = newAuth.user.id;
  console.log(`[SUCCESS] Sysadmin created in auth.users! ID: ${authUuid}`);

  // Save profile to public.users
  const adminProfile = {
    id: authUuid,
    employee_id: 'EMP-001',
    full_name: 'Eng. Ibrahim Al-Mansoor',
    email: adminEmail,
    username: 'admin',
    password_hash: '',
    mobile_number: '+966 50 111 2233',
    position: 'Chief Enterprise Admin',
    role: 'Super Admin',
    assigned_station_id: null,
    assigned_station_name: null,
    signature_url: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: dbErr } = await supabaseAdmin
    .from('users')
    .upsert(adminProfile, { onConflict: 'id' });

  if (dbErr) console.error('Error saving public.users profile:', dbErr.message);
  else console.log('[SUCCESS] Public profile saved to public.users table.');

  // Test login
  console.log(`\nTesting signInWithPassword for ${adminEmail} / ${adminPass}...`);
  const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPass,
  });

  if (loginErr || !loginData?.user) {
    console.error('[FAIL] Login error:', loginErr?.message);
  } else {
    console.log('[SUCCESS] Logged in as Super Admin!', loginData.user.email);
  }
}

provisionCleanSysadmin();
