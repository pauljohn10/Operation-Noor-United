const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listRpcFunctions() {
  console.log('Querying information_schema.routines for RPC functions...');
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .limit(1);

  if (error) console.error('Query error:', error.message);
  else console.log('public.users is responding cleanly.');

  // Try calling known functions or checking RPC endpoints
  const funcs = ['sync_unmapped_auth_users', 'handle_new_user', 'exec_sql', 'execute_sql', 'sql'];
  for (const fn of funcs) {
    const { error: fnErr } = await supabaseAdmin.rpc(fn);
    console.log(`RPC function '${fn}':`, fnErr ? fnErr.message : 'Available / Executed');
  }
}

listRpcFunctions();
