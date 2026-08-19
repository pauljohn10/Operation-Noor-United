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

  // State for Operation Supervisor Month and Year filter (defaults to current month/year)
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1); // 1 - 12
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Available Years dropdown choices
  const years = useMemo(() => {
    const currentYr = new Date().getFullYear();
    const yrSet = new Set<number>([2024, 2025, 2026, 2027, currentYr]);
    audits.forEach((a) => {
      if (a.audit_date) {
        const yr = parseInt(a.audit_date.split('-')[0], 10);
        if (!isNaN(yr)) yrSet.add(yr);
      }
    });
    return Array.from(yrSet).sort((a, b) => b - a);
  }, [audits]);

  if (!currentUser) return null;

  // Strict role check: ONLY Accountant, Accountant Manager / Account Manager, Executive Management & Super Admin see these graphs
  const isManagementOrAccounting =
    currentUser.role === 'Accountant' ||
    currentUser.role === 'Account Manager' ||
    currentUser.role === 'Management' ||
    currentUser.role === 'Super Admin';

  // Role check: Top 4 KPI summary cards (Total, Pending, Completed, Rejected) are visible ONLY to Operation Supervisor & Super Admin
  const canViewKpiCards =
    currentUser.role === 'Operation Supervisor' || currentUser.role === 'Super Admin';

  // Filter audits STRICTLY by official audit_date matching selected Month & Year
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      if (!a.audit_date) return false;
      const parts = a.audit_date.split('-'); // Format: YYYY-MM-DD
      if (parts.length < 2) return false;
      const auditYr = parseInt(parts[0], 10);
      const auditMo = parseInt(parts[1], 10);
      return auditYr === selectedYear && auditMo === selectedMonth;
    });
  }, [audits, selectedMonth, selectedYear]);

  // Recalculated KPI Counts for Selected Official Audit Date Month/Year
  const totalAuditsCount = filteredAudits.length;
  const completedAuditsCount = filteredAudits.filter((a) => a.current_status === 'approved').length;
  const rejectedAuditsCount = filteredAudits.filter((a) => a.current_status === 'rejected').length;
  const pendingApprovalsCount = filteredAudits.filter(
    (a) => a.current_status !== 'approved' && a.current_status !== 'rejected'
  ).length;

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
            {t('dashboard.loggedInAs', { role: currentUser.role })}
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

      {/* 2. OPERATION SUPERVISOR HIGH-CONTRAST KPI CARDS & MONTH/YEAR FILTER */}
      {canViewKpiCards && (
        <div className="space-y-4">
          {/* Month & Year Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 text-sky-700 rounded-xl border border-sky-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Audit Date Filter
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Showing metrics for: <strong className="text-sky-800 font-black">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Month Selector */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-700">Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono shadow-2xs cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards Grid */}
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
            </GlassCard>
          </div>
        </div>
      )}

      {/* 3. MANAGEMENT & ACCOUNTING GRAPHS & MONTHLY AUDIT MONITORING */}
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

