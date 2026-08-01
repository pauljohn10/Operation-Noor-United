const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function updateAuthEmail() {
  const userId = 'f67903f6-59b5-4a82-ad46-187530e63d95';
  const newEmail = 'admin@alnoor.sa';
  const password = 'password123';

  console.log(`Updating email for user ID ${userId} to "${newEmail}" in auth.users...`);

  // First delete any old record in public.users with email admin@alnoor.sa
  await supabaseAdmin.from('users').delete().eq('email', newEmail);

  const { data: updatedAuth, error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email: newEmail,
    email_confirm: true,
    password: password,
  });

  if (authErr) {
    console.error('updateUserById error:', authErr.message);
    return;
  }
  console.log('[SUCCESS] Updated email in auth.users to:', updatedAuth.user.email);

  // Update public.users record
  const { error: dbErr } = await supabaseAdmin
    .from('users')
    .update({
      email: newEmail,
      username: 'admin',
      role: 'Super Admin',
      position: 'Chief Enterprise Admin',
    })
    .eq('id', userId);

  if (dbErr) console.error('Error updating public.users:', dbErr.message);
  else console.log('[SUCCESS] Updated public.users record to email:', newEmail);

  // Test signInWithPassword using admin@alnoor.sa and password123!
  console.log(`\nTesting signInWithPassword for ${newEmail} / ${password}...`);
  const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
    email: newEmail,
    password: password,
  });

  if (loginErr) {
    console.error('[FAIL] Login error:', loginErr.message);
  } else {
    console.log('[SUCCESS] Logged in as Super Admin!', loginData.user.email);
  }
}

updateAuthEmail();
