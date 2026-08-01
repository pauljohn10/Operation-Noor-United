const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function inspectPublicUsers() {
  console.log('Inspecting all records in public.users...');
  const { data: users, error } = await supabaseAdmin.from('users').select('*');
  if (error) {
    console.error('Error fetching public.users:', error.message);
  } else {
    console.log(`Found ${users.length} records in public.users:`);
    users.forEach((u) => {
      console.log(` - ID: ${u.id} | Email: ${u.email} | Username: ${u.username} | Role: ${u.role}`);
    });
  }
}

inspectPublicUsers();
