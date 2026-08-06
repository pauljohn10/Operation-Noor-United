import React from 'react';
import type { StationOpeningForm } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { GlassCard } from '../../../components/Common/GlassCard';
import {
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
  Sparkles,
  Building,
  ShieldCheck,
  FileCheck,
  RotateCcw,
} from 'lucide-react';

interface Props {
  forms: StationOpeningForm[];
  currentUser?: any;
  onCreateNew: () => void;
  onOpenForm: (formId: string) => void;
}

export const SODashboard: React.FC<Props> = ({
  forms,
  currentUser,
  onCreateNew,
  onOpenForm,
}) => {
  const { t } = useLanguage();
  const isHeadOfOperation = currentUser?.role === 'Head of Operation';

  // KPI Counts
  const totalCount = forms.length;
  const approvedCount = forms.filter((f) => f.current_status === 'approved').length;
  const rejectedCount = forms.filter((f) => f.current_status === 'rejected').length;
  const pendingCount = forms.filter(
    (f) => f.current_status.startsWith('pending_')
  ).length;
  const returnedCount = forms.filter((f) => f.current_status === 'returned').length;

  // Filter forms requiring immediate action by current user's role
  let pendingForUser: StationOpeningForm[] = [];
  if (currentUser?.role === 'Safety & Quality Control') {
    pendingForUser = forms.filter((f) => f.current_status === 'pending_safety_quality');
  } else if (currentUser?.role === 'Document Controller') {
    pendingForUser = forms.filter((f) => f.current_status === 'pending_document_controller');
  } else if (currentUser?.role === 'Engineering Department') {
    pendingForUser = forms.filter((f) => f.current_status === 'pending_engineering');
  } else if (currentUser?.role === 'Al Noor United Management') {
    pendingForUser = forms.filter((f) => f.current_status === 'pending_management');
  } else if (currentUser?.role === 'Head of Operation') {
    pendingForUser = forms.filter((f) => f.current_status === 'returned');
  } else if (currentUser?.role === 'Super Admin') {
    pendingForUser = forms.filter((f) => f.current_status.startsWith('pending_'));
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_safety_quality': return t('so.statusPendingSafetyQuality');
      case 'pending_document_controller': return t('so.statusPendingDocController');
      case 'pending_engineering': return t('so.statusPendingEngineering');
      case 'pending_management': return t('so.statusPendingManagement');
      case 'approved': return t('so.statusApproved');
      case 'returned': return t('so.statusReturned');
      case 'rejected': return t('so.statusRejected');
      default: return status;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. WELCOME HERO GLASS BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/12 backdrop-blur-3xl border border-white/25 p-7 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-white/20 relative overflow-hidden transition-all">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-400/20 text-sky-200 rounded-full text-xs font-extrabold border border-sky-400/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
            <span>{t('dashboard.welcomeBack')}, {currentUser?.full_name || 'User'}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
            <Building className="w-6 h-6 text-sky-300" />
            <span>{t('so.dashboardTitle')}</span>
          </h2>
          <p className="text-xs text-sky-100/90 font-semibold max-w-xl drop-shadow-sm">
            {t('so.dashboardSub')} ({currentUser?.role})
          </p>
        </div>

        {isHeadOfOperation && (
          <button
            onClick={onCreateNew}
            className="px-5 py-3 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all shrink-0 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('so.newForm')}</span>
          </button>
        )}
      </div>

      {/* 2. PENDING APPROVAL QUEUE BANNER FOR APPROVERS */}
      {pendingForUser.length > 0 && (
        <div className="bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-indigo-500/20 border-2 border-sky-400/50 p-6 rounded-[28px] backdrop-blur-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-sky-300" />
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider drop-shadow-sm">
                  {t('so.pendingApprovals')} ({pendingForUser.length})
                </h3>
                <p className="text-xs text-sky-200/90 font-semibold drop-shadow-sm">
                  {currentUser?.role === 'Head of Operation'
                    ? t('so.returnedFormsSub')
                    : t('so.pendingApprovalsSub')}
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1 bg-sky-600 text-white font-black text-xs rounded-full shadow-md font-mono">
              {pendingForUser.length} Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {pendingForUser.map((f) => (
              <div key={f.id} className="bg-white/15 backdrop-blur-2xl p-4 rounded-2xl border border-white/30 shadow-md space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sky-200">{f.form_number}</span>
                  <span className="px-2 py-0.5 bg-sky-400/20 text-sky-200 font-bold rounded-md text-[10px] border border-sky-400/30">
                    {getStatusLabel(f.current_status)}
                  </span>
                </div>
                <p className="font-black text-white">{f.station_name}</p>
                <p className="text-[11px] text-sky-200/80 font-bold">{t('so.creatorCol')}: {f.created_by_name}</p>
                <button
                  onClick={() => onOpenForm(f.id)}
                  className="w-full mt-2 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{t('so.viewEdit')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. KPI METRIC SUMMARY CARDS (BLUE FROSTED GLASS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL FORMS */}
        <GlassCard variant="blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-sky-100 uppercase tracking-wider drop-shadow-sm">
              {t('so.totalForms')}
            </span>
            <div className="p-3 bg-sky-500/20 backdrop-blur-xl rounded-2xl border border-sky-400/30 text-cyan-300 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono drop-shadow-md">
              {totalCount}
            </span>
            <p className="text-[11px] text-sky-200/90 font-bold mt-1.5 drop-shadow-sm">
              {t('so.totalFormsSub')}
            </p>
          </div>
        </GlassCard>

        {/* PENDING APPROVALS */}
        <GlassCard variant="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-100 uppercase tracking-wider drop-shadow-sm">
              {t('so.pendingApprovals')}
            </span>
            <div className="p-3 bg-amber-500/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 text-amber-300 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight font-mono drop-shadow-md">
              {pendingCount}
            </span>
            <p className="text-[11px] text-amber-200/90 font-bold mt-1.5 drop-shadow-sm">
              {t('so.pendingApprovalsSub')}
            </p>
          </div>
        </GlassCard>

        {/* APPROVED FORMS */}
        <GlassCard variant="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider drop-shadow-sm">
              {t('so.completedApprovals')}
            </span>
            <div className="p-3 bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 text-emerald-300 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight font-mono drop-shadow-md">
              {approvedCount}
            </span>
            <p className="text-[11px] text-emerald-200/90 font-bold mt-1.5 drop-shadow-sm">
              {t('so.completedApprovalsSub')}
            </p>
          </div>
        </GlassCard>

        {/* RETURNED & REJECTED */}
        <GlassCard variant="rose">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-100 uppercase tracking-wider drop-shadow-sm">
              {t('so.returnedForms')}
            </span>
            <div className="p-3 bg-rose-500/20 backdrop-blur-xl rounded-2xl border border-rose-400/30 text-rose-300 shadow-sm">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-rose-300 tracking-tight font-mono drop-shadow-md">
              {returnedCount + rejectedCount}
            </span>
            <p className="text-[11px] text-rose-200/90 font-bold mt-1.5 drop-shadow-sm">
              {t('so.returnedFormsSub')}
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
