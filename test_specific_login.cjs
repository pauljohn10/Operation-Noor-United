const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testAccounts() {
  console.log('--- TESTING ACCOUNTS FOR 500 ERROR ---');

  // Create a brand new user via Edge Function or Admin API
  const testEmail = `login_test_${Date.now()}@alnoor.sa`;
  const testPass = 'TestPass123!';

  console.log(`Creating test user: ${testEmail}`);
  const { data: newAuth, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPass,
    email_confirm: true,
  });

  if (createErr) {
    console.error('Create test user failed:', createErr);
    return;
  }

  console.log('Created test user ID:', newAuth.user.id);

  // Now test signInWithPassword for this brand new user!
  console.log(`Attempting signInWithPassword for ${testEmail}...`);
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (loginErr) {
    console.error('[FAIL] signInWithPassword error:', loginErr);
  } else {
    console.log('[SUCCESS] Logged in successfully! User ID:', loginData.user.id);
  }

  // Cleanup test user
  await supabaseAdmin.auth.admin.deleteUser(newAuth.user.id);
  console.log('Test user cleaned up.');
}

testAccounts();
