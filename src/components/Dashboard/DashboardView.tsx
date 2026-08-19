import React, { useState, useMemo } from 'react';
import type { StationAudit, Station } from '../../types/audit';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../Common/GlassCard';
import { MonthlyDashboardAuditMonitoring } from './MonthlyDashboardAuditMonitoring';
import {
  AuditStatusDonutChart,
  MonthlyAuditsLineChart,
  MonthlyDiscrepancyBarChart,
  SupervisorPerformanceBarChart,
} from './ManagementAccountingCharts';
import {
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
  Sparkles,
  XCircle,
  Calendar,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  audits: StationAudit[];
  stations: Station[];
  onCreateNewAudit: () => void;
}

export const DashboardView: React.FC<Props> = ({
  audits,
  stations = [],
  onCreateNewAudit,
}) => {
  const { currentUser, canCreateAudit } = useAuth();
  const { t } = useLanguage();

  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  if (!currentUser) return null;

  // Strict Access Guard: Audit Dashboard is restricted ONLY to Operation Supervisor (and Super Admin for system permissions)
  const isAuthorized =
    currentUser.role === 'Operation Supervisor' || currentUser.role === 'Super Admin';

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl text-center shadow-xl space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
          The Audit Dashboard is restricted exclusively to the <strong>Operation Supervisor</strong>. As <strong>{currentUser.role}</strong>, please use the Audits list tab for audit reviews and management.
        </p>
      </div>
    );
  }

  // Filter audits dynamically by selected Month/Year
  const filteredAudits = audits.filter((a) => {
    if (!selectedMonthYear) return true;
    const dateStr = a.audit_date || a.created_at || '';
    return dateStr.startsWith(selectedMonthYear);
  });

  // Calculate Month/Year display label
  const formattedMonthName = useMemo(() => {
    if (!selectedMonthYear) return '';
    const [yearStr, monthStr] = selectedMonthYear.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    if (isNaN(year) || isNaN(month)) return '';
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedMonthYear]);

  // Recalculated KPI Counts for Selected Month
  const totalAuditsCount = filteredAudits.length;
  const completedAuditsCount = filteredAudits.filter((a) => a.current_status === 'approved').length;
  const rejectedAuditsCount = filteredAudits.filter((a) => a.current_status === 'rejected').length;
  const pendingApprovalsCount = filteredAudits.filter(
    (a) => a.current_status !== 'approved' && a.current_status !== 'rejected'
  ).length;

  const isManagementOrAccounting =
    currentUser.role === 'Accountant' ||
    currentUser.role === 'Account Manager' ||
    currentUser.role === 'Management' ||
    currentUser.role === 'Super Admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* 1. WELCOME HERO ENTERPRISE BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-7 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden transition-all">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-200 rounded-full text-xs font-extrabold border border-sky-400/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
            <span>{t('dashboard.welcomeBack', { name: currentUser.full_name })}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {t('dashboard.title')}
          </h2>
          <p className="text-xs text-sky-200/90 font-medium max-w-xl">
            {t('dashboard.loggedInAs', { role: currentUser.role, position: currentUser.position })}
          </p>
        </div>

        {canCreateAudit && (
          <div className="relative z-10 w-full md:w-auto">
            <button
              onClick={onCreateNewAudit}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('dashboard.newAuditBtn')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. MONTH/YEAR FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl border border-sky-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Filter Dashboard by Month
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              Currently showing metrics for: <strong className="text-sky-800 font-black">{formattedMonthName}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Select Month:</label>
          <input
            type="month"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono shadow-2xs cursor-pointer"
          />
        </div>
      </div>

      {/* 3. HIGH-CONTRAST KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Audits */}
        <GlassCard variant="blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-950 tracking-wider uppercase">{t('dashboard.totalAudits')}</span>
            <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl border border-sky-200 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight font-mono">{totalAuditsCount}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 font-mono">{formattedMonthName}</p>
        </GlassCard>

        {/* Pending Audits */}
        <GlassCard variant="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 tracking-wider uppercase">{t('dashboard.pendingAudits')}</span>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-900 mt-3 tracking-tight font-mono">{pendingApprovalsCount}</p>
          <p className="text-[10px] font-bold text-amber-600/70 mt-1 font-mono">{formattedMonthName}</p>
        </GlassCard>

        {/* Completed Audits */}
        <GlassCard variant="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 tracking-wider uppercase">{t('dashboard.completedAudits')}</span>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-900 mt-3 tracking-tight font-mono">{completedAuditsCount}</p>
          <p className="text-[10px] font-bold text-emerald-600/70 mt-1 font-mono">{formattedMonthName}</p>
        </GlassCard>

        {/* Rejected Audits */}
        <GlassCard variant="rose">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-950 tracking-wider uppercase">{t('dashboard.rejectedAudits')}</span>
            <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl border border-rose-200 shadow-2xs">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-rose-900 mt-3 tracking-tight font-mono">{rejectedAuditsCount}</p>
          <p className="text-[10px] font-bold text-rose-600/70 mt-1 font-mono">{formattedMonthName}</p>
        </GlassCard>
      </div>

      {/* 4. MANAGEMENT & ACCOUNTING GRAPHS & MONTHLY AUDIT MONITORING */}
      {isManagementOrAccounting && (
        <div className="space-y-6 pt-2">
          <MonthlyDashboardAuditMonitoring audits={audits} stations={stations} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AuditStatusDonutChart audits={audits} />
            <MonthlyAuditsLineChart audits={audits} />
          </div>
          <MonthlyDiscrepancyBarChart audits={audits} />
          <SupervisorPerformanceBarChart audits={audits} />
        </div>
      )}

    </div>
  );
};


