import React from 'react';
import type { StationAudit, Station } from '../../types/audit';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../Common/GlassCard';
import {
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
  Sparkles,
  XCircle,
} from 'lucide-react';

interface Props {
  audits: StationAudit[];
  stations: Station[];
  onCreateNewAudit: () => void;
}

export const DashboardView: React.FC<Props> = ({
  audits,
  onCreateNewAudit,
}) => {
  const { currentUser, canCreateAudit } = useAuth();
  const { t } = useLanguage();

  if (!currentUser) return null;

  // KPI Counts
  const totalAuditsCount = audits.length;
  const completedAuditsCount = audits.filter((a) => a.current_status === 'approved').length;
  const rejectedAuditsCount = audits.filter((a) => a.current_status === 'rejected').length;
  const pendingApprovalsCount = audits.filter(
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

      {/* 2. HIGH-CONTRAST KPI CARDS GRID */}
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
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-2 font-bold">
            <span>{t('dashboard.repositorySize')}</span>
          </div>
        </GlassCard>

        {/* Pending Approvals */}
        <GlassCard variant="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 tracking-wider uppercase">{t('dashboard.pendingApprovals')}</span>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-900 mt-3 tracking-tight font-mono">{pendingApprovalsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-2 font-bold">
            <span>{t('dashboard.inReviewPipeline')}</span>
          </div>
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
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-2 font-bold">
            <span>{t('dashboard.fullyApproved')}</span>
          </div>
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
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-2 font-bold">
            <span>{t('dashboard.requiresAction')}</span>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};

