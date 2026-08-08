import React, { useState } from 'react';
import type { User, Station, StationAudit, AuditLog, SystemSettings } from '../../types/audit';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../Common/GlassCard';
import { StationManagement } from './StationManagement';
import { UserManagement } from './UserManagement';
import { SystemLogsView } from './SystemLogsView';
import { SystemSettingsView } from './SystemSettingsView';
import { AuditListView } from '../AuditList/AuditListView';
import {
  ShieldCheck,
  Building,
  Users,
  FileText,
  Terminal,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

interface Props {
  stations: Station[];
  users: User[];
  audits: StationAudit[];
  logs: AuditLog[];
  settings: SystemSettings;
  onSaveStation: (station: Station) => Promise<void>;
  onDeleteStation: (id: string) => Promise<void>;
  onSaveUser: (user: User) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onSaveSettings: (settings: SystemSettings) => Promise<void>;
  onOpenAudit: (id: string) => void;
  onCreateNewAudit: () => void;
}

type AdminMenuKey = 'dashboard' | 'stations' | 'users' | 'audits' | 'reports' | 'settings';

export const AdminDashboard: React.FC<Props> = ({
  stations,
  users,
  audits,
  logs,
  settings,
  onSaveStation,
  onDeleteStation,
  onSaveUser,
  onDeleteUser,
  onSaveSettings,
  onOpenAudit,
  onCreateNewAudit,
}) => {
  const { t } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('dashboard');

  const activeStationsCount = stations.filter((s) => s.status === 'active').length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* HEADER NAVBAR */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-800 rounded-full text-xs font-extrabold border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Enterprise Admin Portal</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Building className="w-5 h-5 text-sky-600" />
            <span>Admin Hub</span>
          </h2>
          <p className="text-xs text-slate-600 font-semibold">
            Manage stations, user permissions, audit records & system parameters
          </p>
        </div>

        {/* HIGH-CONTRAST DEDICATED NAVIGATION CONTAINER */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'dashboard'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white font-extrabold'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('admin.navDashboard')}</span>
          </button>

          <button
            onClick={() => setActiveMenu('stations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'stations'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white font-extrabold'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{t('admin.tabStations')}</span>
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-mono">
              {stations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'users'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white font-extrabold'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('admin.tabUsers')}</span>
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-mono">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('audits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'audits'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white font-extrabold'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('nav.audits')}</span>
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-mono">
              {audits.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'reports'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white font-extrabold'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{t('admin.tabLogs')}</span>
          </button>

          <button
            onClick={() => setActiveMenu('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'settings'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white font-extrabold'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('admin.tabSettings')}</span>
          </button>
        </div>
      </div>

      {/* CONTENT PANELS */}
      {activeMenu === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. System Health */}
          <GlassCard variant="emerald">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">System Health</span>
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-emerald-900 font-mono">100%</p>
              <p className="text-xs text-slate-600 font-bold mt-1">Database & RLS Security Active</p>
            </div>
          </GlassCard>

          {/* 2. Station Registry */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('stations')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-950 uppercase tracking-wider">{t('admin.tabStations')}</span>
              <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl border border-sky-200 shadow-2xs">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 font-mono">{stations.length}</p>
              <p className="text-xs text-slate-600 font-bold mt-1">{activeStationsCount} Operational Fuel Stations</p>
            </div>
          </GlassCard>

          {/* 3. User Management */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('users')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-950 uppercase tracking-wider">{t('admin.tabUsers')}</span>
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 font-mono">{users.length}</p>
              <p className="text-xs text-slate-600 font-bold mt-1">{activeUsersCount} Active Accounts</p>
            </div>
          </GlassCard>

          {/* 4. Audits */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('audits')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-950 uppercase tracking-wider">{t('nav.audits')}</span>
              <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl border border-sky-200 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 font-mono">{audits.length}</p>
              <p className="text-xs text-slate-600 font-bold mt-1">Total Filed Station Audits</p>
            </div>
          </GlassCard>

          {/* 5. System Activity Logs */}
          <GlassCard variant="amber" className="cursor-pointer" onClick={() => setActiveMenu('reports')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider">{t('admin.tabLogs')}</span>
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200 shadow-2xs">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-amber-900 font-mono">Active</p>
              <p className="text-xs text-slate-600 font-bold mt-1">Real-time Audit Trail & Logs</p>
            </div>
          </GlassCard>

          {/* 6. System Settings */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('settings')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-950 uppercase tracking-wider">{t('admin.tabSettings')}</span>
              <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl border border-sky-200 shadow-2xs">
                <Settings className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 font-mono">Configured</p>
              <p className="text-xs text-slate-600 font-bold mt-1">Default Fuel Prices & Session Controls</p>
            </div>
          </GlassCard>
        </div>
      )}

      {activeMenu === 'stations' && (
        <StationManagement
          stations={stations}
          users={users}
          onSaveStation={onSaveStation}
          onDeleteStation={onDeleteStation}
        />
      )}

      {activeMenu === 'users' && (
        <UserManagement
          users={users}
          stations={stations}
          onSaveUser={onSaveUser}
          onDeleteUser={onDeleteUser}
        />
      )}

      {activeMenu === 'audits' && (
        <AuditListView
          audits={audits}
          onOpenAudit={onOpenAudit}
          onCreateNewAudit={onCreateNewAudit}
        />
      )}

      {activeMenu === 'reports' && <SystemLogsView logs={logs} />}

      {activeMenu === 'settings' && (
        <SystemSettingsView settings={settings} onSaveSettings={onSaveSettings} />
      )}
    </div>
  );
};
