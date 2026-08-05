import React, { useState } from 'react';
import type { StationAudit } from '../../types/audit';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  ShieldAlert,
  Send,
  UserCheck,
} from 'lucide-react';

interface Props {
  audit: StationAudit;
  onApprove: (comment?: string) => void;
  onReject: (reason: string) => void;
  onReturnForCorrection: (comment: string) => void;
  onAddComment: (comment: string) => void;
}

export const ApprovalPanel: React.FC<Props> = ({
  audit,
  onApprove,
  onReject,
  onReturnForCorrection,
  onAddComment,
}) => {
  const { currentUser, canApproveAuditStatus } = useAuth();
  const { t } = useLanguage();
  const [commentText, setCommentText] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | 'comment' | null>(
    null
  );

  const canActionCurrentStep = canApproveAuditStatus(audit.current_status);

  // 4 Sequential Approval Sequence Steps:
  // 1. Operation Supervisor
  // 2. Accountant
  // 3. Account Manager
  // 4. Management Executive
  const steps = [
    { key: 'op_supervisor', label: 'Operation Supervisor', role: 'operation_supervisor' },
    { key: 'pending_accountant', label: t('approval.accountant'), role: 'accountant' },
    { key: 'pending_account_manager', label: t('approval.accountManager'), role: 'account_manager' },
    { key: 'pending_management', label: 'Management Executive', role: 'management' },
  ];

  const isStepCompleted = (role: string, idx: number): boolean => {
    if ((audit.current_status as string) === 'approved') return true;

    const appRecord = audit.approvals?.find((a) => a.role === role);
    if (appRecord?.status === 'approved') return true;

    if (idx === 0) {
      return Boolean(
        audit.operation_supervisor_signature_url ||
        (audit.current_status && audit.current_status !== 'draft')
      );
    }

    if (idx === 1) {
      return (
        audit.current_status === 'pending_account_manager' ||
        audit.current_status === 'pending_management'
      );
    }

    if (idx === 2) {
      return audit.current_status === 'pending_management';
    }

    if (idx === 3) {
      return (audit.current_status as string) === 'approved';
    }

    return false;
  };

  const isStepCurrent = (role: string, idx: number): boolean => {
    if (audit.current_status === 'approved' || audit.current_status === 'rejected') {
      return false;
    }
    if (isStepCompleted(role, idx)) {
      return false;
    }

    switch (audit.current_status) {
      case 'draft':
      case 'returned_for_correction':
        return idx === 0;
      case 'pending_accountant':
        return idx === 1;
      case 'pending_account_manager':
        return idx === 2;
      case 'pending_management':
        return idx === 3;
      default:
        return false;
    }
  };

  const getCurrentStepIndex = () => {
    switch (audit.current_status) {
      case 'draft':
      case 'returned_for_correction':
        return 0;
      case 'pending_accountant':
        return 1;
      case 'pending_account_manager':
        return 2;
      case 'pending_management':
        return 3;
      case 'approved':
        return 4;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  const getProgressWidthPercent = (): number => {
    if (audit.current_status === 'approved') return 100;
    if (audit.current_status === 'pending_management') return 75;
    if (audit.current_status === 'pending_account_manager') return 50;
    if (audit.current_status === 'pending_accountant') return 25;
    return 10;
  };

  const progressPercent = getProgressWidthPercent();

  const handleModalSubmit = () => {
    if (!commentText.trim() && (actionType === 'reject' || actionType === 'return')) {
      alert('Please provide a comment/reason for this action.');
      return;
    }

    if (actionType === 'approve') {
      onApprove(commentText);
    } else if (actionType === 'reject') {
      onReject(commentText);
    } else if (actionType === 'return') {
      onReturnForCorrection(commentText);
    } else if (actionType === 'comment') {
      onAddComment(commentText);
    }

    setCommentText('');
    setActionType(null);
  };

  // Hide the Sequential Approval Chain when the audit has reached final approval or completion
  const currentStatus = audit.current_status as string;
  if (
    currentStatus === 'approved' ||
    currentStatus === 'completed' ||
    currentStatus === 'archived'
  ) {
    return null;
  }

  return (
    <div className="bg-white/45 backdrop-blur-2xl border border-white/80 rounded-[28px] p-6 shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60 mb-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-sky-100 mb-5">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <span>Sequential Approval Chain</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Operation Supervisor → Accountant → Account Manager → Management Executive
          </p>
        </div>

        {/* Audit Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">Status:</span>
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              audit.current_status === 'approved'
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                : audit.current_status === 'rejected'
                ? 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                : audit.current_status === 'returned_for_correction'
                ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                : 'bg-sky-500/10 text-sky-700 border border-sky-500/30 animate-pulse'
            }`}
          >
            {audit.current_status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* STEP PROGRESSION BAR */}
      <div className="relative flex items-center justify-between mb-6 px-4 overflow-x-auto py-3">
        {/* Background Track */}
        <div className="absolute top-1/2 left-10 right-10 h-1 bg-sky-200/80 -translate-y-1/2 -z-0"></div>

        {/* Filled Progress Bar */}
        <div
          className="absolute top-1/2 left-10 h-1 bg-emerald-500 transition-all duration-500 -translate-y-1/2 -z-0"
          style={{ width: `calc(${progressPercent}% - 40px)` }}
        ></div>

        {steps.map((step, idx) => {
          const isPassed = isStepCompleted(step.role, idx);
          const isCurrent = isStepCurrent(step.role, idx);
          const isRejected = audit.current_status === 'rejected' && currentIndex === idx + 1;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 min-w-[100px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-md ${
                  isPassed
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                    : isCurrent
                    ? isRejected
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/20'
                      : 'bg-sky-600 text-white ring-4 ring-sky-500/30 scale-110 animate-pulse'
                    : 'bg-white/80 text-slate-400 border border-sky-200'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-bold mt-2 text-center max-w-[110px] ${
                  isPassed ? 'text-emerald-700 font-extrabold' : isCurrent ? 'text-sky-700 font-extrabold' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ACTION BUTTONS (AUTHORIZED APPROVER ONLY) */}
      {canActionCurrentStep && audit.current_status !== 'approved' && audit.current_status !== 'rejected' && audit.current_status !== 'draft' && (
        <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-sky-600 shrink-0" />
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Action Required: Logged in as <span className="text-sky-700">{currentUser?.role}</span>
              </p>
              <p className="text-xs text-slate-600 font-medium">
                You are authorized to sign and approve this audit at step #{currentIndex + 1}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onApprove()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign & Approve Audit</span>
            </button>

            <button
              onClick={() => setActionType('return')}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return for Correction</span>
            </button>

            <button
              onClick={() => setActionType('reject')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTION & COMMENT MODAL */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4">
          <div className="bg-white/15 backdrop-blur-3xl border border-white/35 rounded-[32px] max-w-lg w-full p-6 shadow-2xl ring-1 ring-white/30">
            <h4 className="text-base font-black text-slate-900 mb-1 capitalize flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-600" />
              <span>
                {actionType === 'approve'
                  ? 'Confirm Audit Approval'
                  : actionType === 'reject'
                  ? 'Reject Station Audit'
                  : actionType === 'return'
                  ? 'Return Audit for Correction'
                  : 'Add Comment'}
              </span>
            </h4>
            <p className="text-xs text-slate-600 font-medium mb-4">
              Add your review notes or comments to be logged in the permanent audit trail.
            </p>

            <textarea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your approval comments or return notes here..."
              className="w-full bg-white border border-sky-200 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className={`flex items-center gap-1.5 px-5 py-2 font-extrabold text-xs text-white rounded-xl shadow-lg transition-all ${
                  actionType === 'approve'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                    : actionType === 'reject'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Submit {actionType}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
