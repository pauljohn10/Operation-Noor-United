import React, { useState } from 'react';
import type { StationOpeningForm } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Search,
  Building,
  PlusCircle,
  Trash2,
  Calendar,
  FileText,
  FileCheck,
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
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm backdrop-blur-md">
            {t('so.statusApproved')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-sm backdrop-blur-md">
            {t('so.statusRejected')}
          </span>
        );
      case 'returned':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm backdrop-blur-md">
            {t('so.statusReturned')}
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm backdrop-blur-md">
            {status.replace('pending_', '').replace(/_/g, ' ')}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-3xl border border-white/25 p-4 rounded-2xl shadow-xl">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-sky-300 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('so.searchPlaceholder')}
            className="w-full bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl ps-10 pe-4 py-2 text-xs font-bold text-white placeholder-sky-200/70 focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all shadow-inner"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white/15 backdrop-blur-xl border border-white/30 text-xs font-bold rounded-xl px-3 py-2 text-white focus:outline-none focus:bg-white/25 transition-all shadow-sm"
          >
            <option value="ALL" className="bg-slate-900 text-white">{t('so.allStatuses')}</option>
            <option value="pending_safety_quality" className="bg-slate-900 text-white">{t('so.statusPendingSafetyQuality')}</option>
            <option value="pending_document_controller" className="bg-slate-900 text-white">{t('so.statusPendingDocController')}</option>
            <option value="pending_engineering" className="bg-slate-900 text-white">{t('so.statusPendingEngineering')}</option>
            <option value="pending_management" className="bg-slate-900 text-white">{t('so.statusPendingManagement')}</option>
            <option value="approved" className="bg-slate-900 text-white">{t('so.statusApproved')}</option>
            <option value="returned" className="bg-slate-900 text-white">{t('so.statusReturned')}</option>
            <option value="rejected" className="bg-slate-900 text-white">{t('so.statusRejected')}</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full bg-white/15 backdrop-blur-xl border border-white/30 text-xs font-bold rounded-xl px-3 py-2 text-white focus:outline-none focus:bg-white/25 transition-all shadow-sm"
          >
            <option value="ALL" className="bg-slate-900 text-white">{t('auditsList.allStations')}</option>
            {uniqueStations.map((st) => (
              <option key={st} value={st} className="bg-slate-900 text-white">
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[28px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-white/15 text-white uppercase font-black border-b border-white/25">
              <tr>
                <th className="p-4 text-center">{t('so.formNoCol')}</th>
                <th className="p-4 text-center">{t('so.stationCol')}</th>
                <th className="p-4 text-center">{t('so.creatorCol')}</th>
                <th className="p-4 text-center">{t('so.supervisorCol')}</th>
                <th className="p-4 text-center">{t('so.statusCol')}</th>
                <th className="p-4 text-center">{t('so.actionsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15 text-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sky-200/90 font-medium italic">
                    {t('so.noFormsFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="odd:bg-white/5 even:bg-white/10 hover:bg-white/20 transition-all border-b border-white/10">
                    <td className="p-4 text-center">
                      <p className="font-extrabold text-sky-300 flex items-center justify-center gap-1.5 drop-shadow-sm font-mono">
                        <FileText className="w-4 h-4 text-sky-300" />
                        <span>{f.form_number}</span>
                      </p>
                      <p className="text-[11px] text-sky-200/90 font-bold mt-0.5 flex items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-300" />
                        <span>{f.date_started}</span>
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="font-extrabold text-white text-xs drop-shadow-sm">{f.station_name}</p>
                      <p className="text-[11px] text-sky-200/90 font-medium">{f.address}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-white font-extrabold drop-shadow-sm">{f.head_of_operation_name || f.created_by_name || 'Operation Supervisor'}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-sky-200 font-extrabold drop-shadow-sm">{f.station_supervisor_name || 'N/A'}</p>
                    </td>

                    <td className="p-4 text-center">
                      {getStatusBadge(f.current_status)}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenForm(f.id)}
                          className="px-3.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-white border border-sky-400/40 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>View & Process</span>
                        </button>
                        {isHeadOfOp && (
                          <button
                            onClick={() => onDeleteForm(f.id)}
                            className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-400/30"
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
