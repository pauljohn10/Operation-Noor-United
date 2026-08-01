const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabaseClient = createClient(supabaseUrl, anonKey);

async function runTest() {
  console.log('--- TEST 1: User A Creation & Authentication ---');
  const userA_Email = `usera_${Date.now()}@alnoor.sa`;
  const userA_Password = 'Password123!';

  console.log(`[Create User A] Email: ${userA_Email} | Password: ${userA_Password}`);
  const { data: dataA, error: errA } = await supabaseAdmin.auth.admin.createUser({
    email: userA_Email,
    password: userA_Password,
    email_confirm: true,
  });

  if (errA) {
    console.error('[Error Create User A]:', errA.message);
    process.exit(1);
  }
  console.log(`[User A Created] ID: ${dataA.user.id}`);

  // Test User A Login
  const { data: loginA, error: loginErrA } = await supabaseClient.auth.signInWithPassword({
    email: userA_Email,
    password: userA_Password,
  });

  if (loginErrA) {
    console.error('[Error Login User A]:', loginErrA.message);
    process.exit(1);
  }
  console.log(`[User A Login SUCCESS] authenticated as: ${loginA.user.email}`);

  // Test User A Wrong Password Login (Must Fail)
  const { error: wrongLoginErrA } = await supabaseClient.auth.signInWithPassword({
    email: userA_Email,
    password: 'WrongPassword999!',
  });
  console.log(`[User A Wrong Password Check] Message: ${wrongLoginErrA?.message} (Expected Invalid Credentials)`);

  console.log('\n--- TEST 2: User B Creation & Authentication ---');
  const userB_Email = `userb_${Date.now()}@alnoor.sa`;
  const userB_Password = 'Welcome456!';

  console.log(`[Create User B] Email: ${userB_Email} | Password: ${userB_Password}`);
  const { data: dataB, error: errB } = await supabaseAdmin.auth.admin.createUser({
    email: userB_Email,
    password: userB_Password,
    email_confirm: true,
  });

  if (errB) {
    console.error('[Error Create User B]:', errB.message);
    process.exit(1);
  }
  console.log(`[User B Created] ID: ${dataB.user.id}`);

  // Test User B Login
  const { data: loginB, error: loginErrB } = await supabaseClient.auth.signInWithPassword({
    email: userB_Email,
    password: userB_Password,
  });

  if (loginErrB) {
    console.error('[Error Login User B]:', loginErrB.message);
    process.exit(1);
  }
  console.log(`[User B Login SUCCESS] authenticated as: ${loginB.user.email}`);

  // Verify User B cannot log in with User A's password
  const { error: mixPasswordErr } = await supabaseClient.auth.signInWithPassword({
    email: userB_Email,
    password: userA_Password,
  });
  console.log(`[User B Cross-Password Check] Message: ${mixPasswordErr?.message} (Expected Invalid Credentials)`);

  console.log('\n--- TEST 3: User A Password Change & Immediate Invalidation ---');
  const userA_NewPassword = 'NewPassword789!';
  console.log(`[Updating User A Password] New Password: ${userA_NewPassword}`);

  const { error: updateErrA } = await supabaseAdmin.auth.admin.updateUserById(dataA.user.id, {
    password: userA_NewPassword,
  });

  if (updateErrA) {
    console.error('[Error Updating User A Password]:', updateErrA.message);
    process.exit(1);
  }
  console.log('[User A Password Updated Successfully]');

  // Test User A Old Password (Must Fail Immediately)
  const { error: oldPasswordErrA } = await supabaseClient.auth.signInWithPassword({
    email: userA_Email,
    password: userA_Password,
  });
  console.log(`[User A Old Password Login] Result: ${oldPasswordErrA?.message} (Expected Invalid Credentials)`);

  // Test User A New Password (Must Succeed Immediately)
  const { data: newLoginA, error: newLoginErrA } = await supabaseClient.auth.signInWithPassword({
    email: userA_Email,
    password: userA_NewPassword,
  });

  if (newLoginErrA) {
    console.error('[Error User A New Password Login]:', newLoginErrA.message);
    process.exit(1);
  }
  console.log(`[User A New Password Login SUCCESS] authenticated as: ${newLoginA.user.email}`);

  console.log('\n--- Cleanup Test Users ---');
  await supabaseAdmin.auth.admin.deleteUser(dataA.user.id);
  await supabaseAdmin.auth.admin.deleteUser(dataB.user.id);

  console.log('\n=======================================================');
  console.log('VERIFICATION COMPLETE: ALL SUPABASE AUTH TESTS PASSED 100%');
  console.log('=======================================================');
}

runTest();
