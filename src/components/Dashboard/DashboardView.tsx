import React from 'react';
import type { StationAudit, Station } from '../../types/audit';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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

      {/* 3. KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Audits */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-5 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] hover:shadow-[0_20px_45px_rgba(14,165,233,0.18)] hover:-translate-y-1 transition-all duration-300 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('dashboard.totalAudits')}</span>
            <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{totalAuditsCount}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2 font-semibold">
            <span>{t('dashboard.repositorySize')}</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-5 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] hover:shadow-[0_20px_45px_rgba(14,165,233,0.18)] hover:-translate-y-1 transition-all duration-300 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('dashboard.pendingApprovals')}</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-3">{pendingApprovalsCount}</p>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 mt-2 font-semibold">
            <span>{t('dashboard.inReviewPipeline')}</span>
          </div>
        </div>

        {/* Completed Audits */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-5 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] hover:shadow-[0_20px_45px_rgba(14,165,233,0.18)] hover:-translate-y-1 transition-all duration-300 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('dashboard.completedAudits')}</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-3">{completedAuditsCount}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 font-semibold">
            <span>{t('dashboard.fullyApproved')}</span>
          </div>
        </div>

        {/* Rejected Audits */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-5 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] hover:shadow-[0_20px_45px_rgba(14,165,233,0.18)] hover:-translate-y-1 transition-all duration-300 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{t('dashboard.rejectedAudits')}</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 mt-3">{rejectedAuditsCount}</p>
          <div className="flex items-center gap-1 text-[11px] text-rose-700 mt-2 font-semibold">
            <span>{t('dashboard.requiresAction')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

