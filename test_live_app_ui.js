const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runLiveAppVerification() {
  const timestamp = Date.now();
  const testEmail = `live_ui_user_${timestamp}@alnoor.sa`;
  const initialPassword = `LivePass_${timestamp}!`;
  const updatedPassword = `ChangedPass_${timestamp}!`;

  console.log('=== LIVE APPLICATION UI FLOW VERIFICATION ===');
  console.log(`[Test Account] Email: ${testEmail}`);
  console.log(`[Initial Custom Password] ${initialPassword}`);
  console.log(`[Updated Custom Password] ${updatedPassword}`);
  console.log('--------------------------------------------------');

  // STEP 1: Simulate User Management UI "Create User" action calling /functions/v1/manage-user
  console.log('\n--- STEP 1: UI Create User Action ---');
  const createPayload = {
    action: 'create_user',
    email: testEmail,
    password: initialPassword,
    user: {
      employee_id: `EMP-${timestamp.toString().slice(-4)}`,
      full_name: 'Live UI Test User',
      email: testEmail,
      username: `live_ui_${timestamp}`,
      position: 'Quality Auditor',
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
  console.log('[Create User Response Status]', createRes.status);
  console.log('[Create User Response Body]', JSON.stringify(createData));

  if (!createRes.ok || !createData.success) {
    console.error('FAILED to create user via live UI Edge Function endpoint!');
    process.exit(1);
  }

  const userId = createData.user.id;
  console.log(`[User Provisioned in auth.users] ID: ${userId}`);

  // STEP 2: Verify Login with Initial Custom Password
  console.log('\n--- STEP 2: Authenticate with Initial Custom Password ---');
  const login1 = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: initialPassword,
  });

  if (login1.error || !login1.data.user) {
    console.error('[FAILED] Could not log in with initial custom password:', login1.error?.message);
    process.exit(1);
  }
  console.log('[SUCCESS] Logged in successfully with custom password:', initialPassword);

  // STEP 3: Verify Login with Wrong / Default Password fails
  console.log('\n--- STEP 3: Verify Wrong / Default Password Rejection ---');
  const loginWrong = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'password123',
  });

  if (!loginWrong.error) {
    console.error('[FAILED] Default password password123 was incorrectly accepted!');
    process.exit(1);
  }
  console.log('[SUCCESS] Default password password123 rejected:', loginWrong.error.message);

  // STEP 4: Simulate User Management UI "Edit User Password" action calling /functions/v1/manage-user
  console.log('\n--- STEP 4: UI Edit User Change Password Action ---');
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
  console.log('[Update Password Response Status]', updateRes.status);
  console.log('[Update Password Response Body]', JSON.stringify(updateData));

  if (!updateRes.ok || !updateData.success) {
    console.error('FAILED to update password via live UI Edge Function endpoint!');
    process.exit(1);
  }
  console.log('[SUCCESS] Password updated in auth.users via Edge Function');

  // STEP 5: Verify Old Password Invalidation
  console.log('\n--- STEP 5: Verify Old Password Invalidation ---');
  const loginOld = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: initialPassword,
  });

  if (!loginOld.error) {
    console.error('[FAILED] Old password still worked after change!');
    process.exit(1);
  }
  console.log('[SUCCESS] Old password rejected immediately:', loginOld.error.message);

  // STEP 6: Verify New Password Login
  console.log('\n--- STEP 6: Verify New Password Authentication ---');
  const loginNew = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: updatedPassword,
  });

  if (loginNew.error || !loginNew.data.user) {
    console.error('[FAILED] New password failed to authenticate:', loginNew.error?.message);
    process.exit(1);
  }
  console.log('[SUCCESS] Logged in successfully with new updated password:', updatedPassword);

  // STEP 7: Cleanup
  console.log('\n--- STEP 7: Cleanup Test User ---');
  await fetch('http://localhost:5173/functions/v1/manage-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete_user', userId }),
  });
  console.log('[Cleanup Complete]');

  console.log('\n======================================================');
  console.log('ALL LIVE APPLICATION UI VERIFICATION CHECKS PASSED 100%');
  console.log('======================================================');
}

runLiveAppVerification().catch((err) => {
  console.error('Verification Error:', err);
  process.exit(1);
});
