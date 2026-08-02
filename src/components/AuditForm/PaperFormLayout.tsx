import React from 'react';
import type { StationAudit, PumpReadingItem, FuelType } from '../../types/audit';
import { calculateFuelSectionTotals, formatCurrency, formatNumber, formatMeterReading } from '../../lib/calculations';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, PenTool, Banknote } from 'lucide-react';

interface Props {
  audit: Partial<StationAudit>;
  items: PumpReadingItem[];
  prices: Record<FuelType, number>;
  onItemChange?: (
    fuelType: FuelType,
    pumpNo: number,
    field: 'start_reading' | 'end_reading' | 'quantity_sold' | 'price' | 'amount',
    value: number | null
  ) => void;
  onPriceChange?: (fuelType: FuelType, newPrice: number) => void;
  onTotalOpeningChange?: (fuelType: FuelType, value: number | null) => void;
  onMetaChange?: (field: keyof StationAudit, value: any) => void;
  onSignatoryClick?: (roleKey: string) => void;
  isReadOnly?: boolean;
}

export const PaperFormLayout: React.FC<Props> = ({
  audit,
  items,
  prices,
  onItemChange,
  onPriceChange,
  onTotalOpeningChange,
  onMetaChange,
  onSignatoryClick,
  isReadOnly = false,
}) => {
  const p91Totals = calculateFuelSectionTotals(items, 'PETROL_91', prices.PETROL_91);
  const p95Totals = calculateFuelSectionTotals(items, 'PETROL_95', prices.PETROL_95);
  const dieselTotals = calculateFuelSectionTotals(items, 'DIESEL', prices.DIESEL);

  const getFuelItems = (type: FuelType) => items.filter((i) => i.fuel_type === type);

  const normalizeRoleKey = (r?: string) => (r || '').toLowerCase().replace(/[\s_-]+/g, '');

  const getApprovalSlot = (roleKey: string) => {
    const target = normalizeRoleKey(roleKey);
    return audit.approvals?.find((a) => normalizeRoleKey(a.role) === target);
  };

  const grandTotalSales = Number(
    (p91Totals.total_sales + p95Totals.total_sales + dieselTotals.total_sales).toFixed(2)
  );

  return (
    <div id="paper-form-document" className="paper-form shadow-2xl font-sans">
      
      {/* 1. COMPACT OFFICIAL FORM HEADER */}
      <div className="paper-header flex items-center justify-between pb-1.5 mb-2 border-b-2 border-black">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <img
            src="/logo_transparent.png"
            alt="Al Noor United Fuel Est. Logo"
            className="h-10 sm:h-12 w-auto object-contain max-w-[130px]"
            style={{ background: 'transparent', filter: 'none' }}
            crossOrigin="anonymous"
          />
        </div>

        {/* TITLE HEADINGS */}
        <div className="text-center">
          <h2 className="text-sm sm:text-base font-extrabold text-black tracking-wide dir-rtl leading-tight">
            مؤسسة النور المتحدة للوقود
          </h2>
          <h1 className="text-base sm:text-lg font-black text-black uppercase tracking-wider leading-tight">
            Al Noor United Fuel Est.
          </h1>
          <h3 className="text-[10px] font-bold text-gray-800 dir-rtl">
            تقرير السيطرة على خسائر الوقود والتحقيق فيها
          </h3>
          <h4 className="text-[10px] font-extrabold text-gray-900 tracking-wide">
            Fuel Losses Control & Investigation Report
          </h4>
        </div>

        <div className="w-12"></div>
      </div>

      {/* 2. COMPACT METADATA HEADER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0.5 text-[11px] font-semibold pb-1.5 mb-2 border-b border-gray-300">
        {/* Left Column */}
        <div className="space-y-0.5">
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Date :</span>
            {isReadOnly ? (
              <span className="font-bold text-black border-b border-black flex-1 px-1 h-full flex items-center">
                {audit.audit_date || ''}
              </span>
            ) : (
              <input
                type="date"
                value={audit.audit_date || ''}
                onChange={(e) => onMetaChange && onMetaChange('audit_date', e.target.value)}
                className="paper-line-input text-left font-bold h-full flex-1"
              />
            )}
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Station No. :</span>
            <span className="font-bold text-black border-b border-black flex-1 px-1 h-full flex items-center">
              {audit.station_no || ''}
            </span>
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Station Name :</span>
            <span className="font-bold text-black border-b border-black flex-1 px-1 h-full flex items-center">
              {audit.station_name || ''}
            </span>
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">City / Location :</span>
            <span className="font-bold text-black border-b border-black flex-1 px-1 h-full flex items-center">
              {audit.location || ''}
            </span>
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Audit Number :</span>
            <span className="font-mono font-bold text-black border-b border-black flex-1 px-1 h-full flex items-center">
              {audit.audit_number || ''}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-0.5">
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Total Sales :</span>
            <span className="font-black text-black border-b border-black flex-1 px-1 text-right font-mono h-full flex items-center justify-end">
              {grandTotalSales > 0 ? `${formatCurrency(grandTotalSales)} SAR` : ''}
            </span>
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Noor Khoy :</span>
            {isReadOnly ? (
              <span className="font-bold text-black border-b border-black flex-1 px-1 text-right font-mono h-full flex items-center justify-end">
                {audit.noor_khoy_amount != null ? `${formatCurrency(audit.noor_khoy_amount)} SAR` : ''}
              </span>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.noor_khoy_amount ?? ''}
                onChange={(e) =>
                  onMetaChange && onMetaChange('noor_khoy_amount', e.target.value === '' ? null : (parseFloat(e.target.value) || 0))
                }
                placeholder="0.00"
                className="paper-line-input font-bold text-right font-mono h-full flex-1"
              />
            )}
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">ATM :</span>
            {isReadOnly ? (
              <span className="font-bold text-black border-b border-black flex-1 px-1 text-right font-mono h-full flex items-center justify-end">
                {audit.atm_amount != null ? `${formatCurrency(audit.atm_amount)} SAR` : ''}
              </span>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.atm_amount ?? ''}
                onChange={(e) =>
                  onMetaChange && onMetaChange('atm_amount', e.target.value === '' ? null : (parseFloat(e.target.value) || 0))
                }
                placeholder="0.00"
                className="paper-line-input font-bold text-right font-mono h-full flex-1"
              />
            )}
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Cash :</span>
            <span className="font-bold text-black border-b border-black flex-1 px-1 text-right font-mono h-full flex items-center justify-end">
              {audit.cash_amount != null && audit.cash_amount > 0 ? `${formatCurrency(audit.cash_amount)} SAR` : ''}
            </span>
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Cash Received :</span>
            {isReadOnly ? (
              <span className="font-bold text-black border-b border-black flex-1 px-1 text-right font-mono h-full flex items-center justify-end">
                {audit.cash_received_amount != null ? `${formatCurrency(audit.cash_received_amount)} SAR` : ''}
              </span>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.cash_received_amount ?? ''}
                onChange={(e) =>
                  onMetaChange &&
                  onMetaChange('cash_received_amount', e.target.value === '' ? null : (parseFloat(e.target.value) || 0))
                }
                placeholder="0.00"
                className="paper-line-input font-bold text-right font-mono h-full flex-1"
              />
            )}
          </div>
          <div className="flex items-center h-5">
            <span className="w-32 shrink-0 font-bold text-black">Discrepancy :</span>
            <span
              className={`font-black border-b border-black flex-1 px-1 text-right font-mono h-full flex items-center justify-end ${
                (audit.discrepancy_amount || 0) < 0
                  ? 'text-red-700'
                  : (audit.discrepancy_amount || 0) > 0
                  ? 'text-emerald-700'
                  : 'text-black'
              }`}
            >
              {audit.cash_received_amount != null ? `${formatCurrency(audit.discrepancy_amount || 0)} SAR` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* DEDICATED COLLECTION FINANCIAL INPUTS PANEL (NOOR KHOY, ATM, CASH RECEIVED) */}
      {!isReadOnly && (
        <div className="bg-sky-50/80 border-2 border-sky-300 rounded-2xl p-3 my-2 space-y-2 no-print shadow-md">
          <div className="flex items-center justify-between border-b border-sky-200 pb-1.5">
            <h4 className="text-xs font-black uppercase text-sky-900 tracking-wider flex items-center gap-2">
              <Banknote className="w-4 h-4 text-sky-600 bg-white rounded-full p-0.5 border border-sky-300" />
              <span>Financial Collections & Cash Entry</span>
            </h4>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-200/60 px-2.5 py-0.5 rounded-full">
              Real-Time Variance Calculation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Noor Khoy */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 mb-0.5">
                Noor Khoy Collection (SAR)
              </label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.noor_khoy_amount ?? ''}
                onChange={(e) =>
                  onMetaChange && onMetaChange('noor_khoy_amount', e.target.value === '' ? null : (parseFloat(e.target.value) || 0))
                }
                placeholder="0.00"
                className="w-full min-h-[42px] text-base font-black text-right bg-white border-2 border-sky-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner"
              />
            </div>

            {/* ATM */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 mb-0.5">
                ATM POS Sales (SAR)
              </label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.atm_amount ?? ''}
                onChange={(e) =>
                  onMetaChange && onMetaChange('atm_amount', e.target.value === '' ? null : (parseFloat(e.target.value) || 0))
                }
                placeholder="0.00"
                className="w-full min-h-[42px] text-base font-black text-right bg-white border-2 border-sky-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner"
              />
            </div>

            {/* Cash Received */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 mb-0.5">
                Actual Cash Received (SAR)
              </label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={audit.cash_received_amount ?? ''}
                onChange={(e) =>
                  onMetaChange && onMetaChange('cash_received_amount', e.target.value === '' ? null : (parseFloat(e.target.value) || 0))
                }
                placeholder="0.00"
                className="w-full min-h-[42px] text-base font-black text-right bg-white border-2 border-sky-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. FUEL SECTIONS & PUMP TABLES */}
      {/* MOBILE STACKED CARDS (< 768px) */}
      {renderFuelMobileCards('PETROL 91', 'paper-header-p91', getFuelItems('PETROL_91'), p91Totals, 'PETROL_91')}
      {renderFuelMobileCards('PETROL 95', 'paper-header-p95', getFuelItems('PETROL_95'), p95Totals, 'PETROL_95')}
      {renderFuelMobileCards('DIESEL', 'paper-header-diesel', getFuelItems('DIESEL'), dieselTotals, 'DIESEL')}

      {/* DESKTOP & PRINT FORM TABLES (>= 768px) */}
      <div className="hidden md:block space-y-1.5">
        {renderFuelTable('PETROL 91', 'paper-header-p91', getFuelItems('PETROL_91'), p91Totals, 'PETROL_91')}
        {renderFuelTable('PETROL 95', 'paper-header-p95', getFuelItems('PETROL_95'), p95Totals, 'PETROL_95')}
        {renderFuelTable('DIESEL', 'paper-header-diesel', getFuelItems('DIESEL'), dieselTotals, 'DIESEL')}
      </div>

      {/* FULL-WIDTH MOBILE SUMMARY CARDS (< 768px) */}
      <div className="md:hidden space-y-2.5 my-3 no-print">
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl flex items-center justify-between shadow-sm">
          <span className="font-extrabold text-xs text-emerald-900 uppercase">Total Petrol 91</span>
          <span className="font-black text-base text-emerald-900 font-mono">{formatCurrency(p91Totals.total_sales)} SAR</span>
        </div>
        <div className="bg-rose-50 border border-rose-300 p-3 rounded-2xl flex items-center justify-between shadow-sm">
          <span className="font-extrabold text-xs text-rose-900 uppercase">Total Petrol 95</span>
          <span className="font-black text-base text-rose-900 font-mono">{formatCurrency(p95Totals.total_sales)} SAR</span>
        </div>
        <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl flex items-center justify-between shadow-sm">
          <span className="font-extrabold text-xs text-amber-900 uppercase">Total Diesel</span>
          <span className="font-black text-base text-amber-900 font-mono">{formatCurrency(dieselTotals.total_sales)} SAR</span>
        </div>
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-lg">
          <span className="font-black text-xs uppercase">Total Sales</span>
          <span className="font-black text-base font-mono underline">{formatCurrency(grandTotalSales)} SAR</span>
        </div>
        {audit.cash_received_amount != null && (
          <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between shadow-lg">
            <span className="font-black text-xs uppercase">Discrepancy / Variance</span>
            <span className={`font-black text-base font-mono ${(audit.discrepancy_amount || 0) < 0 ? 'text-rose-400' : (audit.discrepancy_amount || 0) > 0 ? 'text-emerald-400' : 'text-white'}`}>
              {formatCurrency(audit.discrepancy_amount || 0)} SAR
            </span>
          </div>
        )}
      </div>

      {/* 4. NOTE SECTION */}
      <div className="my-1.5 text-[10px] font-bold text-black">
        <div className="flex items-center gap-2">
          <span>Note:</span>
          {isReadOnly ? (
            <span className="border-b border-gray-400 flex-1 px-1 font-medium">
              {audit.notes || '____________________________________________________________________________________________________'}
            </span>
          ) : (
            <input
              type="text"
              value={audit.notes || ''}
              onChange={(e) => onMetaChange && onMetaChange('notes', e.target.value)}
              placeholder="Enter audit notes or observations..."
              className="paper-input border-b border-gray-400 text-left font-medium flex-1 text-[10px]"
            />
          )}
        </div>
      </div>

      {/* 5. CLICKABLE SIGNATORIES FOOTER */}
      <div className="paper-signatory-section mt-2 pt-1.5 border-t-2 border-black">
        <div className="text-[10px] font-bold text-black mb-1 text-center tracking-wide uppercase">
          Authorization & Inspection Signatures
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-3 ${getApprovalSlot('super_admin')?.approver_name ? 'md:grid-cols-6' : 'md:grid-cols-5'} gap-1.5 text-center text-[9px]`}>
          
          {/* 1. Station Supervisor */}
          <div
            onClick={() => onSignatoryClick && onSignatoryClick('station_supervisor')}
            className={`border border-black p-1 flex flex-col justify-between min-h-[55px] bg-white relative transition-all ${
              !isReadOnly ? 'cursor-pointer hover:border-amber-600 hover:shadow-md hover:bg-amber-50/50' : ''
            }`}
          >
            <div className="font-bold text-black border-b border-gray-300 pb-0.5 mb-0.5 text-[9px] flex items-center justify-between">
              <span>Station Supervisor</span>
              {!isReadOnly && <PenTool className="w-2.5 h-2.5 text-amber-600 no-print" />}
            </div>

            {audit.station_supervisor_signature_url ? (
              <div className="my-auto py-0.5">
                <div className="h-6 my-0.5 flex items-center justify-center">
                  <img
                    src={audit.station_supervisor_signature_url}
                    alt="Station Supervisor Handwritten Signature"
                    className="max-h-full object-contain mx-auto"
                  />
                </div>
                {audit.station_supervisor_name ? (
                  <p className="font-bold text-black text-[9px] leading-tight">{audit.station_supervisor_name}</p>
                ) : null}
                <p className="text-[7.5px] text-gray-600 leading-tight">On-Site Signatory</p>
              </div>
            ) : (
              <div className="my-auto py-1 text-amber-700 text-[8px] font-bold flex flex-col items-center justify-center">
                {audit.station_supervisor_name ? (
                  <span className="font-extrabold text-slate-900 not-italic text-[8.5px]">{audit.station_supervisor_name}</span>
                ) : null}
                {!isReadOnly && <span className="no-print italic text-amber-700 font-bold text-[8px]">Click to Sign</span>}
              </div>
            )}
          </div>

          {/* 2. Operation Supervisor */}
          <div
            onClick={() => onSignatoryClick && onSignatoryClick('operation_supervisor')}
            className={`border border-black p-1 flex flex-col justify-between min-h-[55px] bg-white relative transition-all ${
              !isReadOnly ? 'cursor-pointer hover:border-amber-600 hover:shadow-md hover:bg-amber-50/50' : ''
            }`}
          >
            <div className="font-bold text-black border-b border-gray-300 pb-0.5 mb-0.5 text-[9px] flex items-center justify-between">
              <span>Operation Supervisor</span>
              {!isReadOnly && <PenTool className="w-2.5 h-2.5 text-amber-600 no-print" />}
            </div>

            {audit.operation_supervisor_signature_url ? (
              <div className="my-auto py-0.5">
                <div className="h-6 my-0.5 flex items-center justify-center">
                  <img
                    src={audit.operation_supervisor_signature_url}
                    alt="Operation Supervisor Handwritten Signature"
                    className="max-h-full object-contain mx-auto"
                  />
                </div>
                <p className="font-bold text-black text-[9px] leading-tight">{audit.created_by_name || 'Operation Supervisor'}</p>
                <p className="text-[7.5px] text-gray-600 leading-tight">Operations Supervisor</p>
              </div>
            ) : (
              <div className="my-auto py-1 text-amber-700 text-[8px] font-bold flex flex-col items-center justify-center">
                {!isReadOnly && <span className="no-print italic text-amber-700 font-bold text-[8px]">Click to Sign</span>}
              </div>
            )}
          </div>

          {/* 3. Accountant */}
          {renderSignatoryCard('Accountant', 'accountant', getApprovalSlot('accountant'))}

          {/* 4. Account Manager */}
          {renderSignatoryCard('Account Manager', 'account_manager', getApprovalSlot('account_manager'))}

          {/* 5. Executive Management */}
          {renderSignatoryCard('Executive Management', 'management', getApprovalSlot('management'))}

          {/* 6. Super Admin (Only if real approval record exists) */}
          {getApprovalSlot('super_admin')?.approver_name
            ? renderSignatoryCard('Super Admin', 'super_admin', getApprovalSlot('super_admin'))
            : null}

        </div>
      </div>
    </div>
  );

  // STACKED MOBILE PUMP CARDS RENDERER FOR ANDROID WEB BROWSERS (< 768px)
  function renderFuelMobileCards(
    title: string,
    headerClass: string,
    fuelItems: PumpReadingItem[],
    sectionTotals: any,
    fuelTypeKey: FuelType
  ) {
    return (
      <div className={`paper-fuel-mobile-${fuelTypeKey.toLowerCase()} mb-6 md:hidden no-print space-y-3`}>
        {/* SECTION HEADER & UNIT PRICE CARD */}
        <div className={`p-4 rounded-2xl text-white shadow-md flex items-center justify-between gap-3 ${headerClass}`}>
          <div>
            <h3 className="text-base font-black tracking-wide uppercase">{title}</h3>
            <p className="text-[11px] font-bold opacity-90">14 Active Pump Lines</p>
          </div>
          <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs font-bold whitespace-nowrap">Unit Price:</span>
            {isReadOnly ? (
              <span className="font-mono font-black text-sm">{sectionTotals.price.toFixed(2)} SAR</span>
            ) : (
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={sectionTotals.price || ''}
                onChange={(e) => onPriceChange && onPriceChange(fuelTypeKey, parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-20 min-h-[38px] text-center font-black text-sm bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-sky-400"
              />
            )}
          </div>
        </div>

        {/* STACKED PUMP CARDS */}
        <div className="space-y-3">
          {fuelItems
            .filter((item) => item.pump_no !== 15)
            .map((item) => {
              const pumpNo = item.pump_no;

            return (
              <div key={pumpNo} className="bg-slate-50 border border-slate-300 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-sm text-slate-900">{title} — Pump #{pumpNo}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Start Reading */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Reading</label>
                    {isReadOnly ? (
                      <div className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-sm font-bold text-center">
                        {formatMeterReading(item.start_reading)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={item.start_reading ?? ''}
                        onChange={(e) =>
                          onItemChange &&
                          onItemChange(item.fuel_type, pumpNo, 'start_reading', e.target.value === '' ? null : parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="w-full min-h-[48px] text-base font-extrabold text-center bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-sky-50"
                      />
                    )}
                  </div>

                  {/* End Reading */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Reading</label>
                    {isReadOnly ? (
                      <div className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-sm font-bold text-center">
                        {formatMeterReading(item.end_reading)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={item.end_reading ?? ''}
                        onChange={(e) =>
                          onItemChange &&
                          onItemChange(item.fuel_type, pumpNo, 'end_reading', e.target.value === '' ? null : parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="w-full min-h-[48px] text-base font-extrabold text-center bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-sky-50"
                      />
                    )}
                  </div>

                  {/* Quantity Sold */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Sold (L)</label>
                    {isReadOnly ? (
                      <div className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-sm font-black text-center min-h-[48px] flex items-center justify-center">
                        {formatNumber(item.quantity_sold)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={item.quantity_sold ?? ''}
                        onChange={(e) =>
                          onItemChange &&
                          onItemChange(item.fuel_type, pumpNo, 'quantity_sold', e.target.value === '' ? null : parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="w-full min-h-[48px] text-base font-extrabold text-center bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-sky-50"
                      />
                    )}
                  </div>

                  {/* Sales Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sales Amount (SAR)</label>
                    {isReadOnly ? (
                      <div className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-sm font-black text-center min-h-[48px] flex items-center justify-center">
                        {formatCurrency(item.amount)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={item.amount ?? ''}
                        onChange={(e) =>
                          onItemChange &&
                          onItemChange(item.fuel_type, pumpNo, 'amount', e.target.value === '' ? null : parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="w-full min-h-[48px] text-base font-extrabold text-center bg-white border border-slate-400 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-sky-50"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Final Closing & Totals Summary Card for Mobile */}
        <div className="p-4 bg-gradient-to-r from-blue-50 via-sky-50 to-emerald-50 border border-sky-200 rounded-2xl flex flex-col space-y-3 text-xs font-black shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
            <span className="text-slate-900 font-extrabold uppercase tracking-wider">{title} TOTAL:</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Opening Reading (Manual Entry)</label>
              {isReadOnly ? (
                <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-center">
                  {sectionTotals.total_opening_reading != null ? formatMeterReading(sectionTotals.total_opening_reading) : '-'}
                </div>
              ) : (
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={sectionTotals.total_opening_reading ?? ''}
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      if (onTotalOpeningChange) onTotalOpeningChange(fuelTypeKey, null);
                      return;
                    }
                    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
                      const parsed = parseFloat(raw);
                      if (onTotalOpeningChange) onTotalOpeningChange(fuelTypeKey, isNaN(parsed) ? null : parsed);
                    }
                  }}
                  placeholder="Manual Entry"
                  className="w-full text-sm font-black text-center bg-yellow-50 border border-amber-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono touch-manipulation cursor-text"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Closing Reading (Auto Calculated)</label>
              <div className="bg-blue-100/70 border border-blue-300 rounded-xl px-3 py-2 text-blue-950 font-mono font-black text-center text-sm">
                {formatMeterReading(sectionTotals.final_closing_reading)} L
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-sky-200/60 font-mono">
            <span className="text-sky-900 font-black">Sold: {formatNumber(sectionTotals.total_quantity)} L</span>
            <span className="text-emerald-900 font-black">Sales: {formatCurrency(sectionTotals.total_sales)} SAR</span>
          </div>
        </div>
      </div>
    );
  }

  // FUEL TABLE RENDERER WITH VERTICALLY MERGED PRICE COLUMN (rowSpan=15)
  function renderFuelTable(
    title: string,
    headerClass: string,
    fuelItems: PumpReadingItem[],
    sectionTotals: any,
    fuelTypeKey: FuelType
  ) {
    return (
      <div className={`paper-fuel-section paper-fuel-${fuelTypeKey.toLowerCase()} mb-3 paper-table-wrapper`}>
        <table className="paper-table">
          <thead>
            <tr>
              <th colSpan={7} className={headerClass}>
                {title}
              </th>
            </tr>
            <tr className="bg-gray-100 text-black">
              <th className="w-16">Pump No.</th>
              <th className="w-28">Start Reading</th>
              <th className="w-28">End Reading</th>
              <th className="w-28">Quantity Sold</th>
              <th className="w-28">Amount</th>
              <th className="w-24">Price</th>
              <th className="w-32">Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {fuelItems.map((item, idx) => {
              const pumpNo = item.pump_no;
              const isTotalRow = pumpNo === 15;

              return (
                <tr
                  key={pumpNo}
                  className={isTotalRow ? 'bg-blue-50/80 font-black text-black border-t-2 border-black' : 'hover:bg-gray-50'}
                >
                  <td className="font-bold text-black">
                    {isTotalRow ? <span className="font-extrabold text-blue-900 text-xs uppercase tracking-wider">Total</span> : pumpNo}
                  </td>
                  
                  {/* Start Reading (Opening Reading) */}
                  <td>
                    {isReadOnly ? (
                      formatMeterReading(item.start_reading)
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={item.start_reading ?? ''}
                        onChange={(e) =>
                          onItemChange &&
                          onItemChange(
                            item.fuel_type,
                            pumpNo,
                            'start_reading',
                            e.target.value === '' ? null : (parseFloat(e.target.value) || 0)
                          )
                        }
                        className={isTotalRow ? 'paper-input text-center font-bold font-mono bg-yellow-50/90 border border-amber-400 rounded px-1 py-0.5' : 'paper-input'}
                        placeholder={isTotalRow ? 'Manual Entry' : '0.00'}
                      />
                    )}
                  </td>

                  {/* End Reading (Closing Reading) */}
                  <td>
                    {isTotalRow ? (
                      <span className="font-mono font-black text-blue-950 p-1 text-xs">
                        {formatMeterReading(item.end_reading)}
                      </span>
                    ) : isReadOnly ? (
                      formatMeterReading(item.end_reading)
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={item.end_reading ?? ''}
                        onChange={(e) =>
                          onItemChange &&
                          onItemChange(
                            item.fuel_type,
                            pumpNo,
                            'end_reading',
                            e.target.value === '' ? null : (parseFloat(e.target.value) || 0)
                          )
                        }
                        className="paper-input"
                      />
                    )}
                  </td>

                  {/* Quantity Sold (Sold Liters) */}
                  <td>
                    {isTotalRow ? (
                      <span className="font-mono font-black text-sky-950 p-1 text-xs">
                        {formatNumber(item.quantity_sold)}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-bold">-</span>
                    )}
                  </td>

                  {/* Amount (Total Sales) */}
                  <td>
                    {isTotalRow ? (
                      <span className="font-mono font-black text-emerald-950 p-1 text-xs">
                        {formatCurrency(item.amount)}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-bold">-</span>
                    )}
                  </td>

                  {/* SINGLE VERTICALLY MERGED PRICE CELL (rowSpan=15) - RENDERED ON FIRST ROW ONLY */}
                  {idx === 0 && (
                    <td
                      rowSpan={15}
                      className="bg-white align-middle font-extrabold text-black text-sm border-l border-r border-black p-1 text-center"
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                          UNIT PRICE
                        </span>
                        {isReadOnly ? (
                          <span className="text-base font-black text-black">
                            {sectionTotals.price.toFixed(2)}
                          </span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            value={sectionTotals.price || ''}
                            onChange={(e) =>
                              onPriceChange &&
                              onPriceChange(fuelTypeKey, parseFloat(e.target.value) || 0)
                            }
                            className="paper-input text-center font-black text-sm bg-yellow-50 border-b border-amber-500 py-1"
                          />
                        )}
                        <span className="text-[8px] text-gray-500 font-bold">SAR / Liter</span>
                      </div>
                    </td>
                  )}

                  {/* SINGLE VERTICALLY MERGED TOTAL SALES COLUMN (rowSpan=15) - RENDERED ON FIRST ROW ONLY */}
                  {idx === 0 && (
                    <td
                      rowSpan={15}
                      className="bg-white align-middle font-extrabold text-black text-sm border-l-2 border-black"
                    >
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">
                          {title} TOTAL
                        </span>
                        <span className="text-base font-black text-black">
                          {formatCurrency(sectionTotals.total_sales)}
                        </span>
                        <span className="text-[9px] text-gray-500 font-semibold">SAR</span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderSignatoryCard(
    title: string,
    roleKey: string,
    approvalSlot?: any
  ) {
    const isApproved = approvalSlot?.status === 'approved';
    const isRejected = approvalSlot?.status === 'rejected';
    const isReturned = approvalSlot?.status === 'returned';

    return (
      <div
        onClick={() => onSignatoryClick && onSignatoryClick(roleKey)}
        className={`border border-black p-1.5 flex flex-col justify-between min-h-[100px] bg-white relative transition-all ${
          !isApproved ? 'cursor-pointer hover:border-amber-600 hover:shadow-md hover:bg-amber-50/50' : ''
        }`}
      >
        <div className="font-bold text-black border-b border-gray-300 pb-1 mb-1 text-[10px] flex items-center justify-between">
          <span>{title}</span>
          {!isApproved && <PenTool className="w-3 h-3 text-amber-600 no-print" />}
        </div>

        {isApproved ? (
          <div className="my-auto py-1">
            {approvalSlot.signature_url ? (
              <div className="h-10 my-0.5 flex items-center justify-center">
                <img
                  src={approvalSlot.signature_url}
                  alt="Handwritten Signature"
                  className="max-h-full object-contain mx-auto"
                />
              </div>
            ) : null}

            <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-[11px]">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>{approvalSlot.approver_name}</span>
            </div>
            <p className="text-[9px] text-gray-600 font-medium leading-none mt-0.5">
              {approvalSlot.approver_position || 'Approved'}
            </p>

            <div className="mt-1 inline-flex items-center gap-1 px-1 py-0.5 bg-emerald-50 border border-emerald-300 rounded text-[8px] text-emerald-800 font-bold">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>{approvalSlot.digital_signature_code || 'SIG-VERIFIED'}</span>
            </div>

            {approvalSlot.action_timestamp && (
              <p className="text-[8px] text-gray-500 font-mono mt-0.5">
                {new Date(approvalSlot.action_timestamp).toLocaleDateString()} {' '}
                {new Date(approvalSlot.action_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        ) : isRejected ? (
          <div className="my-auto py-1 text-red-600 font-bold text-[10px]">
            <XCircle className="w-4 h-4 mx-auto mb-0.5" />
            <span>REJECTED</span>
            <p className="text-[8px] text-gray-500">{approvalSlot?.approver_name}</p>
          </div>
        ) : isReturned ? (
          <div className="my-auto py-1 text-amber-600 font-bold text-[10px]">
            <AlertTriangle className="w-4 h-4 mx-auto mb-0.5" />
            <span>RETURNED</span>
            <p className="text-[8px] text-gray-500">{approvalSlot?.approver_name}</p>
          </div>
        ) : (
          <div className="my-auto py-3 text-amber-700 text-[9px] font-bold flex flex-col items-center justify-center gap-1">
            {!isReadOnly && <span className="no-print italic text-amber-700 font-bold text-[9px]">Click to Sign Manually</span>}
          </div>
        )}
      </div>
    );
  }
};
