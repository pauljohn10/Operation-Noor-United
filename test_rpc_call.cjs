const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpc() {
  console.log('Testing RPC sync_unmapped_auth_users...');
  const { data, error } = await supabase.rpc('sync_unmapped_auth_users');
  if (error) console.error('RPC error:', error.message);
  else console.log('RPC sync_unmapped_auth_users success!');
}

testRpc();
