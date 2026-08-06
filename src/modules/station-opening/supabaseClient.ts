import {
  supabase,
  isSupabaseConfigured,
  createStationOpeningAuthAccount,
  syncAuthProfile,
} from '../../lib/supabaseClient';
import type { StationOpeningForm, StationOpeningNotification, StationOpeningUser, StationOpeningActivityLog } from './types';

// LocalStorage Keys for Resilient Fallback Storage
const STORAGE_KEYS = {
  FORMS: 'station_opening_forms_v1',
  USERS: 'station_opening_users_v1',
  NOTIFS: 'station_opening_notifications_v1',
  LOGS: 'station_opening_activity_logs_v1',
};

// Helper utilities for local storage caching
function getLocalCache<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[StationOpening] LocalStorage set item error:', e);
  }
}

// ==============================================================================
// 1. STATION OPENING FORMS CRUD (DUAL SUPABASE + LOCALSTORAGE RESILIENCE)
// ==============================================================================

export async function fetchStationOpeningForms(userId?: string, userRole?: string): Promise<StationOpeningForm[]> {
  const localForms = getLocalCache<StationOpeningForm[]>(STORAGE_KEYS.FORMS, []);

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('station_opening_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (userRole === 'Head of Operation' && userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const fetched: StationOpeningForm[] = data.map((row) => {
          let parsed: StationOpeningForm;
          if (typeof row.form_json === 'string') {
            parsed = JSON.parse(row.form_json);
          } else {
            parsed = row.form_json;
          }
          return {
            ...parsed,
            id: row.id,
            form_number: row.form_number,
            station_id: row.station_id,
            station_name: row.station_name,
            current_status: row.current_status,
            created_by: row.created_by || parsed.created_by,
            created_at: row.created_at || parsed.created_at,
            updated_at: row.updated_at || parsed.updated_at,
          };
        });
        setLocalCache(STORAGE_KEYS.FORMS, fetched);
        return fetched;
      }
    } catch (e) {
      console.warn('[StationOpening] Supabase fetch forms warning:', e);
    }
  }

  if (userRole === 'Head of Operation' && userId) {
    return localForms.filter((f) => f.created_by === userId);
  }
  return localForms;
}

export async function saveStationOpeningForm(form: StationOpeningForm, userRole?: string): Promise<StationOpeningForm> {
  const updatedForm: StationOpeningForm = {
    ...form,
    updated_at: new Date().toISOString(),
  };

  // 1. Always update local storage cache immediately
  const localForms = getLocalCache<StationOpeningForm[]>(STORAGE_KEYS.FORMS, []);
  const idx = localForms.findIndex((f) => f.id === updatedForm.id);

  // Security check: Only Head of Operation can create brand new forms
  if (idx < 0 && userRole && userRole !== 'Head of Operation') {
    console.error('[StationOpening] Security Violation: Non-Head of Operation role attempted to create a form:', userRole);
    throw new Error('Access Denied: Only Head of Operation can create a Station Opening Form.');
  }
  let updatedList: StationOpeningForm[];
  if (idx >= 0) {
    localForms[idx] = updatedForm;
    updatedList = [...localForms];
  } else {
    updatedList = [updatedForm, ...localForms];
  }
  setLocalCache(STORAGE_KEYS.FORMS, updatedList);

  // 2. Persist to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const row = {
        id: updatedForm.id,
        form_number: updatedForm.form_number,
        station_id: updatedForm.station_id || null,
        station_name: updatedForm.station_name,
        current_status: updatedForm.current_status,
        created_by: updatedForm.created_by,
        form_json: JSON.stringify(updatedForm),
        updated_at: updatedForm.updated_at,
      };

      const { error } = await supabase.from('station_opening_forms').upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn('[StationOpening] Warning saving form to Supabase (using local cache):', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Exception saving form to Supabase:', e);
    }
  }

  return updatedForm;
}

export async function deleteStationOpeningForm(id: string): Promise<boolean> {
  // Update local cache
  const localForms = getLocalCache<StationOpeningForm[]>(STORAGE_KEYS.FORMS, []);
  const filtered = localForms.filter((f) => f.id !== id);
  setLocalCache(STORAGE_KEYS.FORMS, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('station_opening_forms').delete().eq('id', id);
      if (error) {
        console.warn('[StationOpening] Warning deleting form from Supabase:', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Exception deleting form:', e);
    }
  }
  return true;
}

// ==============================================================================
// 2. STATION OPENING USERS CRUD (DUAL SUPABASE + LOCALSTORAGE RESILIENCE)
// ==============================================================================

export async function fetchStationOpeningUsers(): Promise<StationOpeningUser[]> {
  const localUsers = getLocalCache<StationOpeningUser[]>(STORAGE_KEYS.USERS, []);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('station_opening_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const fetched = data.map((u) => ({
          id: u.id,
          employee_id: u.employee_id,
          full_name: u.full_name,
          email: u.email,
          username: u.username || u.email.split('@')[0],
          password_hash: u.password_hash || '',
          role: u.role,
          mobile_number: u.mobile_number || '',
          signature_url: u.signature_url || '',
          profile_photo_url: u.profile_photo_url || '',
          status: u.status || 'active',
          login_enabled: u.login_enabled ?? true,
          last_login_at: u.last_login_at || undefined,
          created_at: u.created_at,
          created_by: u.created_by,
          created_by_name: u.created_by_name || 'Super Admin',
        }));
        setLocalCache(STORAGE_KEYS.USERS, fetched);
        return fetched;
      }
    } catch (e) {
      console.warn('[StationOpening] Supabase fetch users warning:', e);
    }
  }

  return localUsers;
}

export async function saveStationOpeningUser(
  user: StationOpeningUser,
  password?: string
): Promise<StationOpeningUser> {
  const userToSave: StationOpeningUser = {
    ...user,
    login_enabled: user.login_enabled ?? true,
  };

  // Update local storage
  const localUsers = getLocalCache<StationOpeningUser[]>(STORAGE_KEYS.USERS, []);
  const idx = localUsers.findIndex((u) => u.id === userToSave.id);
  let updatedUsers: StationOpeningUser[];
  if (idx >= 0) {
    localUsers[idx] = userToSave;
    updatedUsers = [...localUsers];
  } else {
    updatedUsers = [userToSave, ...localUsers];
  }
  setLocalCache(STORAGE_KEYS.USERS, updatedUsers);

  // Auth provisioning
  if (password && password.trim()) {
    try {
      const authRes = await createStationOpeningAuthAccount(userToSave, password.trim());
      if (authRes.authId) {
        userToSave.id = authRes.authId;
      }
    } catch (e) {
      console.warn('[StationOpening] Supabase Auth provisioning warning:', e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const row = {
        id: userToSave.id,
        employee_id: userToSave.employee_id,
        full_name: userToSave.full_name,
        email: userToSave.email,
        username: userToSave.username,
        mobile_number: userToSave.mobile_number,
        role: userToSave.role,
        signature_url: userToSave.signature_url,
        profile_photo_url: userToSave.profile_photo_url,
        status: userToSave.status,
        login_enabled: userToSave.login_enabled,
        created_by: userToSave.created_by,
        created_by_name: userToSave.created_by_name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('station_opening_users').upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn('[StationOpening] Warning saving user profile to Supabase:', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Exception saving user profile:', e);
    }
  }

  return userToSave;
}

export async function resetStationOpeningUserPassword(userId: string, newPassword: string): Promise<boolean> {
  if (newPassword && newPassword.trim()) {
    try {
      await syncAuthProfile(userId, { password: newPassword.trim() });
    } catch (e) {
      console.warn('[StationOpening] Supabase Auth reset password warning:', e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('station_opening_users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.warn('[StationOpening] Warning updating user timestamp in Supabase:', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Exception updating user timestamp:', e);
    }
  }
  return true;
}

export async function toggleStationOpeningUserLogin(
  userId: string,
  loginEnabled: boolean,
  status: 'active' | 'inactive'
): Promise<boolean> {
  const localUsers = getLocalCache<StationOpeningUser[]>(STORAGE_KEYS.USERS, []);
  const updated = localUsers.map((u) => (u.id === userId ? { ...u, login_enabled: loginEnabled, status } : u));
  setLocalCache(STORAGE_KEYS.USERS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('station_opening_users')
        .update({ login_enabled: loginEnabled, status, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.warn('[StationOpening] Warning toggling login status in Supabase:', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Exception toggling login status:', e);
    }
  }
  return true;
}

export async function deleteStationOpeningUser(id: string): Promise<boolean> {
  const localUsers = getLocalCache<StationOpeningUser[]>(STORAGE_KEYS.USERS, []);
  setLocalCache(STORAGE_KEYS.USERS, localUsers.filter((u) => u.id !== id));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('station_opening_users').delete().eq('id', id);
      if (error) {
        console.warn('[StationOpening] Warning deleting user from Supabase:', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Exception deleting user:', e);
    }
  }
  return true;
}

// ==============================================================================
// 3. STATION OPENING NOTIFICATIONS (DUAL SUPABASE + LOCALSTORAGE RESILIENCE)
// ==============================================================================

export async function fetchStationOpeningNotifications(userId?: string, userRole?: string): Promise<StationOpeningNotification[]> {
  const localNotifs = getLocalCache<StationOpeningNotification[]>(STORAGE_KEYS.NOTIFS, []);

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('station_opening_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userRole === 'Head of Operation' && userId) {
        query = query.or(`recipient_id.eq.${userId},form_creator_id.eq.${userId}`);
      } else if (userRole && userRole !== 'Super Admin') {
        query = query.or(`recipient_role.eq.${userRole},recipient_role.eq.ALL`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const fetched = data.map((n) => ({
          id: n.id,
          form_id: n.form_id || '',
          form_number: n.form_number || '',
          station_name: n.station_name || n.title || 'Station Opening Form',
          recipient_role: n.recipient_role || 'ALL',
          recipient_id: n.recipient_id || '',
          form_creator_id: n.form_creator_id || '',
          sender_name: n.sender_name || 'System',
          action_type: n.action_type || 'submitted',
          message: n.message || '',
          is_read: n.is_read || false,
          created_at: n.created_at || new Date().toISOString(),
        })) as StationOpeningNotification[];
        setLocalCache(STORAGE_KEYS.NOTIFS, fetched);
        return fetched;
      }
    } catch (e) {
      console.warn('[StationOpening] Error fetching notifications:', e);
    }
  }

  if (userRole === 'Head of Operation' && userId) {
    return localNotifs.filter((n) => n.recipient_id === userId || n.form_creator_id === userId);
  }
  if (userRole && userRole !== 'Super Admin') {
    return localNotifs.filter((n) => n.recipient_role === userRole || n.recipient_role === 'ALL');
  }

  return localNotifs;
}

export async function addStationOpeningNotification(notif: StationOpeningNotification): Promise<void> {
  const localNotifs = getLocalCache<StationOpeningNotification[]>(STORAGE_KEYS.NOTIFS, []);
  setLocalCache(STORAGE_KEYS.NOTIFS, [notif, ...localNotifs]);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('station_opening_notifications').insert({
        id: notif.id,
        recipient_role: notif.recipient_role,
        recipient_id: notif.recipient_id,
        form_creator_id: notif.form_creator_id,
        message: notif.message,
        form_id: notif.form_id,
        form_number: notif.form_number,
        title: `${notif.action_type.toUpperCase()}: ${notif.station_name}`,
        is_read: notif.is_read || false,
        created_at: notif.created_at || new Date().toISOString(),
      });

      if (error) {
        console.warn('[StationOpening] Warning inserting notification to Supabase (saved locally):', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Warning adding notification to Supabase:', e);
    }
  }
}

export async function markStationOpeningNotificationAsRead(id: string): Promise<void> {
  const localNotifs = getLocalCache<StationOpeningNotification[]>(STORAGE_KEYS.NOTIFS, []);
  setLocalCache(
    STORAGE_KEYS.NOTIFS,
    localNotifs.map((n) => (n.id === id ? { ...n, is_read: true } : n))
  );

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('station_opening_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        console.warn('[StationOpening] Warning marking notification read in Supabase:', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Warning marking notification read:', e);
    }
  }
}

export async function markAllStationOpeningNotificationsAsRead(recipientRole?: string): Promise<void> {
  const localNotifs = getLocalCache<StationOpeningNotification[]>(STORAGE_KEYS.NOTIFS, []);
  const updated = localNotifs.map((n) =>
    !recipientRole || recipientRole === 'Super Admin' || n.recipient_role === recipientRole || n.recipient_role === 'ALL'
      ? { ...n, is_read: true }
      : n
  );
  setLocalCache(STORAGE_KEYS.NOTIFS, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('station_opening_notifications').update({ is_read: true });
      if (recipientRole && recipientRole !== 'Super Admin') {
        query = query.or(`recipient_role.eq.${recipientRole},recipient_role.eq.ALL`);
      }
      const { error } = await query;
      if (error) {
        console.warn('[StationOpening] Warning marking all notifications read in Supabase:', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Warning marking all notifications read:', e);
    }
  }
}

// ==============================================================================
// 4. STATION OPENING ACTIVITY LOGS (DUAL SUPABASE + LOCALSTORAGE RESILIENCE)
// ==============================================================================

export async function fetchStationOpeningActivityLogs(actorId?: string, userRole?: string): Promise<StationOpeningActivityLog[]> {
  const localLogs = getLocalCache<StationOpeningActivityLog[]>(STORAGE_KEYS.LOGS, []);

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('station_opening_activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (userRole === 'Head of Operation' && actorId) {
        query = query.or(`form_creator_id.eq.${actorId},actor_id.eq.${actorId}`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const fetched = data.map((log) => ({
          id: log.id,
          form_id: log.form_id || '',
          form_number: log.form_number || '',
          station_id: log.station_id || '',
          station_name: log.station_name || 'Station Opening Form',
          action_type: log.action_type || 'created',
          action_title: log.action_title || 'Form Action',
          action_description: log.action_description || '',
          status_at_time: log.status_at_time || 'pending_safety_quality',
          actor_id: log.actor_id || '',
          actor_name: log.actor_name || 'System User',
          actor_role: log.actor_role || 'Head of Operation',
          form_creator_id: log.form_creator_id || log.actor_id || '',
          created_at: log.created_at || new Date().toISOString(),
        })) as StationOpeningActivityLog[];
        setLocalCache(STORAGE_KEYS.LOGS, fetched);
        return fetched;
      }
    } catch (e) {
      console.warn('[StationOpening] Error fetching activity logs from Supabase:', e);
    }
  }

  if (userRole === 'Head of Operation' && actorId) {
    return localLogs.filter((l) => l.form_creator_id === actorId || l.actor_id === actorId);
  }
  return localLogs;
}

export async function addStationOpeningActivityLog(log: StationOpeningActivityLog): Promise<void> {
  const localLogs = getLocalCache<StationOpeningActivityLog[]>(STORAGE_KEYS.LOGS, []);
  setLocalCache(STORAGE_KEYS.LOGS, [log, ...localLogs]);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('station_opening_activity_logs').insert({
        id: log.id,
        form_id: log.form_id,
        form_number: log.form_number,
        station_id: log.station_id,
        station_name: log.station_name,
        action_type: log.action_type,
        action_title: log.action_title,
        action_description: log.action_description,
        status_at_time: log.status_at_time,
        actor_id: log.actor_id,
        actor_name: log.actor_name,
        actor_role: log.actor_role,
        form_creator_id: log.form_creator_id || log.actor_id,
        created_at: log.created_at || new Date().toISOString(),
      });

      if (error) {
        console.warn('[StationOpening] Warning inserting activity log to Supabase (saved to local cache):', error.message);
      }
    } catch (e) {
      console.warn('[StationOpening] Exception adding activity log to Supabase:', e);
    }
  }
}
