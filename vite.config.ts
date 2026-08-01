import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (id?: string | null): boolean => Boolean(id && UUID_REGEX.test(id));

function edgeFunctionCorsPlugin(): Plugin {
  return {
    name: 'edge-function-cors-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = (req.url || '').toLowerCase();
        if (rawUrl.includes('manage-user') || rawUrl.includes('functions') || rawUrl.includes('/api/admin')) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin');
          res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ status: 'ok' }));
          }

          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              const { action, userId, email, password, user } = body;

              console.log(`[Edge Function Proxy] Action: ${action} | Target: ${email || userId}`);

              // 1. CREATE USER (Strict Supabase Auth Admin Creation)
              if (action === 'create_user') {
                const pass = (password || '').trim();
                const userEmail = (email || user?.email || '').trim().toLowerCase();

                if (!userEmail || !pass) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Email and password are required.' }));
                }

                if (pass.length < 6) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Password must be at least 6 characters long.' }));
                }

                // Debug log password sent to Edge Function (never saved to DB)
                console.log(`[Edge Function Proxy DEBUG] Creating user in auth.admin.createUser with email: "${userEmail}" and password: "${pass}"`);

                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                  email: userEmail,
                  password: pass,
                  email_confirm: true,
                  user_metadata: {
                    full_name: user?.full_name || '',
                    username: user?.username || userEmail.split('@')[0],
                    role: user?.role || 'Operation Supervisor',
                    position: user?.position || 'Staff Member',
                  },
                });

                if (authError || !authData?.user) {
                  console.error('[Edge Function Proxy] auth.admin.createUser failed:', authError?.message);
                  res.statusCode = 400;
                  return res.end(JSON.stringify({
                    success: false,
                    error: authError?.message || 'Failed to create user in Supabase Authentication.',
                  }));
                }

                const authUuid = authData.user.id;
                console.log(`[Edge Function Proxy] auth.admin.createUser SUCCESS | Auth User ID: ${authUuid}`);

                // After successful Auth creation, create linked profile record in public.users
                const profile = {
                  id: authUuid,
                  employee_id: user?.employee_id || `EMP-${authUuid.substring(0, 6).toUpperCase()}`,
                  full_name: user?.full_name || userEmail.split('@')[0],
                  email: userEmail,
                  username: user?.username || userEmail.split('@')[0],
                  password_hash: '', // Never store passwords in any database table
                  mobile_number: user?.mobile_number || '',
                  position: user?.position || 'Staff Member',
                  role: user?.role || 'Operation Supervisor',
                  assigned_station_id: isValidUuid(user?.assigned_station_id) ? user.assigned_station_id : null,
                  assigned_station_name: user?.assigned_station_name || null,
                  signature_url: user?.signature_url || '',
                  status: user?.status || 'active',
                  created_at: user?.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };

                const { data: dbData, error: dbError } = await supabaseAdmin
                  .from('users')
                  .upsert(profile, { onConflict: 'id' })
                  .select()
                  .single();

                if (dbError) {
                  console.error('[Edge Function Proxy] Profile record creation failed:', dbError.message);
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ success: false, error: dbError.message }));
                }

                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true, user: dbData }));
              }

              // 2. UPDATE PASSWORD (EXCLUSIVELY IN SUPABASE AUTH VIA updateUserById)
              if (action === 'update_password') {
                const pass = (password || '').trim();
                const userEmail = (email || '').trim().toLowerCase();
                const targetUserId = (userId || '').trim();

                if (!pass) {
                  res.statusCode = 200;
                  return res.end(JSON.stringify({ success: true }));
                }

                if (pass.length < 6) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Password must be at least 6 characters long.' }));
                }

                console.log(`[Edge Function Proxy DEBUG] Updating password via updateUserById for: "${userEmail || targetUserId}" with password: "${pass}"`);

                let targetAuthId = isValidUuid(targetUserId) ? targetUserId : null;

                if (!targetAuthId && userEmail) {
                  const { data: existingDbUser } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('email', userEmail)
                    .maybeSingle();

                  if (existingDbUser?.id) {
                    targetAuthId = existingDbUser.id;
                  }
                }

                if (targetAuthId) {
                  console.log('[Edge Function Proxy] Updating password in auth.users via updateUserById for ID:', targetAuthId);
                  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetAuthId, {
                    password: pass,
                    email_confirm: true,
                  });

                  if (!updateError) {
                    console.log('[Edge Function Proxy] Password updated successfully in auth.users for ID:', targetAuthId);
                    res.statusCode = 200;
                    return res.end(JSON.stringify({ success: true }));
                  }

                  console.warn('[Edge Function Proxy] updateUserById failed:', updateError.message);
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: updateError.message }));
                }

                if (userEmail) {
                  const { data: dbUser } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', userEmail)
                    .maybeSingle();

                  console.log('[Edge Function Proxy] Provisioning auth.users account for:', userEmail);
                  const { data: newAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: userEmail,
                    password: pass,
                    email_confirm: true,
                    user_metadata: {
                      full_name: dbUser?.full_name || userEmail.split('@')[0],
                      username: dbUser?.username || userEmail.split('@')[0],
                      role: dbUser?.role || 'Operation Supervisor',
                      position: dbUser?.position || 'Staff Member',
                    },
                  });

                  if (newAuth?.user) {
                    if (dbUser?.id && dbUser.id !== newAuth.user.id) {
                      await supabaseAdmin.from('users').update({ id: newAuth.user.id }).eq('id', dbUser.id);
                    }
                    console.log('[Edge Function Proxy] Provisioned and set password in auth.users for:', userEmail);
                    res.statusCode = 200;
                    return res.end(JSON.stringify({ success: true }));
                  }

                  if (createError) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ success: false, error: createError.message }));
                  }
                }

                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, error: 'User not found in Supabase Authentication' }));
              }

              // 3. DELETE USER
              if (action === 'delete_user') {
                if (userId) {
                  try {
                    await supabaseAdmin.auth.admin.deleteUser(userId);
                  } catch (e) {}
                  try {
                    await supabaseAdmin.from('users').delete().eq('id', userId);
                  } catch (e) {}
                }
                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true }));
              }

              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Invalid action' }));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    edgeFunctionCorsPlugin(),
  ],
});
