import React, { useState, useEffect, useRef } from 'react';
import type { PumpReadingItem, FuelType, StationAudit } from '../../types/audit';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  RotateCcw,
  Sparkles,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export interface MobileFieldRef {
  id: string; // e.g. "PETROL_91-3-start_reading" | "PETROL_91-price" | "noor_khoy"
  category: 'PUMP' | 'PRICE' | 'COLLECTION';
  fuelType?: FuelType;
  pumpNo?: number;
  fieldName: string; // Display label
  fieldKey: 'start_reading' | 'end_reading' | 'quantity_sold' | 'amount' | 'price' | 'noor_khoy_amount' | 'atm_amount' | 'cash_received_amount';
  currentValue: number;
}

interface Props {
  isOpen: boolean;
  initialFieldId?: string;
  items: PumpReadingItem[];
  prices: Record<FuelType, number>;
  audit: Partial<StationAudit>;
  onItemChange: (
    fuelType: FuelType,
    pumpNo: number,
    field: 'start_reading' | 'end_reading' | 'quantity_sold' | 'price' | 'amount',
    value: number | null
  ) => void;
  onPriceChange: (fuelType: FuelType, newPrice: number) => void;
  onMetaChange: (field: keyof StationAudit, value: any) => void;
  onClose: () => void;
}

export const MobileEntryModal: React.FC<Props> = ({
  isOpen,
  initialFieldId,
  items,
  prices,
  audit,
  onItemChange,
  onPriceChange,
  onMetaChange,
  onClose,
}) => {
  const [fieldList, setFieldList] = useState<MobileFieldRef[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Generate sequence of all editable fields across the audit form
  useEffect(() => {
    const list: MobileFieldRef[] = [];
    const fuelTypes: FuelType[] = ['PETROL_91', 'PETROL_95', 'DIESEL'];

    fuelTypes.forEach((ft) => {
      const fuelName = ft.replace('_', ' ');
      // Price field for this section
      list.push({
        id: `${ft}-price`,
        category: 'PRICE',
        fuelType: ft,
        fieldName: `${fuelName} Unit Price (SAR/L)`,
        fieldKey: 'price',
        currentValue: prices[ft] || 0,
      });

      // Active pumps 1 to 14
      for (let p = 1; p <= 14; p++) {
        const item = items.find((i) => i.fuel_type === ft && i.pump_no === p);

        list.push({
          id: `${ft}-${p}-start_reading`,
          category: 'PUMP',
          fuelType: ft,
          pumpNo: p,
          fieldName: `${fuelName} — Pump #${p} — Start Reading`,
          fieldKey: 'start_reading',
          currentValue: item?.start_reading || 0,
        });

        list.push({
          id: `${ft}-${p}-end_reading`,
          category: 'PUMP',
          fuelType: ft,
          pumpNo: p,
          fieldName: `${fuelName} — Pump #${p} — End Reading`,
          fieldKey: 'end_reading',
          currentValue: item?.end_reading || 0,
        });
      }

      // Total row (Pump 15) manual opening reading entry
      const totalItem = items.find((i) => i.fuel_type === ft && i.pump_no === 15);
      list.push({
        id: `${ft}-15-start_reading`,
        category: 'PUMP',
        fuelType: ft,
        pumpNo: 15,
        fieldName: `${fuelName} — Total Start Reading (Manual Entry)`,
        fieldKey: 'start_reading',
        currentValue: totalItem?.start_reading || 0,
      });
    });

    // Collection metadata fields
    list.push({
      id: 'noor_khoy_amount',
      category: 'COLLECTION',
      fieldName: 'Noor Khoy Collection (SAR)',
      fieldKey: 'noor_khoy_amount',
      currentValue: audit.noor_khoy_amount || 0,
    });

    list.push({
      id: 'atm_amount',
      category: 'COLLECTION',
      fieldName: 'ATM POS Terminal Sales (SAR)',
      fieldKey: 'atm_amount',
      currentValue: audit.atm_amount || 0,
    });

    list.push({
      id: 'cash_received_amount',
      category: 'COLLECTION',
      fieldName: 'Actual Cash Received (SAR)',
      fieldKey: 'cash_received_amount',
      currentValue: audit.cash_received_amount || 0,
    });

    setFieldList(list);

    // Find starting field index
    if (initialFieldId) {
      const idx = list.findIndex((f) => f.id === initialFieldId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setInputValue(list[idx].currentValue ? String(list[idx].currentValue) : '');
      } else {
        setCurrentIndex(0);
        setInputValue(list[0]?.currentValue ? String(list[0].currentValue) : '');
      }
    } else {
      setCurrentIndex(0);
      setInputValue(list[0]?.currentValue ? String(list[0].currentValue) : '');
    }
  }, [isOpen, initialFieldId]);

  // Sync input value whenever currentIndex changes
  useEffect(() => {
    if (fieldList[currentIndex]) {
      const val = fieldList[currentIndex].currentValue;
      setInputValue(val ? String(val) : '');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [currentIndex, fieldList]);

  if (!isOpen || fieldList.length === 0) return null;

  const currentField = fieldList[currentIndex];

  const handleSaveCurrentValue = (advanceToNext: boolean = true) => {
    if (!currentField) return;
    const numericVal = inputValue.trim() === '' ? null : (parseFloat(inputValue) || 0);

    if (currentField.category === 'PRICE' && currentField.fuelType) {
      onPriceChange(currentField.fuelType, numericVal || 0);
    } else if (currentField.category === 'PUMP' && currentField.fuelType && currentField.pumpNo) {
      onItemChange(
        currentField.fuelType,
        currentField.pumpNo,
        currentField.fieldKey as any,
        numericVal as any
      );
    } else if (currentField.category === 'COLLECTION') {
      onMetaChange(currentField.fieldKey as keyof StationAudit, numericVal);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1200);

    if (advanceToNext && currentIndex < fieldList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    handleSaveCurrentValue(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    handleSaveCurrentValue(true);
  };

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full p-6 shadow-2xl ring-1 ring-white/60 animate-in slide-in-from-bottom duration-250 flex flex-col space-y-5">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-sky-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mobile Touch Entry Mode</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold">
                Field {currentIndex + 1} of {fieldList.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* FIELD TITLE BADGE */}
        <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-2xl">
          <p className="text-[11px] font-black uppercase tracking-wider text-sky-700">
            Current Field Target
          </p>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            {currentField.fieldName}
          </h3>
        </div>

        {/* INPUT DISPLAY CONTAINER WITH LARGE NUMERIC KEYPAD SUPPORT */}
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0.00"
              className="w-full text-3xl font-black text-center py-4 px-4 bg-sky-50/80 border-2 border-sky-500/80 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/20 shadow-inner"
            />
            {savedSuccess && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-600 font-black text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Previous Saved: <strong>{currentField.currentValue || 0}</strong></span>
            <button
              onClick={handleClear}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-extrabold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Input</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION & ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Field</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === fieldList.length - 1}
            className="px-4 py-3 bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-sm"
          >
            <span>Next Field</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* SAVE & NEXT PRIMARY ACTION */}
        <button
          onClick={() => handleSaveCurrentValue(true)}
          className="w-full py-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>Save & Advance Field</span>
        </button>

      </div>
    </div>
  );
};
