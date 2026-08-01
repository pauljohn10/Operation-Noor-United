import React, { useState } from 'react';
import type { StationOpeningForm, StationOpeningApprovalRole } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { SignaturePadModal } from '../../../components/Signature/SignaturePadModal';
import { ShieldCheck, CheckCircle2, RotateCcw, PenTool, X } from 'lucide-react';

interface Props {
  form: StationOpeningForm;
  currentUser: any;
  onApprove: (formId: string, role: StationOpeningApprovalRole, comments: string, signatureUrl?: string) => void;
  onReturn: (formId: string, role: StationOpeningApprovalRole, comments: string) => void;
  onClose: () => void;
}

export const SOApprovalPanel: React.FC<Props> = ({
  form,
  currentUser,
  onApprove,
  onReturn,
  onClose,
}) => {
  const { t } = useLanguage();
  const [comments, setComments] = useState('');
  const [signatureUrl, setSignatureUrl] = useState<string | null>(currentUser.signature_url || null);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);

  // Map Station Opening user system role to Station Opening Approval Role
  let userApprovalRole: StationOpeningApprovalRole | null = null;

  if (currentUser.role === 'Super Admin') {
    userApprovalRole = form.current_approver_role || 'safety_quality';
  } else if (currentUser.role === 'Safety & Quality Control') {
    userApprovalRole = 'safety_quality';
  } else if (currentUser.role === 'Document Controller') {
    userApprovalRole = 'document_controller';
  } else if (currentUser.role === 'Engineering Department') {
    userApprovalRole = 'engineering';
  } else if (currentUser.role === 'Al Noor United Management') {
    userApprovalRole = 'management';
  }

  const canApproveCurrentStage =
    Boolean(userApprovalRole) && (currentUser.role === 'Super Admin' || form.current_approver_role === userApprovalRole);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-sky-100 pb-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-2xl border border-sky-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{t('so.approvalModalTitle')}</h3>
            <p className="text-xs text-slate-600 font-bold">{form.form_number} - {form.station_name}</p>
          </div>
        </div>

        {!canApproveCurrentStage ? (
          <div className="p-4 bg-sky-50 border border-sky-200 text-sky-900 rounded-2xl text-xs font-bold space-y-1">
            <p>{t('so.notDesignatedApprover', { role: form.current_approver_role?.replace(/_/g, ' ') || '' })}</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-extrabold">
            <div>
              <label className="block text-slate-700 mb-1">{t('so.commentsLabel')}</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t('so.commentsPlaceholder')}
                className="w-full h-24 bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 font-medium shadow-inner"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700">{t('so.approverDigitalSig')}</label>
                <button
                  type="button"
                  onClick={() => setIsSigModalOpen(true)}
                  className="text-[11px] text-sky-600 hover:text-sky-700 font-black flex items-center gap-1"
                >
                  <PenTool className="w-3 h-3" />
                  <span>{signatureUrl ? t('so.changeSig') : t('so.signNow')}</span>
                </button>
              </div>

              <div className="bg-white border border-sky-200/80 rounded-xl p-3 h-16 flex items-center justify-center shadow-inner">
                {signatureUrl ? (
                  <img src={signatureUrl} alt="Approver Signature" className="h-12 object-contain" />
                ) : (
                  <span className="text-slate-400 font-medium italic">{t('so.sigNotCaptured')}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!userApprovalRole) return;
                  if (!comments.trim()) {
                    alert('Please enter return comments/reasons before returning.');
                    return;
                  }
                  onReturn(form.id, userApprovalRole, comments);
                  onClose();
                }}
                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 font-extrabold rounded-xl border border-amber-500/30 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('so.returnForRevision')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!userApprovalRole) return;
                  onApprove(form.id, userApprovalRole, comments, signatureUrl || undefined);
                  onClose();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('so.approveStage')}</span>
              </button>
            </div>
          </div>
        )}

        {isSigModalOpen && (
          <SignaturePadModal
            isOpen={isSigModalOpen}
            title="Approver Signature Pad"
            signatoryName={currentUser.full_name}
            signatoryRole={currentUser.role}
            onSaveSignature={async (url) => {
              setSignatureUrl(url);
              setIsSigModalOpen(false);
            }}
            onClose={() => setIsSigModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
