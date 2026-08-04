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
      <div className="bg-white/10 backdrop-blur-3xl border border-white/25 p-5 rounded-[28px] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-400/20 text-sky-200 rounded-full text-xs font-extrabold border border-sky-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
            <span>Enterprise Admin Portal</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1 drop-shadow-sm">
            <Building className="w-5 h-5 text-sky-300" />
            <span>Admin Hub</span>
          </h2>
          <p className="text-xs text-sky-100/90 font-semibold drop-shadow-sm">
            Manage stations, user permissions, audit records & system parameters
          </p>
        </div>

        {/* HIGH-CONTRAST DEDICATED FROSTED NAVIGATION CONTAINER */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950/40 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/30 shadow-inner">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'dashboard'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                : 'text-white hover:text-sky-200 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-sky-300" />
            <span>{t('admin.navDashboard')}</span>
          </button>

          <button
            onClick={() => setActiveMenu('stations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'stations'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                : 'text-white hover:text-sky-200 hover:bg-white/10'
            }`}
          >
            <Building className="w-4 h-4 text-sky-300" />
            <span>{t('admin.tabStations')}</span>
            <span className="px-1.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-mono">
              {stations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'users'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                : 'text-white hover:text-sky-200 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-sky-300" />
            <span>{t('admin.tabUsers')}</span>
            <span className="px-1.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-mono">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('audits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'audits'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                : 'text-white hover:text-sky-200 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-300" />
            <span>{t('nav.audits')}</span>
            <span className="px-1.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-mono">
              {audits.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'reports'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                : 'text-white hover:text-sky-200 hover:bg-white/10'
            }`}
          >
            <Terminal className="w-4 h-4 text-sky-300" />
            <span>{t('admin.tabLogs')}</span>
          </button>

          <button
            onClick={() => setActiveMenu('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeMenu === 'settings'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                : 'text-white hover:text-sky-200 hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4 text-sky-300" />
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
              <span className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider drop-shadow-sm">System Health</span>
              <div className="p-3 bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 text-emerald-300 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-emerald-300 font-mono drop-shadow-md">100%</p>
              <p className="text-xs text-emerald-200/90 font-bold mt-1 drop-shadow-sm">Database & RLS Security Active</p>
            </div>
          </GlassCard>

          {/* 2. Station Registry */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('stations')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabStations')}</span>
              <div className="p-3 bg-sky-500/20 backdrop-blur-xl rounded-2xl border border-sky-400/30 text-cyan-300 shadow-sm">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">{stations.length}</p>
              <p className="text-xs text-sky-200/90 font-bold mt-1 drop-shadow-sm">{activeStationsCount} Operational Fuel Stations</p>
            </div>
          </GlassCard>

          {/* 3. User Management */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('users')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabUsers')}</span>
              <div className="p-3 bg-purple-500/20 backdrop-blur-xl rounded-2xl border border-purple-400/30 text-purple-300 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">{users.length}</p>
              <p className="text-xs text-purple-200/90 font-bold mt-1 drop-shadow-sm">{activeUsersCount} Active Accounts</p>
            </div>
          </GlassCard>

          {/* 4. Audits */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('audits')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-100 uppercase tracking-wider drop-shadow-sm">{t('nav.audits')}</span>
              <div className="p-3 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 text-cyan-300 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">{audits.length}</p>
              <p className="text-xs text-blue-200/90 font-bold mt-1 drop-shadow-sm">Total Filed Station Audits</p>
            </div>
          </GlassCard>

          {/* 5. System Activity Logs */}
          <GlassCard variant="amber" className="cursor-pointer" onClick={() => setActiveMenu('reports')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabLogs')}</span>
              <div className="p-3 bg-amber-500/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 text-amber-300 shadow-sm">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-amber-300 font-mono drop-shadow-md">Active</p>
              <p className="text-xs text-amber-200/90 font-bold mt-1 drop-shadow-sm">Real-time Audit Trail & Logs</p>
            </div>
          </GlassCard>

          {/* 6. System Settings */}
          <GlassCard variant="blue" className="cursor-pointer" onClick={() => setActiveMenu('settings')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabSettings')}</span>
              <div className="p-3 bg-indigo-500/20 backdrop-blur-xl rounded-2xl border border-indigo-400/30 text-indigo-300 shadow-sm">
                <Settings className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">Configured</p>
              <p className="text-xs text-indigo-200/90 font-bold mt-1 drop-shadow-sm">Default Fuel Prices & Session Controls</p>
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
