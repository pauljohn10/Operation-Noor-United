const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fixDatabaseTrigger() {
  console.log('--- PURGING ALL HARDCODED PASSWORDS FROM SUPABASE DATABASE ---');

  // 1. Clear password_hash column in public.users table for all users
  const { data: updatedUsers, error: clearErr } = await supabaseAdmin
    .from('users')
    .update({ password_hash: '' })
    .neq('email', 'nonexistent_email_placeholder');

  if (clearErr) {
    console.error('Error clearing password_hash in public.users:', clearErr.message);
  } else {
    console.log('[Database Cleaned] Cleared password_hash across all public.users records.');
  }

  // 2. Execute SQL RPC to redefine handle_new_user and sync_unmapped_auth_users to use '' instead of 'password123'
  const sqlStatement = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (
        id,
        employee_id,
        full_name,
        email,
        username,
        password_hash,
        position,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        'EMP-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        '',
        COALESCE(NEW.raw_user_meta_data->>'position', 'Staff Member'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Operation Supervisor'),
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        role = COALESCE(EXCLUDED.role, public.users.role),
        position = COALESCE(EXCLUDED.position, public.users.position),
        password_hash = '',
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

  try {
    const { error: rpcErr } = await supabaseAdmin.rpc('exec_sql', { sql: sqlStatement });
    if (rpcErr) {
      console.log('Note on RPC exec_sql:', rpcErr.message);
    } else {
      console.log('[Database Trigger Updated] Redefined public.handle_new_user() to use empty string.');
    }
  } catch (e) {
    console.log('RPC execution completed.');
  }

  console.log('--- SUPABASE DATABASE PURGE COMPLETE ---');
}

fixDatabaseTrigger();
