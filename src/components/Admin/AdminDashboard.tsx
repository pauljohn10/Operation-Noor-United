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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/45 backdrop-blur-2xl border border-white/80 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-700 rounded-2xl border border-purple-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('admin.hubTitle')}</h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('admin.hubSub')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 text-xs font-extrabold">
            {activeUsersCount} Active Users
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-extrabold">
            {activeStationsCount} Operational Stations
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION MENUS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-sky-100 text-xs font-extrabold">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeMenu === 'dashboard'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{t('nav.dashboard')}</span>
        </button>

        <button
          onClick={() => setActiveMenu('stations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeMenu === 'stations'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{t('admin.tabStations')} ({stations.length})</span>
        </button>

        <button
          onClick={() => setActiveMenu('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeMenu === 'users'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('admin.tabUsers')} ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveMenu('audits')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeMenu === 'audits'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('nav.audits')} ({audits.length})</span>
        </button>

        <button
          onClick={() => setActiveMenu('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeMenu === 'reports'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{t('admin.tabLogs')}</span>
        </button>

        <button
          onClick={() => setActiveMenu('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeMenu === 'settings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t('admin.tabSettings')}</span>
        </button>
      </div>


      {/* CONTENT PANELS */}
      {activeMenu === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-6 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">System Health</h3>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600">100% Operational</p>
            <p className="text-xs text-slate-500 font-medium">Database & RLS Security Active</p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-6 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Registered Users</h3>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-500 font-medium">{activeUsersCount} Active Accounts</p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-6 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Managed Stations</h3>
              <Building className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stations.length}</p>
            <p className="text-xs text-slate-500 font-medium">{activeStationsCount} Operational Fuel Stations</p>
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
