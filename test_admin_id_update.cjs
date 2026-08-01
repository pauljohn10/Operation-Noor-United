const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminIdUpdate() {
  const seedAdminUuid = '00000000-0000-0000-0000-000000000001';
  console.log(`Updating password for seed admin ID (${seedAdminUuid})...`);

  const { data: updateData, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(seedAdminUuid, {
    password: 'admin123',
    email_confirm: true,
  });

  if (updateErr) {
    console.error('updateUserById error:', updateErr.message);
  } else {
    console.log('[SUCCESS] Updated password for seed admin ID!', updateData?.user?.email);
  }

  // Now test signInWithPassword for admin@alnoor.sa
  console.log('\nTesting signInWithPassword for admin@alnoor.sa...');
  const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
    email: 'admin@alnoor.sa',
    password: 'admin123',
  });

  if (loginErr) {
    console.error('[FAIL] Login error:', loginErr.message);
  } else {
    console.log('[SUCCESS] Logged in as Super Admin!', loginData.user.email);
  }
}

testAdminIdUpdate();
