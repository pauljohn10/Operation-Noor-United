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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/12 backdrop-blur-3xl border border-white/25 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-white/20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-400/30 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">{t('admin.hubTitle')}</h2>
            <p className="text-xs text-purple-200/90 font-semibold mt-0.5 drop-shadow-sm">
              {t('admin.hubSub')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-extrabold shadow-sm">
            {activeUsersCount} Active Users
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold shadow-sm">
            {activeStationsCount} Operational Stations
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION MENUS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-white/12 backdrop-blur-3xl border border-white/25 rounded-2xl shadow-lg ring-1 ring-white/20 text-xs font-bold">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'dashboard'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/40 ring-1 ring-white/30 font-black'
              : 'text-sky-100/90 hover:text-white bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeMenu === 'dashboard' ? 'text-white' : 'text-purple-300'}`} />
          <span>{t('nav.dashboard')}</span>
        </button>

        <button
          onClick={() => setActiveMenu('stations')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'stations'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/40 ring-1 ring-white/30 font-black'
              : 'text-sky-100/90 hover:text-white bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20'
          }`}
        >
          <Building className={`w-4 h-4 ${activeMenu === 'stations' ? 'text-white' : 'text-purple-300'}`} />
          <span>{t('admin.tabStations')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
            activeMenu === 'stations'
              ? 'bg-white/25 text-white border border-white/40'
              : 'bg-purple-500/25 text-purple-200 border border-purple-400/30'
          }`}>
            {stations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMenu('users')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'users'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/40 ring-1 ring-white/30 font-black'
              : 'text-sky-100/90 hover:text-white bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20'
          }`}
        >
          <Users className={`w-4 h-4 ${activeMenu === 'users' ? 'text-white' : 'text-purple-300'}`} />
          <span>{t('admin.tabUsers')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
            activeMenu === 'users'
              ? 'bg-white/25 text-white border border-white/40'
              : 'bg-purple-500/25 text-purple-200 border border-purple-400/30'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMenu('audits')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'audits'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/40 ring-1 ring-white/30 font-black'
              : 'text-sky-100/90 hover:text-white bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeMenu === 'audits' ? 'text-white' : 'text-purple-300'}`} />
          <span>{t('nav.audits')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
            activeMenu === 'audits'
              ? 'bg-white/25 text-white border border-white/40'
              : 'bg-purple-500/25 text-purple-200 border border-purple-400/30'
          }`}>
            {audits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMenu('reports')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'reports'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/40 ring-1 ring-white/30 font-black'
              : 'text-sky-100/90 hover:text-white bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20'
          }`}
        >
          <Terminal className={`w-4 h-4 ${activeMenu === 'reports' ? 'text-white' : 'text-purple-300'}`} />
          <span>{t('admin.tabLogs')}</span>
        </button>

        <button
          onClick={() => setActiveMenu('settings')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
            activeMenu === 'settings'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/40 ring-1 ring-white/30 font-black'
              : 'text-sky-100/90 hover:text-white bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeMenu === 'settings' ? 'text-white' : 'text-purple-300'}`} />
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
