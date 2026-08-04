import React, { useState } from 'react';
import type { StationAudit, PumpReadingItem, FuelType, Station } from '../../types/audit';
import { calculateFuelSectionTotals, formatCurrency, formatNumber, formatMeterReading } from '../../lib/calculations';
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
}) => {
  const { t } = useLanguage();

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    PETROL_91: true,
    PETROL_95: true,
    DIESEL: true,
  });

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const p91Totals = calculateFuelSectionTotals(items, 'PETROL_91', prices.PETROL_91);
  const p95Totals = calculateFuelSectionTotals(items, 'PETROL_95', prices.PETROL_95);
  const dieselTotals = calculateFuelSectionTotals(items, 'DIESEL', prices.DIESEL);

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

  return (
    <div className="space-y-6">
      
      {/* 1. AUDIT & STATION METADATA CARD */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-5 sm:p-6 rounded-[28px] shadow-[0_15px_35px_rgba(14,165,233,0.10)] space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{t('auditForm.auditInfoTitle')}</h3>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            {audit.audit_number || 'NEW AUDIT'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Station Selection Dropdown */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-600" />
              <span>{t('auditForm.selectStation')}</span>
            </label>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 min-h-[44px] flex items-center">
                {selectedStation.station_no} - {selectedStation.name}
              </div>
            ) : (
              <select
                value={selectedStation.id}
                onChange={(e) => onMetaChange('station_id', e.target.value)}
                className="w-full bg-white/90 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm min-h-[44px]"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.station_no} - {s.name} ({s.location})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Audit Date Picker */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>{t('auditForm.auditDate')}</span>
            </label>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 min-h-[44px] flex items-center font-mono">
                {audit.audit_date}
              </div>
            ) : (
              <input
                type="date"
                value={audit.audit_date || ''}
                onChange={(e) => onMetaChange('audit_date', e.target.value)}
                className="w-full bg-white/90 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm min-h-[44px]"
              />
            )}
          </div>

          {/* City / Location */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('auditForm.cityLocation')}</label>
            <div className="w-full bg-slate-100/70 border border-slate-300/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 min-h-[44px] flex items-center">
              {selectedStation.location || 'Riyadh'}
            </div>
          </div>

          {/* Assigned Supervisor */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">{t('auditForm.opSupervisor')}</label>
            <div className="w-full bg-slate-100/70 border border-slate-300/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 min-h-[44px] flex items-center font-sans">
              {audit.created_by_name || (selectedStation.operation_supervisor_name && selectedStation.operation_supervisor_name !== 'Unassigned' ? selectedStation.operation_supervisor_name : null) || 'Operation Supervisor'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRICS KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Sales */}
        <GlassCard variant="blue">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-sky-100 uppercase tracking-wider drop-shadow-sm">{t('auditForm.grandTotalSales')}</span>
            <div className="p-3 bg-sky-500/20 backdrop-blur-xl rounded-2xl border border-sky-400/30 text-cyan-300 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono drop-shadow-md">
            {formatCurrency(grandTotalSales)} <span className="text-xs font-normal text-sky-200">{t('common.sar')}</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-200/90 font-bold drop-shadow-sm">
            {t('auditForm.meteredFuelRevenue')}
          </div>
        </GlassCard>

        {/* Card 2: Actual Cash Received */}
        <GlassCard variant="emerald">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider drop-shadow-sm">{t('auditForm.cashReceived')}</span>
            <div className="p-3 bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 text-emerald-300 shadow-sm">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono drop-shadow-md">
            {cashReceivedVal != null ? formatCurrency(cashReceivedVal) : '0.00'}{' '}
            <span className="text-xs font-normal text-emerald-200">{t('common.sar')}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-200/90 font-bold drop-shadow-sm">
            {t('auditForm.expected')}: <strong className="text-white font-mono">{formatCurrency(expectedCash)} {t('common.sar')}</strong>
          </div>
        </GlassCard>

        {/* Card 3: Discrepancy / Variance */}
        <GlassCard variant={discrepancyVal < 0 ? 'rose' : discrepancyVal > 0 ? 'emerald' : 'blue'}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider drop-shadow-sm">{t('auditForm.netDiscrepancy')}</span>
            <div
              className={`p-3 rounded-2xl border backdrop-blur-xl shadow-sm ${
                discrepancyVal < 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono drop-shadow-md ${
            discrepancyVal < 0 ? 'text-rose-300' : discrepancyVal > 0 ? 'text-emerald-300' : 'text-white'
          }`}>
            {formatCurrency(discrepancyVal)} <span className="text-xs font-normal">{t('common.sar')}</span>
          </div>
          <div className="mt-2 text-[11px] font-extrabold drop-shadow-sm">
            {discrepancyVal < 0 ? (
              <span className="text-rose-300 font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {t('auditForm.cashShortage')}
              </span>
            ) : discrepancyVal > 0 ? (
              <span className="text-emerald-300 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('auditForm.surplus')}
              </span>
            ) : (
              <span className="text-sky-200 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" /> {t('auditForm.balanced')}
              </span>
            )}
          </div>
        </GlassCard>

        {/* Card 4: Fuel Types Quick Breakdown */}
        <GlassCard variant="blue" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-sky-100 uppercase tracking-wider drop-shadow-sm">{t('auditForm.fuelSalesSummary')}</span>
            <div className="p-2.5 bg-sky-500/20 backdrop-blur-xl rounded-2xl border border-sky-400/30 text-cyan-300 shadow-sm">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-emerald-500/20 border border-emerald-400/30 p-2 rounded-xl backdrop-blur-md shadow-sm">
              <span className="block text-[10px] font-black text-emerald-300">P91</span>
              <span className="text-xs font-black text-white font-mono">{formatNumber(p91Totals.total_quantity)}L</span>
            </div>
            <div className="bg-amber-500/20 border border-amber-400/30 p-2 rounded-xl backdrop-blur-md shadow-sm">
              <span className="block text-[10px] font-black text-amber-300">P95</span>
              <span className="text-xs font-black text-white font-mono">{formatNumber(p95Totals.total_quantity)}L</span>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-400/30 p-2 rounded-xl backdrop-blur-md shadow-sm">
              <span className="block text-[10px] font-black text-yellow-300">DSL</span>
              <span className="text-xs font-black text-white font-mono">{formatNumber(dieselTotals.total_quantity)}L</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 3. FINANCIAL COLLECTIONS INPUT CARD */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/90 p-5 sm:p-6 rounded-[28px] shadow-[0_15px_35px_rgba(14,165,233,0.10)] space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{t('auditForm.collectionsTitle')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('auditForm.collectionsSub')}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('auditForm.realTimeVariance')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Noor Khoy */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              {t('auditForm.noorKhoy')}
            </label>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-black text-right text-slate-900 font-mono min-h-[48px] flex items-center justify-end">
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
                className="w-full min-h-[48px] text-base font-black text-right bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono shadow-sm"
              />
            )}
          </div>

          {/* ATM POS */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              {t('auditForm.atmPos')}
            </label>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-black text-right text-slate-900 font-mono min-h-[48px] flex items-center justify-end">
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
                className="w-full min-h-[48px] text-base font-black text-right bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono shadow-sm"
              />
            )}
          </div>

          {/* Actual Cash Received */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              {t('auditForm.cashReceivedInput')}
            </label>
            {isReadOnly ? (
              <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-black text-right text-slate-900 font-mono min-h-[48px] flex items-center justify-end">
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
                className="w-full min-h-[48px] text-base font-black text-right bg-white border-2 border-emerald-500 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-sm"
              />
            )}
          </div>
        </div>

        {/* Total Collections — auto-sum of Noor Khoy + ATM + Cash in Form */}
        <div className="pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-emerald-50 border-2 border-sky-400/60 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">{t('auditForm.totalCollections')}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t('auditForm.totalCollectionsFormula')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-sky-900 font-mono tracking-tight">
                {formatCurrency(noorKhoyVal + atmVal + (cashReceivedVal ?? 0))}
              </p>
              <p className="text-[10px] font-bold text-sky-600 mt-0.5">{t('common.sar')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FUEL METER READINGS SECTIONS */}
      {([
        {
          key: 'PETROL_91',
          title: t('auditForm.petrol91'),
          colorClass: 'bg-emerald-600 text-white',
          headerBg: 'bg-emerald-500/10 text-emerald-900 border-emerald-500/20',
          totals: p91Totals,
          price: prices.PETROL_91,
        },
        {
          key: 'PETROL_95',
          title: t('auditForm.petrol95'),
          colorClass: 'bg-amber-600 text-white',
          headerBg: 'bg-amber-500/10 text-amber-900 border-amber-500/20',
          totals: p95Totals,
          price: prices.PETROL_95,
        },
        {
          key: 'DIESEL',
          title: t('auditForm.diesel'),
          colorClass: 'bg-yellow-600 text-white',
          headerBg: 'bg-yellow-500/10 text-yellow-900 border-yellow-500/20',
          totals: dieselTotals,
          price: prices.DIESEL,
        },
      ] as const).map((sec) => {
        const fuelType = sec.key as FuelType;
        const fuelItems = getFuelItems(fuelType);
        const isCollapsed = collapsedSections[fuelType];

        return (
          <div
            key={fuelType}
            className="bg-white/60 backdrop-blur-2xl border border-white/90 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.12)] transition-all"
          >
            {/* Section Header Bar (Collapsible Accordion Header) */}
            <div
              onClick={() => toggleSection(fuelType)}
              className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b cursor-pointer select-none transition-colors hover:brightness-95 ${sec.headerBg}`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/* Accordion Expand/Collapse Indicator Icon */}
                <div className="p-1.5 bg-white/90 text-slate-800 rounded-xl shadow-xs flex items-center justify-center">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Fuel Type Title */}
                <div className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs ${sec.colorClass}`}>
                  {sec.title}
                </div>

                {/* Fuel Price Tag */}
                <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-300/80 shadow-xs text-xs font-extrabold text-slate-800" onClick={(e) => e.stopPropagation()}>
                  <span className="text-slate-500 font-bold">{t('auditForm.unitPrice')}:</span>
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
                        className="w-16 text-xs font-black text-center bg-slate-50 border-b border-sky-500 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-500 font-bold">SAR/Liter</span>
                    </div>
                  )}
                </div>

                {/* Pump Count Badge */}
                <div className="bg-white/80 px-2.5 py-1.5 rounded-xl border border-slate-200/90 text-[11px] font-black text-slate-700 shadow-xs flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-sky-600" />
                  <span>{fuelItems.filter((i) => i.pump_no !== 15).length} Pumps</span>
                </div>
              </div>

              {/* Section Totals & Summary */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('auditForm.quantitySold')}</span>
                  <span className="text-xs font-black font-mono text-slate-800">{formatNumber(sec.totals.total_quantity)} L</span>
                </div>

                <div className="text-right bg-white/90 px-3.5 py-1.5 rounded-xl border border-slate-300/80 font-mono shadow-xs">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t('auditForm.fuelSalesSummary')}</span>
                  <span className="text-xs font-black text-sky-900">{formatCurrency(sec.totals.total_sales)} SAR</span>
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
                                {t('auditForm.openingReading')} (L)
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
                                {t('auditForm.closingReading')} (L)
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
                              {totalClosing != null ? `${formatMeterReading(totalClosing)} L` : '-'}
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

                {/* 2. DESKTOP GRID TABLE (HIDDEN ON Mobile, VISIBLE ON Desktop md:block) */}
                <div className="hidden md:block overflow-x-auto p-4 sm:p-5">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
                        <th className="p-3 w-16 text-center">{t('auditForm.pumpNo')}</th>
                        <th className="p-3">{t('auditForm.openingReading')} (L)</th>
                        <th className="p-3">{t('auditForm.closingReading')} (L)</th>
                        <th className="p-3 text-right">{t('auditForm.quantitySold')} (L)</th>
                        <th className="p-3 text-center">{t('auditForm.unitPrice')}</th>
                        <th className="p-3 text-right">{t('auditForm.totalAmount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      {fuelItems.map((item, index) => {
                        const isTotalRow = item.pump_no === 15;
                        return (
                          <tr
                            key={item.pump_no}
                            className={isTotalRow ? 'bg-blue-50/80 font-black border-t-2 border-slate-300' : 'hover:bg-sky-50/50 transition-colors'}
                          >
                            <td className="p-2.5 text-center font-bold font-mono text-slate-900 rounded-l-lg">
                              {isTotalRow ? (
                                <span className="font-extrabold text-blue-950 font-sans uppercase text-xs">Total</span>
                              ) : (
                                `Pump ${item.pump_no}`
                              )}
                            </td>
                            <td className="p-2.5">
                              {isReadOnly ? (
                                <span className="font-mono font-bold text-slate-900">
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
                                  className={isTotalRow ? 'w-full text-xs font-black text-slate-900 bg-yellow-50 border border-amber-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 font-mono shadow-xs touch-manipulation cursor-text' : 'w-full min-h-[40px] text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-sky-500 font-mono touch-manipulation cursor-text'}
                                />
                              )}
                            </td>
                            <td className="p-2.5">
                              {isTotalRow ? (
                                <span className="font-mono font-black text-blue-950">
                                  {item.end_reading != null ? `${formatMeterReading(item.end_reading)} L` : '-'}
                                </span>
                              ) : isReadOnly ? (
                                <span className="font-mono font-bold text-slate-900">
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
                                  className="w-full min-h-[40px] text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-sky-500 font-mono"
                                />
                              )}
                            </td>
                            <td className="p-2.5 text-right font-black font-mono text-slate-900">
                              {isTotalRow ? (
                                <span className="text-sky-900 font-black">
                                  {item.quantity_sold != null ? `${formatNumber(item.quantity_sold)} L` : '-'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold">-</span>
                              )}
                            </td>
                            {index === 0 && (
                              <td
                                rowSpan={fuelItems.length}
                                className="p-3 text-center align-middle font-black font-mono text-slate-800 bg-slate-100/70 border-x border-slate-200"
                              >
                                <span className="text-xs">SAR {sec.price.toFixed(2)}</span>
                                <span className="block text-[10px] text-slate-500 font-sans font-bold mt-0.5">
                                  Shared Unit Price
                                </span>
                              </td>
                            )}
                            <td className="p-2.5 text-right font-black font-mono text-slate-900 rounded-r-lg">
                              {isTotalRow ? (
                                <span className="text-emerald-900 font-black">
                                  {item.amount != null ? `${formatCurrency(item.amount)} SAR` : '-'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold">-</span>
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

              return (
                <div
                  key={sigBox.key}
                  onClick={() => onSignatoryClick(sigBox.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] relative ${
                    isApproved
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-sm hover:shadow-md'
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
                      {!isApproved && !isReadOnly && <PenTool className="w-3 h-3 text-sky-600 no-print" />}
                    </div>

                    <span className="text-xs font-black text-slate-900 block truncate">
                      {sigBox.name || 'Pending Approval'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block truncate">
                      {sigBox.position}
                    </span>
                  </div>

                  <div className="my-2">
                    {sigBox.sig ? (
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

    </div>
  );
};
