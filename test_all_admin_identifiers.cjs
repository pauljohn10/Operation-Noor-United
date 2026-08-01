const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAllAdminIdentifiers() {
  console.log('--- TESTING ALL ADMIN IDENTIFIERS (admin@alnoor.sa, admin, admin.user@alnoor.sa) ---');

  const identifiers = ['admin@alnoor.sa', 'admin', 'admin.user@alnoor.sa'];
  const password = 'password123';

  for (const id of identifiers) {
    let emailToAuth = id.trim().toLowerCase();

    if (emailToAuth === 'admin@alnoor.sa' || emailToAuth === 'admin') {
      emailToAuth = 'admin.user@alnoor.sa';
    }

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password: password,
    });

    if (authErr) {
      console.error(`[FAIL] Login with identifier "${id}" failed:`, authErr.message);
    } else {
      console.log(`[SUCCESS] Identifier "${id}" authenticated cleanly! Logged in as: ${authData.user.email}`);
    }
  }
}

testAllAdminIdentifiers();
