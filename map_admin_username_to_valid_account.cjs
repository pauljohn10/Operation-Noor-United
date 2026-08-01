const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function mapAdminUsername() {
  console.log('--- MAPPING ADMIN USERNAME TO VALID SUPABASE AUTH ACCOUNT ---');

  // 1. Find user in public.users with email admin.user@alnoor.sa or role Super Admin
  const { data: dbUsers, error: dbErr } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('role', 'Super Admin');

  if (dbErr || !dbUsers || dbUsers.length === 0) {
    console.error('No Super Admin found in public.users');
    return;
  }

  const validAdmin = dbUsers.find((u) => u.email === 'admin.user@alnoor.sa') || dbUsers[0];
  console.log(`Updating username of Super Admin account (${validAdmin.email}) to 'admin'...`);

  // Clear any old user with username 'admin'
  await supabaseAdmin.from('users').delete().eq('username', 'admin');

  // Update valid admin username to 'admin'
  const { error: updateErr } = await supabaseAdmin
    .from('users')
    .update({ username: 'admin' })
    .eq('id', validAdmin.id);

  if (updateErr) console.error('Update username error:', updateErr.message);
  else console.log('[SUCCESS] Username "admin" mapped to Super Admin account:', validAdmin.email);

  // 2. Test logging in with username "admin" and password "Password123!" via authenticateUser logic
  console.log(`\nTesting lookup for username "admin"...`);
  const { data: matched } = await supabaseClient
    .from('users')
    .select('email')
    .eq('username', 'admin')
    .maybeSingle();

  console.log('Matched email for username "admin":', matched?.email);

  if (matched?.email) {
    console.log(`Testing signInWithPassword for ${matched.email} / Password123!...`);
    const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
      email: matched.email,
      password: 'Password123!',
    });

    if (authErr) {
      console.error('[FAIL] Login error:', authErr.message);
    } else {
      console.log('[SUCCESS] Logged in successfully as Super Admin!', authData.user.email);
    }
  }
}

mapAdminUsername();
