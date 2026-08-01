const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function rebuildAdminIdentities() {
  console.log('--- REPAIRING ADMIN USER IDENTITY ---');
  const adminEmail = 'admin@alnoor.sa';
  const targetPassword = 'password123';

  // Test listUsers page 1
  const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  console.log('listUsers status:', listErr ? listErr.message : `Found ${listData.users.length} users`);

  if (listData?.users) {
    const adminUser = listData.users.find(u => u.email === adminEmail);
    if (adminUser) {
      console.log('Found admin user in auth.users. Resetting password via updateUserById...');
      const { data: updated, error: upErr } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
        password: targetPassword,
        email_confirm: true,
      });

      if (upErr) console.error('updateUserById error:', upErr.message);
      else console.log('[SUCCESS] Updated password via updateUserById for ID:', adminUser.id);
    }
  }

  // Also upsert public.users for admin@alnoor.sa
  const { data: existingPublic } = await supabaseAdmin
    .from('users')
    .select('*')
    .or(`email.eq.${adminEmail},username.eq.admin`)
    .maybeSingle();

  if (!existingPublic) {
    console.log('Creating public.users profile for admin@alnoor.sa...');
    const adminUuid = '00000000-0000-0000-0000-000000000001';
    await supabaseAdmin.from('users').upsert({
      id: adminUuid,
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
    });
  }

  // Test signInWithPassword
  console.log(`\nTesting signInWithPassword for ${adminEmail} with password "${targetPassword}"...`);
  const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail,
    password: targetPassword,
  });

  if (loginErr) {
    console.error('[FAIL] Login error:', loginErr.message);
  } else {
    console.log('[SUCCESS] Logged in successfully as Super Admin!', loginData.user.email);
  }
}

rebuildAdminIdentities();
