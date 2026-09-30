import { useState, useEffect, useRef, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import type { UserRole } from './types/audit';


import { Navbar } from './components/Navigation/Navbar';
import { LoginPage } from './components/Auth/LoginPage';
import { DashboardView } from './components/Dashboard/DashboardView';
import { StationAuditForm } from './components/AuditForm/StationAuditForm';
import { StationSelectionModal } from './components/AuditForm/StationSelectionModal';
import { AuditListView } from './components/AuditList/AuditListView';

import { NotificationCenter } from './components/ActivityCenter/NotificationCenter';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SuperAdminModuleSelector } from './components/Navigation/SuperAdminModuleSelector';
import { StationOpeningModule } from './modules/station-opening';
import type { StationAudit, Station, AuditNotification, User, AuditLog, SystemSettings } from './types/audit';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import {
  fetchAudits,
  fetchAuditById,
  fetchStations,
  fetchNotifications,
  fetchAuditLogs,
  fetchSettings,
  saveAudit as saveAuditToStorage,
  saveStation as saveStationToStorage,
  deleteStation as deleteStationFromStorage,
  saveUser as saveUserToStorage,
  deleteUser as deleteUserFromStorage,
  saveSettings as saveSettingsToStorage,
  markNotificationAsRead as markNotifReadInStorage,
  markAllNotificationsAsRead,
  deleteNotificationFromStorage,
  saveNotification as saveNotifToStorage,
  logActivity,
  createUserAccount,
  syncAuthProfile,
  generateUUID,
  CACHE_KEYS,
  getLocalCache,
  isSupabaseConfigured,
  supabase,
} from './lib/supabaseClient';
import { INITIAL_STATIONS } from './lib/mockData';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (id?: string): boolean => Boolean(id && UUID_REGEX.test(id));

function AppContent() {
  const { currentUser, isAuthenticated, canCreateAudit, allUsers, reloadUsers } = useAuth();

  type TabKey = 'dashboard' | 'audits' | 'new-audit' | 'activity' | 'admin';

  // Map between URL hash and internal tab key
  const HASH_TO_TAB: Record<string, TabKey> = {
    '#dashboard': 'dashboard',
    '#audits': 'audits',
    '#new-audit': 'new-audit',
    '#activity': 'activity',
    '#admin': 'admin',
  };
  const TAB_TO_HASH: Record<TabKey, string> = {
    dashboard: '#dashboard',
    audits: '#audits',
    'new-audit': '#new-audit',
    activity: '#activity',
    admin: '#admin',
  };

  const getTabFromHash = (): TabKey =>
    HASH_TO_TAB[window.location.hash] ?? 'dashboard';

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const isStationOpeningUser = [
    'Head of Operation',
    'Safety & Quality Control',
    'Document Controller',
    'Engineering Department',
    'Al Noor United Management',
  ].includes(currentUser?.role || '');

  const getModuleFromHash = (): 'audits' | 'station-openings' => {
    if (isStationOpeningUser) return 'station-openings';
    if (window.location.hash.startsWith('#station-opening')) return 'station-openings';
    if (isSuperAdmin) {
      const stored = localStorage.getItem('superadmin_active_module');
      if (stored === 'station-openings') return 'station-openings';
      if (stored === 'audits') return 'audits';
    }
    return 'audits';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromHash);
  const [activeModule, setActiveModule] = useState<'audits' | 'station-openings'>(getModuleFromHash);

  // Auto-enforce module boundaries upon login / route change
  useEffect(() => {
    if (isStationOpeningUser) {
      if (activeModule !== 'station-openings') {
        setActiveModule('station-openings');
      }
      if (!window.location.hash.startsWith('#station-opening')) {
        window.location.hash = '#station-opening';
      }
    } else if (!isSuperAdmin && activeModule === 'station-openings') {
      setActiveModule('audits');
    }
  }, [isStationOpeningUser, isSuperAdmin, activeModule]);

  // Navigate to a tab: push a new entry to the browser history stack
  const navigateTo = (tab: TabKey) => {
    if (isStationOpeningUser) return; // Station opening users stay in Station Opening module
    const hash = TAB_TO_HASH[tab];
    if (window.location.hash !== hash) {
      history.pushState({ tab }, '', hash);
    }
    setActiveTab(tab);
    setActiveModule('audits');
  };

  const switchModule = (mod: 'audits' | 'station-openings', subRoute?: string) => {
    if (!isSuperAdmin) return;
    try {
      localStorage.setItem('superadmin_active_module', mod);
    } catch (e) {
      console.warn('[App] LocalStorage set error:', e);
    }
    setActiveModule(mod);
    let newHash = mod === 'station-openings' ? '#station-opening' : '#dashboard';
    if (subRoute) {
      newHash = `#station-opening/${subRoute}`;
    }
    if (window.location.hash !== newHash) {
      history.pushState({ module: mod, subRoute }, '', newHash);
    }
  };

  // Listen for browser back / forward button
  useEffect(() => {
    const onPopState = () => {
      setActiveTab(getTabFromHash());
      setActiveModule(getModuleFromHash());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [stations, setStations] = useState<Station[]>(() => getLocalCache(CACHE_KEYS.STATIONS, INITIAL_STATIONS));
  const [audits, setAudits] = useState<StationAudit[]>(() => getLocalCache(CACHE_KEYS.AUDITS, []));
  const [notifications, setNotifications] = useState<AuditNotification[]>(() => getLocalCache(CACHE_KEYS.NOTIFS, []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getLocalCache(CACHE_KEYS.LOGS, []));
  const [settings, setSettings] = useState<SystemSettings>(() => getLocalCache(CACHE_KEYS.SETTINGS, {
    company_name: 'Al Noor United Fuel Est.',
    company_name_ar: 'مؤسسة النور المتحدة للوقود',
    session_timeout_minutes: 30,
    p91_price: 2.18,
    p95_price: 2.33,
    diesel_price: 1.15,
  }));

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [isStationSelectionOpen, setIsStationSelectionOpen] = useState(false);
  const [preselectedStationId, setPreselectedStationId] = useState<string | null>(null);

  // Track whether authentication routing was initialized for the current session.
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (!wasAuthenticated.current) {
        wasAuthenticated.current = true;
        setSelectedAuditId(null);
        setPreselectedStationId(null);

        if (isStationOpeningUser) {
          setActiveModule('station-openings');
          if (typeof window !== 'undefined' && !window.location.hash.startsWith('#station-opening')) {
            window.location.hash = '#station-opening';
            history.replaceState({ module: 'station-openings' }, '', '#station-opening');
          }
        } else {
          setActiveTab('dashboard');
          setActiveModule('audits');
          if (typeof window !== 'undefined' && window.location.hash !== '#dashboard') {
            window.location.hash = '#dashboard';
            history.replaceState({ tab: 'dashboard' }, '', '#dashboard');
          }
        }
      }

      // Progressive background data loading - parallelized and instant
      async function loadData() {
        try {
          const [settingsRes, stationsRes, auditsRes, notifsRes] = await Promise.all([
            fetchSettings(),
            fetchStations(),
            fetchAudits(currentUser?.id, currentUser?.role),
            fetchNotifications(),
          ]);

          setSettings(settingsRes);
          setStations(stationsRes);
          setAudits(auditsRes);
          setNotifications(notifsRes);

          if (currentUser?.role === 'Super Admin') {
            fetchAuditLogs().then(setAuditLogs);
          }
        } catch (e) {
          console.error('Background data load error:', e);
        }
      }
      loadData();
    } else {
      if (wasAuthenticated.current) {
        wasAuthenticated.current = false;
        setSelectedAuditId(null);
        setPreselectedStationId(null);
        setActiveTab('dashboard');
        setActiveModule('audits');
      }
    }
  }, [isAuthenticated, currentUser?.id]);

  // Realtime Supabase Database Subscription for Instant Multi-User Data Refresh
  useEffect(() => {
    if (!isAuthenticated || !isSupabaseConfigured || !supabase) return;

    const client = supabase;
    const channel = client
      .channel('realtime-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'station_audits' },
        () => {
          fetchAudits(currentUser?.id, currentUser?.role).then(setAudits);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'station_audit_notifications' },
        () => {
          fetchNotifications().then(setNotifications);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stations' },
        () => {
          fetchStations().then(setStations);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [isAuthenticated, currentUser?.id, currentUser?.role]);


  // --- USER DATA ISOLATION FILTERING FOR OPERATION SUPERVISORS ---
  const visibleAudits = useMemo(() => {
    if (!currentUser?.role) return [];
    if (currentUser.role === 'Operation Supervisor') {
      return audits.filter((audit) => audit.created_by === currentUser.id);
    }
    return audits; // Super Admin & Approval Roles see system/pipeline audits
  }, [audits, currentUser?.role, currentUser?.id]);

  // Filter notifications so each user sees workflow alerts & activity notifications relevant to their role and owned audits
  const visibleNotifications = useMemo(() => {
    if (!currentUser?.role) return [];
    if (currentUser.role === 'Super Admin') return notifications;

    // Index audits by ID and audit_number for O(1) lookups
    const auditMap = new Map<string, StationAudit>();
    for (const audit of audits) {
      if (audit.id) auditMap.set(audit.id, audit);
      if (audit.audit_number) auditMap.set(audit.audit_number, audit);
    }

    return notifications.filter((notif) => {
      // Cross-reference parent audit to verify creator/ownership
      const targetAudit = auditMap.get(notif.audit_id) || auditMap.get(notif.audit_number);

      if (currentUser.role === 'Operation Supervisor') {
        // Operation Supervisors ONLY see notifications for audits THEY created
        // (e.g. when their audit is approved, returned, or commented on)
        if (targetAudit && targetAudit.created_by === currentUser.id) {
          return notif.recipient_role === 'Operation Supervisor' || notif.recipient_role === 'ALL';
        }
        return false;
      }

      // For approval roles (Accountant, Account Manager, Management Executive):
      if (notif.recipient_role === 'ALL' || notif.recipient_role === currentUser.role) {
        return true;
      }

      return false;
    });
  }, [notifications, audits, currentUser?.role, currentUser?.id]);

  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  const handleSaveStation = async (station: Station) => {
    const saved = await saveStationToStorage(station);
    setStations((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved];
    });
    fetchStations().then(setStations);
    logActivity(currentUser.id, currentUser.full_name, 'STATION_SAVE', `Saved station ${station.station_no} - ${station.name}`).catch(console.warn);
  };

  const handleDeleteStation = async (stationId: string) => {
    setStations((prev) => prev.filter((s) => s.id !== stationId));
    await deleteStationFromStorage(stationId);
    fetchStations().then(setStations);
    logActivity(currentUser.id, currentUser.full_name, 'STATION_DELETE', `Deleted station ID ${stationId}`).catch(console.warn);
  };

  const handleSaveUser = async (user: User) => {
    const isNewUser = !user.id || !isValidUuid(user.id);

    if (isNewUser) {
      // --- CREATE: Provision Auth first (gets the real Auth UUID), then save profile ---
      if (!user.password_hash || !user.password_hash.trim()) {
        alert('Password is required to create a new user account.');
        return;
      }
      const res = await createUserAccount(user, user.password_hash);
      if (!res.success) {
        alert(`Error creating user account: ${res.error}`);
        return;
      }
    } else {
      // --- UPDATE: Save profile to public.users, then atomically sync auth.users ---
      const newEmail = user.email.trim().toLowerCase();
      const newPass  = (user.password_hash || '').trim();

      await saveUserToStorage({ ...user, password_hash: '', email: newEmail });

      const authUpdates: { email?: string; password?: string } = {};
      authUpdates.email = newEmail;
      if (newPass) authUpdates.password = newPass;

      try {
        await syncAuthProfile(user.id, authUpdates);
      } catch (err: any) {
        alert(`Profile saved. Auth sync warning: ${err.message}`);
      }
    }

    await reloadUsers();
    await logActivity(currentUser.id, currentUser.full_name, 'USER_SAVE', `Saved user account ${user.employee_id} - ${user.full_name}`);
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await deleteUserFromStorage(userId);
    if (!res.success && res.error) {
      alert(`Error deleting user account: ${res.error}`);
      return;
    }
    await reloadUsers();
    await logActivity(currentUser.id, currentUser.full_name, 'USER_DELETE', `Deleted user account ID ${userId}`);
  };


  const handleSaveSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    await saveSettingsToStorage(newSettings);
    logActivity(currentUser.id, currentUser.full_name, 'SETTINGS_UPDATE', 'Updated system configuration & fuel prices').catch(console.warn);
  };

  const handleSaveAudit = async (audit: StationAudit) => {
    try {
      const savedAudit = await saveAuditToStorage(audit);

      // 1. Optimistically update local audits state immediately with saved audit
      setAudits((prev) => {
        const exists = prev.some((a) => a.id === savedAudit.id);
        return exists ? prev.map((a) => (a.id === savedAudit.id ? savedAudit : a)) : [savedAudit, ...prev];
      });

      const isManagementOverride = audit.comments?.some((c) => c.comment_text?.includes('override authority'));

      const notificationsToCreate: Array<{ role: UserRole | 'ALL'; action: AuditNotification['action_type']; msg: string }> = [];

      if (savedAudit.current_status === 'pending_accountant') {
        notificationsToCreate.push(
          { role: 'Accountant', action: 'submitted', msg: `New Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) submitted by ${currentUser.full_name} for Accountant review.` },
          { role: 'Account Manager', action: 'submitted', msg: `New Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) submitted by ${currentUser.full_name} — pending Accountant review.` },
          { role: 'Management', action: 'submitted', msg: `New Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) submitted by ${currentUser.full_name} — pending Accountant review.` }
        );
      } else if (savedAudit.current_status === 'pending_account_manager') {
        notificationsToCreate.push({
          role: 'Account Manager',
          action: 'approved',
          msg: `Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) approved by Accountant ${currentUser.full_name} — awaiting Account Manager approval.`,
        });
      } else if (savedAudit.current_status === 'pending_management') {
        notificationsToCreate.push({
          role: 'Management',
          action: 'approved',
          msg: `Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) approved by Account Manager ${currentUser.full_name} — awaiting final Management Executive approval.`,
        });
      } else if (savedAudit.current_status === 'approved') {
        notificationsToCreate.push({
          role: 'Operation Supervisor',
          action: 'approved',
          msg: isManagementOverride
            ? `Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) approved & finalized by Management Executive ${currentUser.full_name} using override authority.`
            : `Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) fully approved and completed by Management Executive ${currentUser.full_name}.`,
        });
      } else if (savedAudit.current_status === 'returned_for_correction') {
        notificationsToCreate.push({
          role: 'Operation Supervisor',
          action: 'returned',
          msg: `Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) returned for correction by ${currentUser.full_name} (${currentUser.role}).`,
        });
      } else if (savedAudit.current_status === 'rejected') {
        notificationsToCreate.push({
          role: 'Operation Supervisor',
          action: 'rejected',
          msg: `Audit #${savedAudit.audit_number} for ${savedAudit.station_name} (${savedAudit.audit_date}) rejected by ${currentUser.full_name} (${currentUser.role}).`,
        });
      }

      // 2. Save notifications concurrently in parallel
      const createdNotifs: AuditNotification[] = notificationsToCreate.map((item) => ({
        id: generateUUID(),
        audit_id: savedAudit.id,
        audit_number: savedAudit.audit_number,
        station_name: savedAudit.station_name,
        audit_date: savedAudit.audit_date,
        recipient_role: item.role,
        sender_name: currentUser.full_name,
        action_type: item.action,
        message: item.msg,
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      if (createdNotifs.length > 0) {
        setNotifications((prev) => [...createdNotifs, ...prev]);
        Promise.all(createdNotifs.map((n) => saveNotifToStorage(n))).catch(console.warn);
      }

      // 3. Immediately transition screen view
      navigateTo('audits');

      // 4. Background synchronization with Supabase DB
      fetchAudits(currentUser?.id, currentUser?.role).then(setAudits);
      fetchNotifications().then(setNotifications);
      logActivity(currentUser.id, currentUser.full_name, 'AUDIT_SAVE', `Saved audit ${savedAudit.audit_number} with status ${savedAudit.current_status}`).catch(console.warn);

    } catch (err: any) {
      alert(err.message || 'Error saving station audit.');
    }
  };

  const handleOpenAudit = async (auditId: string) => {
    setSelectedAuditId(auditId);
    setPreselectedStationId(null);
    navigateTo('new-audit');

    try {
      const fullAudit = await fetchAuditById(auditId);
      if (fullAudit) {
        setAudits((prev) => prev.map((a) => (a.id === auditId ? fullAudit : a)));
      }
    } catch (e) {
      console.warn('Error fetching audit details on demand:', e);
    }
  };

  const handleCreateNewAudit = () => {
    if (!canCreateAudit) {
      alert('Access Denied: Only the Operation Supervisor is authorized to create new Station Audits.');
      return;
    }
    setIsStationSelectionOpen(true);
  };

  const handleSelectStation = (station: Station) => {
    setPreselectedStationId(station.id);
    setSelectedAuditId(null);
    setIsStationSelectionOpen(false);
    navigateTo('new-audit');
  };

  const handleMarkNotifRead = async (id: string) => {
    await markNotifReadInStorage(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllNotifsRead = async () => {
    const unreadIds = visibleNotifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await markAllNotificationsAsRead(unreadIds);
    setNotifications((prev) =>
      prev.map((n) => (unreadIds.includes(n.id) ? { ...n, is_read: true } : n))
    );
  };

  const handleDeleteNotif = async (id: string) => {
    await deleteNotificationFromStorage(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const selectedAudit = audits.find((a) => a.id === selectedAuditId) || null;
  const unreadCount = visibleNotifications.filter((n) => !n.is_read).length;

  const isUnauthorizedAuditAccess =
    Boolean(selectedAudit) &&
    currentUser?.role === 'Operation Supervisor' &&
    selectedAudit?.created_by !== currentUser?.id;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      
      {/* 1. ELEGANT CLEAN ENTERPRISE BACKGROUND SYSTEM */}
      <div className="fixed inset-0 w-full h-full bg-slate-100 pointer-events-none z-0 overflow-hidden">
        {/* Layer 1: Base Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-sky-50/60 to-slate-200/80"></div>

        {/* Layer 2: Subtle Ambient Accent Orbs */}
        <div className="absolute -top-44 -left-44 w-[750px] h-[750px] bg-sky-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-44 -right-44 w-[700px] h-[700px] bg-blue-200/35 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[100px]"></div>
      </div>

      {/* NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'new-audit') {
            handleCreateNewAudit();
          } else {
            setSelectedAuditId(null);
            navigateTo(tab as TabKey);
          }
        }}
        unreadCount={unreadCount}
        activeModule={activeModule}
        onSelectModule={(mod) => switchModule(mod)}
      />

      {/* STATION SELECTION MODAL BEFORE AUDIT CREATION */}
      <StationSelectionModal
        isOpen={isStationSelectionOpen}
        stations={stations}
        currentUser={currentUser}
        onSelectStation={handleSelectStation}
        onClose={() => setIsStationSelectionOpen(false)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 pb-12 relative z-10">
        {isSuperAdmin && (
          <SuperAdminModuleSelector
            activeModule={activeModule}
            onSelectModule={(mod) => switchModule(mod)}
          />
        )}

        {activeModule === 'station-openings' ? (
          <StationOpeningModule currentUser={currentUser} stations={stations} />
        ) : (
          <>
            {activeTab === 'admin' && currentUser.role === 'Super Admin' && (
          <AdminDashboard
            stations={stations}
            users={allUsers}
            audits={audits}
            logs={auditLogs}
            settings={settings}
            onSaveStation={handleSaveStation}
            onDeleteStation={handleDeleteStation}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
            onSaveSettings={handleSaveSettings}
            onOpenAudit={handleOpenAudit}
            onCreateNewAudit={handleCreateNewAudit}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            audits={visibleAudits}
            stations={stations}
            onCreateNewAudit={handleCreateNewAudit}
          />
        )}

        {activeTab === 'audits' && (
          <AuditListView
            audits={visibleAudits}
            onOpenAudit={handleOpenAudit}
            onCreateNewAudit={handleCreateNewAudit}
          />
        )}

        {activeTab === 'new-audit' && (
          !selectedAudit && !canCreateAudit ? (
            /* ACCESS DENIED SCREEN FOR UNAUTHORIZED CREATION */
            <div className="max-w-2xl mx-auto my-12 p-8 bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[28px] text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Access Denied: Audit Creation Restricted</h3>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Only the <strong className="text-sky-800">Operation Supervisor</strong> is authorized to create new Station Audits. As <strong className="text-slate-900">{currentUser.role}</strong> ({currentUser.full_name}), you have view and approval permissions assigned to your role.
              </p>
              <button
                onClick={() => navigateTo('dashboard')}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs rounded-2xl border border-sky-200/80 shadow-md inline-flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-sky-600" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          ) : isUnauthorizedAuditAccess ? (
            /* ACCESS DENIED SCREEN FOR PRIVATE WORKSPACE RESTRICTION */
            <div className="max-w-2xl mx-auto my-12 p-8 bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[28px] text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Access Denied: Private Workspace Restriction</h3>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Operation Supervisors can only view and manage Station Audits that they personally created. You are not authorized to access audit <strong className="text-sky-800">{selectedAudit?.audit_number}</strong> created by another Operation Supervisor.
              </p>
              <button
                onClick={() => navigateTo('audits')}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs rounded-2xl border border-sky-200/80 shadow-md inline-flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-sky-600" />
                <span>Return to My Audits</span>
              </button>
            </div>
          ) : (
            <StationAuditForm
              initialAudit={selectedAudit}
              initialStationId={preselectedStationId}
              stations={stations}
              existingAudits={audits}
              defaultPrices={{
                p91: settings.p91_price,
                p95: settings.p95_price,
                diesel: settings.diesel_price,
              }}
              onSave={handleSaveAudit}
              onBack={() => navigateTo('audits')}
            />
          )
        )}


        {activeTab === 'activity' && (
          <NotificationCenter
            notifications={visibleNotifications}
            onMarkAsRead={handleMarkNotifRead}
            onMarkAllAsRead={handleMarkAllNotifsRead}
            onDeleteNotification={handleDeleteNotif}
            onOpenAudit={handleOpenAudit}
          />
        )}
          </>
        )}
      </main>

      {/* FOOTER (CLEAN UNBOXED CENTERED TEXT DIRECTLY ON PAGE BACKGROUND - 7PX) */}
      <footer className="py-3 text-center text-[7px] text-sky-100/80 font-medium drop-shadow-sm relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>
            © 2026 Al Noor United Fuel Est. All rights reserved. | Developed by Paul John Buenafe
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

