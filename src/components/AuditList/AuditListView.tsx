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
  const { t, isRTL } = useLanguage();
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

  // Date Group Header Label Helper
  const getGroupHeaderLabel = (dateStr: string) => {
    if (!dateStr) return isRTL ? 'تاريخ غير معروف' : 'Unknown Date';

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yYear = yesterdayDate.getFullYear();
    const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

    if (dateStr === todayStr) {
      return isRTL ? 'اليوم' : 'Today';
    } else if (dateStr === yesterdayStr) {
      return isRTL ? 'أمس' : 'Yesterday';
    } else {
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const mIdx = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          const dateObj = new Date(y, mIdx, d);

          const dayFormatted = String(d).padStart(2, '0');
          const monthFormatted = dateObj.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { month: 'short' });
          return `${dayFormatted} ${monthFormatted} ${y}`;
        }
      } catch (e) {
        // fallback
      }
      return dateStr;
    }
  };

  // Group filtered audits by Audit Date
  const groupedAuditsMap = filtered.reduce((acc, audit) => {
    const dateKey = audit.audit_date || 'Unknown Date';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(audit);
    return acc;
  }, {} as Record<string, StationAudit[]>);

  // Sort group date keys descending (newest date first)
  const sortedDateKeys = Object.keys(groupedAuditsMap).sort((a, b) => b.localeCompare(a));

  const groupedAudits = sortedDateKeys.map((dateKey) => {
    const auditsInGroup = [...groupedAuditsMap[dateKey]].sort((a, b) => b.audit_number.localeCompare(a.audit_number));
    return {
      dateKey,
      displayLabel: getGroupHeaderLabel(dateKey),
      audits: auditsInGroup,
    };
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

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/10 backdrop-blur-3xl border border-white/25 p-4 rounded-2xl shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-sky-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('auditsList.searchPlaceholder')}
            className="w-full bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white placeholder-sky-200/70 focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all shadow-inner"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white/15 backdrop-blur-xl border border-white/30 text-xs font-bold rounded-xl px-3 py-2 text-white focus:outline-none focus:bg-white/25 transition-all shadow-sm"
          >
            <option value="ALL" className="bg-slate-900 text-white">{t('auditsList.allStatuses')}</option>
            <option value="pending_accountant" className="bg-slate-900 text-white">{t('auditsList.statusPendingAccountant')}</option>
            <option value="pending_account_manager" className="bg-slate-900 text-white">{t('auditsList.statusPendingAccountManager')}</option>
            <option value="pending_management" className="bg-slate-900 text-white">{t('auditsList.statusPendingManagement')}</option>
            <option value="approved" className="bg-slate-900 text-white">{t('auditsList.statusApproved')}</option>
            <option value="rejected" className="bg-slate-900 text-white">{t('auditsList.statusRejected')}</option>
            <option value="returned_for_correction" className="bg-slate-900 text-white">{t('auditsList.statusReturned')}</option>
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

      {/* AUDITS DATA TABLE */}
      <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[28px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-white/15 text-white uppercase font-black border-b border-white/25">
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
            <tbody className="divide-y divide-white/15 text-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sky-200/90 font-medium italic">
                    {t('auditsList.noAuditsFound')}
                  </td>
                </tr>
              ) : (
                groupedAudits.map((group) => (
                  <React.Fragment key={group.dateKey}>
                    {/* DATE GROUP HEADER ROW */}
                    <tr className="bg-slate-950/40 backdrop-blur-xl border-y border-white/20">
                      <td colSpan={7} className="px-5 py-3 text-start">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-sky-500/20 text-sky-300 rounded-lg border border-sky-400/30">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-black text-white tracking-wide drop-shadow-sm">
                            {group.displayLabel}
                          </span>
                          <span className="text-[11px] font-bold text-sky-200/90 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                            {group.audits.length} {group.audits.length === 1 ? 'Audit' : 'Audits'}
                          </span>
                          <div className="flex-1 h-[1px] bg-gradient-to-r from-sky-400/30 via-white/15 to-transparent ms-2"></div>
                        </div>
                      </td>
                    </tr>

                    {/* AUDIT ROWS IN THIS GROUP */}
                    {group.audits.map((a) => (
                      <tr key={a.id} className="odd:bg-white/5 even:bg-white/10 hover:bg-white/20 transition-all border-b border-white/10">
                        <td className="p-4 text-center">
                          <p className="font-black text-sky-300 flex items-center justify-center gap-1.5 drop-shadow-sm font-mono text-xs">
                            <FileText className="w-4 h-4 text-sky-300" />
                            <span>{a.audit_number}</span>
                          </p>
                          <p className="text-[11px] text-sky-200/90 font-bold mt-0.5 flex items-center justify-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-sky-300" />
                            <span>{a.audit_date}</span>
                          </p>
                        </td>

                        <td className="p-4 text-center">
                          <p className="font-extrabold text-white text-xs drop-shadow-sm">{a.station_name}</p>
                          <p className="text-[11px] text-sky-200/90 font-medium">{a.location}</p>
                        </td>

                        <td className="p-4 text-center">
                          <p className="text-white font-extrabold drop-shadow-sm">{a.created_by_name || 'Operation Supervisor'}</p>
                        </td>

                        <td className="p-4 text-center">
                          <p className="font-black text-white text-sm font-mono drop-shadow-sm">{formatCurrency(a.total_sales)} {t('common.sar')}</p>
                          <p className="text-[11px] text-sky-200/90 font-mono font-bold mt-0.5">{formatCurrency(a.total_quantity)} {t('common.liters')}</p>
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`font-black font-mono text-xs drop-shadow-sm ${
                              a.discrepancy_amount < 0
                                ? 'text-rose-300'
                                : a.discrepancy_amount > 0
                                ? 'text-emerald-300'
                                : 'text-sky-200'
                            }`}
                          >
                            {formatCurrency(a.discrepancy_amount)} {t('common.sar')}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
                              a.current_status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : a.current_status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                                : a.current_status === 'returned_for_correction'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                : 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                            }`}
                          >
                            {getStatusBadgeLabel(a.current_status)}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => exportAuditToPdf(a.audit_number, a.station_name)}
                              className="p-2 bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/30 shadow-sm transition-all"
                              title={t('auditsList.exportPdf')}
                            >
                              <FileDown className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenAudit(a.id)}
                              className="px-3.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-white border border-sky-400/40 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <span>{t('auditsList.viewEdit')}</span>
                              <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

