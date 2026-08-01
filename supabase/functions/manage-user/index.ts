import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (id?: string | null): boolean => Boolean(id && UUID_REGEX.test(id));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { action, userId, email, password, user } = await req.json();

    console.log(`[Edge Function] Action: ${action} | Target: ${email || userId}`);

    // 1. CREATE USER (Strict Supabase Auth Admin Creation)
    if (action === 'create_user') {
      const pass = (password || '').trim();
      const userEmail = (email || user?.email || '').trim().toLowerCase();

      if (!userEmail || !pass) {
        return new Response(
          JSON.stringify({ success: false, error: 'Email and password are required.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      if (pass.length < 6) {
        return new Response(
          JSON.stringify({ success: false, error: 'Password must be at least 6 characters long.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log(`[Edge Function DEBUG] Creating user in auth.admin.createUser with email: "${userEmail}" and password: "${pass}"`);

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
        console.error('[Edge Function] auth.admin.createUser failed:', authError?.message);
        return new Response(
          JSON.stringify({
            success: false,
            error: authError?.message || 'Failed to create user in Supabase Authentication.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const authUuid = authData.user.id;
      console.log(`[Edge Function] auth.admin.createUser SUCCESS | Auth User ID: ${authUuid}`);

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
        console.error('[Edge Function] Profile record creation failed:', dbError.message);
        return new Response(
          JSON.stringify({ success: false, error: dbError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, user: dbData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. UPDATE PASSWORD (EXCLUSIVELY IN SUPABASE AUTH VIA updateUserById)
    if (action === 'update_password') {
      const pass = (password || '').trim();
      const userEmail = (email || '').trim().toLowerCase();
      const targetUserId = (userId || '').trim();

      if (!pass) {
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      if (pass.length < 6) {
        return new Response(
          JSON.stringify({ success: false, error: 'Password must be at least 6 characters long.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log(`[Edge Function DEBUG] Updating password via updateUserById for: "${userEmail || targetUserId}" with password: "${pass}"`);

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
        console.log('[Edge Function] Updating password in auth.users via updateUserById for ID:', targetAuthId);
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetAuthId, {
          password: pass,
          email_confirm: true,
        });

        if (!updateError) {
          console.log('[Edge Function] Password updated successfully in auth.users for ID:', targetAuthId);
          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }

        console.warn('[Edge Function] updateUserById failed:', updateError.message);
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'User not found in Supabase Authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
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
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
