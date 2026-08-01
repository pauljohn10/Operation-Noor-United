const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function aliasAdminEmails() {
  console.log('--- ALIASING admin@alnoor.sa AND admin USERNAME TO VALID ACCOUNT ---');

  // Update existing Super Admin record f67903f6-59b5-4a82-ad46-187530e63d95
  const userId = 'f67903f6-59b5-4a82-ad46-187530e63d95';

  const { error: dbErr } = await supabaseAdmin
    .from('users')
    .update({
      username: 'admin',
      role: 'Super Admin',
      position: 'Chief Enterprise Admin',
      full_name: 'Eng. Ibrahim Al-Mansoor',
    })
    .eq('id', userId);

  if (dbErr) console.error('Error updating public.users profile:', dbErr.message);
  else console.log('[SUCCESS] Super Admin account in public.users updated: username="admin", email="admin.user@alnoor.sa"');

  // Test authenticating with identifier "admin@alnoor.sa" using updated logic
  const identifier = 'admin@alnoor.sa';
  const { data: matched } = await supabaseClient
    .from('users')
    .select('email')
    .or(`username.ilike.${identifier},email.ilike.${identifier}`)
    .maybeSingle();

  console.log(`Lookup for identifier "${identifier}":`, matched?.email);

  // If no exact email match for admin@alnoor.sa in public.users, let's also update email to admin@alnoor.sa in public.users or map it!
  const { data: superAdmin } = await supabaseClient
    .from('users')
    .select('email')
    .eq('username', 'admin')
    .maybeSingle();

  console.log('Lookup for username "admin":', superAdmin?.email);

  if (superAdmin?.email) {
    const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
      email: superAdmin.email,
      password: 'password123',
    });

    if (authErr) {
      console.error('[FAIL] Login error:', authErr.message);
    } else {
      console.log('[SUCCESS] Logged in successfully as Super Admin!', authData.user.email);
    }
  }
}

aliasAdminEmails();
