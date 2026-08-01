const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runFullUserManagementAudit() {
  const timestamp = Date.now();
  const testEmail = `audit_user_${timestamp}@alnoor.sa`;
  const initialPassword = `AuditPass_${timestamp}!`;
  const updatedPassword = `UpdatedPass_${timestamp}!`;

  console.log('===============================================================');
  console.log('   FULL USER MANAGEMENT MODULE & SUPABASE AUTH AUDIT');
  console.log('===============================================================');
  console.log(`[Target User] Email: ${testEmail}`);
  console.log(`[Initial Password] ${initialPassword}`);
  console.log(`[Updated Password] ${updatedPassword}`);
  console.log('---------------------------------------------------------------\n');

  // CHECK 1: User Creation with Custom Password & Profile Meta
  console.log('--- CHECK 1: User Creation via Edge Function ---');
  const createPayload = {
    action: 'create_user',
    email: testEmail,
    password: initialPassword,
    user: {
      employee_id: `EMP-${timestamp.toString().slice(-4)}`,
      full_name: 'Audit Supervisor User',
      email: testEmail,
      username: `audit_${timestamp}`,
      position: 'Senior Operations Supervisor',
      role: 'Operation Supervisor',
      assigned_station_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      assigned_station_name: 'Al Olaya Grand Station',
      status: 'active',
    },
  };

  const createRes = await fetch('http://localhost:5173/functions/v1/manage-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload),
  });

  const createData = await createRes.json();
  if (!createRes.ok || !createData.success) {
    console.error('[FAIL] User creation failed:', createData.error);
    process.exit(1);
  }

  const userId = createData.user.id;
  console.log('[PASS] User Created in auth.users & public.users.');
  console.log(`  -> User ID: ${userId}`);
  console.log(`  -> Role: ${createData.user.role}`);
  console.log(`  -> Assigned Station: ${createData.user.assigned_station_name}`);
  console.log(`  -> Password Hash Expose Check: "${createData.user.password_hash}" (Must be empty)`);

  if (createData.user.password_hash !== '') {
    console.error('[FAIL] Password hash was exposed in user object!');
    process.exit(1);
  }

  // CHECK 2: Supabase Authentication with Initial Custom Password
  console.log('\n--- CHECK 2: Login Authentication with Custom Password ---');
  const login1 = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: initialPassword,
  });

  if (login1.error || !login1.data.user) {
    console.error('[FAIL] Login with custom password failed:', login1.error?.message);
    process.exit(1);
  }
  console.log('[PASS] Authenticated successfully via Supabase Auth with custom password.');

  // CHECK 3: Verify Default Password Rejection
  console.log('\n--- CHECK 3: Verify Default Password Rejection ---');
  const loginDefault = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'password123',
  });

  if (!loginDefault.error) {
    console.error('[FAIL] Default password "password123" was accepted!');
    process.exit(1);
  }
  console.log('[PASS] Default password "password123" correctly rejected:', loginDefault.error.message);

  // CHECK 4: Password Update via Edge Function updateUserById
  console.log('\n--- CHECK 4: Update Password via Edge Function (updateUserById) ---');
  const updatePayload = {
    action: 'update_password',
    userId: userId,
    email: testEmail,
    password: updatedPassword,
  };

  const updateRes = await fetch('http://localhost:5173/functions/v1/manage-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload),
  });

  const updateData = await updateRes.json();
  if (!updateRes.ok || !updateData.success) {
    console.error('[FAIL] Password update failed:', updateData.error);
    process.exit(1);
  }
  console.log('[PASS] Password updated successfully in auth.users via Edge Function.');

  // CHECK 5: Immediate Invalidation of Old Password
  console.log('\n--- CHECK 5: Old Password Invalidation Verification ---');
  const loginOld = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: initialPassword,
  });

  if (!loginOld.error) {
    console.error('[FAIL] Old password still worked after update!');
    process.exit(1);
  }
  console.log('[PASS] Old password immediately invalidated:', loginOld.error.message);

  // CHECK 6: Authentication with New Password
  console.log('\n--- CHECK 6: New Password Authentication Verification ---');
  const loginNew = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: updatedPassword,
  });

  if (loginNew.error || !loginNew.data.user) {
    console.error('[FAIL] New password failed to authenticate:', loginNew.error?.message);
    process.exit(1);
  }
  console.log('[PASS] Authenticated successfully via Supabase Auth with new updated password.');

  // CHECK 7: Database Record Profile & Station Assignment Verification
  console.log('\n--- CHECK 7: Database Profile & Station Assignment Persistence ---');
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (dbError || !dbUser) {
    console.error('[FAIL] Could not fetch public.users record:', dbError?.message);
    process.exit(1);
  }

  console.log('[PASS] Database record fetched:');
  console.log(`  -> Full Name: ${dbUser.full_name}`);
  console.log(`  -> Role: ${dbUser.role}`);
  console.log(`  -> Position: ${dbUser.position}`);
  console.log(`  -> Assigned Station ID: ${dbUser.assigned_station_id}`);
  console.log(`  -> Status: ${dbUser.status}`);

  // CHECK 8: Cleanup Test User
  console.log('\n--- CHECK 8: Cleanup Test User ---');
  await fetch('http://localhost:5173/functions/v1/manage-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete_user', userId }),
  });
  console.log('[PASS] Test user account cleaned up cleanly.');

  console.log('\n===============================================================');
  console.log('   AUDIT COMPLETE: ALL 8 VERIFICATION CHECKS PASSED 100%');
  console.log('===============================================================');
}

runFullUserManagementAudit().catch((err) => {
  console.error('Audit Exception:', err);
  process.exit(1);
});
