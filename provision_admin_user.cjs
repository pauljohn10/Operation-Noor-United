const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function provisionAdmin() {
  const adminEmail = 'admin@alnoor.sa';
  const adminPassword = 'admin123';

  console.log(`--- PROVISIONING SUPER ADMIN USER (${adminEmail}) ---`);

  // 1. Delete all existing instances of admin@alnoor.sa from auth.users
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existingUsers = listData?.users?.filter((u) => u.email?.toLowerCase() === adminEmail);

  if (existingUsers && existingUsers.length > 0) {
    for (const u of existingUsers) {
      console.log(`Deleting existing admin user ${u.id}...`);
      await supabaseAdmin.auth.admin.deleteUser(u.id);
    }
  }

  // Also check public.users for any old record with id 00000000-0000-0000-0000-000000000001
  await supabaseAdmin.from('users').delete().eq('id', '00000000-0000-0000-0000-000000000001');

  // 2. Create fresh Super Admin in auth.users
  console.log('Creating fresh admin user via Supabase Auth Admin API...');
  const { data: newAuth, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Eng. Ibrahim Al-Mansoor',
      username: 'admin',
      role: 'Super Admin',
      position: 'Chief Enterprise Admin',
    },
  });

  if (createErr || !newAuth?.user) {
    console.error('[FAIL] Failed to create admin user:', createErr?.message);
    process.exit(1);
  }

  const adminUuid = newAuth.user.id;
  console.log(`[SUCCESS] Created Super Admin in auth.users! ID: ${adminUuid}`);

  // 3. Upsert into public.users table
  const adminProfile = {
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
  };

  const { error: dbErr } = await supabaseAdmin
    .from('users')
    .upsert(adminProfile, { onConflict: 'id' });

  if (dbErr) {
    console.error('Error upserting public.users:', dbErr.message);
  } else {
    console.log('[SUCCESS] Public user profile upserted cleanly into public.users.');
  }

  // 4. Verify login using public anon client
  console.log('\n--- VERIFYING LOGIN VIA signInWithPassword ---');
  const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (loginErr || !loginData?.user) {
    console.error('[FAIL] Admin login failed:', loginErr?.message);
    process.exit(1);
  }

  console.log('[SUCCESS] Admin logged in successfully via Supabase Auth!');
  console.log('  -> User ID:', loginData.user.id);
  console.log('  -> Email:', loginData.user.email);
}

provisionAdmin();
