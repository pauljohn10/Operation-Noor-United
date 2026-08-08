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
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            {t('so.statusApproved')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
            {t('so.statusRejected')}
          </span>
        );
      case 'returned':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
            {t('so.statusReturned')}
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs">
            {status.replace('pending_', '').replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-600" />
            <span>{t('so.listTitle')}</span>
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            {t('so.listSub')}
          </p>
        </div>

        {isHeadOfOp && (
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5 min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('so.newForm')}</span>
          </button>
        )}
      </div>

      {/* FILTER TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('so.searchPlaceholder')}
            className="w-full bg-white border border-slate-300 rounded-xl ps-10 pe-4 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
          >
            <option value="ALL">{t('so.allStatuses')}</option>
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
            className="w-full bg-white border border-slate-300 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black border-b border-slate-200">
              <tr>
                <th className="p-4 text-center">{t('so.formNoCol')}</th>
                <th className="p-4 text-center">{t('so.stationCol')}</th>
                <th className="p-4 text-center">{t('so.creatorCol')}</th>
                <th className="p-4 text-center">{t('so.supervisorCol')}</th>
                <th className="p-4 text-center">{t('so.statusCol')}</th>
                <th className="p-4 text-center">{t('so.actionsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium italic">
                    {t('so.noFormsFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-4 text-center">
                      <p className="font-extrabold text-sky-900 flex items-center justify-center gap-1.5 font-mono">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span>{f.form_number}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5 flex items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{f.date_started}</span>
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="font-extrabold text-slate-900 text-xs">{f.station_name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{f.address}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-slate-900 font-extrabold">{f.head_of_operation_name || f.created_by_name || 'Operation Supervisor'}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-slate-700 font-extrabold">{f.station_supervisor_name || 'N/A'}</p>
                    </td>

                    <td className="p-4 text-center">
                      {getStatusBadge(f.current_status)}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenForm(f.id)}
                          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>View & Process</span>
                        </button>
                        {isHeadOfOp && (
                          <button
                            onClick={() => onDeleteForm(f.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
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
