const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFinalAdminLogin() {
  console.log('--- TESTING FINAL SUPER ADMIN LOGIN ---');

  // Test 1: Login with username 'admin' and password 'password123'
  const { data: userMatch } = await supabase
    .from('users')
    .select('email')
    .eq('username', 'admin')
    .maybeSingle();

  console.log('Username "admin" resolved to email:', userMatch?.email);

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: userMatch.email,
    password: 'password123',
  });

  if (authErr) {
    console.error('[FAIL] Login failed:', authErr.message);
  } else {
    console.log('[SUCCESS] Super Admin logged in cleanly!');
    console.log('  -> User ID:', authData.user.id);
    console.log('  -> Email:', authData.user.email);
  }
}

testFinalAdminLogin();
