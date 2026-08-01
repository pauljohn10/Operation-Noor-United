const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function diagnose() {
  console.log('--- DIAGNOSING SUPABASE 500 ERROR ---');

  // 1. List all auth users in Supabase Auth
  const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error('Error listing auth.users:', listErr.message);
  } else {
    console.log(`Found ${listData.users.length} users in auth.users:`);
    listData.users.forEach((u) => console.log(` - ID: ${u.id} | Email: ${u.email} | Confirmed: ${u.email_confirmed_at}`));
  }

  // 2. Ensure Super Admin admin@alnoor.sa exists and set password to admin123 cleanly
  const adminEmail = 'admin@alnoor.sa';
  const existingAdmin = listData?.users?.find((u) => u.email === adminEmail);

  if (existingAdmin) {
    console.log(`\nResetting password for Super Admin (${adminEmail})...`);
    const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
      password: 'admin123',
      email_confirm: true,
    });
    if (resetErr) console.error('Error resetting admin password:', resetErr.message);
    else console.log('[SUCCESS] Admin password reset to "admin123" via updateUserById.');
  } else {
    console.log(`\nCreating Super Admin account (${adminEmail})...`);
    const { data: newAdmin, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Eng. Ibrahim Al-Mansoor',
        username: 'admin',
        role: 'Super Admin',
      },
    });
    if (createErr) console.error('Error creating admin account:', createErr.message);
    else console.log('[SUCCESS] Super Admin account created with password "admin123". ID:', newAdmin.user?.id);
  }

  // 3. Test signInWithPassword for admin@alnoor.sa
  console.log(`\nTesting signInWithPassword for ${adminEmail} with "admin123"...`);
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: 'admin123',
  });

  if (authErr) {
    console.error('[FAIL] signInWithPassword returned error:', authErr);
  } else {
    console.log('[SUCCESS] Logged in as Super Admin!', authData.user.email);
  }
}

diagnose();
