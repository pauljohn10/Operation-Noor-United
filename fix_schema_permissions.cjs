const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function repairSchemaPermissions() {
  console.log('--- REPAIRING SUPABASE SCHEMA PERMISSIONS ---');

  // Test executing table permissions or queries
  const { data: dbData, error: dbErr } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .limit(10);

  if (dbErr) {
    console.error('Error fetching public.users:', dbErr.message);
  } else {
    console.log('[SUCCESS] public.users table accessible. Profiles:', dbData.length);
  }

  // Attempt to call RPC or raw query
  try {
    const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
      `
    });

    if (rpcErr) {
      console.log('RPC exec_sql note:', rpcErr.message);
    } else {
      console.log('[SUCCESS] Granted public schema permissions to all roles.');
    }
  } catch (e) {
    console.log('Permission setup attempted.');
  }

  // Check raw token endpoint again
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI',
    },
    body: JSON.stringify({
      email: 'admin@alnoor.sa',
      password: 'admin123',
    }),
  });

  console.log('Post-repair Token Endpoint Status:', res.status);
  const text = await res.text();
  console.log('Post-repair Response Body:', text);
}

repairSchemaPermissions();
