import React, { useState } from 'react';
import type { StationOpeningActivityLog, StationOpeningForm, StationOpeningStatus } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Activity,
  Search,
  PlusCircle,
  FileEdit,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  Building2,
  User,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface Props {
  activityLogs: StationOpeningActivityLog[];
  forms?: StationOpeningForm[];
  currentUser: any;
  onOpenForm: (formId: string) => void;
}

export const SOActivityView: React.FC<Props> = ({
  activityLogs,
  forms = [],
  currentUser,
  onOpenForm,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('ALL');

  // Role-Based Activity Log Isolation:
  // 1. Super Admin -> Access to all activity logs.
  // 2. Head of Operation -> STRICTLY isolated to activity logs for forms created by that specific Head of Operation.
  // 3. Department Approvers -> Access to activity logs for forms assigned to or processed by their department.
  const userLogs = activityLogs.filter((log) => {
    if (currentUser.role === 'Super Admin') return true;

    // Helper: Determine form creator ID with backward-compatible lookup
    const targetForm = forms.find((f) => f.id === log.form_id || f.form_number === log.form_number);
    const formCreatorId = log.form_creator_id || targetForm?.created_by || log.actor_id;

    if (currentUser.role === 'Head of Operation') {
      return formCreatorId === currentUser.id;
    }

    // Department Approver filtering
    const isProcessedOrAssigned =
      log.actor_id === currentUser.id ||
      Boolean(
        targetForm &&
          ((currentUser.role === 'Safety & Quality Control' &&
            (targetForm.current_status === 'pending_safety_quality' || targetForm.approvals.some((a) => a.role === 'safety_quality' && a.status === 'approved'))) ||
            (currentUser.role === 'Document Controller' &&
              (targetForm.current_status === 'pending_document_controller' || targetForm.approvals.some((a) => a.role === 'document_controller' && a.status === 'approved'))) ||
            (currentUser.role === 'Engineering Department' &&
              (targetForm.current_status === 'pending_engineering' || targetForm.approvals.some((a) => a.role === 'engineering' && a.status === 'approved'))) ||
            (currentUser.role === 'Al Noor United Management' &&
              (targetForm.current_status === 'pending_management' || targetForm.approvals.some((a) => a.role === 'management' && a.status === 'approved'))))
      );

    return isProcessedOrAssigned;
  });

  const filteredLogs = userLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.form_number.toLowerCase().includes(term) ||
      log.station_name.toLowerCase().includes(term) ||
      log.action_title.toLowerCase().includes(term) ||
      log.actor_name.toLowerCase().includes(term);

    const matchesAction =
      selectedActionType === 'ALL' || log.action_type === selectedActionType;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return {
          icon: <PlusCircle className="w-4 h-4 text-sky-600" />,
          bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
          label: t('so.actCreated'),
        };
      case 'draft_saved':
        return {
          icon: <FileEdit className="w-4 h-4 text-slate-600" />,
          bg: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
          label: t('so.actDraftSaved'),
        };
      case 'updated':
        return {
          icon: <FileEdit className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
          label: t('so.actUpdated'),
        };
      case 'submitted':
        return {
          icon: <Send className="w-4 h-4 text-indigo-600" />,
          bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
          label: t('so.actSubmitted'),
        };
      case 'returned':
        return {
          icon: <RotateCcw className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
          label: t('so.actReturned'),
        };
      case 'resubmitted':
        return {
          icon: <Send className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
          label: t('so.actResubmitted'),
        };
      case 'approved_stage':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-teal-600" />,
          bg: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
          label: t('so.actApprovedStage'),
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
          label: t('so.actRejected'),
        };
      case 'final_approval':
        return {
          icon: <Award className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
          label: t('so.actFinalApproval'),
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-slate-600" />,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: actionType,
        };
    }
  };

  const getStatusBadge = (status: StationOpeningStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pending_safety_quality':
      case 'pending_document_controller':
      case 'pending_engineering':
      case 'pending_management':
        return 'bg-sky-500/10 text-sky-700 border-sky-500/30';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      case 'returned':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-700 border-rose-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-6 sm:p-8 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-sky-500/10 text-sky-600 rounded-2xl border border-sky-500/20 shadow-inner">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {t('so.activityLogTitle')}
            </h1>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              {t('so.activityLogSub')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-sky-500/10 px-4 py-2 rounded-2xl border border-sky-500/20 text-sky-950 font-black text-xs">
          <span>{t('so.totalRecordedActivities')}</span>
          <span className="bg-sky-600 text-white px-2.5 py-0.5 rounded-full font-mono font-bold">
            {userLogs.length}
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('so.filterByForm')}
            className="w-full bg-white/80 backdrop-blur-md border border-sky-200/80 rounded-xl ps-10 pe-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
        </div>

        {/* Action Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="bg-white/80 backdrop-blur-md border border-sky-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">{t('so.allActionTypes')}</option>
            <option value="created">{t('so.actCreated')}</option>
            <option value="draft_saved">{t('so.actDraftSaved')}</option>
            <option value="updated">{t('so.actUpdated')}</option>
            <option value="submitted">{t('so.actSubmitted')}</option>
            <option value="returned">{t('so.actReturned')}</option>
            <option value="resubmitted">{t('so.actResubmitted')}</option>
            <option value="approved_stage">{t('so.actApprovedStage')}</option>
            <option value="final_approval">{t('so.actFinalApproval')}</option>
          </select>
        </div>
      </div>

      {/* ACTIVITY FEED CARDS */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-2xl border border-white/90 rounded-[28px] p-12 text-center text-slate-400 font-extrabold text-xs shadow-sm">
            {t('so.noActivityRecords')}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const actionInfo = getActionBadge(log.action_type);
            return (
              <div
                key={log.id}
                className="bg-white/60 hover:bg-white/80 backdrop-blur-2xl border border-white/90 hover:border-sky-300 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Action Badge & Form Number */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border flex items-center gap-1.5 font-black text-xs shrink-0 ${actionInfo.bg}`}>
                      {actionInfo.icon}
                      <span>{actionInfo.label}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-xs">
                          {log.form_number}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <div className="flex items-center gap-1 text-slate-700 font-extrabold text-xs">
                          <Building2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>{log.station_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                </div>

                {/* Title & User Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-sky-100/60">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900">{log.action_title}</p>
                    {log.action_description && (
                      <p className="text-[11px] font-medium text-slate-600">{log.action_description}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-bold pt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('so.performedBy')} <strong>{log.actor_name}</strong> ({log.actor_role})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(log.status_at_time)}`}>
                      {log.status_at_time?.replace(/_/g, ' ')}
                    </span>

                    <button
                      onClick={() => onOpenForm(log.form_id)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>{t('so.viewForm')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
