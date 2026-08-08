import React, { useState } from 'react';
import type { SystemSettings } from '../../types/audit';
import { useLanguage } from '../../context/LanguageContext';
import { Settings, Save, ShieldAlert } from 'lucide-react';

interface Props {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => Promise<void>;
}

export const SystemSettingsView: React.FC<Props> = ({ settings, onSaveSettings }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-5xl">

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <Settings className="w-4 h-4 text-sky-600" />
          <span>{t('admin.settingsTitle')}</span>
        </h3>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold shadow-2xs">
            {t('common.success')}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-extrabold mb-1">{t('admin.companyNameEn')}</label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-extrabold mb-1">{t('admin.companyNameAr')}</label>
            <input
              type="text"
              required
              value={formData.company_name_ar}
              onChange={(e) => setFormData({ ...formData, company_name_ar: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-extrabold mb-1">{t('admin.sessionTimeout')}</label>
            <input
              type="number"
              required
              min={5}
              max={240}
              value={formData.session_timeout_minutes}
              onChange={(e) => setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) || 30 })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <ShieldAlert className="w-4 h-4 text-sky-600" />
          <span>{t('admin.defaultFuelPrices')}</span>
        </h3>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-emerald-800 font-extrabold mb-1">{t('auditForm.petrol91')}</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.p91_price}
              onChange={(e) => setFormData({ ...formData, p91_price: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-black focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-rose-800 font-extrabold mb-1">{t('auditForm.petrol95')}</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.p95_price}
              onChange={(e) => setFormData({ ...formData, p95_price: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-black focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-amber-800 font-extrabold mb-1">{t('auditForm.diesel')}</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.diesel_price}
              onChange={(e) => setFormData({ ...formData, diesel_price: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-black focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>{t('admin.saveSettingsBtn')}</span>
        </button>
      </div>
    </form>
  );
};

