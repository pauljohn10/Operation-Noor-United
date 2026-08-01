const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function provisionAdminProfile() {
  const adminEmail = 'admin@alnoor.sa';
  const adminPass = 'Password123!';
  const seedId = '00000000-0000-0000-0000-000000000001';

  console.log(`Upserting profile for ${adminEmail} into public.users...`);
  const profile = {
    id: seedId,
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

  const { error: upsertErr } = await supabaseAdmin.from('users').upsert(profile, { onConflict: 'id' });
  if (upsertErr) console.error('Upsert error:', upsertErr.message);
  else console.log('[SUCCESS] Upserted public.users profile for admin@alnoor.sa');

  // Now call update_password via proxy!
  console.log('\nInvoking update_password via Edge Function Proxy...');
  const updateRes = await fetch('http://localhost:5173/functions/v1/manage-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update_password',
      userId: seedId,
      email: adminEmail,
      password: adminPass,
    }),
  });

  const updateData = await updateRes.json();
  console.log('Update password status:', updateRes.status);
  console.log('Update password response:', JSON.stringify(updateData));

  // Verify login
  console.log(`\nTesting signInWithPassword for ${adminEmail} / ${adminPass}...`);
  const loginRes = await supabaseClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPass,
  });

  if (loginRes.error || !loginRes.data.user) {
    console.error('[FAIL] Login error:', loginRes.error?.message);
  } else {
    console.log('[SUCCESS] Logged in as Super Admin!', loginRes.data.user.email);
  }
}

provisionAdminProfile();
