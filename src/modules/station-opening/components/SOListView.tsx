import React, { useState } from 'react';
import type { StationOpeningForm } from '../types';
import { exportStationOpeningToPdf } from '../pdfGenerator';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Search,
  FileDown,
  Building,
  PlusCircle,
  Trash2,
  ExternalLink,
  Calendar,
  FileText,
} from 'lucide-react';

interface Props {
  forms: StationOpeningForm[];
  currentUser?: any;
  onOpenForm: (formId: string) => void;
  onCreateNew: () => void;
  onDeleteForm: (formId: string) => void;
}

export const SOListView: React.FC<Props> = ({ forms, currentUser, onOpenForm, onCreateNew, onDeleteForm }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState('ALL');

  const isHeadOfOp = currentUser?.role === 'Head of Operation';
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const uniqueStations = Array.from(new Set(forms.map((f) => f.station_name)));

  const filtered = forms.filter((f) => {
    const matchesSearch =
      f.form_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.created_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.station_supervisor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || f.current_status === selectedStatus;
    const matchesStation = selectedStation === 'ALL' || f.station_name === selectedStation;
    return matchesSearch && matchesStatus && matchesStation;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
            {t('so.statusApproved')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-700 border border-rose-500/30">
            {t('so.statusRejected')}
          </span>
        );
      case 'returned':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/30">
            {t('so.statusReturned')}
          </span>
        );
      case 'draft':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-700 border border-slate-500/30">
            {t('so.statusDraft')}
          </span>
        );
      case 'pending_safety_quality':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-700 border border-sky-500/30">
            {t('so.statusPendingSafetyQuality')}
          </span>
        );
      case 'pending_document_controller':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-700 border border-sky-500/30">
            {t('so.statusPendingDocController')}
          </span>
        );
      case 'pending_engineering':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-700 border border-sky-500/30">
            {t('so.statusPendingEngineering')}
          </span>
        );
      case 'pending_management':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-700 border border-sky-500/30">
            {t('so.statusPendingManagement')}
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-700 border border-sky-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/45 backdrop-blur-2xl border border-white/80 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-600" />
            <span>{t('so.listTitle')}</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {t('so.listSub')}
          </p>
        </div>

        {isHeadOfOp && (
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all shrink-0 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('so.newForm')}</span>
          </button>
        )}
      </div>

      {/* FILTER TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/50 backdrop-blur-xl border border-white/90 p-4 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)]">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-sky-600/70 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('so.searchPlaceholder')}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl ps-10 pe-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-inner"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 text-xs font-extrabold rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 cursor-pointer"
          >
            <option value="ALL">{t('so.allStatuses')}</option>
            <option value="draft">{t('so.statusDraft')}</option>
            <option value="pending_safety_quality">{t('so.statusPendingSafetyQuality')}</option>
            <option value="pending_document_controller">{t('so.statusPendingDocController')}</option>
            <option value="pending_engineering">{t('so.statusPendingEngineering')}</option>
            <option value="pending_management">{t('so.statusPendingManagement')}</option>
            <option value="approved">{t('so.statusApproved')}</option>
            <option value="returned">{t('so.statusReturned')}</option>
            <option value="rejected">{t('so.statusRejected')}</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 text-xs font-extrabold rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 cursor-pointer"
          >
            <option value="ALL">{t('auditsList.allStations')}</option>
            {uniqueStations.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white/50 backdrop-blur-2xl border border-white/90 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-white/80 text-slate-700 uppercase font-extrabold border-b border-sky-100">
              <tr>
                <th className="p-4 text-center">{t('so.formNoCol')}</th>
                <th className="p-4 text-center">{t('so.stationCol')}</th>
                <th className="p-4 text-center">{t('so.creatorCol')}</th>
                <th className="p-4 text-center">{t('so.supervisorCol')}</th>
                <th className="p-4 text-center">{t('so.statusCol')}</th>
                <th className="p-4 text-center">{t('so.actionsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium italic">
                    {t('so.noFormsFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-sky-50/60 transition-colors">
                    <td className="p-4 text-center">
                      <p className="font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span>{f.form_number}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{f.date_started}</span>
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="font-bold text-slate-900">{f.station_name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{f.address}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-slate-900 font-bold">{f.head_of_operation_name || f.created_by_name || 'Head of Operation'}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-slate-900 font-bold">{f.station_supervisor_name || 'N/A'}</p>
                    </td>

                    <td className="p-4 text-center">
                      {getStatusBadge(f.current_status)}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => exportStationOpeningToPdf(f)}
                          className="p-2 bg-white/80 hover:bg-white text-sky-700 rounded-xl border border-sky-200/80 shadow-sm transition-all"
                          title={t('so.pdfExport')}
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenForm(f.id)}
                          className="px-3.5 py-1.5 bg-sky-600/10 hover:bg-sky-600/20 text-sky-700 border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>View & Process</span>
                          <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                        </button>

                        {(isSuperAdmin || (f.created_by === currentUser?.id && f.current_status === 'draft')) && (
                          <button
                            onClick={() => onDeleteForm(f.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 shadow-sm transition-all"
                            title="Delete Form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
