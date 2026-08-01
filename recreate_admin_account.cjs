const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function recreateAdmin() {
  console.log('--- RECREATING SUPER ADMIN ACCOUNT (admin@alnoor.sa) ---');
  const adminEmail = 'admin@alnoor.sa';

  // 1. Delete existing admin record from auth.users via admin API
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
  const existingAdmin = listData?.users?.find((u) => u.email === adminEmail);

  if (existingAdmin) {
    console.log(`Deleting corrupted admin user from auth.users (ID: ${existingAdmin.id})...`);
    await supabaseAdmin.auth.admin.deleteUser(existingAdmin.id);
  }

  // 2. Create fresh admin account in auth.users
  console.log(`Creating fresh admin user (${adminEmail}) in Supabase Auth...`);
  const { data: newAuth, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Eng. Ibrahim Al-Mansoor',
      username: 'admin',
      role: 'Super Admin',
      position: 'Chief Enterprise Admin',
    },
  });

  if (createErr) {
    console.error('[FAIL] Error creating admin user in Supabase Auth:', createErr.message);
    process.exit(1);
  }

  const adminUuid = newAuth.user.id;
  console.log(`[SUCCESS] Created Super Admin in auth.users with ID: ${adminUuid}`);

  // 3. Upsert into public.users with password_hash: ''
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
    console.error('Error upserting public.users record:', dbErr.message);
  } else {
    console.log('[SUCCESS] Public profile upserted into public.users table.');
  }

  // 4. Test signInWithPassword using public anon key client
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\nTesting signInWithPassword for admin@alnoor.sa / admin123...');
  const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail,
    password: 'admin123',
  });

  if (authErr) {
    console.error('[FAIL] signInWithPassword failed:', authErr.message);
  } else {
    console.log('[SUCCESS] Logged in successfully! User ID:', authData.user.id);
  }
}

recreateAdmin();
