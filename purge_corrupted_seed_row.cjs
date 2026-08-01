const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function purgeCorruptedSeedRow() {
  console.log('Attempting to delete corrupted seed row 00000000-0000-0000-0000-000000000001...');
  const res = await supabaseAdmin.auth.admin.deleteUser('00000000-0000-0000-0000-000000000001');
  console.log('deleteUser result error:', res.error);
  console.log('deleteUser result data:', res.data);

  // Now test listUsers again!
  console.log('\nTesting auth.admin.listUsers()...');
  const listRes = await supabaseAdmin.auth.admin.listUsers();
  if (listRes.error) {
    console.error('[FAIL] listUsers error:', listRes.error);
  } else {
    console.log('[SUCCESS] listUsers retrieved users cleanly! Count:', listRes.data.users.length);
    listRes.data.users.forEach((u) => console.log(` - User ID: ${u.id} | Email: ${u.email}`));
  }
}

purgeCorruptedSeedRow();
