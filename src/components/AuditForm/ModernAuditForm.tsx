import React, { useState } from 'react';
import type { StationAudit, PumpReadingItem, FuelType, Station } from '../../types/audit';
import { calculateFuelSectionTotals, formatCurrency, formatNumber, formatMeterReading, DEFAULT_FUEL_PRICES } from '../../lib/calculations';
import { compressImage } from '../../lib/imageCompression';
import { useLanguage } from '../../context/LanguageContext';
import { GlassCard } from '../Common/GlassCard';
import {
  Building,
  Calendar,
  Fuel,
  Banknote,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  PenTool,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Camera,
  Trash2,
  Eye,
  X,
  Loader2,
  PlusCircle,
} from 'lucide-react';

interface Props {
  audit: Partial<StationAudit>;
  items: PumpReadingItem[];
  prices: Record<FuelType, number>;
  selectedStation: Station;
  stations: Station[];
  onItemChange: (
    fuelType: FuelType,
    pumpNo: number,
    field: keyof PumpReadingItem,
    value: number | null
  ) => void;
  onPriceChange: (fuelType: FuelType, newPrice: number) => void;
  onTotalOpeningChange?: (fuelType: FuelType, value: number | null) => void;
  onMetaChange: (field: string, value: any) => void;
  onSignatoryClick: (roleKey: string) => void;
  isReadOnly: boolean;
  isNewAudit?: boolean;
}

export const ModernAuditForm: React.FC<Props> = ({
  audit,
  items,
  prices,
  selectedStation,
  stations,
  onItemChange,
  onPriceChange,
  onTotalOpeningChange,
  onMetaChange,
  onSignatoryClick,
  isReadOnly,
  isNewAudit,
}) => {
  const { t } = useLanguage();

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    PETROL_91: true,
    PETROL_95: true,
    DIESEL: true,
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const handlePosPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentAttachments = audit.atm_pos_attachments || [];
    if (currentAttachments.length >= 3) {
      alert('Maximum of 3 photo attachments allowed for ATM POS Terminal Sales.');
      return;
    }

    const file = files[0];
    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file, 1200, 0.75);
      const updated = [...currentAttachments, compressedDataUrl];
      onMetaChange('atm_pos_attachments', updated);
    } catch (err) {
      console.error('Failed to compress POS photo attachment:', err);
      alert('Could not process photo attachment. Please try again.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemovePosPhoto = (indexToRemove: number) => {
    const currentAttachments = audit.atm_pos_attachments || [];
    const updated = currentAttachments.filter((_, idx) => idx !== indexToRemove);
    onMetaChange('atm_pos_attachments', updated);
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const effectivePrices: Record<FuelType, number> = {
    PETROL_91:
      prices?.PETROL_91 ||
      audit.p91_price ||
      items.find((i) => i.fuel_type === 'PETROL_91' && i.price != null && i.price > 0)?.price ||
      DEFAULT_FUEL_PRICES.PETROL_91,
    PETROL_95:
      prices?.PETROL_95 ||
      audit.p95_price ||
      items.find((i) => i.fuel_type === 'PETROL_95' && i.price != null && i.price > 0)?.price ||
      DEFAULT_FUEL_PRICES.PETROL_95,
    DIESEL:
      prices?.DIESEL ||
      audit.diesel_price ||
      items.find((i) => i.fuel_type === 'DIESEL' && i.price != null && i.price > 0)?.price ||
      DEFAULT_FUEL_PRICES.DIESEL,
  };

  const p91Totals = calculateFuelSectionTotals(items, 'PETROL_91', effectivePrices.PETROL_91);
  const p95Totals = calculateFuelSectionTotals(items, 'PETROL_95', effectivePrices.PETROL_95);
  const dieselTotals = calculateFuelSectionTotals(items, 'DIESEL', effectivePrices.DIESEL);

  const grandTotalSales = p91Totals.total_sales + p95Totals.total_sales + dieselTotals.total_sales;
  const noorKhoyVal = audit.noor_khoy_amount || 0;
  const atmVal = audit.atm_amount || 0;
  const expectedCash = Math.max(0, grandTotalSales - noorKhoyVal - atmVal);
  const cashReceivedVal = audit.cash_received_amount;
  const discrepancyVal = cashReceivedVal != null ? cashReceivedVal - expectedCash : 0;

  const getFuelItems = (fuelType: FuelType) =>
    items.filter((i) => i.fuel_type === fuelType).sort((a, b) => a.pump_no - b.pump_no);

  const approvals = audit.approvals || [];
  const getApproval = (role: string) => approvals.find((a) => a.role === role);

  // Determine if this is a new audit creation vs existing saved audit
  const isCreatingNewAudit = isNewAudit ?? (!audit.id || audit.audit_number === 'NEW AUDIT');

  return (
    <div className="space-y-3.5 sm:space-y-4">
      
      {/* 1. AUDIT & STATION METADATA CARD (ALWAYS DISPLAYED WITH ADAPTIVE LABELS) */}
      <div className="bg-white border border-slate-200 p-4 sm:p-4.5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg border border-sky-200">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{t('auditForm.auditInfoTitle')}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Station Field */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-0.5 flex items-center gap-1">
              <Building className="w-3 h-3 text-sky-600" />
              <span>{isCreatingNewAudit ? t('auditForm.selectStation') : t('auditForm.stationLabel')}</span>
            </label>
            {isCreatingNewAudit && !isReadOnly ? (
              <select
                value={selectedStation.id}
                onChange={(e) => onMetaChange('station_id', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-xs"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id} className="text-slate-900">
                    {st.station_no ? `${st.station_no} – ${st.name}` : st.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-slate-100/80 border border-slate-300/90 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 min-h-[36px] flex items-center shadow-2xs">
                {selectedStation.station_no ? `${selectedStation.station_no} - ` : ''}{selectedStation.name}
              </div>
            )}
          </div>

          {/* Audit Date Field (Read-only, automatically set to today's date for new audits) */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-600" />
              <span>{t('auditForm.auditDate')}</span>
            </label>
            <div className="w-full bg-slate-100/80 border border-slate-300/90 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 min-h-[36px] flex items-center font-mono shadow-2xs">
              {audit.audit_date}
            </div>
          </div>

          {/* City / Location */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-0.5">{t('auditForm.cityLocation')}</label>
            <div className="w-full bg-slate-100/70 border border-slate-300/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 min-h-[36px] flex items-center">
              {selectedStation.location || 'Riyadh'}
            </div>
          </div>

          {/* Assigned Supervisor */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-0.5">{t('auditForm.opSupervisor')}</label>
            <div className="w-full bg-slate-100/70 border border-slate-300/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 min-h-[36px] flex items-center font-sans">
              {audit.created_by_name || (selectedStation.operation_supervisor_name && selectedStation.operation_supervisor_name !== 'Unassigned' ? selectedStation.operation_supervisor_name : null) || 'Operation Supervisor'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRICS KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Card 1: Total Sales */}
        <GlassCard variant="blue" className="!p-3.5 sm:!p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black text-sky-950 uppercase tracking-wider">{t('auditForm.grandTotalSales')}</span>
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl border border-sky-200 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-mono">
            {formatCurrency(grandTotalSales)} <span className="text-xs font-bold text-slate-600">{t('common.sar')}</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-600 font-bold">
            {t('auditForm.meteredFuelRevenue')}
          </div>
        </GlassCard>

        {/* Card 2: Actual Cash Received */}
        <GlassCard variant="emerald" className="!p-3.5 sm:!p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">{t('auditForm.cashReceived')}</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 shadow-2xs">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
            {cashReceivedVal != null ? formatCurrency(cashReceivedVal) : '0.00'}{' '}
            <span className="text-xs font-bold text-emerald-700">{t('common.sar')}</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-600 font-bold">
            {t('auditForm.expected')}: <strong className="text-slate-900 font-mono font-black">{formatCurrency(expectedCash)} {t('common.sar')}</strong>
          </div>
        </GlassCard>

        {/* Card 3: Discrepancy / Variance */}
        <GlassCard variant={discrepancyVal < 0 ? 'rose' : discrepancyVal > 0 ? 'emerald' : 'blue'} className="!p-3.5 sm:!p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{t('auditForm.netDiscrepancy')}</span>
            <div
              className={`p-2 rounded-xl border shadow-2xs ${
                discrepancyVal < 0
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : discrepancyVal > 0
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-sky-100 text-sky-700 border-sky-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${
            discrepancyVal < 0 ? 'text-rose-900' : discrepancyVal > 0 ? 'text-emerald-900' : 'text-slate-900'
          }`}>
            {formatCurrency(discrepancyVal)} <span className="text-xs font-bold">{t('common.sar')}</span>
          </div>
          <div className="mt-1.5 text-[10px] font-extrabold">
            {discrepancyVal < 0 ? (
              <span className="text-rose-800 font-black flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" /> {t('auditForm.cashShortage')}
              </span>
            ) : discrepancyVal > 0 ? (
              <span className="text-emerald-800 font-black flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('auditForm.cashSurplus')}
              </span>
            ) : (
              <span className="text-sky-900 font-black flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-sky-600" /> {t('auditForm.balanced')}
              </span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* 3. FINANCIAL COLLECTIONS INPUT CARD */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-4 sm:p-4.5 rounded-2xl shadow-[0_10px_25px_rgba(14,165,233,0.08)] space-y-3">
        <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{t('auditForm.collectionsTitle')}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{t('auditForm.collectionsSub')}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {t('auditForm.realTimeVariance')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Noor Khoy */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-800 mb-0.5">
              {t('auditForm.noorKhoy')}
            </label>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-right text-slate-900 font-mono min-h-[38px] flex items-center justify-end">
                {noorKhoyVal > 0 ? formatCurrency(noorKhoyVal) : '0.00'}
              </div>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.noor_khoy_amount ?? ''}
                onChange={(e) =>
                  onMetaChange('noor_khoy_amount', e.target.value === '' ? null : parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="w-full min-h-[38px] text-sm font-black text-right bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono shadow-2xs"
              />
            )}
          </div>

          {/* ATM POS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold text-slate-800">
                {t('auditForm.atmPos')}
              </label>
              <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                {(audit.atm_pos_attachments || []).length}/3 Photos
              </span>
            </div>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-right text-slate-900 font-mono min-h-[38px] flex items-center justify-end">
                {atmVal > 0 ? formatCurrency(atmVal) : '0.00'}
              </div>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.atm_amount ?? ''}
                onChange={(e) =>
                  onMetaChange('atm_amount', e.target.value === '' ? null : parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="w-full min-h-[38px] text-sm font-black text-right bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono shadow-2xs"
              />
            )}

            {/* ATM POS PHOTO ATTACHMENTS (UP TO 3) */}
            <div className="pt-2 border-t border-slate-100/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-sky-600" />
                  Receipt Photos (Max 3)
                </span>
                {!isReadOnly && (audit.atm_pos_attachments || []).length < 3 && (
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-lg text-[10px] font-black transition-all shadow-2xs">
                    {isCompressing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                        <span>Optimizing...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3 h-3 text-sky-600" />
                        <span>Add Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      disabled={isCompressing}
                      onChange={handlePosPhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Thumbnails Display */}
              <div className="flex flex-wrap items-center gap-2">
                {(audit.atm_pos_attachments || []).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group w-14 h-14 rounded-xl border border-slate-300 overflow-hidden bg-slate-100 shadow-2xs flex-shrink-0"
                  >
                    <img
                      src={imgUrl}
                      alt={`POS Receipt ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedImagePreview(imgUrl)}
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedImagePreview(imgUrl)}
                        className="p-1 bg-white/90 text-slate-900 rounded-full hover:bg-white transition-all shadow-2xs"
                        title="Preview Photo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemovePosPhoto(idx)}
                          className="p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all shadow-2xs"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {(audit.atm_pos_attachments || []).length === 0 && (
                  <span className="text-[10px] text-slate-400 font-bold italic">No POS receipt photos attached</span>
                )}
              </div>
            </div>
          </div>

          {/* Actual Cash Received */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-800 mb-0.5">
              {t('auditForm.cashReceivedInput')}
            </label>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-right text-slate-900 font-mono min-h-[38px] flex items-center justify-end">
                {cashReceivedVal != null ? formatCurrency(cashReceivedVal) : '0.00'}
              </div>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.cash_received_amount ?? ''}
                onChange={(e) =>
                  onMetaChange('cash_received_amount', e.target.value === '' ? null : parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="w-full min-h-[38px] text-sm font-black text-right bg-white border-2 border-emerald-500 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-2xs"
              />
            )}
          </div>
        </div>

        {/* Total Collections — auto-sum of Noor Khoy + ATM + Cash in Form */}
        <div className="pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-emerald-50 border border-sky-400/60 rounded-xl px-4 py-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-500/10 text-sky-600 rounded-lg border border-sky-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">{t('auditForm.totalCollections')}</p>
                <p className="text-[10px] text-slate-400 font-medium">{t('auditForm.totalCollectionsFormula')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-sky-900 font-mono tracking-tight">
                {formatCurrency(noorKhoyVal + atmVal + (cashReceivedVal ?? 0))}
              </p>
              <p className="text-[10px] font-bold text-sky-600">{t('common.sar')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FUEL METER READINGS SECTIONS (COLOR-CODED HIGH-CONTRAST CARDS BY FUEL TYPE) */}
      {([
        {
          key: 'PETROL_91',
          title: t('auditForm.petrol91'),
          colorClass: 'bg-emerald-600 text-white',
          cardClass: 'bg-white border border-emerald-300 shadow-sm rounded-2xl overflow-hidden',
          headerBg: 'bg-emerald-50/90 text-slate-900 border-b border-emerald-200',
          textColor: 'text-emerald-900',
          totals: p91Totals,
          price: effectivePrices.PETROL_91,
        },
        {
          key: 'PETROL_95',
          title: t('auditForm.petrol95'),
          colorClass: 'bg-rose-600 text-white',
          cardClass: 'bg-white border border-rose-300 shadow-sm rounded-2xl overflow-hidden',
          headerBg: 'bg-rose-50/90 text-slate-900 border-b border-rose-200',
          textColor: 'text-rose-900',
          totals: p95Totals,
          price: effectivePrices.PETROL_95,
        },
        {
          key: 'DIESEL',
          title: t('auditForm.diesel'),
          colorClass: 'bg-amber-600 text-white',
          cardClass: 'bg-amber-300/60 border border-amber-300 shadow-sm rounded-2xl overflow-hidden',
          headerBg: 'bg-amber-50/90 text-slate-900 border-b border-amber-200',
          textColor: 'text-amber-900',
          totals: dieselTotals,
          price: effectivePrices.DIESEL,
        },
      ] as const).map((sec) => {
        const fuelType = sec.key as FuelType;
        const fuelItems = getFuelItems(fuelType);
        const isCollapsed = collapsedSections[fuelType];

        return (
          <div
            key={fuelType}
            className={`transition-all ${sec.cardClass}`}
          >
            {/* Section Header Bar (Collapsible Accordion Header) */}
            <div
              onClick={() => toggleSection(fuelType)}
              className={`p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer select-none transition-all hover:brightness-95 ${sec.headerBg}`}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Accordion Expand/Collapse Indicator Icon */}
                <div className="p-1 bg-white border border-slate-200 text-slate-800 rounded-lg shadow-2xs flex items-center justify-center">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Fuel Type Title */}
                <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-2xs ${sec.colorClass}`}>
                  {sec.title}
                </div>

                {/* Fuel Price Tag */}
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-[11px] font-extrabold text-slate-900" onClick={(e) => e.stopPropagation()}>
                  <span className="text-slate-600 font-bold">{t('auditForm.unitPrice')}:</span>
                  {isReadOnly ? (
                    <span className="font-mono text-slate-900 font-black">{sec.price.toFixed(2)} SAR/Liter</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={sec.price}
                        onChange={(e) => onPriceChange(fuelType, parseFloat(e.target.value) || 0)}
                        className="w-14 text-xs font-black text-center bg-slate-50 border-b border-sky-500 focus:outline-none font-mono text-slate-900"
                      />
                      <span className="text-[10px] text-slate-600 font-bold">SAR/Liter</span>
                    </div>
                  )}
                </div>

                {/* Pump Count Badge */}
                <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-black text-slate-800 shadow-2xs flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-sky-600" />
                  <span>{fuelItems.filter((i) => i.pump_no !== 15).length} Pumps</span>
                </div>
              </div>

              {/* Section Totals & Summary */}
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-600 uppercase tracking-wider">{t('auditForm.quantitySold')}</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-slate-900">{formatNumber(sec.totals.total_quantity)} L</span>
                </div>

                <div className="text-right bg-white px-3 py-1 rounded-lg border border-slate-200 font-mono shadow-2xs">
                  <span className="block text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">{t('auditForm.fuelSalesSummary')}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900">{formatCurrency(sec.totals.total_sales)} SAR</span>
                </div>
              </div>
            </div>

            {/* Meter Reading Section Body */}
            {!isCollapsed && (
              <>
                {/* 1. MOBILE RESPONSIVE STACKED CARDS (VISIBLE ON Android & Mobile, HIDDEN ON Desktop md:hidden) */}
                <div className="block md:hidden p-3.5 space-y-3.5">
                  {fuelItems
                    .filter((item) => item.pump_no !== 15)
                    .map((item) => {
                      const qty = item.quantity_sold != null && item.quantity_sold > 0 ? item.quantity_sold : 0;
                      const amt = item.amount != null && item.amount > 0 ? item.amount : 0;

                      return (
                        <div
                          key={item.pump_no}
                          className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3"
                        >
                          {/* Pump Number Badge & Quantities/Totals */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono shadow-xs ${sec.colorClass}`}>
                                {t('auditForm.pumpNo')} {item.pump_no}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-extrabold font-mono">
                              <span className="bg-sky-50 text-sky-800 border border-sky-200/70 px-2.5 py-1 rounded-lg">
                                {formatNumber(qty)} L
                              </span>
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
                                {formatCurrency(amt)} {t('common.sar')}
                              </span>
                            </div>
                          </div>

                          {/* Inputs Grid */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            {/* Opening Reading */}
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                                {t('auditForm.openingReading')}
                              </label>
                              {isReadOnly ? (
                                <div className="w-full min-h-[44px] bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-black text-end text-slate-900 font-mono flex items-center justify-end">
                                  {item.start_reading != null ? formatMeterReading(item.start_reading) : '0'}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  step="0.01"
                                  inputMode="decimal"
                                  value={item.start_reading ?? ''}
                                  onChange={(e) =>
                                    onItemChange(
                                      fuelType,
                                      item.pump_no,
                                      'start_reading',
                                      e.target.value === '' ? null : parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full min-h-[44px] text-base font-black text-end bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono shadow-xs"
                                />
                              )}
                            </div>

                            {/* Closing Reading */}
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                                {t('auditForm.closingReading')}
                              </label>
                              {isReadOnly ? (
                                <div className="w-full min-h-[44px] bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-black text-end text-slate-900 font-mono flex items-center justify-end">
                                  {item.end_reading != null ? formatMeterReading(item.end_reading) : '0'}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  step="0.01"
                                  inputMode="decimal"
                                  value={item.end_reading ?? ''}
                                  onChange={(e) =>
                                    onItemChange(
                                      fuelType,
                                      item.pump_no,
                                      'end_reading',
                                      e.target.value === '' ? null : parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full min-h-[44px] text-base font-black text-end bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono shadow-xs"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Section Total Summary Card for Mobile */}
                  {(() => {
                    const totalItem = fuelItems.find((i) => i.pump_no === 15);
                    const totalOpening = totalItem?.start_reading ?? sec.totals.total_opening_reading;
                    const totalClosing = totalItem?.end_reading ?? sec.totals.final_closing_reading;
                    const totalQty = totalItem?.quantity_sold ?? sec.totals.total_quantity;
                    const totalSales = totalItem?.amount ?? sec.totals.total_sales;

                    return (
                      <div className="p-4 bg-gradient-to-r from-blue-50/90 via-sky-50/90 to-emerald-50/90 border-2 border-blue-300/80 rounded-2xl flex flex-col space-y-3 text-xs font-black shadow-md">
                        <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1 rounded-xl text-xs font-black font-sans uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                              Total
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 font-sans">
                              (Summary Row)
                            </span>
                          </div>
                          <div className="text-[11px] font-extrabold text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                            Price: <strong className="font-mono text-slate-900">SAR {sec.price.toFixed(2)}/L</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('auditForm.openingReading')} (Manual Entry)
                            </label>
                            {isReadOnly ? (
                              <div className="w-full min-h-[40px] bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-end text-slate-900 font-mono flex items-center justify-end">
                                {totalOpening != null ? formatMeterReading(totalOpening) : '-'}
                              </div>
                            ) : (
                              <input
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9.]*"
                                value={totalOpening ?? ''}
                                onClick={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === '') {
                                    onItemChange(fuelType, 15, 'start_reading', null);
                                    if (onTotalOpeningChange) onTotalOpeningChange(fuelType, null);
                                    return;
                                  }
                                  if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
                                    const parsed = parseFloat(raw);
                                    const val = isNaN(parsed) ? null : parsed;
                                    onItemChange(fuelType, 15, 'start_reading', val);
                                    if (onTotalOpeningChange) onTotalOpeningChange(fuelType, val);
                                  }
                                }}
                                placeholder="Manual Entry"
                                className="w-full min-h-[48px] text-base font-black text-end bg-yellow-50 border-2 border-amber-300/80 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 font-mono shadow-xs touch-manipulation relative z-10 cursor-text"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('auditForm.closingReading')} (Auto Calculated)
                            </label>
                            <div className="w-full min-h-[44px] bg-blue-100/90 border border-blue-300 rounded-xl px-3 py-2 text-sm font-black text-end text-blue-950 font-mono flex items-center justify-end">
                              {totalClosing != null ? formatMeterReading(totalClosing) : '-'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 font-mono text-xs">
                          <span className="text-sky-900 font-black">
                            Sold: {totalQty != null ? `${formatNumber(totalQty)} L` : '-'}
                          </span>
                          <span className="text-emerald-900 font-black">
                            Sales: {totalSales != null ? `${formatCurrency(totalSales)} SAR` : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. DESKTOP GRID TABLE (HIGH-CONTRAST SOLID WHITE TYPOGRAPHY & DATA ROW STYLING) */}
                <div className="hidden md:block overflow-x-auto p-4 sm:p-5">
                  <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-extrabold uppercase text-[11px] border-b border-slate-200">
                        <th className="p-3.5 w-24 text-center">{t('auditForm.pumpNo')}</th>
                        <th className="p-3.5">{t('auditForm.openingReading')}</th>
                        <th className="p-3.5">{t('auditForm.closingReading')}</th>
                        <th className="p-3.5 text-right">{t('auditForm.quantitySold')} (L)</th>
                        <th className="p-3.5 text-center">{t('auditForm.unitPrice')}</th>
                        <th className="p-3.5 text-right">{t('auditForm.totalAmount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-900 font-medium">
                      {fuelItems.map((item, index) => {
                        const isTotalRow = item.pump_no === 15;
                        return (
                          <tr
                            key={item.pump_no}
                            className={
                              isTotalRow
                                ? 'bg-sky-50/90 font-black border-y-2 border-sky-300 text-slate-900'
                                : 'hover:bg-slate-50 transition-all'
                            }
                          >
                            <td className="p-3 text-center font-extrabold font-mono text-slate-900 text-xs">
                              {isTotalRow ? (
                                <span className="font-extrabold text-sky-900 font-sans uppercase text-xs tracking-wider">Total</span>
                              ) : (
                                `Pump ${item.pump_no}`
                              )}
                            </td>
                            <td className="p-3">
                              {isReadOnly ? (
                                <span className="font-mono font-black text-slate-900 text-xs">
                                  {item.start_reading != null ? formatMeterReading(item.start_reading) : '-'}
                                </span>
                              ) : (
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  pattern="[0-9.]*"
                                  value={item.start_reading ?? ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === '') {
                                      onItemChange(fuelType, item.pump_no, 'start_reading', null);
                                      return;
                                    }
                                    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
                                      const parsed = parseFloat(raw);
                                      onItemChange(
                                        fuelType,
                                        item.pump_no,
                                        'start_reading',
                                        isNaN(parsed) ? null : parsed
                                      );
                                    }
                                  }}
                                  placeholder={isTotalRow ? 'Manual Entry' : '0.00'}
                                  className={
                                    isTotalRow
                                      ? 'w-full text-xs font-black text-slate-900 bg-amber-100 border-2 border-amber-400 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-amber-500 font-mono shadow-2xs touch-manipulation cursor-text'
                                      : 'w-full min-h-[38px] text-xs font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono touch-manipulation cursor-text placeholder:text-slate-400 shadow-2xs'
                                  }
                                />
                              )}
                            </td>
                            <td className="p-3">
                              {isTotalRow ? (
                                <span className="font-mono font-black text-sky-900 text-xs">
                                  {item.end_reading != null ? formatMeterReading(item.end_reading) : '-'}
                                </span>
                              ) : isReadOnly ? (
                                <span className="font-mono font-black text-slate-900 text-xs">
                                  {item.end_reading != null ? formatMeterReading(item.end_reading) : '-'}
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  step="0.01"
                                  inputMode="decimal"
                                  value={item.end_reading ?? ''}
                                  onChange={(e) =>
                                    onItemChange(
                                      fuelType,
                                      item.pump_no,
                                      'end_reading',
                                      e.target.value === '' ? null : parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full min-h-[38px] text-xs font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono placeholder:text-slate-400 shadow-2xs"
                                />
                              )}
                            </td>
                            <td className="p-3 text-right font-black font-mono">
                              {isTotalRow ? (
                                <span className="text-sky-900 font-black text-xs">
                                  {item.quantity_sold != null ? `${formatNumber(item.quantity_sold)} L` : '-'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold text-center block">-</span>
                              )}
                            </td>
                            {index === 0 && (
                              <td
                                rowSpan={fuelItems.length}
                                className="p-3 text-center align-middle font-black font-mono bg-sky-50/70 border-x border-slate-200"
                              >
                                <span className="text-xs font-black text-sky-900">SAR {sec.price.toFixed(2)}</span>
                                <span className="block text-[10px] text-slate-500 font-sans font-bold mt-1">
                                  Shared Unit Price
                                </span>
                              </td>
                            )}
                            <td className="p-3 text-right font-black font-mono">
                              {isTotalRow ? (
                                <span className="text-emerald-800 font-black text-xs">
                                  {item.amount != null ? `${formatCurrency(item.amount)} SAR` : '-'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold text-center block">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        );
      })}

      {/* 4.5 NOTES, REMARKS & SHORTAGE LIABILITY DETAILS CARD */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-[28px] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Notes / Remarks & Shortage Liability Details</h3>
              <p className="text-xs text-slate-500 font-medium">Record audit observations, responsible personnel, and shortage details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Person Responsible for Shortage */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Person Responsible for Shortage
            </label>
            {isReadOnly ? (
              <div className="w-full min-h-[42px] bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 flex items-center">
                {audit.person_responsible_for_shortage || 'N/A (No Shortage Assigned)'}
              </div>
            ) : (
              <input
                type="text"
                value={audit.person_responsible_for_shortage || ''}
                onChange={(e) => onMetaChange && onMetaChange('person_responsible_for_shortage', e.target.value)}
                placeholder="e.g. Ahmed Ali (Station Supervisor / Cashier)"
                className="w-full min-h-[42px] text-xs font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs placeholder:text-slate-400 font-sans"
              />
            )}
          </div>

          {/* Shortage Amount (SAR) */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Shortage Amount (SAR)
            </label>
            {isReadOnly ? (
              <div className="w-full min-h-[42px] bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 font-mono flex items-center">
                {audit.shortage_amount != null ? `${formatCurrency(audit.shortage_amount)} SAR` : '0.00 SAR'}
              </div>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.shortage_amount ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseFloat(e.target.value) || 0;
                  onMetaChange && onMetaChange('shortage_amount', val);
                }}
                placeholder="0.00"
                className="w-full min-h-[42px] text-xs font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs font-mono placeholder:text-slate-400"
              />
            )}
          </div>
        </div>

        {/* Free-Text Audit Notes & Remarks */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
            Notes / Remarks & Observations
          </label>
          {isReadOnly ? (
            <div className="w-full min-h-[80px] bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-semibold text-slate-900 whitespace-pre-wrap leading-relaxed">
              {audit.notes || 'No additional notes or observations recorded.'}
            </div>
          ) : (
            <textarea
              rows={3}
              value={audit.notes || ''}
              onChange={(e) => onMetaChange && onMetaChange('notes', e.target.value)}
              placeholder="Enter detailed audit notes, physical station observations, or discrepancy explanation..."
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs placeholder:text-slate-400 leading-relaxed font-sans"
            />
          )}
        </div>
      </div>

      {/* 5. SIGNATORY AUTHORIZATION CARDS (6 SEQUENTIAL STAGES) */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-5 sm:p-6 rounded-[28px] shadow-[0_15px_35px_rgba(14,165,233,0.10)] space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Signatory Authorization & Governance Chain</h3>
              <p className="text-xs text-slate-500 font-medium">Sequential digital signatures, audit trail codes, and approval timestamps</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {(() => {
            const superAdminApp = getApproval('super_admin');
            const hasSuperAdminAction = Boolean(superAdminApp && (superAdminApp.approver_name || superAdminApp.signature_url || superAdminApp.status === 'approved'));

            const stages = [
              {
                key: 'station_supervisor',
                title: 'Station Supervisor',
                name: audit.station_supervisor_name,
                position: 'On-Site Supervisor',
                sig: audit.station_supervisor_signature_url,
                code: undefined,
                time: audit.audit_date,
                status: audit.station_supervisor_signature_url ? 'approved' : 'pending',
              },
              {
                key: 'operation_supervisor',
                title: 'Operation Supervisor',
                name: audit.created_by_name || (selectedStation.operation_supervisor_name && selectedStation.operation_supervisor_name !== 'Unassigned' ? selectedStation.operation_supervisor_name : null) || 'Operation Supervisor',
                position: 'Operations Supervisor',
                sig: audit.operation_supervisor_signature_url,
                code: undefined,
                time: audit.audit_date,
                status: audit.operation_supervisor_signature_url ? 'approved' : 'pending',
              },
              {
                key: 'accountant',
                title: 'Accountant',
                name: getApproval('accountant')?.approver_name,
                position: getApproval('accountant')?.approver_position || 'Station Accountant',
                sig: getApproval('accountant')?.signature_url,
                code: getApproval('accountant')?.digital_signature_code,
                time: getApproval('accountant')?.action_timestamp,
                status: getApproval('accountant')?.status || 'pending',
              },
              {
                key: 'account_manager',
                title: 'Account Manager',
                name: getApproval('account_manager')?.approver_name,
                position: getApproval('account_manager')?.approver_position || 'Senior Account Manager',
                sig: getApproval('account_manager')?.signature_url,
                code: getApproval('account_manager')?.digital_signature_code,
                time: getApproval('account_manager')?.action_timestamp,
                status: getApproval('account_manager')?.status || 'pending',
              },
              {
                key: 'management',
                title: 'Executive Management',
                name: getApproval('management')?.approver_name,
                position: getApproval('management')?.approver_position || 'Executive Director',
                sig: getApproval('management')?.signature_url,
                code: getApproval('management')?.digital_signature_code,
                time: getApproval('management')?.action_timestamp,
                status: getApproval('management')?.status || 'pending',
              },
            ];

            if (hasSuperAdminAction) {
              stages.push({
                key: 'super_admin',
                title: 'Super Admin',
                name: superAdminApp?.approver_name,
                position: superAdminApp?.approver_position || 'System Super Admin',
                sig: superAdminApp?.signature_url,
                code: superAdminApp?.digital_signature_code,
                time: superAdminApp?.action_timestamp,
                status: superAdminApp?.status || 'approved',
              });
            }

            return stages.map((sigBox) => {
              const isApproved = sigBox.status === 'approved';
              const isRejected = sigBox.status === 'rejected';
              const isSkipped = sigBox.status === 'skipped' || sigBox.status === 'bypassed';

              return (
                <div
                  key={sigBox.key}
                  onClick={() => !isSkipped && onSignatoryClick(sigBox.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] relative ${
                    isApproved
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-sm hover:shadow-md'
                      : isSkipped
                      ? 'bg-slate-100/80 border-slate-300 shadow-xs'
                      : isRejected
                      ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                      : 'bg-white/80 border-slate-200/90 hover:border-sky-300 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 border-b border-slate-200/60 pb-1">
                      <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider truncate">
                        {sigBox.title}
                      </span>
                      {!isApproved && !isSkipped && !isReadOnly && <PenTool className="w-3 h-3 text-sky-600 no-print" />}
                    </div>

                    <span className="text-xs font-black text-slate-900 block truncate">
                      {isApproved
                        ? sigBox.name
                        : isSkipped
                        ? 'Bypassed by Override'
                        : sigBox.name || 'Pending Approval'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block truncate">
                      {sigBox.position}
                    </span>
                  </div>

                  <div className="my-2">
                    {isSkipped ? (
                      <div className="h-9 my-1 flex items-center justify-center bg-slate-200/50 rounded-lg p-1 border border-slate-300/60 text-[10px] font-bold text-slate-600">
                        No Signature
                      </div>
                    ) : sigBox.sig ? (
                      <div className="h-9 my-1 flex items-center justify-center bg-white/60 rounded-lg p-1 border border-slate-200/60">
                        <img src={sigBox.sig} alt="Signature" className="max-h-full object-contain mx-auto" />
                      </div>
                    ) : null}

                    {sigBox.code && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100/70 border border-emerald-300 rounded text-[9px] font-mono font-bold text-emerald-800">
                        <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{sigBox.code}</span>
                      </div>
                    )}

                    {sigBox.time && (
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">
                        {new Date(sigBox.time).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    {isApproved ? (
                      <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Approved
                      </span>
                    ) : isSkipped ? (
                      <span className="text-[10px] font-black text-slate-600 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Bypassed
                      </span>
                    ) : isRejected ? (
                      <span className="text-[10px] font-black text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Rejected
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-sky-500 shrink-0" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL PREVIEW FOR POS ATTACHMENTS */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-600" />
                ATM POS Terminal Sales Receipt Attachment
              </span>
              <button
                type="button"
                onClick={() => setSelectedImagePreview(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-300 rounded-xl transition-all"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 flex items-center justify-center bg-slate-950 rounded-b-xl overflow-auto max-h-[78vh]">
              <img
                src={selectedImagePreview}
                alt="ATM POS Attachment Full Preview"
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
