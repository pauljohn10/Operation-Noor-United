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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. System Health */}
          <div className="relative group bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[24px] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(16,185,129,0.15)] hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden space-y-3">
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[24px] pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider drop-shadow-sm">System Health</span>
              <div className="p-3 bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 text-emerald-300 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-emerald-300 font-mono drop-shadow-md">100%</p>
              <p className="text-xs text-emerald-200/90 font-bold mt-1 drop-shadow-sm">Database & RLS Security Active</p>
            </div>
          </div>

          {/* 2. Station Registry */}
          <div
            onClick={() => setActiveMenu('stations')}
            className="relative group bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[24px] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(56,189,248,0.15)] hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden space-y-3 cursor-pointer"
          >
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[24px] pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabStations')}</span>
              <div className="p-3 bg-sky-500/20 backdrop-blur-xl rounded-2xl border border-sky-400/30 text-sky-300 shadow-sm">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">{stations.length}</p>
              <p className="text-xs text-sky-200/90 font-bold mt-1 drop-shadow-sm">{activeStationsCount} Operational Fuel Stations</p>
            </div>
          </div>

          {/* 3. User Management */}
          <div
            onClick={() => setActiveMenu('users')}
            className="relative group bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[24px] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(168,85,247,0.15)] hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden space-y-3 cursor-pointer"
          >
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[24px] pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabUsers')}</span>
              <div className="p-3 bg-purple-500/20 backdrop-blur-xl rounded-2xl border border-purple-400/30 text-purple-300 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">{users.length}</p>
              <p className="text-xs text-purple-200/90 font-bold mt-1 drop-shadow-sm">{activeUsersCount} Active Accounts</p>
            </div>
          </div>

          {/* 4. Audits */}
          <div
            onClick={() => setActiveMenu('audits')}
            className="relative group bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[24px] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(59,130,246,0.15)] hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden space-y-3 cursor-pointer"
          >
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[24px] pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-100 uppercase tracking-wider drop-shadow-sm">{t('nav.audits')}</span>
              <div className="p-3 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 text-blue-300 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">{audits.length}</p>
              <p className="text-xs text-blue-200/90 font-bold mt-1 drop-shadow-sm">Total Filed Station Audits</p>
            </div>
          </div>

          {/* 5. System Activity Logs */}
          <div
            onClick={() => setActiveMenu('reports')}
            className="relative group bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[24px] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(245,158,11,0.15)] hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden space-y-3 cursor-pointer"
          >
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[24px] pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabLogs')}</span>
              <div className="p-3 bg-amber-500/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 text-amber-300 shadow-sm">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-amber-300 font-mono drop-shadow-md">Active</p>
              <p className="text-xs text-amber-200/90 font-bold mt-1 drop-shadow-sm">Real-time Audit Trail & Logs</p>
            </div>
          </div>

          {/* 6. System Settings */}
          <div
            onClick={() => setActiveMenu('settings')}
            className="relative group bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[24px] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(99,102,241,0.15)] hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden space-y-3 cursor-pointer"
          >
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[24px] pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-100 uppercase tracking-wider drop-shadow-sm">{t('admin.tabSettings')}</span>
              <div className="p-3 bg-indigo-500/20 backdrop-blur-xl rounded-2xl border border-indigo-400/30 text-indigo-300 shadow-sm">
                <Settings className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-indigo-300 font-mono drop-shadow-md">Ready</p>
              <p className="text-xs text-indigo-200/90 font-bold mt-1 drop-shadow-sm">System Parameters & Config</p>
            </div>
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
