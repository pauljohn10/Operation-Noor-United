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



      
      {/* 1. WELCOME HERO GLASS BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/45 backdrop-blur-2xl border border-white/80 p-7 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60 relative overflow-hidden transition-all">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-800 rounded-full text-xs font-extrabold border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>{t('dashboard.welcomeBack', { name: currentUser.full_name })}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('dashboard.title')}
          </h2>
          <p className="text-xs text-slate-600 font-medium max-w-xl">
            {t('dashboard.loggedInAs', { role: currentUser.role, position: currentUser.position })}
          </p>
        </div>

        {canCreateAudit && (
          <div className="relative z-10 w-full md:w-auto">
            <button
              onClick={onCreateNewAudit}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('dashboard.newAuditBtn')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. PREMIUM BLUE FROSTED GLASS KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Audits */}
        <GlassCard variant="blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-sky-100 tracking-wide uppercase drop-shadow-sm">{t('dashboard.totalAudits')}</span>
            <div className="p-3 bg-sky-500/20 backdrop-blur-xl rounded-2xl border border-sky-400/30 text-cyan-300 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white mt-3 tracking-tight font-mono drop-shadow-md">{totalAuditsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-sky-200/90 mt-2 font-bold drop-shadow-sm">
            <span>{t('dashboard.repositorySize')}</span>
          </div>
        </GlassCard>

        {/* Pending Approvals */}
        <GlassCard variant="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-100 tracking-wide uppercase drop-shadow-sm">{t('dashboard.pendingApprovals')}</span>
            <div className="p-3 bg-amber-500/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 text-amber-300 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-300 mt-3 tracking-tight font-mono drop-shadow-md">{pendingApprovalsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 mt-2 font-bold drop-shadow-sm">
            <span>{t('dashboard.inReviewPipeline')}</span>
          </div>
        </GlassCard>

        {/* Completed Audits */}
        <GlassCard variant="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-100 tracking-wide uppercase drop-shadow-sm">{t('dashboard.completedAudits')}</span>
            <div className="p-3 bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 text-emerald-300 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-300 mt-3 tracking-tight font-mono drop-shadow-md">{completedAuditsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-200/90 mt-2 font-bold drop-shadow-sm">
            <span>{t('dashboard.fullyApproved')}</span>
          </div>
        </GlassCard>

        {/* Rejected Audits */}
        <GlassCard variant="rose">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-100 tracking-wide uppercase drop-shadow-sm">{t('dashboard.rejectedAudits')}</span>
            <div className="p-3 bg-rose-500/20 backdrop-blur-xl rounded-2xl border border-rose-400/30 text-rose-300 shadow-sm">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-rose-300 mt-3 tracking-tight font-mono drop-shadow-md">{rejectedAuditsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-rose-200/90 mt-2 font-bold drop-shadow-sm">
            <span>{t('dashboard.requiresAction')}</span>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};

