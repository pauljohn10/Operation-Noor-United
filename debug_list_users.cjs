const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function debugListUsers() {
  console.log('Fetching users from auth.admin.listUsers()...');
  const res = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  console.log('listUsers error:', res.error);
  console.log('listUsers count:', res.data?.users?.length);
  if (res.data?.users) {
    res.data.users.forEach((u) => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Created: ${u.created_at}`);
    });
  }
}

debugListUsers();
