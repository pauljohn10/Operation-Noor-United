import { useState } from 'react';
import type {
  StationAudit,
  Station,
  PumpReadingItem,
  FuelType,
  AuditComment,
  ApprovalRole,
  AuditStatus,
} from '../../types/audit';
import { PaperFormLayout } from './PaperFormLayout';
import { ModernAuditForm } from './ModernAuditForm';
import { ApprovalPanel } from '../ApprovalWorkflow/ApprovalPanel';
import { SignaturePadModal } from '../Signature/SignaturePadModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  calculateAuditTotals,
} from '../../lib/calculations';


import { generateUUID } from '../../lib/supabaseClient';
import {
  generateEmptyItems,
  createDefaultApprovals,
} from '../../lib/mockData';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (id?: string): boolean => Boolean(id && UUID_REGEX.test(id));
import { exportAuditToPdf } from '../../lib/pdfGenerator';
import {
  Save,
  Send,
  Printer,
  FileDown,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  initialAudit?: StationAudit | null;
  initialStationId?: string | null;
  stations: Station[];
  existingAudits: StationAudit[];
  defaultPrices: { p91: number; p95: number; diesel: number };
  onSave: (audit: StationAudit) => void;
  onBack: () => void;
}

export const StationAuditForm: React.FC<Props> = ({
  initialAudit,
  initialStationId,
  stations,
  existingAudits,
  defaultPrices,
  onSave,
  onBack,
}) => {

  const { currentUser } = useAuth();
  const { t } = useLanguage();

  if (!currentUser) return null;


  const [selectedStationId, setSelectedStationId] = useState<string>(
    initialStationId || initialAudit?.station_id || (stations[0]?.id ?? '')
  );


  const [auditDate, setAuditDate] = useState<string>(
    initialAudit?.audit_date || new Date().toISOString().split('T')[0]
  );
  const [supervisorName, setSupervisorName] = useState<string>(
    initialAudit?.station_supervisor_name || ''
  );
  const [supervisorSignatureUrl, setSupervisorSignatureUrl] = useState<string>(
    initialAudit?.station_supervisor_signature_url || ''
  );
  const [operationSupervisorSignatureUrl, setOperationSupervisorSignatureUrl] = useState<string>(
    initialAudit?.operation_supervisor_signature_url || ''
  );

  const [notes, setNotes] = useState<string>(initialAudit?.notes || '');

  // Section Fuel Prices State.
  // For existing audits: restore the prices saved at audit creation time.
  // For new audits: use the current system default prices.
  const [sectionPrices, setSectionPrices] = useState<Record<FuelType, number>>({
    PETROL_91: initialAudit?.p91_price ?? defaultPrices.p91,
    PETROL_95: initialAudit?.p95_price ?? defaultPrices.p95,
    DIESEL:    initialAudit?.diesel_price ?? defaultPrices.diesel,
  });


  // Signature Pad Modal State
  const [activeSigModal, setActiveSigModal] = useState<{
    isOpen: boolean;
    roleKey: string;
    title: string;
    signatoryName: string;
    signatoryRole: string;
  } | null>(null);

  const [noorKhoy, setNoorKhoy] = useState<number | null>(
    initialAudit?.noor_khoy_amount !== undefined ? initialAudit.noor_khoy_amount : null
  );
  const [atm, setAtm] = useState<number | null>(
    initialAudit?.atm_amount !== undefined ? initialAudit.atm_amount : null
  );
  const [cashReceived, setCashReceived] = useState<number | null>(
    initialAudit?.cash_received_amount !== undefined ? initialAudit.cash_received_amount : null
  );

  const [items, setItems] = useState<PumpReadingItem[]>(() => {
    const template = generateEmptyItems();
    if (!initialAudit?.items || initialAudit.items.length === 0) {
      return template;
    }
    return template.map((tmpl) => {
      const saved = initialAudit.items.find(
        (s) => s.fuel_type === tmpl.fuel_type && Number(s.pump_no) === Number(tmpl.pump_no)
      );
      return saved ? { ...tmpl, ...saved } : tmpl;
    });
  });

  const [comments, setComments] = useState<AuditComment[]>(
    initialAudit?.comments || []
  );
  const [newCommentInput, setNewCommentInput] = useState('');

  const [currentStatus, setCurrentStatus] = useState<any>(
    initialAudit?.current_status || 'draft'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const isDraftOrReturned =
    currentStatus === 'draft' || currentStatus === 'returned_for_correction';
  const isReadOnly = !isDraftOrReturned && currentUser.role !== 'Super Admin';

  const selectedStation: Station =
    stations.find((s) => s.id === selectedStationId) ||
    stations[0] || {
      id: selectedStationId || generateUUID(),
      station_no: 'ST-101',
      name: 'Al Malaz Fuel Station',
      location: 'Riyadh - Al Malaz District',
      region: 'Central Region',
      status: 'active',
      operation_supervisor_id: currentUser.id,
      operation_supervisor_name: currentUser.full_name,
    };

  const [totalOpeningReadings, setTotalOpeningReadings] = useState<Record<FuelType, number | null>>({
    PETROL_91: initialAudit?.p91_total_opening_reading !== undefined ? initialAudit.p91_total_opening_reading : null,
    PETROL_95: initialAudit?.p95_total_opening_reading !== undefined ? initialAudit.p95_total_opening_reading : null,
    DIESEL: initialAudit?.diesel_total_opening_reading !== undefined ? initialAudit.diesel_total_opening_reading : null,
  });

  const handleTotalOpeningChange = (fuelType: FuelType, value: number | null) => {
    setTotalOpeningReadings((prev) => ({ ...prev, [fuelType]: value }));
  };

  const totals = calculateAuditTotals(
    items,
    sectionPrices,
    noorKhoy,
    atm,
    cashReceived
  );

  // Handle Section Price Update (Updates all 14 pump rows of that fuel type)
  const handleFuelPriceChange = (fuelType: FuelType, newPrice: number) => {
    setSectionPrices((prev) => ({ ...prev, [fuelType]: newPrice }));
  };

  // Pump Reading Input Change Handler
  const handleItemChange = (
    fuelType: FuelType,
    pumpNo: number,
    field: keyof PumpReadingItem,
    value: number | null
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.fuel_type === fuelType && item.pump_no === pumpNo) {
          const updated = { ...item, [field]: value };
          if (field === 'start_reading' || field === 'end_reading') {
            const s = field === 'start_reading' ? value : item.start_reading;
            const e = field === 'end_reading' ? value : item.end_reading;

            if (s != null && e != null) {
              const diff = Number((Number(e) - Number(s)).toFixed(2));
              if (diff >= 0) {
                updated.quantity_sold = diff;
                updated.amount = Number((diff * item.price).toFixed(2));
              }
            } else {
              updated.quantity_sold = null;
              updated.amount = null;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleMetaChange = (field: string, value: any) => {
    if (field === 'audit_date') setAuditDate(value);
    if (field === 'station_id') setSelectedStationId(value);
    if (field === 'noor_khoy_amount') setNoorKhoy(value);
    if (field === 'atm_amount') setAtm(value);
    if (field === 'cash_received_amount') setCashReceived(value);
    if (field === 'notes') setNotes(value);
  };

  // Signatory Box Click Handler
  const handleSignatoryClick = (roleKey: string) => {
    if (roleKey === 'station_supervisor') {
      if (!isDraftOrReturned) {
        alert('Audit is locked for editing.');
        return;
      }
      if (currentUser.role !== 'Operation Supervisor' && currentUser.role !== 'Super Admin') {
        alert('Only the Operation Supervisor can collect the Fuel Station Supervisor signature on-site.');
        return;
      }
      setActiveSigModal({
        isOpen: true,
        roleKey: 'station_supervisor',
        title: 'Fuel Station Supervisor Handwritten Signature',
        signatoryName: supervisorName || '',
        signatoryRole: 'On-Site Signatory',
      });
      return;
    }

    if (roleKey === 'operation_supervisor') {
      if (!isDraftOrReturned) {
        alert('Audit is locked for editing.');
        return;
      }
      if (currentUser.role !== 'Operation Supervisor' && currentUser.role !== 'Super Admin') {
        alert('Only the Operation Supervisor can sign this box.');
        return;
      }
      setActiveSigModal({
        isOpen: true,
        roleKey: 'operation_supervisor',
        title: 'Operation Supervisor Handwritten Signature',
        signatoryName: currentUser.full_name,
        signatoryRole: currentUser.position,
      });
      return;
    }

    if (roleKey === 'accountant') {
      if (currentStatus !== 'pending_accountant' && currentUser.role !== 'Super Admin') {
        alert('This audit is not currently pending Accountant review.');
        return;
      }
      if (currentUser.role !== 'Accountant' && currentUser.role !== 'Super Admin') {
        alert('Only an authorized Accountant can sign this box.');
        return;
      }
      setActiveSigModal({
        isOpen: true,
        roleKey: 'accountant',
        title: 'Accountant Handwritten Signature',
        signatoryName: currentUser.full_name,
        signatoryRole: currentUser.position,
      });
      return;
    }

    if (roleKey === 'account_manager') {
      if (currentStatus !== 'pending_account_manager' && currentUser.role !== 'Super Admin') {
        alert('This audit is not currently pending Account Manager review.');
        return;
      }
      if (currentUser.role !== 'Account Manager' && currentUser.role !== 'Super Admin') {
        alert('Only an authorized Account Manager can sign this box.');
        return;
      }
      setActiveSigModal({
        isOpen: true,
        roleKey: 'account_manager',
        title: 'Account Manager Handwritten Signature',
        signatoryName: currentUser.full_name,
        signatoryRole: currentUser.position,
      });
      return;
    }

    if (roleKey === 'management') {
      if (currentStatus !== 'pending_management' && currentUser.role !== 'Super Admin') {
        alert('This audit is not currently pending Executive Management approval.');
        return;
      }
      if (currentUser.role !== 'Management' && currentUser.role !== 'Super Admin') {
        alert('Only Executive Management can sign this box.');
        return;
      }
      setActiveSigModal({
        isOpen: true,
        roleKey: 'management',
        title: 'Al Noor United Management Handwritten Signature',
        signatoryName: currentUser.full_name,
        signatoryRole: currentUser.position,
      });
      return;
    }
  };

  const [pendingApprovalConfirmation, setPendingApprovalConfirmation] = useState<{
    dataUrl: string;
    roleKey: string;
    editedSignatoryName?: string;
  } | null>(null);

  const handleSaveSignature = async (dataUrl: string, editedSignatoryName?: string) => {
    if (!activeSigModal) return;

    if (activeSigModal.roleKey === 'station_supervisor') {
      if (editedSignatoryName && editedSignatoryName.trim()) {
        setSupervisorName(editedSignatoryName.trim());
      }
      setSupervisorSignatureUrl(dataUrl);
      return;
    }

    if (activeSigModal.roleKey === 'operation_supervisor') {
      setOperationSupervisorSignatureUrl(dataUrl);
      return;
    }

    // Require explicit user confirmation before committing stage approval transaction
    setPendingApprovalConfirmation({
      dataUrl,
      roleKey: activeSigModal.roleKey,
      editedSignatoryName,
    });
  };

  const validateForm = (): boolean => {
    setValidationError(null);

    const isDuplicate = existingAudits.some(
      (a) =>
        a.station_id === selectedStationId &&
        a.audit_date === auditDate &&
        a.id !== initialAudit?.id
    );

    if (isDuplicate) {
      setValidationError(
        `An audit already exists for ${selectedStation?.name} on ${auditDate}. Duplicate audits for the same station and date are prohibited.`
      );
      return false;
    }

    return true;
  };

  const buildAuditObject = (status: any = currentStatus): StationAudit => {
    const auditId = (initialAudit?.id && isValidUuid(initialAudit.id))
      ? initialAudit.id
      : generateUUID();

    const auditNumber =
      initialAudit?.audit_number ||
      `SA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const st = selectedStation;

    return {
      id: auditId,
      audit_number: auditNumber,
      station_id: st.id,
      station_no: st.station_no,
      station_name: st.name,
      location: st.location,
      audit_date: auditDate,
      created_by: (initialAudit?.created_by && isValidUuid(initialAudit.created_by))
        ? initialAudit.created_by
        : (currentUser?.id && isValidUuid(currentUser.id))
        ? currentUser.id
        : '00000000-0000-0000-0000-000000000001',
      created_by_name: initialAudit?.created_by_name || currentUser.full_name,
      created_by_role: initialAudit?.created_by_role || currentUser.role,
      station_supervisor_name: supervisorName,
      station_supervisor_signature_url: supervisorSignatureUrl,
      operation_supervisor_signature_url: operationSupervisorSignatureUrl,
      current_status: status,
      rejected_by_role: initialAudit?.rejected_by_role,
      rejection_reason: initialAudit?.rejection_reason,
      noor_khoy_amount: noorKhoy,
      atm_amount: atm,
      cash_amount: totals.expectedCash,
      cash_received_amount: cashReceived,
      total_sales: totals.grandTotalSales,
      total_quantity: totals.grandTotalQuantity,
      discrepancy_amount: totals.discrepancy,
      // Always persist the fuel prices used for this audit so they are
      // never overwritten by later changes to System Settings defaults.
      p91_price: sectionPrices.PETROL_91,
      p95_price: sectionPrices.PETROL_95,
      diesel_price: sectionPrices.DIESEL,

      p91_total_opening_reading: totalOpeningReadings.PETROL_91,
      p95_total_opening_reading: totalOpeningReadings.PETROL_95,
      diesel_total_opening_reading: totalOpeningReadings.DIESEL,
      notes: notes,

      created_at: initialAudit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.filter((i) => {
        return i.start_reading != null || i.end_reading != null || i.quantity_sold != null || i.amount != null;
      }),
      approvals:
        initialAudit?.approvals && initialAudit.approvals.length > 0
          ? initialAudit.approvals
          : createDefaultApprovals(),
      comments: comments,
    };
  };

  const handleSaveDraft = () => {
    if (!validateForm()) return;
    const auditObj = buildAuditObject('draft');
    onSave(auditObj);
  };

  const handleSubmitForApproval = () => {
    if (!validateForm()) return;

    if (!supervisorSignatureUrl) {
      alert('Please collect the Fuel Station Supervisor handwritten signature before submitting.');
      return;
    }

    if (!operationSupervisorSignatureUrl) {
      alert('Please draw your Operation Supervisor handwritten signature before submitting.');
      return;
    }

    // If this audit was previously returned for correction or rejected, delegate directly to handleResubmitAudit
    if (
      initialAudit &&
      (initialAudit.current_status === 'returned_for_correction' ||
        initialAudit.current_status === 'rejected' ||
        initialAudit.rejected_by_role)
    ) {
      handleResubmitAudit();
      return;
    }

    const auditObj = buildAuditObject('pending_accountant');

    // For initial submissions, reset all approvals to clean PENDING status
    auditObj.approvals = createDefaultApprovals();
    auditObj.rejected_by_role = null;
    auditObj.rejection_reason = null;

    const submissionComment: AuditComment = {
      id: generateUUID(),
      audit_id: auditObj.id,
      user_id: isValidUuid(currentUser?.id) ? currentUser.id : '00000000-0000-0000-0000-000000000001',
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      comment_text: 'Completed on-site inspection and submitted audit for Accountant approval.',
      created_at: new Date().toISOString(),
    };
    auditObj.comments.unshift(submissionComment);

    setCurrentStatus('pending_accountant');
    onSave(auditObj);
  };

  const handleWorkflowApprove = (comment?: string, customSignatureUrl?: string, roleOverrideKey?: string) => {
    let nextStatus: any = 'approved';

    if (currentStatus === 'pending_accountant') {
      nextStatus = 'pending_account_manager';
    } else if (currentStatus === 'pending_account_manager') {
      nextStatus = 'pending_management';
    } else if (currentStatus === 'pending_management') {
      nextStatus = 'approved';
    }

    const currentAuditObj = buildAuditObject(nextStatus);

    const approvalRoleKey =
      roleOverrideKey ||
      (currentStatus === 'pending_accountant'
        ? 'accountant'
        : currentStatus === 'pending_account_manager'
        ? 'account_manager'
        : 'management');

    currentAuditObj.approvals = currentAuditObj.approvals.map((app) => {
      if (app.role === approvalRoleKey) {
        return {
          ...app,
          approver_id: isValidUuid(currentUser?.id) ? currentUser.id : null,
          approver_name: currentUser.full_name,
          approver_position: currentUser.position,
          status: 'approved',
          comments: comment || app.comments || 'Approved fuel audit.',
          action_timestamp: new Date().toISOString(),
          digital_signature_code: `SIG-${currentUser.role.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          signature_url: customSignatureUrl || app.signature_url || currentUser.signature_url,
        };
      }
      return app;
    });

    if (comment) {
      currentAuditObj.comments.unshift({
        id: generateUUID(),
        audit_id: currentAuditObj.id,
        user_id: isValidUuid(currentUser?.id) ? currentUser.id : '00000000-0000-0000-0000-000000000001',
        user_name: currentUser.full_name,
        user_role: currentUser.role,
        comment_text: `[Approved] ${comment}`,
        created_at: new Date().toISOString(),
      });
    }

    setCurrentStatus(nextStatus);
    onSave(currentAuditObj);
  };

  const handleWorkflowReject = (reason: string) => {
    if (!reason || !reason.trim()) {
      alert('A mandatory rejection reason is required.');
      return;
    }

    const rejectionRoleKey: ApprovalRole =
      currentStatus === 'pending_accountant'
        ? 'accountant'
        : currentStatus === 'pending_account_manager'
        ? 'account_manager'
        : 'management';

    const currentAuditObj = buildAuditObject('returned_for_correction');
    currentAuditObj.rejected_by_role = rejectionRoleKey;
    currentAuditObj.rejection_reason = reason.trim();

    currentAuditObj.approvals = currentAuditObj.approvals.map((app) => {
      if (app.role === rejectionRoleKey) {
        return {
          ...app,
          status: 'returned',
          approver_id: isValidUuid(currentUser?.id) ? currentUser.id : null,
          approver_name: currentUser.full_name,
          approver_position: currentUser.position,
          comments: reason.trim(),
          action_timestamp: new Date().toISOString(),
        };
      }
      return app;
    });

    currentAuditObj.comments.unshift({
      id: generateUUID(),
      audit_id: currentAuditObj.id,
      user_id: isValidUuid(currentUser?.id) ? currentUser.id : '00000000-0000-0000-0000-000000000001',
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      comment_text: `[REJECTED BY ${rejectionRoleKey.replace(/_/g, ' ').toUpperCase()}] Reason: ${reason.trim()}`,
      created_at: new Date().toISOString(),
    });

    setCurrentStatus('returned_for_correction');
    onSave(currentAuditObj);
  };

  const handleWorkflowReturn = (comment: string) => {
    handleWorkflowReject(comment);
  };

  const handleResubmitAudit = () => {
    if (!validateForm()) return;

    const rejRole: ApprovalRole = initialAudit?.rejected_by_role || 'accountant';
    const rolesOrder: ApprovalRole[] = ['accountant', 'account_manager', 'management'];
    const rejIndex = rolesOrder.indexOf(rejRole) >= 0 ? rolesOrder.indexOf(rejRole) : 0;

    let targetStatus: AuditStatus = 'pending_accountant';
    if (rejRole === 'accountant') {
      targetStatus = 'pending_accountant';
    } else if (rejRole === 'account_manager') {
      targetStatus = 'pending_account_manager';
    } else if (rejRole === 'management') {
      targetStatus = 'pending_management';
    }

    const auditObj = buildAuditObject(targetStatus);
    auditObj.rejected_by_role = initialAudit?.rejected_by_role;
    auditObj.rejection_reason = initialAudit?.rejection_reason;

    // Reset rejecting stage and all subsequent stages to Pending; preserve prior approved stages
    auditObj.approvals = createDefaultApprovals().map((defaultApp) => {
      const appIndex = rolesOrder.indexOf(defaultApp.role);
      const existing = initialAudit?.approvals?.find((a) => a.role === defaultApp.role);

      if (appIndex < rejIndex && existing && existing.status === 'approved') {
        // PRESERVE PRIOR APPROVED STAGES BEFORE REJECTION POINT
        return {
          ...existing,
          status: 'approved' as const,
        };
      }

      // RESET REJECTING STAGE AND ALL SUBSEQUENT STAGES TO CLEAN PENDING STATE
      return {
        role: defaultApp.role,
        role_display_name: defaultApp.role_display_name,
        approver_id: null,
        approver_name: null,
        approver_position: null,
        status: 'pending' as const,
        comments: null,
        action_timestamp: null,
        digital_signature_code: null,
        signature_url: null,
      };
    });

    auditObj.comments.unshift({
      id: generateUUID(),
      audit_id: auditObj.id,
      user_id: isValidUuid(currentUser?.id) ? currentUser.id : '00000000-0000-0000-0000-000000000001',
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      comment_text: `[CORRECTED & RESUBMITTED] Audit corrected by ${currentUser.full_name} and returned directly to ${rejRole.replace(/_/g, ' ').toUpperCase()} for manual review & approval.`,
      created_at: new Date().toISOString(),
    });

    setCurrentStatus(targetStatus);
    onSave(auditObj);
  };

  const handleAddThreadComment = () => {
    if (!newCommentInput.trim()) return;
    const newComment: AuditComment = {
      id: generateUUID(),
      audit_id: (initialAudit?.id && isValidUuid(initialAudit.id)) ? initialAudit.id : generateUUID(),
      user_id: isValidUuid(currentUser?.id) ? currentUser.id : '00000000-0000-0000-0000-000000000001',
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      comment_text: newCommentInput,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
    setNewCommentInput('');
  };

  const currentAuditData = buildAuditObject();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* TOOLBAR */}
      <div className="relative z-10 mb-6 bg-white/80 backdrop-blur-xl border border-white/90 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl transition-all border border-sky-200/80 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/80 hover:bg-white text-slate-700 font-extrabold text-xs rounded-xl transition-all border border-sky-200/80 shadow-sm"
          >
            <Printer className="w-4 h-4 text-sky-600" />
            <span>{t('auditForm.printPreview')}</span>
          </button>

          <button
            onClick={() =>
              exportAuditToPdf(
                currentAuditData.audit_number,
                currentAuditData.station_name
              )
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-white/80 hover:bg-white text-slate-700 font-extrabold text-xs rounded-xl transition-all border border-sky-200/80 shadow-sm"
          >
            <FileDown className="w-4 h-4 text-sky-600" />
            <span>{t('auditForm.pdfExport')}</span>
          </button>

          {currentStatus === 'draft' && (currentUser.role === 'Operation Supervisor' || currentUser.role === 'Super Admin') && (
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-extrabold text-xs rounded-xl transition-all border border-emerald-500/30 shadow-sm"
            >
              <Save className="w-4 h-4 text-emerald-600" />
              <span>{t('auditForm.saveDraft')}</span>
            </button>
          )}

          {currentStatus === 'draft' && (currentUser.role === 'Operation Supervisor' || currentUser.role === 'Super Admin') && (
            <button
              onClick={handleSubmitForApproval}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
              <span>{t('auditForm.submitAudit')}</span>
            </button>
          )}

          {(currentStatus === 'returned_for_correction' || currentStatus === 'rejected') && (currentUser.role === 'Operation Supervisor' || currentUser.role === 'Super Admin') && (
            <button
              onClick={handleResubmitAudit}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all animate-pulse"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('auditForm.submitAudit')}</span>
            </button>
          )}
        </div>

      </div>

      {(currentStatus === 'returned_for_correction' || currentStatus === 'rejected') && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-[24px] backdrop-blur-md shadow-lg flex items-start gap-3.5 no-print">
          <div className="p-2.5 bg-rose-500/20 text-rose-700 rounded-2xl border border-rose-500/30 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-rose-900 uppercase tracking-wide">
                Audit Returned for Correction
              </h4>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800 border border-rose-300">
                Rejected by {initialAudit?.rejected_by_role?.replace(/_/g, ' ').toUpperCase() || 'Approver'}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1.5 bg-white/80 p-3 rounded-2xl border border-rose-200 shadow-inner">
              "{initialAudit?.rejection_reason || 'Please review audit values and make necessary corrections before resubmitting.'}"
            </p>
            <p className="text-[11px] text-rose-700 font-bold mt-2">
              Note: Clicking "Resubmit Corrected Audit" will return this audit directly to the {initialAudit?.rejected_by_role?.replace(/_/g, ' ').toUpperCase() || 'rejecting approver'} for re-review, preserving all prior approved signatures.
            </p>
          </div>
        </div>
      )}

      {validationError && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-3 backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* APPROVAL WORKFLOW PROGRESS BAR */}
      {initialAudit && (
        <ApprovalPanel
          audit={currentAuditData}
          onApprove={(_comment) => {
            const roleKey =
              currentStatus === 'pending_accountant'
                ? 'accountant'
                : currentStatus === 'pending_account_manager'
                ? 'account_manager'
                : 'management';

            setActiveSigModal({
              isOpen: true,
              roleKey: roleKey,
              title: `${roleKey.replace(/_/g, ' ').toUpperCase()} Handwritten Approval Signature`,
              signatoryName: currentUser.full_name,
              signatoryRole: currentUser.position,
            });
          }}
          onReject={handleWorkflowReject}
          onReturnForCorrection={handleWorkflowReturn}
          onAddComment={(cmt) => {
            const auditObj = buildAuditObject();
            auditObj.comments.unshift({
              id: `c-${Date.now()}`,
              audit_id: auditObj.id,
              user_id: currentUser.id,
              user_name: currentUser.full_name,
              user_role: currentUser.role,
              comment_text: cmt,
              created_at: new Date().toISOString(),
            });
            onSave(auditObj);
          }}
        />
      )}

      {/* MODERN ENTERPRISE WEB APP AUDIT FORM (INTERACTIVE FAST DATA ENTRY) */}
      <div className="no-print pb-6">
        <ModernAuditForm
          audit={currentAuditData}
          items={items}
          prices={sectionPrices}
          selectedStation={selectedStation}
          stations={stations}
          onItemChange={handleItemChange}
          onPriceChange={handleFuelPriceChange}
          onTotalOpeningChange={handleTotalOpeningChange}
          onMetaChange={handleMetaChange}
          onSignatoryClick={handleSignatoryClick}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* OFFICIAL PRINTABLE A4 PAPER FORM (HIDDEN ON SCREEN, USED FOR PDF EXPORT & PRINTING) */}
      <div id="paper-form-document" className="hidden print:block">
        <PaperFormLayout
          audit={currentAuditData}
          items={items}
          prices={sectionPrices}
          onItemChange={handleItemChange}
          onPriceChange={handleFuelPriceChange}
          onTotalOpeningChange={handleTotalOpeningChange}
          onMetaChange={handleMetaChange}
          onSignatoryClick={handleSignatoryClick}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* COMMENTS THREAD SECTION */}
      <div className="mt-8 bg-white/45 backdrop-blur-2xl border border-white/80 rounded-[28px] p-7 shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60">
        <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-600" />
          <span>Audit Discussion & Review History</span>
        </h3>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCommentInput}
            onChange={(e) => setNewCommentInput(e.target.value)}
            placeholder="Add a comment or query regarding this audit..."
            className="flex-1 bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-inner"
          />
          <button
            onClick={handleAddThreadComment}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 italic font-medium">No comments recorded yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-3.5 bg-white/60 backdrop-blur-md border border-white/90 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs">{c.user_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 font-bold border border-sky-500/20">
                      {c.user_role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{c.comment_text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* HANDWRITTEN SIGNATURE MODAL */}
      {activeSigModal && (
        <SignaturePadModal
          isOpen={activeSigModal.isOpen}
          title={activeSigModal.title}
          signatoryName={activeSigModal.signatoryName}
          signatoryRole={activeSigModal.signatoryRole}
          onSaveSignature={handleSaveSignature}
          onClose={() => setActiveSigModal(null)}
        />
      )}

      {/* EXPLICIT WORKFLOW APPROVAL CONFIRMATION DIALOG */}
      {pendingApprovalConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-[28px] max-w-md w-full p-6 shadow-2xl ring-1 ring-white/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Confirm Approval</h3>
                <p className="text-xs text-sky-700 font-extrabold">
                  {pendingApprovalConfirmation.roleKey.replace(/_/g, ' ').toUpperCase()} Stage
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed mb-6">
              Are you sure you want to approve this audit? After approval, this action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setPendingApprovalConfirmation(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const pending = pendingApprovalConfirmation;
                  setPendingApprovalConfirmation(null);
                  await handleWorkflowApprove(undefined, pending.dataUrl, pending.roleKey);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
