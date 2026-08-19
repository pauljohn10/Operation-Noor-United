import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
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

  // Pagination state (default 20 audits per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Reset to page 1 whenever search, status, station, or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedStation, itemsPerPage]);

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

  // Calculate total pages & slice filtered audits for the current page
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedFiltered = filtered.slice(startIndex, endIndex);

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

  // Group paginated audits by Audit Date (preserving date-grouped layout)
  const groupedAuditsMap = paginatedFiltered.reduce((acc, audit) => {
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

  // Helper for generating page numbers: Previous | 1 | 2 | 3 | … | Last Page | Next
  const generatePageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('auditsList.searchPlaceholder')}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
          >
            <option value="ALL">{t('auditsList.allStatuses')}</option>
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

      {/* AUDITS DATA TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium italic">
                    {t('auditsList.noAuditsFound')}
                  </td>
                </tr>
              ) : (
                groupedAudits.map((group) => (
                  <React.Fragment key={group.dateKey}>
                    {/* DATE GROUP HEADER ROW */}
                    <tr className="bg-slate-100/90 border-y border-slate-200">
                      <td colSpan={7} className="px-5 py-3 text-start">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg border border-sky-200">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-black text-slate-900 tracking-wide">
                            {group.displayLabel}
                          </span>
                          <span className="text-[11px] font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                            {group.audits.length} {group.audits.length === 1 ? 'Audit' : 'Audits'}
                          </span>
                          <div className="flex-1 h-[1px] bg-slate-200 ms-2"></div>
                        </div>
                      </td>
                    </tr>

                    {/* AUDIT ROWS IN THIS GROUP */}
                    {group.audits.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-all border-b border-slate-100">
                        <td className="p-4 text-center">
                          <p className="font-black text-sky-900 flex items-center justify-center gap-1.5 font-mono text-xs">
                            <FileText className="w-4 h-4 text-sky-600" />
                            <span>{a.audit_number}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-bold mt-0.5 flex items-center justify-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{a.audit_date}</span>
                          </p>
                        </td>

                        <td className="p-4 text-center">
                          <p className="font-extrabold text-slate-900 text-xs">{a.station_name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{a.location}</p>
                        </td>

                        <td className="p-4 text-center">
                          <p className="text-slate-800 font-extrabold">{a.created_by_name || 'Operation Supervisor'}</p>
                        </td>

                        <td className="p-4 text-center">
                          <p className="font-black text-slate-900 text-sm font-mono">{formatCurrency(a.total_sales)} {t('common.sar')}</p>
                          <p className="text-[11px] text-slate-500 font-mono font-bold mt-0.5">{formatCurrency(a.total_quantity)} {t('common.liters')}</p>
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
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : a.current_status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-300'
                                : a.current_status === 'returned_for_correction'
                                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                                : 'bg-sky-50 text-sky-700 border border-sky-300'
                            }`}
                          >
                            {getStatusBadgeLabel(a.current_status)}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => exportAuditToPdf(a.audit_number, a.station_name)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition-all"
                              title={t('auditsList.exportPdf')}
                            >
                              <FileDown className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenAudit(a.id)}
                              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs"
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

        {/* PAGINATION CONTROLS BAR */}
        {totalItems > 0 && (
          <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50/95 backdrop-blur-md border-t border-slate-200 shadow-md">
            {/* Items Per Page & Display Range */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">{isRTL ? 'العناصر لكل صفحة:' : 'Items per page:'}</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer shadow-2xs"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <span className="text-slate-600 font-mono text-xs font-bold">
                {isRTL
                  ? `عرض ${startIndex + 1}–${endIndex} من إجمالي ${totalItems}`
                  : `Showing ${startIndex + 1}–${endIndex} of ${totalItems}`}
              </span>
            </div>

            {/* Page Navigation Controls: Previous | 1 | 2 | 3 | … | Last Page | Next */}
            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all shadow-2xs flex items-center gap-1 min-h-[36px]"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180 text-slate-500" />
                <span>{isRTL ? 'السابق' : 'Previous'}</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                {generatePageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                  typeof p === 'number' ? (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[36px] h-9 rounded-xl flex items-center justify-center transition-all px-2.5 ${
                        safeCurrentPage === p
                          ? 'bg-sky-600 text-white font-black shadow-xs ring-2 ring-sky-600/30'
                          : 'bg-white border border-slate-200 text-slate-700 font-extrabold hover:bg-slate-100 hover:border-slate-300'
                      }`}
                      title={p === totalPages && totalPages > 5 ? (isRTL ? 'الصفحة الأخيرة' : 'Last Page') : `Page ${p}`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 font-black">
                      …
                    </span>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all shadow-2xs flex items-center gap-1 min-h-[36px]"
              >
                <span>{isRTL ? 'التالي' : 'Next'}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


