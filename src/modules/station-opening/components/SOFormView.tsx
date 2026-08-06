import React, { useState, useEffect } from 'react';
import type { StationOpeningForm } from '../types';
import type { Station } from '../../../types/audit';
import { exportStationOpeningToPdf } from '../pdfGenerator';
import { useLanguage } from '../../../context/LanguageContext';
import { SOPdfLayout } from './SOPdfLayout';
import { SignaturePadModal } from '../../../components/Signature/SignaturePadModal';
import {
  Building,
  Fuel,
  ShieldCheck,
  FileDown,
  Send,
  PenTool,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

import { SOApprovalPanel } from './SOApprovalPanel';

interface Props {
  form: StationOpeningForm;
  stations: Station[];
  currentUser: any;
  onSave?: (updatedForm: StationOpeningForm) => void;
  onSubmit: (updatedForm: StationOpeningForm) => void;
  onApprove: (formId: string, role: any, comments: string, signatureUrl?: string) => void;
  onReturn: (formId: string, role: any, comments: string) => void;
  onBack: () => void;
}

export const SOFormView: React.FC<Props> = ({
  form: initialForm,
  stations,
  currentUser,
  onSave: _onSave,
  onSubmit,
  onApprove,
  onReturn,
  onBack,
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<StationOpeningForm>(() => ({
    ...initialForm,
    head_of_operation_name: initialForm.head_of_operation_name || currentUser?.full_name || 'Head of Operation',
    head_of_operation_signature_url: initialForm.head_of_operation_signature_url || (currentUser?.role === 'Head of Operation' ? currentUser?.signature_url : ''),
  }));

  // Sync internal form state whenever initialForm prop is updated upstream
  useEffect(() => {
    setForm((prev) => ({
      ...initialForm,
      head_of_operation_name: initialForm.head_of_operation_name || prev.head_of_operation_name || currentUser?.full_name || 'Head of Operation',
      head_of_operation_signature_url: initialForm.head_of_operation_signature_url || prev.head_of_operation_signature_url || (currentUser?.role === 'Head of Operation' ? currentUser?.signature_url : ''),
    }));
  }, [initialForm]);

  const [isSupervisorSignatureModalOpen, setIsSupervisorSignatureModalOpen] = useState(false);
  const [isHeadOfOpSignatureModalOpen, setIsHeadOfOpSignatureModalOpen] = useState(false);
  const [isApprovalPanelOpen, setIsApprovalPanelOpen] = useState(false);

  const isHeadOfOperation = currentUser?.role === 'Head of Operation';
  const isDraftOrReturned = isHeadOfOperation && (form.current_status === 'pending_safety_quality' || form.current_status === 'returned' || !form.created_at);

  const activeStageRole = form.current_approver_role;
  const isCurrentStageApprover =
    currentUser?.role === 'Super Admin' ||
    (activeStageRole === 'safety_quality' && currentUser?.role === 'Safety & Quality Control') ||
    (activeStageRole === 'document_controller' && currentUser?.role === 'Document Controller') ||
    (activeStageRole === 'engineering' && currentUser?.role === 'Engineering Department') ||
    (activeStageRole === 'management' && currentUser?.role === 'Al Noor United Management');

  const isPendingApproval = form.current_status.startsWith('pending_') && isCurrentStageApprover;

  // Station Selection Change
  const handleStationChange = (stationId: string) => {
    const selected = stations.find((s) => s.id === stationId);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        station_id: selected.id,
        station_no: selected.station_no,
        station_name: selected.name,
        address: selected.location || 'Riyadh, Saudi Arabia',
      }));
    }
  };

  // Field change handlers
  const updateField = (field: keyof StationOpeningForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSupervisorSignature = (signatureUrl: string) => {
    setForm((prev) => ({
      ...prev,
      station_supervisor_signature_url: signatureUrl,
      station_supervisor_signed_at: new Date().toISOString(),
    }));
    setIsSupervisorSignatureModalOpen(false);
  };

  const handleSaveHeadOfOpSignature = (signatureUrl: string) => {
    setForm((prev) => ({
      ...prev,
      head_of_operation_signature_url: signatureUrl,
      head_of_operation_signed_at: new Date().toISOString(),
    }));
    setIsHeadOfOpSignatureModalOpen(false);
  };

  const updateSafetyField = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      safety_equipment: {
        ...prev.safety_equipment,
        [field]: value,
      },
    }));
  };

  const updateAmenityField = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [field]: value,
      },
    }));
  };

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
    <div className="space-y-6">
      {/* 1. TOP TOOLBAR & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-2xl border border-white/90 p-5 rounded-[28px] shadow-lg sticky top-3 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title={t('so.backToForms')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-amber-900 font-mono">{form.form_number}</span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                {getStatusLabel(form.current_status)}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-extrabold">{form.station_name} ({form.station_no})</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportStationOpeningToPdf(form)}
            className="px-4 py-2 bg-white/80 hover:bg-white text-sky-700 font-extrabold text-xs rounded-xl border border-sky-200/80 shadow-sm transition-all flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4 text-sky-600" />
            <span>{t('so.printPdf')}</span>
          </button>

          {isPendingApproval && (
            <button
              onClick={() => setIsApprovalPanelOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('so.reviewApprove')}</span>
            </button>
          )}

          {isDraftOrReturned && (
            <button
              onClick={() => {
                if (!form.station_supervisor_name || !form.station_supervisor_name.trim()) {
                  alert('Please enter the Station Supervisor Name before submitting.');
                  return;
                }
                if (!form.station_supervisor_signature_url) {
                  alert('Please capture the Station Supervisor on-site signature before submitting.');
                  return;
                }
                if (!form.head_of_operation_name || !form.head_of_operation_name.trim()) {
                  alert('Please enter the Operation Supervisor Name before submitting.');
                  return;
                }
                if (!form.head_of_operation_signature_url) {
                  alert('Please sign as Operation Supervisor before submitting.');
                  return;
                }
                onSubmit(form);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{form.current_status === 'returned' ? t('so.resubmitForm') : t('so.submitForm')}</span>
            </button>
          )}
        </div>
      </div>

      {/* RETURN REASON ALERT BANNER */}
      {form.current_status === 'returned' && form.return_reason && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex items-start gap-3 text-amber-900">
          <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Form Returned for Correction</h4>
            <p className="text-xs font-bold mt-0.5">{form.return_reason}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              Please make the required updates and click <strong>Submit for Approval</strong> to resume the approval process from the returning department.
            </p>
          </div>
        </div>
      )}

      {/* FORM BODY CONTAINER */}
      <div className="bg-white/50 backdrop-blur-2xl border border-white/90 rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(14,165,233,0.12)] space-y-8">
        {/* SECTION 1: STATION BASIC INFORMATION */}
        <div className="space-y-4">
          <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-600" />
              <span>{t('so.sec1Title')}</span>
            </h3>
            <span className="text-xs font-bold text-sky-700 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              {t('so.sec1Sub')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Station Dropdown */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.selectStation')}</label>
              {!isDraftOrReturned ? (
                <div className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-sm flex items-center min-h-[42px]">
                  {form.station_no} - {form.station_name}
                </div>
              ) : (
                <select
                  value={form.station_id}
                  onChange={(e) => handleStationChange(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.station_no} - {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Started */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.dateStarted')}</label>
              <input
                type="date"
                value={form.date_started}
                onChange={(e) => updateField('date_started', e.target.value)}
                disabled={!isDraftOrReturned}
                className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>

            {/* Station Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.stationAddress')}</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                disabled={!isDraftOrReturned}
                className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>

            {/* Electric Meter Number */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.electricMeterNo')}</label>
              <input
                type="text"
                value={form.electric_meter_number}
                onChange={(e) => updateField('electric_meter_number', e.target.value)}
                disabled={!isDraftOrReturned}
                placeholder="e.g. ELEC-99201"
                className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>

            {/* ATM Machine */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.atmMachine')}</label>
              {!isDraftOrReturned ? (
                <div className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-sm flex items-center min-h-[42px]">
                  {form.atm_machine || 'Available'}
                </div>
              ) : (
                <select
                  value={form.atm_machine || 'Available'}
                  onChange={(e) => updateField('atm_machine', e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
                >
                  <option value="Available">{t('so.available')}</option>
                  <option value="Not Available">{t('so.notAvailable')}</option>
                </select>
              )}
            </div>

            {/* Noor Khoy Machine */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.noorKhoyMachine')}</label>
              {!isDraftOrReturned ? (
                <div className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-sm flex items-center min-h-[42px]">
                  {form.noor_khoy_machine || 'Installed'}
                </div>
              ) : (
                <select
                  value={form.noor_khoy_machine || 'Installed'}
                  onChange={(e) => updateField('noor_khoy_machine', e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
                >
                  <option value="Installed">Installed</option>
                  <option value="Not Installed">Not Installed</option>
                </select>
              )}
            </div>

            {/* Staff House */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Staff House</label>
              {!isDraftOrReturned ? (
                <div className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-sm flex items-center min-h-[42px]">
                  {form.staff_house || 'Available'}
                </div>
              ) : (
                <select
                  value={form.staff_house || 'Available'}
                  onChange={(e) => updateField('staff_house', e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              )}
            </div>

            {/* Operation Supervisor Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Operation Supervisor</label>
              <div className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 flex items-center min-h-[42px]">
                {form.created_by_name}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FUEL PUMP & TANK SPECIFICATIONS */}
        <div className="space-y-4">
          <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-sky-600" />
              <span>{t('so.sec2Title')}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.brandOfPump')}</label>
              <input
                type="text"
                value={form.brand_of_fuel_pump}
                onChange={(e) => updateField('brand_of_fuel_pump', e.target.value)}
                disabled={!isDraftOrReturned}
                className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.noOfPumps')}</label>
              <input
                type="number"
                value={form.no_of_fuel_pump || ''}
                onChange={(e) => updateField('no_of_fuel_pump', parseInt(e.target.value) || 0)}
                disabled={!isDraftOrReturned}
                className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('so.automation')}</label>
              <select
                value={form.automation_enabled ? 'true' : 'false'}
                onChange={(e) => updateField('automation_enabled', e.target.value === 'true')}
                disabled={!isDraftOrReturned}
                className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm"
              >
                <option value="true">{t('so.yes')}</option>
                <option value="false">{t('so.no')}</option>
              </select>
            </div>
          </div>

          {/* Product Tanks Table & Tank Installation Safety Checklist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tanks Table (2 Cols) */}
            <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-sky-200/80 bg-white/70 backdrop-blur-md">
              <table className="w-full text-center text-xs">
                <thead className="bg-white/80 text-slate-700 font-extrabold border-b border-sky-100">
                  <tr>
                    <th className="p-3">{t('so.productType')}</th>
                    <th className="p-3">{t('so.available')}</th>
                    <th className="p-3">{t('so.tankCapacity')}</th>
                    <th className="p-3">{t('so.noOfTanks')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-extrabold">
                  {form.fuel_tanks.map((tank, idx) => (
                    <tr key={tank.fuel_type} className="hover:bg-sky-50/50">
                      <td className="p-3 font-bold text-slate-900">{tank.fuel_type.replace('_', ' ')}</td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={tank.is_available}
                          onChange={(e) => {
                            const updated = [...form.fuel_tanks];
                            updated[idx].is_available = e.target.checked;
                            updateField('fuel_tanks', updated);
                          }}
                          disabled={!isDraftOrReturned}
                          className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={tank.tank_capacity || ''}
                          onChange={(e) => {
                            const updated = [...form.fuel_tanks];
                            updated[idx].tank_capacity = e.target.value;
                            updateField('fuel_tanks', updated);
                          }}
                          disabled={!isDraftOrReturned}
                          className="w-32 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={tank.no_of_tanks || ''}
                          onChange={(e) => {
                            const updated = [...form.fuel_tanks];
                            updated[idx].no_of_tanks = parseInt(e.target.value) || 0;
                            updateField('fuel_tanks', updated);
                          }}
                          disabled={!isDraftOrReturned}
                          className="w-20 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tank Installation Safety Checklist (Right Column Grid) */}
            <div className="bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-900 border-b border-sky-100 pb-2 uppercase tracking-wide">
                {t('so.tankSafetyChecklist')}
              </h4>
              <div className="space-y-2 text-xs font-bold text-slate-800">
                <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-sky-100 cursor-pointer">
                  <span>{t('so.earthingCable')}</span>
                  <input
                    type="checkbox"
                    checked={form.safety_equipment.earthing_cable}
                    onChange={(e) => updateSafetyField('earthing_cable', e.target.checked)}
                    disabled={!isDraftOrReturned}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-sky-100 cursor-pointer">
                  <span>{t('so.hoseCouplings')}</span>
                  <input
                    type="checkbox"
                    checked={form.safety_equipment.hose_couplings}
                    onChange={(e) => updateSafetyField('hose_couplings', e.target.checked)}
                    disabled={!isDraftOrReturned}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-sky-100 cursor-pointer">
                  <span>{t('so.ventAirPipes')}</span>
                  <input
                    type="checkbox"
                    checked={form.safety_equipment.vent_air_pipes}
                    onChange={(e) => updateSafetyField('vent_air_pipes', e.target.checked)}
                    disabled={!isDraftOrReturned}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-sky-100 cursor-pointer">
                  <span>{t('so.colorCoding')}</span>
                  <input
                    type="checkbox"
                    checked={form.safety_equipment.color_coding}
                    onChange={(e) => updateSafetyField('color_coding', e.target.checked)}
                    disabled={!isDraftOrReturned}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-sky-100 cursor-pointer">
                  <span>{t('so.sandBackfill')}</span>
                  <input
                    type="checkbox"
                    checked={form.safety_equipment.sand_backfill}
                    onChange={(e) => updateSafetyField('sand_backfill', e.target.checked)}
                    disabled={!isDraftOrReturned}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* NOZZLE BREAKDOWN TABLE */}
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              {t('so.nozzleBreakdown')}
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-sky-200/80 bg-white/70 backdrop-blur-md">
              <table className="w-full text-center text-xs">
                <thead className="bg-white/80 text-slate-700 font-extrabold border-b border-sky-100">
                  <tr>
                    <th className="p-3 text-start">{t('so.noOfNozzles')}</th>
                    <th className="p-3">{t('so.quantity')}</th>
                    <th className="p-3 text-end">{t('so.noOfPumps')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-bold">
                  {/* Petrol 91 */}
                  <tr>
                    <td className="p-3 text-start font-black text-emerald-700">Petrol 91</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'PETROL_91')?.quantity || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'PETROL_91');
                          if (idx >= 0) copy[idx].quantity = val;
                          else copy.push({ fuel_type: 'PETROL_91', quantity: val, no_of_pumps: 0 });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="p-3 text-end">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'PETROL_91')?.no_of_pumps || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'PETROL_91');
                          if (idx >= 0) copy[idx].no_of_pumps = val;
                          else copy.push({ fuel_type: 'PETROL_91', quantity: 0, no_of_pumps: val });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                  </tr>

                  {/* Petrol 95 */}
                  <tr>
                    <td className="p-3 text-start font-black text-rose-700">Petrol 95</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'PETROL_95')?.quantity || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'PETROL_95');
                          if (idx >= 0) copy[idx].quantity = val;
                          else copy.push({ fuel_type: 'PETROL_95', quantity: val, no_of_pumps: 0 });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="p-3 text-end">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'PETROL_95')?.no_of_pumps || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'PETROL_95');
                          if (idx >= 0) copy[idx].no_of_pumps = val;
                          else copy.push({ fuel_type: 'PETROL_95', quantity: 0, no_of_pumps: val });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                  </tr>

                  {/* Diesel */}
                  <tr>
                    <td className="p-3 text-start font-black text-amber-700">Diesel</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'DIESEL')?.quantity || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'DIESEL');
                          if (idx >= 0) copy[idx].quantity = val;
                          else copy.push({ fuel_type: 'DIESEL', quantity: val, no_of_pumps: 0 });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="p-3 text-end">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'DIESEL')?.no_of_pumps || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'DIESEL');
                          if (idx >= 0) copy[idx].no_of_pumps = val;
                          else copy.push({ fuel_type: 'DIESEL', quantity: 0, no_of_pumps: val });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                  </tr>

                  {/* Combined Petrol & Diesel */}
                  <tr>
                    <td className="p-3 text-start font-black text-slate-800">Combined Petrol & Diesel</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'COMBINED')?.quantity || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'COMBINED');
                          if (idx >= 0) copy[idx].quantity = val;
                          else copy.push({ fuel_type: 'COMBINED', quantity: val, no_of_pumps: 0 });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="p-3 text-end">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'COMBINED')?.no_of_pumps || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'COMBINED');
                          if (idx >= 0) copy[idx].no_of_pumps = val;
                          else copy.push({ fuel_type: 'COMBINED', quantity: 0, no_of_pumps: val });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                  </tr>

                  {/* Kerosene */}
                  <tr>
                    <td className="p-3 text-start font-black text-slate-600">Kerosene</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'KEROSENE')?.quantity || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'KEROSENE');
                          if (idx >= 0) copy[idx].quantity = val;
                          else copy.push({ fuel_type: 'KEROSENE', quantity: val, no_of_pumps: 0 });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="p-3 text-end">
                      <input
                        type="number"
                        value={form.nozzle_details?.find((n) => n.fuel_type === 'KEROSENE')?.no_of_pumps || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...(form.nozzle_details || [])];
                          const idx = copy.findIndex((n) => n.fuel_type === 'KEROSENE');
                          if (idx >= 0) copy[idx].no_of_pumps = val;
                          else copy.push({ fuel_type: 'KEROSENE', quantity: 0, no_of_pumps: val });
                          updateField('nozzle_details', copy);
                        }}
                        disabled={!isDraftOrReturned}
                        className="w-24 bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 3: SAFETY EQUIPMENTS */}
        <div className="space-y-4">
          <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>{t('so.sec3Title')}</span>
            </h3>
          </div>

          {/* Primary Safety Systems Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-md rounded-xl border border-sky-200/80 cursor-pointer hover:bg-white transition-all shadow-sm">
              <span className="text-xs font-bold text-slate-800">{t('so.firePump')}</span>
              <input
                type="checkbox"
                checked={form.safety_equipment.fire_pump}
                onChange={(e) => updateSafetyField('fire_pump', e.target.checked)}
                disabled={!isDraftOrReturned}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-md rounded-xl border border-sky-200/80 cursor-pointer hover:bg-white transition-all shadow-sm">
              <span className="text-xs font-bold text-slate-800">{t('so.waterTanks')}</span>
              <input
                type="checkbox"
                checked={form.safety_equipment.water_tanks}
                onChange={(e) => updateSafetyField('water_tanks', e.target.checked)}
                disabled={!isDraftOrReturned}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-md rounded-xl border border-sky-200/80 cursor-pointer hover:bg-white transition-all shadow-sm">
              <span className="text-xs font-bold text-slate-800">{t('so.batteryForFirePump')}</span>
              <input
                type="checkbox"
                checked={form.safety_equipment.battery_for_fire_pump}
                onChange={(e) => updateSafetyField('battery_for_fire_pump', e.target.checked)}
                disabled={!isDraftOrReturned}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Fire Hose Cabinet Locations (12 Slots) */}
            <div className="bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-900 border-b border-sky-100 pb-2 uppercase tracking-wide">
                {t('so.fireHoseLocations')}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-sky-100">
                    <span className="w-5 text-center font-mono font-black text-sky-700">{i + 1}.</span>
                    <input
                      type="text"
                      value={form.safety_equipment?.fire_hose_cabinet_locations?.[i] || ''}
                      onChange={(e) => {
                        const copy = [...(form.safety_equipment?.fire_hose_cabinet_locations || Array(12).fill(''))];
                        copy[i] = e.target.value;
                        updateSafetyField('fire_hose_cabinet_locations', copy);
                      }}
                      disabled={!isDraftOrReturned}
                      className="w-full bg-transparent border-0 p-0 text-xs font-bold text-slate-900 focus:ring-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Fire Extinguishers & Safety Equipment Table */}
            <div className="bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl p-4 space-y-3 overflow-x-auto">
              <h4 className="text-xs font-black text-slate-900 border-b border-sky-100 pb-2 uppercase tracking-wide">
                {t('so.fireExtinguishersTitle')}
              </h4>
              <table className="w-full text-center text-xs">
                <thead className="bg-white/80 text-slate-700 font-extrabold border-b border-sky-100">
                  <tr>
                    <th className="p-2 text-start">{t('so.equipmentItem')}</th>
                    <th className="p-2">{t('so.weightVolume')}</th>
                    <th className="p-2">{t('so.quantity')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-bold">
                  {(form.safety_equipment?.extinguishers || []).map((ext, idx) => {
                    const isYesNoItem = ['6', '7', '8', '9'].includes(ext.id) || ['Sand Bucket', 'Traffic Cone', 'Waste Bin', 'CCTV 24/7 Monitoring'].some(n => ext.name.includes(n));
                    const isLiterItem = ['2', '4'].includes(ext.id) || ext.name.includes('Foam');

                    const kgList = Array.from({ length: 20 }, (_, i) => `${i + 1} Kg`);
                    const literList = Array.from({ length: 20 }, (_, i) => `${i + 1} ${i === 0 ? 'Liter' : 'Liters'}`);

                    const isAvailable = Boolean(ext.is_available);

                    return (
                      <tr key={ext.id} className="hover:bg-sky-50/50">
                        <td className="p-2 text-start font-black text-slate-900">{ext.name}</td>
                        <td className="p-2">
                          {isYesNoItem ? (
                            !isDraftOrReturned ? (
                              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black border shadow-sm ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {isAvailable ? t('so.yes') : t('so.no')}
                              </span>
                            ) : (
                              <select
                                value={isAvailable ? 'Yes' : 'No'}
                                onChange={(e) => {
                                  const yes = e.target.value === 'Yes';
                                  const copy = [...(form.safety_equipment?.extinguishers || [])];
                                  copy[idx].is_available = yes;
                                  if (!yes) {
                                    copy[idx].quantity = 0;
                                  } else if ((copy[idx].quantity || 0) === 0) {
                                    copy[idx].quantity = 1;
                                  }
                                  updateSafetyField('extinguishers', copy);
                                }}
                                className={`rounded-lg px-2.5 py-1 text-center font-black text-xs border shadow-sm cursor-pointer ${
                                  isAvailable
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                <option value="Yes">{t('so.yes')}</option>
                                <option value="No">{t('so.no')}</option>
                              </select>
                            )
                          ) : !isDraftOrReturned ? (
                            <span className="inline-block px-3 py-1 bg-slate-100/90 text-slate-800 rounded-lg text-xs font-extrabold border border-slate-200/90 shadow-sm">
                              {ext.weight_volume || '-'}
                            </span>
                          ) : (
                            <select
                              value={ext.weight_volume || ''}
                              onChange={(e) => {
                                const copy = [...(form.safety_equipment?.extinguishers || [])];
                                copy[idx].weight_volume = e.target.value;
                                updateSafetyField('extinguishers', copy);
                              }}
                              className="bg-white border border-sky-200/80 rounded-lg px-2 py-1 text-center font-bold text-xs focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
                            >
                              <option value="">Select Weight / Volume...</option>
                              {(isLiterItem ? literList : kgList).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="p-2">
                          {!isDraftOrReturned ? (
                            <span className="inline-block w-16 px-2 py-1 bg-slate-100/90 text-slate-800 rounded-lg text-center font-mono text-xs font-extrabold border border-slate-200/90 shadow-sm">
                              {isYesNoItem && !isAvailable ? 0 : (ext.quantity || 0)}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              disabled={isYesNoItem && !isAvailable}
                              value={isYesNoItem && !isAvailable ? '' : (ext.quantity || '')}
                              placeholder="0"
                              onChange={(e) => {
                                const copy = [...(form.safety_equipment?.extinguishers || [])];
                                copy[idx].quantity = Math.max(0, parseInt(e.target.value) || 0);
                                updateSafetyField('extinguishers', copy);
                              }}
                              className={`w-16 rounded-lg px-2 py-1 text-center font-mono text-xs font-bold border shadow-sm ${
                                isYesNoItem && !isAvailable
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : 'bg-white text-slate-900 border-sky-200/80 focus:ring-2 focus:ring-sky-500'
                              }`}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 4: OPERATIONAL AMENITIES CHECKLIST */}
        <div className="space-y-4">
          <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">{t('so.sec4Title')}</h3>
            <span className="text-xs font-bold text-sky-700 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              {t('so.amenities22Items')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-bold text-slate-800">
            {Object.entries({
              noor_cladding: t('so.noorCladding'),
              price_board_led: t('so.priceBoardLed'),
              washrooms: t('so.washrooms'),
              pwd_ramp_parking: t('so.pwdRampParking'),
              entrance_exit_signage: t('so.entranceExitSignage'),
              station_office: t('so.stationOffice'),
              emergency_switch: t('so.emergencySwitch'),
              assembly_point: t('so.assemblyPoint'),
              backup_generator: t('so.backupGenerator'),
              diesel_truck_area: t('so.dieselTruckArea'),
              diesel_canopy_small_car: t('so.dieselCanopySmallCar'),
              supermarket: t('so.supermarket'),
              restaurant: t('so.restaurant'),
              buffia: t('so.buffia'),
              mosque: t('so.mosque'),
              bank_machine: t('so.bankMachine'),
              car_wash: t('so.carWash'),
              auto_car_wash: t('so.autoCarWash'),
              buncher_shop: t('so.buncherShop'),
              oil_change_shop: t('so.oilChangeShop'),
              ev_charger: t('so.evCharger'),
            }).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-md rounded-xl border border-sky-200/80 cursor-pointer hover:bg-white transition-all shadow-sm">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={(form.amenities as any)[key]}
                  onChange={(e) => updateAmenityField(key, e.target.checked)}
                  disabled={!isDraftOrReturned}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
              </label>
            ))}

            {/* Item 22: Others */}
            <div className="sm:col-span-2 lg:col-span-3 p-3 bg-white/70 backdrop-blur-md rounded-xl border border-sky-200/80 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-black text-slate-900">{t('so.others')}</span>
                <input
                  type="checkbox"
                  checked={Boolean(form.amenities.others_text)}
                  onChange={(e) => {
                    if (!e.target.checked) updateAmenityField('others_text', '');
                  }}
                  disabled={!isDraftOrReturned}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
              </label>
              <input
                type="text"
                value={form.amenities.others_text || ''}
                onChange={(e) => updateAmenityField('others_text', e.target.value)}
                disabled={!isDraftOrReturned}
                placeholder={t('so.othersPlaceholder')}
                className="w-full bg-white border border-sky-200/80 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: ON-SITE STAKEHOLDER SIGNATURES & MANAGEMENT APPROVALS */}
        <div className="space-y-4 pt-4 border-t-2 border-sky-100">
          <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-sky-600" />
              <span>{t('so.sec5Title')}</span>
            </h3>
          </div>

          {/* DUAL INITIAL SIGNATURES CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PANEL 1: ON-SITE STATION SUPERVISOR SIGNATURE PANEL */}
            <div className="bg-white/60 backdrop-blur-2xl border border-sky-200/90 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider">
                    {t('so.supervisorTitle')}
                  </h4>
                  <p className="text-[11px] text-sky-800 font-medium mt-0.5">
                    {t('so.supervisorSub')}
                  </p>
                </div>

                {isDraftOrReturned && (
                  <button
                    onClick={() => setIsSupervisorSignatureModalOpen(true)}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{form.station_supervisor_signature_url ? t('so.reSign') : t('so.signOnSite')}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    {t('so.supervisorName')}
                  </label>
                  <input
                    type="text"
                    value={form.station_supervisor_name}
                    onChange={(e) => updateField('station_supervisor_name', e.target.value)}
                    disabled={!isDraftOrReturned}
                    placeholder="Enter full name of on-site supervisor..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    {t('so.sigPreview')}
                  </label>
                  <div className="bg-white border border-slate-300 rounded-xl p-2 min-h-[48px] flex items-center justify-center">
                    {form.station_supervisor_signature_url ? (
                      <img src={form.station_supervisor_signature_url} alt="Supervisor Signature" className="h-10 object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">{t('so.sigNotCaptured')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: HEAD OF OPERATION CREATOR SIGNATURE PANEL */}
            <div className="bg-white/60 backdrop-blur-2xl border border-sky-200/90 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider">
                    {t('so.headOfOpTitle')}
                  </h4>
                  <p className="text-[11px] text-sky-800 font-medium mt-0.5">
                    {t('so.headOfOpSub')}
                  </p>
                </div>

                {isDraftOrReturned && (
                  <button
                    onClick={() => setIsHeadOfOpSignatureModalOpen(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{form.head_of_operation_signature_url ? t('so.reSign') : t('so.signCreator')}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    {t('so.headOfOpName')}
                  </label>
                  <input
                    type="text"
                    value={form.head_of_operation_name}
                    onChange={(e) => updateField('head_of_operation_name', e.target.value)}
                    disabled={!isDraftOrReturned}
                    placeholder="Enter Operation Supervisor name..."
                    className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    {t('so.sigPreview')}
                  </label>
                  <div className="bg-white/80 border border-sky-200/80 rounded-xl p-2 min-h-[48px] flex items-center justify-center shadow-inner">
                    {form.head_of_operation_signature_url ? (
                      <img src={form.head_of_operation_signature_url} alt="Operation Supervisor Signature" className="h-10 object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">{t('so.sigNotCaptured')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEQUENTIAL 4-STEP APPROVAL CHAIN DISPLAY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {form.approvals.map((app) => (
              <div key={app.role} className="bg-white/60 backdrop-blur-xl border border-white/90 p-4 rounded-2xl shadow-sm space-y-2 text-xs">
                <p className="font-extrabold text-slate-900">{app.role_display_name}</p>
                <p className="text-[11px] text-slate-500 font-bold">Approver: {app.approver_name || 'Pending'}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30' :
                    app.status === 'returned' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {app.status === 'approved' ? t('so.statusApproved') : app.status === 'returned' ? t('so.statusReturned') : app.status}
                  </span>
                </div>
                {app.signature_url && (
                  <img src={app.signature_url} alt="Approver Sig" className="h-8 object-contain mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUPERVISOR SIGNATURE MODAL */}
      {isSupervisorSignatureModalOpen && (
        <SignaturePadModal
          isOpen={isSupervisorSignatureModalOpen}
          title="Station Supervisor Signature"
          signatoryName={form.station_supervisor_name || 'Station Supervisor'}
          signatoryRole="Station Supervisor"
          onSaveSignature={async (sigUrl, editedName) => {
            if (editedName) {
              updateField('station_supervisor_name', editedName);
            }
            handleSaveSupervisorSignature(sigUrl);
          }}
          onClose={() => setIsSupervisorSignatureModalOpen(false)}
        />
      )}

      {/* HEAD OF OPERATION SIGNATURE MODAL */}
      {isHeadOfOpSignatureModalOpen && (
        <SignaturePadModal
          isOpen={isHeadOfOpSignatureModalOpen}
          title="Operation Supervisor Signature"
          signatoryName={form.head_of_operation_name || currentUser?.full_name || 'Operation Supervisor'}
          signatoryRole="Operation Supervisor"
          onSaveSignature={async (sigUrl, editedName) => {
            if (editedName) {
              updateField('head_of_operation_name', editedName);
            }
            handleSaveHeadOfOpSignature(sigUrl);
          }}
          onClose={() => setIsHeadOfOpSignatureModalOpen(false)}
        />
      )}

      {/* DEPARTMENT APPROVAL PANEL MODAL */}
      {isApprovalPanelOpen && (
        <SOApprovalPanel
          form={form}
          currentUser={currentUser}
          onApprove={(formId, role, comments, signatureUrl) => {
            const updatedApprovals = form.approvals.map((app) => {
              if (app.role === role) {
                return {
                  ...app,
                  status: 'approved' as const,
                  approver_id: currentUser.id,
                  approver_name: currentUser.full_name,
                  approver_position: currentUser.position || currentUser.role,
                  comments: comments || 'Approved',
                  signature_url: signatureUrl || currentUser.signature_url || '',
                  action_timestamp: new Date().toISOString(),
                };
              }
              return app;
            });

            let nextStatus: any = 'approved';
            let nextApproverRole: any = null;
            if (role === 'safety_quality') {
              nextStatus = 'pending_document_controller';
              nextApproverRole = 'document_controller';
            } else if (role === 'document_controller') {
              nextStatus = 'pending_engineering';
              nextApproverRole = 'engineering';
            } else if (role === 'engineering') {
              nextStatus = 'pending_management';
              nextApproverRole = 'management';
            } else if (role === 'management') {
              nextStatus = 'approved';
              nextApproverRole = null;
            }

            setForm((prev) => ({
              ...prev,
              current_status: nextStatus,
              current_approver_role: nextApproverRole,
              returned_by_role: null,
              return_reason: null,
              approvals: updatedApprovals,
            }));

            onApprove(formId, role, comments, signatureUrl);
            setIsApprovalPanelOpen(false);
          }}
          onReturn={(formId, role, comments) => {
            const updatedApprovals = form.approvals.map((app) => {
              if (app.role === role) {
                return {
                  ...app,
                  status: 'returned' as const,
                  approver_id: currentUser.id,
                  approver_name: currentUser.full_name,
                  approver_position: currentUser.position || currentUser.role,
                  comments,
                  action_timestamp: new Date().toISOString(),
                };
              }
              return app;
            });

            setForm((prev) => ({
              ...prev,
              current_status: 'returned',
              current_approver_role: null,
              returned_by_role: role,
              return_reason: comments,
              approvals: updatedApprovals,
            }));

            onReturn(formId, role, comments);
            setIsApprovalPanelOpen(false);
          }}
          onClose={() => setIsApprovalPanelOpen(false)}
        />
      )}

      {/* HIDDEN PRINT DOCUMENT */}
      <div className="hidden">
        <SOPdfLayout form={form} />
      </div>
    </div>
  );
};
