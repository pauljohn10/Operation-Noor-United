const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function provisionFreshAdmin() {
  const adminEmail = 'admin.user@alnoor.sa';
  const adminPass = 'Password123!';

  console.log(`Provisioning fresh admin (${adminEmail}) via Edge Function Proxy...`);
  const createPayload = {
    action: 'create_user',
    email: adminEmail,
    password: adminPass,
    user: {
      employee_id: 'EMP-0001',
      full_name: 'Eng Ibrahim Al-Mansoor',
      email: adminEmail,
      username: 'admin_master',
      position: 'Staff Member',
      role: 'Operation Supervisor',
      status: 'active',
    },
  };

  const createRes = await fetch('http://localhost:5173/functions/v1/manage-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload),
  });

  const createData = await createRes.json();
  console.log('[Create Admin Status]', createRes.status);
  console.log('[Create Admin Response]', JSON.stringify(createData));

  if (!createRes.ok || !createData.success) {
    console.error('Failed to create fresh admin:', createData.error);
    process.exit(1);
  }

  const userId = createData.user.id;
  console.log(`[SUCCESS] Super Admin created in auth.users & public.users! ID: ${userId}`);

  // Test signInWithPassword
  console.log(`\nTesting signInWithPassword for ${adminEmail} / ${adminPass}...`);
  const loginRes = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPass,
  });

  if (loginRes.error || !loginRes.data.user) {
    console.error('[FAIL] Login failed:', loginRes.error?.message);
    process.exit(1);
  }

  console.log('[SUCCESS] Logged in successfully as Super Admin!');
  console.log('  -> User ID:', loginRes.data.user.id);
  console.log('  -> Email:', loginRes.data.user.email);
}

provisionFreshAdmin();
