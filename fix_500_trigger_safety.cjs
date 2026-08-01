const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function repairSupabaseAuth() {
  console.log('--- REPAIRING SUPABASE AUTHENTICATION SERVICE ---');

  // 1. Fetch public.users schema and verify table structure
  const { data: dbUsers, error: dbErr } = await supabaseAdmin.from('users').select('*').limit(5);
  if (dbErr) {
    console.error('Error fetching public.users:', dbErr.message);
  } else {
    console.log(`[public.users Table Accessible] ${dbUsers.length} records found.`);
  }

  // 2. Try creating or updating Super Admin admin@alnoor.sa via auth.admin API
  const adminEmail = 'admin@alnoor.sa';
  const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();

  console.log('listUsers result:', listErr ? listErr.message : `Success (${listData?.users?.length} users)`);

  if (listData?.users) {
    const existingAdmin = listData.users.find((u) => u.email === adminEmail);
    if (existingAdmin) {
      console.log(`Found existing admin account ${existingAdmin.id}. Updating password...`);
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
        password: 'admin123',
        email_confirm: true,
      });
      console.log('Update password result:', updateErr ? updateErr.message : 'Success');
    } else {
      console.log('Creating new admin account...');
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
      console.log('Create admin result:', createErr ? createErr.message : `Success (ID: ${newAdmin?.user?.id})`);
    }
  }
}

repairSupabaseAuth();
