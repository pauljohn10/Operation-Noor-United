import React, { useState } from 'react';
import type { User, Station, StationAudit, AuditLog, SystemSettings } from '../../types/audit';
import { useLanguage } from '../../context/LanguageContext';
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
  CheckCircle,
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
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'stations' | 'users' | 'audits' | 'reports' | 'settings'
  >('dashboard');

  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const activeStationsCount = stations.filter((s) => s.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">



      
      {/* SUPER ADMIN HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-2xl border border-slate-700/80 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/25 text-purple-300 rounded-2xl border border-purple-400/40 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">{t('admin.hubTitle')}</h2>
            <p className="text-xs text-purple-200 font-semibold mt-0.5 drop-shadow-sm">
              {t('admin.hubSub')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-100 text-xs font-black shadow-sm">
            {activeUsersCount} Active Users
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-black shadow-sm">
            {activeStationsCount} Operational Stations
          </div>
        </div>
      </div>

      {/* HIGH-CONTRAST ADMIN NAVIGATION MENUS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto p-2.5 bg-slate-950/85 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.4)] ring-1 ring-white/10 text-xs font-bold">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'dashboard'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-300/50 ring-1 ring-white/30 font-black'
              : 'bg-slate-900/60 hover:bg-purple-950/60 text-slate-100 hover:text-white border border-slate-800 hover:border-purple-500/40 shadow-sm'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeMenu === 'dashboard' ? 'text-white' : 'text-purple-400'}`} />
          <span>{t('nav.dashboard')}</span>
        </button>

        <button
          onClick={() => setActiveMenu('stations')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'stations'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-300/50 ring-1 ring-white/30 font-black'
              : 'bg-slate-900/60 hover:bg-purple-950/60 text-slate-100 hover:text-white border border-slate-800 hover:border-purple-500/40 shadow-sm'
          }`}
        >
          <Building className={`w-4 h-4 ${activeMenu === 'stations' ? 'text-white' : 'text-purple-400'}`} />
          <span>{t('admin.tabStations')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
            activeMenu === 'stations'
              ? 'bg-white/25 text-white border border-white/40'
              : 'bg-slate-800 text-purple-200 border border-purple-400/40'
          }`}>
            {stations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMenu('users')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'users'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-300/50 ring-1 ring-white/30 font-black'
              : 'bg-slate-900/60 hover:bg-purple-950/60 text-slate-100 hover:text-white border border-slate-800 hover:border-purple-500/40 shadow-sm'
          }`}
        >
          <Users className={`w-4 h-4 ${activeMenu === 'users' ? 'text-white' : 'text-purple-400'}`} />
          <span>{t('admin.tabUsers')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
            activeMenu === 'users'
              ? 'bg-white/25 text-white border border-white/40'
              : 'bg-slate-800 text-purple-200 border border-purple-400/40'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMenu('audits')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'audits'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-300/50 ring-1 ring-white/30 font-black'
              : 'bg-slate-900/60 hover:bg-purple-950/60 text-slate-100 hover:text-white border border-slate-800 hover:border-purple-500/40 shadow-sm'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeMenu === 'audits' ? 'text-white' : 'text-purple-400'}`} />
          <span>{t('nav.audits')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
            activeMenu === 'audits'
              ? 'bg-white/25 text-white border border-white/40'
              : 'bg-slate-800 text-purple-200 border border-purple-400/40'
          }`}>
            {audits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMenu('reports')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'reports'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-300/50 ring-1 ring-white/30 font-black'
              : 'bg-slate-900/60 hover:bg-purple-950/60 text-slate-100 hover:text-white border border-slate-800 hover:border-purple-500/40 shadow-sm'
          }`}
        >
          <Terminal className={`w-4 h-4 ${activeMenu === 'reports' ? 'text-white' : 'text-purple-400'}`} />
          <span>{t('admin.tabLogs')}</span>
        </button>

        <button
          onClick={() => setActiveMenu('settings')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'settings'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-300/50 ring-1 ring-white/30 font-black'
              : 'bg-slate-900/60 hover:bg-purple-950/60 text-slate-100 hover:text-white border border-slate-800 hover:border-purple-500/40 shadow-sm'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeMenu === 'settings' ? 'text-white' : 'text-purple-400'}`} />
          <span>{t('admin.tabSettings')}</span>
        </button>
      </div>

      {/* CONTENT PANELS */}
      {activeMenu === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/25 p-6 rounded-[24px] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sky-100">System Health</h3>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">100% Operational</p>
            <p className="text-xs text-sky-200/80 font-medium">Database & RLS Security Active</p>
          </div>

          <div className="bg-white/10 backdrop-blur-3xl border border-white/25 p-6 rounded-[24px] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sky-100">Registered Users</h3>
              <Users className="w-4 h-4 text-purple-300" />
            </div>
            <p className="text-2xl font-black text-white">{users.length}</p>
            <p className="text-xs text-purple-200/80 font-medium">{activeUsersCount} Active Accounts</p>
          </div>

          <div className="bg-white/10 backdrop-blur-3xl border border-white/25 p-6 rounded-[24px] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sky-100">Managed Stations</h3>
              <Building className="w-4 h-4 text-sky-300" />
            </div>
            <p className="text-2xl font-black text-white">{stations.length}</p>
            <p className="text-xs text-sky-200/80 font-medium">{activeStationsCount} Operational Fuel Stations</p>
          </div>
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
