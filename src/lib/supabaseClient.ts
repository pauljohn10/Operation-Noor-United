import { createClient } from '@supabase/supabase-js';
import type { Station, StationAudit, AuditNotification, User, AuditLog, SystemSettings } from '../types/audit';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ3NTAsImV4cCI6MjEwMDIwMDc1MH0.q2s63JSKo6j6LJdNzipnXtMxU6T6O94JsWFV2WWJPKI';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Public Anon Client ONLY in frontend browser
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const SESSION_KEY = 'alnoor_station_audits_session_v2';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    try {
      return window.crypto.randomUUID();
    } catch (e) {
      // Fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const isValidUuid = (id?: string | null): boolean => Boolean(id && UUID_REGEX.test(id));

// --- BACKEND API USER AUTHENTICATION & MANAGEMENT ---

export async function syncAuthUsers(): Promise<void> {
  // User accounts are synchronized directly during creation via auth.admin.createUser & Edge Function
}

export async function fetchUsers(): Promise<User[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      await syncAuthUsers();
      const { data, error } = await supabase.from('users').select('*').order('full_name');
      if (!error && data) {
        return data.map((u: any) => ({ ...u, password_hash: '' })) as User[];
      }
    } catch (e) {
      console.warn('Supabase fetchUsers error:', e);
    }
  }
  return [];
}

// Direct Supabase Admin REST API — no Edge Function required
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gpljpjnzpyvmvlndcnfb.supabase.co';
const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpwam56cHl2bXZsbmRjbmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYyNDc1MCwiZXhwIjoyMTAwMjAwNzUwfQ.y9JNCLB5dT28GjYAaVKeIW1YvyzIo-5g0yiBmT-ZCdc';

const adminHeaders = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
};

/**
 * Creates a user in Supabase Auth via the Admin REST API (no Edge Function needed).
 */
async function adminCreateAuthUser(email: string, password: string, metadata: Record<string, string> = {}): Promise<{ id: string; email: string } | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.msg || err?.message || `Create user failed (${res.status})`);
  }
  return res.json();
}

/**
 * Updates a user's password in Supabase Auth via the Admin REST API.
 */
async function adminUpdateAuthPassword(userId: string, password: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.msg || err?.message || `Update password failed (${res.status})`);
  }
}

/**
 * Deletes a user from Supabase Auth via the Admin REST API.
 */
async function adminDeleteAuthUser(userId: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.msg || err?.message || `Delete user failed (${res.status})`);
  }
}

/**
 * Syncs profile changes (email, password) to auth.users via Admin REST API.
 * If the auth account doesn't exist (404), it is automatically recreated.
 * This keeps auth.users.email always in sync with public.users.email.
 */
export async function syncAuthProfile(
  userId: string,
  updates: { email?: string; password?: string }
): Promise<void> {
  if (!updates.email && !updates.password) return;

  const body: Record<string, string | boolean> = { email_confirm: true };
  if (updates.email) body.email = updates.email;
  if (updates.password) body.password = updates.password;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify(body),
  });

  if (res.ok) return; // success

  const err = await res.json().catch(() => ({}));

  // 404 = auth account missing (was deleted or never created) — recreate it
  if (res.status === 404) {
    if (!updates.email) return; // can't create without an email
    const createBody: Record<string, string | boolean> = {
      id: userId,               // use the same UUID so public.users.id stays valid
      email: updates.email,
      email_confirm: true,
    };
    if (updates.password) createBody.password = updates.password;

    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(createBody),
    });

    if (!createRes.ok) {
      const createErr = await createRes.json().catch(() => ({}));
      throw new Error(createErr?.msg || createErr?.message || `Auth recreate failed (${createRes.status})`);
    }
    console.log('[Auth] Recreated missing auth account for:', updates.email);
    return;
  }

  throw new Error(err?.msg || err?.message || `Auth sync failed (${res.status})`);
}


/**
 * Creates a new user in Supabase Auth using the Admin REST API.
 */
export async function createUserAccount(
  user: User,
  password?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const pass = (password || user.password_hash || '').trim();
  if (!pass) {
    return { success: false, error: 'Password is required to create a user account.' };
  }

  console.log('[Admin API] Creating user in Supabase Auth:', user.email);

  try {
    const authUser = await adminCreateAuthUser(user.email.trim().toLowerCase(), pass, {
      full_name: user.full_name || '',
      username: user.username || user.email.split('@')[0],
      role: user.role || 'Operation Supervisor',
      position: user.position || 'Staff Member',
    });

    if (!authUser?.id) {
      return { success: false, error: 'Failed to create user in Supabase Authentication.' };
    }

    const savedUser = await saveUser({ ...user, id: authUser.id });
    await logActivity(
      authUser.id,
      user.full_name,
      'CREATE_USER',
      `Provisioned account via Admin API for ${user.full_name} (${user.role})`
    );
    return { success: true, user: savedUser };
  } catch (e: any) {
    console.warn('[Admin API] createUserAccount error:', e);
    return { success: false, error: e.message || 'Failed to create user account' };
  }
}

/**
 * Safely generates an RFC4122 v4 UUID in all browser environments (HTTP, HTTPS, non-secure contexts, older browsers).
 */
export function generateUuidV4(): string {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    try {
      return window.crypto.randomUUID();
    } catch (e) {
      // Fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates or syncs a Station Opening user in Supabase Auth via Admin REST API.
 */
export async function createStationOpeningAuthAccount(
  user: any,
  password?: string
): Promise<{ authId?: string; error?: string }> {
  const pass = (password || user.password_hash || '').trim();
  const validUuid = (user.id && user.id.includes('-')) ? user.id : generateUuidV4();

  try {
    if (pass) {
      const authUser = await adminCreateAuthUser(user.email.trim().toLowerCase(), pass, {
        full_name: user.full_name || '',
        username: user.username || user.email.split('@')[0],
        role: user.role || 'Head of Operation',
        module: 'station-opening',
      });

      if (authUser?.id) {
        return { authId: authUser.id };
      }
    }
  } catch (e: any) {
    console.warn('[Admin API] createStationOpeningAuthAccount warning:', e);
    if (pass) {
      try {
        await syncAuthProfile(validUuid, { email: user.email.trim().toLowerCase(), password: pass });
        return { authId: validUuid };
      } catch (err: any) {
        console.warn('[Admin API] syncAuthProfile fallback failed:', err);
      }
    }
    return { authId: validUuid };
  }
  return { authId: validUuid };
}

/**
 * Updates a user's password in Supabase Auth using the Admin REST API.
 */
export async function updateUserPassword(
  userId: string,
  email: string,
  newPassword?: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || !newPassword.trim()) {
    return { success: true };
  }

  const pass = newPassword.trim();

  // Resolve userId if not a valid UUID — look up by email
  let targetId = isValidUuid(userId) ? userId : null;
  if (!targetId && email && isSupabaseConfigured && supabase) {
    const { data: found } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    targetId = found?.id || null;
  }

  if (!targetId) {
    return { success: false, error: 'User not found — cannot update password.' };
  }

  console.log('[Admin API] Updating password for user ID:', targetId);

  try {
    await adminUpdateAuthPassword(targetId, pass);
    console.log('[Admin API] Password updated successfully for:', targetId);
    return { success: true };
  } catch (e: any) {
    console.warn('[Admin API] updateUserPassword error:', e);
    return { success: false, error: e.message || 'Failed to update password' };
  }
}

export async function saveUser(user: User): Promise<User> {
  if (isSupabaseConfigured && supabase) {
    try {
      let targetId = user.id;

      // Only fall back to email lookup if we don't already have a valid UUID.
      // NEVER override a valid UUID with one found by email — that breaks the auth link.
      if (!isValidUuid(targetId) && user.email) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email.trim().toLowerCase())
          .maybeSingle();

        if (existing?.id) {
          targetId = existing.id;
        }
      }

      if (!isValidUuid(targetId)) {
        targetId = generateUUID();
      }

      const cleanEmail = user.email.trim().toLowerCase();
      const cleanUsername = user.username ? user.username.trim() : cleanEmail.split('@')[0];
      const cleanEmpId = user.employee_id || `EMP-${targetId.substring(0, 6).toUpperCase()}`;

      const userPayload = {
        id: targetId,
        employee_id: cleanEmpId,
        full_name: user.full_name,
        email: cleanEmail,
        username: cleanUsername,
        mobile_number: user.mobile_number || '',
        position: user.position || 'Staff Member',
        role: user.role,
        assigned_station_id: isValidUuid(user.assigned_station_id) ? user.assigned_station_id : null,
        assigned_station_name: user.assigned_station_name || null,
        signature_url: user.signature_url || '',
        status: user.status || 'active',
        last_login_at: user.last_login_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(userPayload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (!error && data) return data as User;
    } catch (e) {
      console.warn('Supabase saveUser error:', e);
    }
  }
  return user;
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isValidUuid(userId)) {
    return { success: false, error: 'Invalid user ID' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase client is not configured' };
  }

  // Check if the user has linked audit records — if so, deletion is blocked by FK constraint
  const { count } = await supabase
    .from('station_audits')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', userId);

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete this user — they have ${count} audit record(s) linked to their account.\n\nTo remove their access, set their status to "Inactive" instead.`,
    };
  }

  // No linked records — safe to delete from auth.users first
  try {
    await adminDeleteAuthUser(userId);
  } catch (e: any) {
    // 404 = user doesn't exist in auth (already removed or never created) — non-blocking
    if (!e.message?.includes('404') && !e.message?.includes('not found')) {
      console.warn('[Admin API] deleteUser auth deletion warning:', e.message);
    }
  }

  // Delete from public.users
  const { error: dbError } = await supabase.from('users').delete().eq('id', userId);
  if (dbError) {
    return {
      success: false,
      error: dbError.code === '23503'
        ? 'Cannot delete this user — they have linked records. Set status to "Inactive" instead.'
        : dbError.message,
    };
  }

  return { success: true };
}

export async function authenticateUser(
  identifier: string,
  pass: string
): Promise<{ user: User | null; error?: string }> {
  const cleanedId = identifier.trim().toLowerCase();
  const cleanedPass = pass.trim();

  if (!cleanedId || !cleanedPass) {
    return { user: null, error: 'Email/username and password are required.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { user: null, error: 'Supabase client is not configured.' };
  }

  let emailToAuth = cleanedId;

  if (cleanedId === 'admin@alnoor.sa' || cleanedId === 'admin') {
    emailToAuth = 'admin.user@alnoor.sa';
  } else {
    try {
      const { data: matched } = await supabase
        .from('users')
        .select('email')
        .or(`username.ilike.${cleanedId},email.ilike.${cleanedId}`)
        .maybeSingle();

      if (matched?.email) {
        emailToAuth = matched.email;
      } else {
        try {
          const { data: matchedSo } = await supabase
            .from('station_opening_users')
            .select('email')
            .or(`username.ilike.${cleanedId},email.ilike.${cleanedId}`)
            .maybeSingle();

          if (matchedSo?.email) {
            emailToAuth = matchedSo.email;
          } else if (!cleanedId.includes('@')) {
            emailToAuth = `${cleanedId}@alnoor.sa`;
          }
        } catch (e) {
          if (!cleanedId.includes('@')) {
            emailToAuth = `${cleanedId}@alnoor.sa`;
          }
        }
      }
    } catch (e) {
      if (!cleanedId.includes('@')) {
        emailToAuth = `${cleanedId}@alnoor.sa`;
      }
    }
  }

  // 1. Pure Supabase Auth Authentication via signInWithPassword (NO FALLBACKS)
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password: cleanedPass,
    });

    if (authError || !authData?.user) {
      const rawMsg = authError?.message || '';
      const isSystemError = rawMsg.includes('500') || rawMsg.includes('unexpected_failure') || rawMsg === '{}' || !rawMsg.trim();
      const displayErr = isSystemError ? 'Invalid login credentials' : rawMsg;
      return { user: null, error: displayErr };
    }

    const authUuid = authData.user.id;

    // Fetch user profile attributes (role, station assignment, name, employee_id) from public.users
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUuid)
      .maybeSingle();

    if (!userProfile) {
      const { data: soProfile } = await supabase
        .from('station_opening_users')
        .select('*')
        .or(`id.eq.${authUuid},email.ilike.${emailToAuth}`)
        .maybeSingle();

      if (soProfile) {
        if (soProfile.login_enabled === false || soProfile.status === 'inactive') {
          return { user: null, error: 'Your account is currently disabled. Please contact the Super Admin.' };
        }
        const soUserToReturn: User = {
          id: soProfile.id,
          employee_id: soProfile.employee_id,
          full_name: soProfile.full_name,
          email: soProfile.email,
          username: soProfile.username,
          password_hash: '',
          position: soProfile.role,
          role: soProfile.role as any,
          status: soProfile.status,
          signature_url: soProfile.signature_url,
          last_login_at: new Date().toISOString(),
          created_at: soProfile.created_at,
        };
        return { user: soUserToReturn };
      }
    }

    const userToReturn: User = userProfile
      ? { ...userProfile, password_hash: '', last_login_at: new Date().toISOString() }
      : {
          id: authUuid,
          employee_id: `EMP-${authUuid.substring(0, 6).toUpperCase()}`,
          full_name: authData.user.user_metadata?.full_name || emailToAuth.split('@')[0],
          email: emailToAuth,
          username: authData.user.user_metadata?.username || emailToAuth.split('@')[0],
          password_hash: '',
          position: authData.user.user_metadata?.position || 'Staff Member',
          role: authData.user.user_metadata?.role || 'Operation Supervisor',
          status: 'active',
          last_login_at: new Date().toISOString(),
        };

    await saveUser(userToReturn);
    await logActivity(userToReturn.id, userToReturn.full_name, 'USER_LOGIN', 'Authenticated with Supabase Auth');

    return { user: userToReturn };
  } catch (e: any) {
    return { user: null, error: e.message || 'Authentication error occurred' };
  }
}

// --- SESSION MANAGEMENT ---

export function saveSession(user: User | null, rememberMe: boolean = true) {
  if (user) {
    const data = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, data);
    } else {
      sessionStorage.setItem(SESSION_KEY, data);
    }
  } else {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function loadSession(): User | null {
  const local = localStorage.getItem(SESSION_KEY);
  const session = sessionStorage.getItem(SESSION_KEY);
  if (local) return JSON.parse(local);
  if (session) return JSON.parse(session);
  return null;
}

export async function normalizeStationCodes(stationList: Station[]): Promise<Station[]> {
  // Sort stations deterministically by creation time or name
  const sorted = [...stationList].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.name.localeCompare(b.name);
  });

  const normalizedList: Station[] = [];
  let updatedInDbCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const expectedCode = (i + 1).toString();
    const st = sorted[i];

    if (st.station_no !== expectedCode) {
      const updatedSt: Station = { ...st, station_no: expectedCode };
      normalizedList.push(updatedSt);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('stations')
            .update({ station_no: expectedCode })
            .eq('id', st.id);
          updatedInDbCount++;
        } catch (err) {
          console.warn(`[NORMALIZE STATIONS] Failed to update station_no for ${st.name}:`, err);
        }
      }
    } else {
      normalizedList.push(st);
    }
  }

  if (updatedInDbCount > 0) {
    console.log(`[NORMALIZE STATIONS] Successfully reindexed ${updatedInDbCount} station codes to sequential order 1..${sorted.length}`);
  }

  return normalizedList;
}

export async function fetchStations(): Promise<Station[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        const rawStations = data as Station[];
        const normalized = await normalizeStationCodes(rawStations);
        return normalized;
      }
    } catch (e) {
      console.warn('Supabase fetchStations error:', e);
    }
  }
  return [];
}

export async function saveStation(station: Station): Promise<Station> {
  if (!isSupabaseConfigured || !supabase) {
    return station;
  }

  try {
    const stationId = isValidUuid(station.id) ? station.id : generateUUID();
    const superId = isValidUuid(station.operation_supervisor_id) ? station.operation_supervisor_id : null;

    const payload = {
      id: stationId,
      station_no: station.station_no,
      name: station.name,
      location: station.location || 'Saudi Arabia',
      region: station.region || 'Central Region',
      status: station.status || 'active',
      operation_supervisor_id: superId,
      operation_supervisor_name: station.operation_supervisor_name || 'Unassigned',
      created_at: station.created_at || new Date().toISOString(),
    };

    console.log(`[SAVE STATION] Upserting station ${payload.station_no} - ${payload.name} (ID: ${stationId})...`);
    const { data, error } = await supabase
      .from('stations')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error(`[SAVE STATION FAILURE] Table: stations | Code: ${error.code} | Message: ${error.message} | Details: ${error.details}`);
      throw new Error(`[Database Error: stations] ${error.message} (Code: ${error.code})`);
    }

    if (data) return data as Station;
  } catch (e: any) {
    console.error('Supabase saveStation error:', e);
    throw e;
  }
  return station;
}

export async function deleteStation(stationId: string): Promise<void> {
  if (isSupabaseConfigured && supabase && isValidUuid(stationId)) {
    try {
      await supabase.from('stations').delete().eq('id', stationId);
    } catch (e) {
      console.warn('Supabase deleteStation error:', e);
    }
  }
}

// --- AUDIT MANAGEMENT ---

export async function fetchAudits(): Promise<StationAudit[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('station_audits')
        .select(`
          *,
          items:station_audit_items(*),
          approvals:station_audit_approvals(*),
          comments:station_audit_comments(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map((aud: any) => ({
          ...aud,
          approvals: (aud.approvals || []).map((app: any) => ({
            ...app,
            status:
              app.comments?.includes('Bypassed') || app.comments?.includes('skipped')
                ? 'skipped'
                : app.status,
          })),
        }));
        return formatted as StationAudit[];
      }
    } catch (e) {
      console.warn('Supabase fetchAudits error:', e);
    }
  }
  return [];
}

export async function saveAudit(audit: StationAudit): Promise<StationAudit> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[saveAudit] Supabase client is not configured.');
    return audit;
  }

  // 1. Resolve valid station_id UUID from Supabase stations table (satisfies foreign key & not-null constraints)
  let validStationId: string | null = isValidUuid(audit.station_id) ? audit.station_id : null;
  if (validStationId) {
    const { data: stExists } = await supabase.from('stations').select('id').eq('id', validStationId).maybeSingle();
    if (!stExists) validStationId = null;
  }
  if (!validStationId) {
    const { data: matched } = await supabase
      .from('stations')
      .select('id')
      .or(`name.eq.${audit.station_name || ''},station_no.eq.${audit.station_no || ''}`)
      .limit(1);

    if (matched && matched.length > 0) {
      validStationId = matched[0].id;
    } else {
      const { data: firstStation } = await supabase.from('stations').select('id').limit(1);
      if (firstStation && firstStation.length > 0) {
        validStationId = firstStation[0].id;
      }
    }
  }

  // 2. Resolve valid created_by UUID from Supabase users table (satisfies foreign key constraint station_audits_created_by_fkey)
  let validCreatorId: string | null = isValidUuid(audit.created_by) ? audit.created_by : null;
  if (validCreatorId) {
    const { data: usrExists } = await supabase.from('users').select('id').eq('id', validCreatorId).maybeSingle();
    if (!usrExists) validCreatorId = null;
  }
  if (!validCreatorId) {
    const { data: firstUser } = await supabase.from('users').select('id').limit(1);
    if (firstUser && firstUser.length > 0) {
      validCreatorId = firstUser[0].id;
    }
  }

  // 3. Check unique_station_audit_per_date constraint to update existing record instead of throwing constraint errors
  let auditId = isValidUuid(audit.id) ? audit.id : generateUUID();
  const auditDate = audit.audit_date || new Date().toISOString().split('T')[0];

  if (validStationId) {
    const { data: existingAudit } = await supabase
      .from('station_audits')
      .select('id, audit_number')
      .eq('station_id', validStationId)
      .eq('audit_date', auditDate)
      .maybeSingle();

    if (existingAudit?.id) {
      auditId = existingAudit.id;
      if (existingAudit.audit_number) {
        audit.audit_number = existingAudit.audit_number;
      }
    }
  }

  audit.id = auditId;
  if (validStationId) audit.station_id = validStationId;
  if (validCreatorId) audit.created_by = validCreatorId;

  console.log(`[SAVE AUDIT STEP 1] Upserting parent station_audits for Audit #${audit.audit_number} (ID: ${auditId}, Station: ${validStationId})...`);

  // Normalize numeric fields to satisfy Postgres NOT NULL constraints while keeping UI inputs blank
  const parentPayload = {
    id: auditId,
    audit_number: audit.audit_number,
    station_id: validStationId,
    station_no: audit.station_no || '',
    station_name: audit.station_name || '',
    location: audit.location || '',
    audit_date: auditDate,
    created_by: validCreatorId,
    created_by_name: audit.created_by_name || '',
    created_by_role: audit.created_by_role || 'Operation Supervisor',
    station_supervisor_name: audit.station_supervisor_name || '',
    station_supervisor_signature_url: audit.station_supervisor_signature_url || '',
    operation_supervisor_signature_url: audit.operation_supervisor_signature_url || '',
    current_status: audit.current_status || 'draft',
    noor_khoy_amount: audit.noor_khoy_amount != null ? Number(audit.noor_khoy_amount) : 0,
    atm_amount: audit.atm_amount != null ? Number(audit.atm_amount) : 0,
    cash_amount: audit.cash_amount != null ? Number(audit.cash_amount) : 0,
    cash_received_amount: audit.cash_received_amount != null ? Number(audit.cash_received_amount) : 0,
    total_sales: audit.total_sales != null ? Number(audit.total_sales) : 0,
    total_quantity: audit.total_quantity != null ? Number(audit.total_quantity) : 0,
    discrepancy_amount: audit.discrepancy_amount != null ? Number(audit.discrepancy_amount) : 0,
    notes: audit.notes || '',
    person_responsible_for_shortage: audit.person_responsible_for_shortage || '',
    shortage_amount: audit.shortage_amount != null ? Number(audit.shortage_amount) : 0,
    updated_at: new Date().toISOString(),
  };

  let { error: parentErr } = await supabase.from('station_audits').upsert(parentPayload, { onConflict: 'id' });

  // Graceful fallback retry if new shortage columns do not exist in Supabase Postgres schema yet
  if (parentErr && (parentErr.code === 'PGRST204' || parentErr.message?.includes('column'))) {
    console.warn('[SAVE AUDIT NOTICE] Missing shortage columns in Supabase station_audits table. Retrying with standard payload...');
    const fallbackPayload = { ...parentPayload };
    delete (fallbackPayload as any).person_responsible_for_shortage;
    delete (fallbackPayload as any).shortage_amount;
    const retryRes = await supabase.from('station_audits').upsert(fallbackPayload, { onConflict: 'id' });
    parentErr = retryRes.error;
  }

  if (parentErr) {
    console.error(`[SAVE AUDIT FAILURE] Table: station_audits | Code: ${parentErr.code} | Message: ${parentErr.message} | Details: ${parentErr.details}`);
    throw new Error(`[Database Error: station_audits] ${parentErr.message} (Code: ${parentErr.code})`);
  }

  console.log(`[SAVE AUDIT STEP 1 SUCCESS] Parent station_audits record saved successfully.`);

  // STEP 2: Upsert pump reading items (Filter non-blank rows, resolve conflicts)
  if (audit.items && audit.items.length > 0) {
    const nonBlankItems = audit.items
      .filter((i) => {
        const hasStart = i.start_reading != null && i.start_reading !== 0;
        const hasEnd = i.end_reading != null && i.end_reading !== 0;
        const hasQty = i.quantity_sold != null && i.quantity_sold !== 0;
        const hasAmt = i.amount != null && i.amount !== 0;
        return hasStart || hasEnd || hasQty || hasAmt;
      })
      .map((i) => ({
        id: isValidUuid(i.id) ? i.id : generateUUID(),
        audit_id: auditId,
        fuel_type: i.fuel_type,
        pump_no: Number(i.pump_no),
        start_reading: i.start_reading != null ? Number(i.start_reading) : 0,
        end_reading: i.end_reading != null ? Number(i.end_reading) : 0,
        quantity_sold: i.quantity_sold != null ? Number(i.quantity_sold) : 0,
        price: Number(i.price || 0),
        amount: i.amount != null ? Number(i.amount) : 0,
      }));

    const { error: delErr } = await supabase.from('station_audit_items').delete().eq('audit_id', auditId);
    if (delErr) {
      console.warn(`[SAVE AUDIT ITEMS DELETE WARN] Code: ${delErr.code} | Message: ${delErr.message}`);
    }

    if (nonBlankItems.length > 0) {
      console.log(`[SAVE AUDIT STEP 2] Inserting ${nonBlankItems.length} non-blank pump items...`);
      const { error: itemsErr } = await supabase
        .from('station_audit_items')
        .upsert(nonBlankItems, { onConflict: 'audit_id,fuel_type,pump_no' });

      if (itemsErr) {
        console.error(`[SAVE AUDIT FAILURE] Table: station_audit_items | Code: ${itemsErr.code} | Message: ${itemsErr.message} | Details: ${itemsErr.details}`);
        throw new Error(`[Database Error: station_audit_items] ${itemsErr.message} (Code: ${itemsErr.code})`);
      }
      console.log(`[SAVE AUDIT STEP 2 SUCCESS] Audit items inserted successfully.`);
    }
  }

  // STEP 3: Upsert approvals chain (Unique constraint: audit_id, role)
  if (audit.approvals && audit.approvals.length > 0) {
    console.log(`[SAVE AUDIT STEP 3] Creating ${audit.approvals.length} approval workflow records...`);
    const approvalsToSave = audit.approvals.map((a) => ({
      id: isValidUuid(a.id) ? a.id : generateUUID(),
      audit_id: auditId,
      role: a.role,
      role_display_name: a.role_display_name,
      approver_id: isValidUuid(a.approver_id) ? a.approver_id : null,
      approver_name: a.approver_name || null,
      approver_position: a.approver_position || null,
      status: (a.status === 'skipped' || a.status === 'bypassed') ? 'pending' : (a.status || 'pending'),
      comments: a.comments || null,
      action_timestamp: a.action_timestamp || null,
      digital_signature_code: a.digital_signature_code || null,
      signature_url: a.signature_url || null,
      created_at: a.created_at || new Date().toISOString(),
    }));

    const { error: appErr } = await supabase.from('station_audit_approvals').upsert(approvalsToSave, { onConflict: 'audit_id,role' });
    if (appErr) {
      console.error(`[SAVE AUDIT FAILURE] Table: station_audit_approvals | Code: ${appErr.code} | Message: ${appErr.message} | Details: ${appErr.details}`);
      throw new Error(`[Database Error: station_audit_approvals] ${appErr.message} (Code: ${appErr.code})`);
    }
    console.log(`[SAVE AUDIT STEP 3 SUCCESS] Approval records created successfully.`);
  }

  // STEP 4: Upsert non-empty comments
  if (audit.comments && audit.comments.length > 0) {
    const validComments = audit.comments
      .filter((c) => c.comment_text && c.comment_text.trim())
      .map((c) => ({
        id: isValidUuid(c.id) ? c.id : generateUUID(),
        audit_id: auditId,
        user_id: isValidUuid(c.user_id) ? c.user_id : null,
        user_name: c.user_name || 'System User',
        user_role: c.user_role || 'Operation Supervisor',
        comment_text: c.comment_text.trim(),
        created_at: c.created_at || new Date().toISOString(),
      }));

    if (validComments.length > 0) {
      console.log(`[SAVE AUDIT STEP 4] Creating ${validComments.length} audit comments...`);
      const { error: commErr } = await supabase.from('station_audit_comments').upsert(validComments, { onConflict: 'id' });
      if (commErr) {
        console.error(`[SAVE AUDIT FAILURE] Table: station_audit_comments | Code: ${commErr.code} | Message: ${commErr.message} | Details: ${commErr.details}`);
        throw new Error(`[Database Error: station_audit_comments] ${commErr.message} (Code: ${commErr.code})`);
      }
      console.log(`[SAVE AUDIT STEP 4 SUCCESS] Audit comments created successfully.`);
    }
  }

  console.log(`[SAVE AUDIT COMPLETE] Audit #${audit.audit_number} successfully committed to database!`);
  return audit;
}

// --- NOTIFICATIONS MANAGEMENT ---

const NOTIFS_STORAGE_KEY = 'station_audit_notifications';

export async function fetchNotifications(): Promise<AuditNotification[]> {
  let dbNotifs: AuditNotification[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('station_audit_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbNotifs = data as AuditNotification[];
      }
    } catch (e) {
      console.warn('Supabase fetchNotifications error:', e);
    }
  }

  try {
    const localStr = localStorage.getItem(NOTIFS_STORAGE_KEY);
    const localNotifs: AuditNotification[] = localStr ? JSON.parse(localStr) : [];
    const map = new Map<string, AuditNotification>();
    localNotifs.forEach((n) => map.set(n.id, n));
    dbNotifs.forEach((n) => map.set(n.id, n));

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return combined;
  } catch (e) {
    return dbNotifs;
  }
}

export async function saveNotification(notif: AuditNotification): Promise<AuditNotification> {
  const validAuditId = isValidUuid(notif.audit_id) ? notif.audit_id : generateUUID();
  const notifId = isValidUuid(notif.id) ? notif.id : generateUUID();

  const notifPayload: AuditNotification = {
    id: notifId,
    audit_id: validAuditId,
    audit_number: notif.audit_number,
    station_name: notif.station_name,
    audit_date: notif.audit_date,
    recipient_role: notif.recipient_role,
    sender_name: notif.sender_name,
    action_type: notif.action_type,
    message: notif.message,
    is_read: notif.is_read ?? false,
    created_at: notif.created_at || new Date().toISOString(),
  };

  // Always save to LocalStorage immediately for instant local reactivity
  try {
    const localStr = localStorage.getItem(NOTIFS_STORAGE_KEY);
    const localNotifs: AuditNotification[] = localStr ? JSON.parse(localStr) : [];
    const updated = [notifPayload, ...localNotifs.filter((n) => n.id !== notifId)];
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage saveNotification error:', e);
  }

  // Also upsert to Supabase (Omit audit_date which is omitted in database schema)
  if (isSupabaseConfigured && supabase) {
    try {
      const { audit_date, ...supabasePayload } = notifPayload;
      const { error } = await supabase.from('station_audit_notifications').upsert(supabasePayload, { onConflict: 'id' });
      if (error) {
        console.error(`[SAVE NOTIFICATION ERROR] Code: ${error.code} | Message: ${error.message}`);
      } else {
        console.log(`[SAVE NOTIFICATION SUCCESS] Notification sent for Audit #${notif.audit_number}`);
      }
    } catch (e: any) {
      console.warn('Supabase saveNotification error:', e);
    }
  }
  return notifPayload;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const localStr = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (localStr) {
      const localNotifs: AuditNotification[] = JSON.parse(localStr);
      const updated = localNotifs.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage markNotificationAsRead error:', e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('station_audit_notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase markNotificationAsRead error:', e);
    }
  }
}

export async function markAllNotificationsAsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  try {
    const localStr = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (localStr) {
      const localNotifs: AuditNotification[] = JSON.parse(localStr);
      const updated = localNotifs.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n));
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage markAllNotificationsAsRead error:', e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('station_audit_notifications')
        .update({ is_read: true })
        .in('id', ids);
    } catch (e) {
      console.warn('Supabase markAllNotificationsAsRead error:', e);
    }
  }
}

export async function deleteNotificationFromStorage(id: string): Promise<void> {
  try {
    const localStr = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (localStr) {
      const localNotifs: AuditNotification[] = JSON.parse(localStr);
      const updated = localNotifs.filter((n) => n.id !== id);
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage deleteNotificationFromStorage error:', e);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('station_audit_notifications')
        .delete()
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteNotificationFromStorage error:', e);
    }
  }
}

// --- AUDIT LOGS ---

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data as AuditLog[];
    } catch (e) {
      console.warn('Supabase fetchAuditLogs error:', e);
    }
  }
  return [];
}

export async function logActivity(
  userId: string,
  userName: string,
  action: string,
  details?: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      let validUserRef: string | null = null;
      if (isValidUuid(userId)) {
        const { data } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
        if (data?.id) validUserRef = data.id;
      }

      await supabase.from('audit_logs').insert({
        user_id: validUserRef,
        user_name: userName || 'System User',
        action: action,
        details: details || '',
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase logActivity warning:', e);
    }
  }
}

// --- SYSTEM SETTINGS ---

export async function fetchSettings(): Promise<SystemSettings> {
  const defaults: SystemSettings = {
    company_name: 'Al Noor United Fuel Est.',
    company_name_ar: 'مؤسسة النور المتحدة للوقود',
    session_timeout_minutes: 30,
    p91_price: 2.18,
    p95_price: 2.33,
    diesel_price: 1.15,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('system_settings').select('*');
      if (!error && data && data.length > 0) {
        const merged = { ...defaults };
        data.forEach((row: { key: string; value: string }) => {
          if (row.key === 'company_name') merged.company_name = row.value;
          if (row.key === 'company_name_ar') merged.company_name_ar = row.value;
          if (row.key === 'session_timeout_minutes') merged.session_timeout_minutes = parseInt(row.value) || 30;
          if (row.key === 'p91_price') merged.p91_price = parseFloat(row.value) || 2.18;
          if (row.key === 'p95_price') merged.p95_price = parseFloat(row.value) || 2.33;
          if (row.key === 'diesel_price') merged.diesel_price = parseFloat(row.value) || 1.15;
        });
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetchSettings error:', e);
    }
  }

  return defaults;
}

export async function saveSettings(settings: SystemSettings): Promise<SystemSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const rows = [
        { key: 'company_name', value: settings.company_name },
        { key: 'company_name_ar', value: settings.company_name_ar },
        { key: 'session_timeout_minutes', value: settings.session_timeout_minutes.toString() },
        { key: 'p91_price', value: settings.p91_price.toString() },
        { key: 'p95_price', value: settings.p95_price.toString() },
        { key: 'diesel_price', value: settings.diesel_price.toString() },
      ];
      await supabase.from('system_settings').upsert(rows);
    } catch (e) {
      console.warn('Supabase saveSettings error:', e);
    }
  }
  return settings;
}
