import React from 'react';
import type { StationOpeningForm } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
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
  const isHeadOfOperation = currentUser?.role === 'Head of Operation' || currentUser?.role === 'Super Admin';

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
    pendingForUser = forms.filter((f) => f.current_status === 'draft' || f.current_status === 'returned');
  } else if (currentUser?.role === 'Super Admin') {
    pendingForUser = forms.filter((f) => f.current_status.startsWith('pending_'));
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return t('so.statusDraft');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/45 backdrop-blur-2xl border border-white/80 p-7 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60 relative overflow-hidden transition-all">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-800 rounded-full text-xs font-extrabold border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>{t('dashboard.welcomeBack')}, {currentUser?.full_name || 'User'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-sky-600" />
            <span>{t('so.dashboardTitle')}</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium max-w-xl">
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
        <div className="bg-gradient-to-r from-sky-500/15 via-blue-500/15 to-indigo-500/15 border-2 border-sky-500/60 p-6 rounded-[28px] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-sky-600" />
              <div>
                <h3 className="text-sm font-black text-sky-950 uppercase tracking-wider">
                  {t('so.pendingApprovals')} ({pendingForUser.length})
                </h3>
                <p className="text-xs text-sky-800 font-medium">
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
              <div key={f.id} className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sky-900">{f.form_number}</span>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded-md text-[10px]">
                    {getStatusLabel(f.current_status)}
                  </span>
                </div>
                <p className="font-black text-slate-900">{f.station_name}</p>
                <p className="text-[11px] text-slate-500 font-bold">{t('so.creatorCol')}: {f.created_by_name}</p>
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

      {/* 3. KPI METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL FORMS */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-5 rounded-[24px] shadow-[0_15px_35px_rgba(14,165,233,0.12)] space-y-3 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {t('so.totalForms')}
            </span>
            <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-2xl border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {totalCount}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {t('so.totalFormsSub')}
            </p>
          </div>
        </div>

        {/* PENDING APPROVALS */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-5 rounded-[24px] shadow-[0_15px_35px_rgba(14,165,233,0.12)] space-y-3 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {t('so.pendingApprovals')}
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {pendingCount}
            </span>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              {t('so.pendingApprovalsSub')}
            </p>
          </div>
        </div>

        {/* APPROVED FORMS */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-5 rounded-[24px] shadow-[0_15px_35px_rgba(14,165,233,0.12)] space-y-3 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {t('so.completedApprovals')}
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {approvedCount}
            </span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {t('so.completedApprovalsSub')}
            </p>
          </div>
        </div>

        {/* RETURNED & REJECTED */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-5 rounded-[24px] shadow-[0_15px_35px_rgba(14,165,233,0.12)] space-y-3 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {t('so.returnedForms')}
            </span>
            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-2xl border border-rose-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {returnedCount + rejectedCount}
            </span>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              {returnedCount} {t('so.statusReturned')} | {rejectedCount} {t('so.statusRejected')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
