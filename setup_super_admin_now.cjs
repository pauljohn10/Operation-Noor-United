const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function setupSuperAdmin() {
  console.log('--- SETTING UP SUPER ADMIN ACCOUNT (admin) ---');
  const userId = 'f67903f6-59b5-4a82-ad46-187530e63d95';
  const newPassword = 'password123';

  // 1. Update password in auth.users via updateUserById
  console.log(`Setting password to "${newPassword}" for user ID ${userId} in auth.users...`);
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
    email_confirm: true,
  });

  if (authErr) {
    console.error('Error updating password in auth.users:', authErr.message);
    return;
  }
  console.log('[SUCCESS] Password updated in auth.users to:', newPassword);

  // 2. Update profile in public.users
  const { error: dbErr } = await supabaseAdmin
    .from('users')
    .update({
      username: 'admin',
      role: 'Super Admin',
      position: 'Chief Enterprise Admin',
      full_name: 'Eng. Ibrahim Al-Mansoor',
    })
    .eq('id', userId);

  if (dbErr) {
    console.error('Error updating public.users profile:', dbErr.message);
    return;
  }
  console.log('[SUCCESS] Updated public.users profile: username="admin", role="Super Admin".');

  // 3. Test signInWithPassword using username "admin" and password "password123"!
  console.log('\n--- TESTING LOGIN WITH USERNAME "admin" AND PASSWORD "password123" ---');
  const { data: matched } = await supabaseClient
    .from('users')
    .select('email')
    .eq('username', 'admin')
    .maybeSingle();

  console.log('Username "admin" resolved to email:', matched?.email);

  if (matched?.email) {
    const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
      email: matched.email,
      password: newPassword,
    });

    if (loginErr) {
      console.error('[FAIL] Login error:', loginErr.message);
    } else {
      console.log('[SUCCESS] Logged in successfully as Super Admin!');
      console.log('  -> User ID:', loginData.user.id);
      console.log('  -> Email:', loginData.user.email);
    }
  }
}

setupSuperAdmin();
