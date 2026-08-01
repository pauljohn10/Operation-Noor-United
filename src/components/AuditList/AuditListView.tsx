import React, { useState } from 'react';
import type { StationAudit } from '../../types/audit';
import { formatCurrency } from '../../lib/calculations';
import { exportAuditToPdf } from '../../lib/pdfGenerator';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  FileText,
  FileDown,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface Props {
  audits: StationAudit[];
  onOpenAudit: (auditId: string) => void;
  onCreateNewAudit?: () => void;
}

export const AuditListView: React.FC<Props> = ({ audits, onOpenAudit }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState('ALL');

  const uniqueStations = Array.from(new Set(audits.map((a) => a.station_name)));

  const filtered = audits.filter((a) => {
    const matchesSearch =
      a.audit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.created_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.station_supervisor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || a.current_status === selectedStatus;
    const matchesStation = selectedStation === 'ALL' || a.station_name === selectedStation;

    return matchesSearch && matchesStatus && matchesStation;
  });

  const getStatusBadgeLabel = (status: string) => {
    switch (status) {
      case 'draft': return t('auditsList.statusDraft');
      case 'pending_accountant': return t('auditsList.statusPendingAccountant');
      case 'pending_account_manager': return t('auditsList.statusPendingAccountManager');
      case 'pending_management': return t('auditsList.statusPendingManagement');
      case 'approved': return t('auditsList.statusApproved');
      case 'rejected': return t('auditsList.statusRejected');
      case 'returned_for_correction': return t('auditsList.statusReturned');
      default: return status.replace(/_/g, ' ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">



      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/45 backdrop-blur-2xl border border-white/80 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <span>{t('auditsList.title')}</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {t('auditsList.subtitle')}
          </p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/50 backdrop-blur-xl border border-white/90 p-4 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)]">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-sky-600/70 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('auditsList.searchPlaceholder')}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl ps-10 pe-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-inner"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 text-xs font-extrabold rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 cursor-pointer"
          >
            <option value="ALL">{t('auditsList.allStatuses')}</option>
            <option value="draft">{t('auditsList.statusDraft')}</option>
            <option value="pending_accountant">{t('auditsList.statusPendingAccountant')}</option>
            <option value="pending_account_manager">{t('auditsList.statusPendingAccountManager')}</option>
            <option value="pending_management">{t('auditsList.statusPendingManagement')}</option>
            <option value="approved">{t('auditsList.statusApproved')}</option>
            <option value="rejected">{t('auditsList.statusRejected')}</option>
            <option value="returned_for_correction">{t('auditsList.statusReturned')}</option>
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

      {/* AUDITS DATA TABLE */}
      <div className="bg-white/50 backdrop-blur-2xl border border-white/90 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-white/80 text-slate-700 uppercase font-extrabold border-b border-sky-100">
              <tr>
                <th className="p-4 text-center">{t('auditsList.auditNo')}</th>
                <th className="p-4 text-center">{t('auditsList.station')}</th>
                <th className="p-4 text-center">{t('auditsList.supervisor')}</th>
                <th className="p-4 text-center">{t('auditForm.grandTotalSales')}</th>
                <th className="p-4 text-center">{t('auditsList.netDiscrepancy')}</th>
                <th className="p-4 text-center">{t('auditsList.status')}</th>
                <th className="p-4 text-center">{t('auditsList.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium italic">
                    {t('auditsList.noAuditsFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-sky-50/60 transition-colors">
                    <td className="p-4 text-center">
                      <p className="font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span>{a.audit_number}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{a.audit_date}</span>
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="font-bold text-slate-900">{a.station_name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{a.location}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="text-slate-900 font-bold">{a.created_by_name || 'Operation Supervisor'}</p>
                    </td>

                    <td className="p-4 text-center">
                      <p className="font-black text-slate-900">{formatCurrency(a.total_sales)} {t('common.sar')}</p>
                      <p className="text-[10px] text-slate-500 font-mono font-semibold">{formatCurrency(a.total_quantity)} {t('common.liters')}</p>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`font-black font-mono text-xs ${
                          a.discrepancy_amount < 0
                            ? 'text-rose-600'
                            : a.discrepancy_amount > 0
                            ? 'text-emerald-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {formatCurrency(a.discrepancy_amount)} {t('common.sar')}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          a.current_status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                            : a.current_status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                            : a.current_status === 'returned_for_correction'
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                            : 'bg-sky-500/10 text-sky-700 border border-sky-500/30'
                        }`}
                      >
                        {getStatusBadgeLabel(a.current_status)}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => exportAuditToPdf(a.audit_number, a.station_name)}
                          className="p-2 bg-white/80 hover:bg-white text-sky-700 rounded-xl border border-sky-200/80 shadow-sm transition-all"
                          title={t('auditsList.exportPdf')}
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenAudit(a.id)}
                          className="px-3.5 py-1.5 bg-sky-600/10 hover:bg-sky-600/20 text-sky-700 border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>{t('auditsList.viewEdit')}</span>
                          <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                        </button>
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

