import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';


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
  saveNotification as saveNotifToStorage,
  logActivity,
  createUserAccount,
  syncAuthProfile,
  generateUUID,
} from './lib/supabaseClient';

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

  const [stations, setStations] = useState<Station[]>([]);
  const [audits, setAudits] = useState<StationAudit[]>([]);
  const [notifications, setNotifications] = useState<AuditNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    company_name: 'Al Noor United Fuel Est.',
    company_name_ar: 'مؤسسة النور المتحدة للوقود',
    session_timeout_minutes: 30,
    p91_price: 2.18,
    p95_price: 2.33,
    diesel_price: 1.15,
  });

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [isStationSelectionOpen, setIsStationSelectionOpen] = useState(false);
  const [preselectedStationId, setPreselectedStationId] = useState<string | null>(null);

  // Track whether authentication routing was initialized for the current session.
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Synchronously mark auth as initialized IMMEDIATELY on login transition
      if (!wasAuthenticated.current) {
        wasAuthenticated.current = true;

        // Every new login session starts fresh on the Dashboard
        history.replaceState({ tab: 'dashboard' }, '', '#dashboard');
        setActiveTab('dashboard');
      }

      // Background data loading - completely decoupled from navigation and routing
      async function loadData() {
        try {
          const [stData, audData, notifData, logData, settsData] = await Promise.all([
            fetchStations(),
            fetchAudits(),
            fetchNotifications(),
            fetchAuditLogs(),
            fetchSettings(),
          ]);

          setStations(stData);
          setAudits(audData);
          setNotifications(notifData);
          setAuditLogs(logData);
          setSettings(settsData);
        } catch (e) {
          console.error('Background data load error:', e);
        }
      }
      loadData();
    } else {
      // User logged out — reset the tracker so the next login performs single initial redirect
      wasAuthenticated.current = false;
    }
  }, [isAuthenticated]);


  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // --- USER DATA ISOLATION FILTERING FOR OPERATION SUPERVISORS ---
  const visibleAudits = audits.filter((audit) => {
    if (currentUser.role === 'Operation Supervisor') {
      return audit.created_by === currentUser.id;
    }
    return true; // Super Admin & Approval Roles see system/pipeline audits
  });

  // Filter notifications so Operation Supervisors only see alerts for their own audits
  const visibleNotifications = notifications.filter((notif) => {
    if (currentUser.role === 'Operation Supervisor') {
      return notif.recipient_role === 'ALL' || notif.sender_name === currentUser.full_name;
    }
    return true;
  });

  const handleSaveStation = async (station: Station) => {
    await saveStationToStorage(station);
    const updatedStations = await fetchStations();
    setStations(updatedStations);
    await logActivity(currentUser.id, currentUser.full_name, 'STATION_SAVE', `Saved station ${station.station_no} - ${station.name}`);
  };

  const handleDeleteStation = async (stationId: string) => {
    await deleteStationFromStorage(stationId);
    const updatedStations = await fetchStations();
    setStations(updatedStations);
    await logActivity(currentUser.id, currentUser.full_name, 'STATION_DELETE', `Deleted station ID ${stationId}`);
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
      // createUserAccount already calls saveUser internally with the correct Auth UUID
    } else {
      // --- UPDATE: Save profile to public.users, then atomically sync auth.users ---

      // 1. Fetch the CURRENT email stored in auth.users before making any changes
      const newEmail = user.email.trim().toLowerCase();
      const newPass  = (user.password_hash || '').trim();

      // 2. Save profile fields to public.users (password_hash column is not used for auth)
      await saveUserToStorage({ ...user, password_hash: '', email: newEmail });

      // 3. Sync BOTH email and optional password to auth.users in a single API call.
      //    This is the critical step that was missing — without it, changing the email
      //    in public.users causes a mismatch with auth.users, breaking username login.
      const authUpdates: { email?: string; password?: string } = {};
      authUpdates.email = newEmail;           // always sync email (no-op if unchanged)
      if (newPass) authUpdates.password = newPass; // only if admin explicitly set a new password

      try {
        await syncAuthProfile(user.id, authUpdates);
      } catch (err: any) {
        // Profile was already saved — alert but don't block
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
    await saveSettingsToStorage(newSettings);
    setSettings(newSettings);
    await logActivity(currentUser.id, currentUser.full_name, 'SETTINGS_UPDATE', 'Updated system configuration & fuel prices');
  };

  const handleSaveAudit = async (audit: StationAudit) => {
    try {
      await saveAuditToStorage(audit);
      const updatedAudits = await fetchAudits();
      setAudits(updatedAudits);

      const notifRole =
        audit.current_status === 'pending_accountant'
          ? 'Accountant'
          : audit.current_status === 'pending_account_manager'
          ? 'Account Manager'
          : audit.current_status === 'pending_management'
          ? 'Management'
          : 'ALL';

      const newNotif: AuditNotification = {
        id: generateUUID(),
        audit_id: isValidUuid(audit.id) ? audit.id : generateUUID(),
        audit_number: audit.audit_number,
        station_name: audit.station_name,
        recipient_role: notifRole as any,
        sender_name: currentUser.full_name,
        action_type:
          audit.current_status === 'approved'
            ? 'approved'
            : audit.current_status === 'returned_for_correction'
            ? 'returned'
            : audit.current_status === 'rejected'
            ? 'rejected'
            : 'submitted',
        message: `Audit ${audit.audit_number} for ${audit.station_name} updated to ${audit.current_status.replace(/_/g, ' ').toUpperCase()}`,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      await saveNotifToStorage(newNotif);
      setNotifications(await fetchNotifications());

      await logActivity(
        currentUser.id,
        currentUser.full_name,
        'AUDIT_SAVE',
        `Saved audit ${audit.audit_number} with status ${audit.current_status}`
      );

      navigateTo('audits');

    } catch (err: any) {
      alert(err.message || 'Error saving station audit.');
    }
  };

  const handleOpenAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setPreselectedStationId(null);
    navigateTo('new-audit');
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

  const selectedAudit = audits.find((a) => a.id === selectedAuditId) || null;
  const unreadCount = visibleNotifications.filter((n) => !n.is_read).length;

  const isUnauthorizedAuditAccess =
    Boolean(selectedAudit) &&
    currentUser.role === 'Operation Supervisor' &&
    selectedAudit?.created_by !== currentUser.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF6FF] via-[#D9F1FF] via-[#FFFFFF] to-[#E3F2FD] text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      
      {/* AMBIENT LIGHT BLOBS FOR GLASS DEPTH */}
      <div className="fixed -top-36 -left-36 w-[650px] h-[650px] bg-gradient-to-tr from-sky-400/25 via-blue-300/20 to-cyan-300/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-36 -right-36 w-[750px] h-[750px] bg-gradient-to-bl from-blue-300/20 via-indigo-200/20 to-sky-300/25 rounded-full blur-3xl pointer-events-none"></div>

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
            onOpenAudit={handleOpenAudit}
          />
        )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/80 bg-white/45 backdrop-blur-md py-4 text-center text-xs text-slate-600 font-semibold shadow-inner relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>
            © 2026 Al Noor United Fuel Est. (مؤسسة النور المتحدة للوقود) — Enterprise Station Audit Management System
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

