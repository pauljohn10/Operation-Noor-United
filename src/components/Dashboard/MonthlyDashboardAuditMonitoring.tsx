import React, { useState, useEffect, useMemo } from 'react';
import type { StationAudit, Station } from '../../types/audit';
import { useLanguage } from '../../context/LanguageContext';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface Props {
  audits: StationAudit[];
  stations: Station[];
}

export const MonthlyDashboardAuditMonitoring: React.FC<Props> = ({ audits, stations }) => {
  const { isRTL } = useLanguage();

  // Active registered stations from Station Registry master list
  const activeStations = stations.length > 0
    ? stations.filter((s) => s.status !== 'inactive')
    : [];

  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // State for separate Month (1-12) and Year selection
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeTab, setActiveTab] = useState<'completed' | 'not_completed'>('completed');
  const [searchTerm, setSearchTerm] = useState('');

  // Available Years dropdown dynamically populated from audits + default years
  const availableYears = useMemo(() => {
    const yrSet = new Set<number>([2024, 2025, 2026, 2027, currentYear]);
    audits.forEach((a) => {
      if (a.audit_date) {
        const yr = parseInt(a.audit_date.split('-')[0], 10);
        if (!isNaN(yr)) yrSet.add(yr);
      }
    });
    return Array.from(yrSet).sort((a, b) => b - a);
  }, [audits, currentYear]);

  // Derived YYYY-MM key based on selectedMonth & selectedYear
  const selectedMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Pagination states (strictly 10 stations per page)
  const ITEMS_PER_PAGE = 10;
  const [completedPage, setCompletedPage] = useState(1);
  const [notCompletedPage, setNotCompletedPage] = useState(1);

  // Reset pagination when month, year, search term, or active tab changes
  useEffect(() => {
    setCompletedPage(1);
    setNotCompletedPage(1);
  }, [selectedMonth, selectedYear, searchTerm, activeTab]);

  // Format Month & Year to display label (e.g. 8, 2026 -> "August 2026")
  const formatMonthLabel = (m: number, y: number) => {
    return `${monthNames[m - 1] || 'Month'} ${y}`;
  };

  // Filter audits matching the selected official audit_date month and year only
  const monthAudits = audits.filter((a) => a.audit_date?.startsWith(selectedMonthKey));

  // Determine completion status for every active registered station in master list
  const completedStationsList: Array<{
    station: Station;
    audit: StationAudit;
  }> = [];

  const notCompletedStationsList: Array<{
    station: Station;
    statusLabel: string;
    statusBadgeClass: string;
  }> = [];

  activeStations.forEach((station) => {
    // Check if station has an approved/completed audit in the selected month
    const completedAudit = monthAudits.find(
      (a) =>
        (a.station_id === station.id ||
          a.station_no === station.station_no ||
          a.station_name.toLowerCase() === station.name.toLowerCase()) &&
        a.current_status === 'approved'
    );

    if (completedAudit) {
      completedStationsList.push({
        station,
        audit: completedAudit,
      });
    } else {
      // Check if station has an in-progress audit
      const inProgressAudit = monthAudits.find(
        (a) =>
          a.station_id === station.id ||
          a.station_no === station.station_no ||
          a.station_name.toLowerCase() === station.name.toLowerCase()
      );

      let statusLabel = 'No Audit Submitted';
      let statusBadgeClass = 'bg-slate-100 text-slate-600 border-slate-300';

      if (inProgressAudit) {
        switch (inProgressAudit.current_status) {
          case 'pending_accountant':
            statusLabel = 'Pending Accountant Review';
            statusBadgeClass = 'bg-sky-50 text-sky-700 border-sky-300';
            break;
          case 'pending_account_manager':
            statusLabel = 'Pending Account Manager Review';
            statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
            break;
          case 'pending_management':
            statusLabel = 'Pending Management Review';
            statusBadgeClass = 'bg-purple-50 text-purple-700 border-purple-300';
            break;
          case 'rejected':
            statusLabel = 'Rejected Audit';
            statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-300';
            break;
          case 'returned_for_correction':
            statusLabel = 'Returned for Correction';
            statusBadgeClass = 'bg-yellow-50 text-yellow-700 border-yellow-300';
            break;
          default:
            statusLabel = 'Pending Audit';
            statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
        }
      }

      notCompletedStationsList.push({
        station,
        statusLabel,
        statusBadgeClass,
      });
    }
  });

  // Master KPI counts (Invariant: Total Active = Completed + Not Completed)
  const totalActiveStationsCount = activeStations.length;
  const completedCount = completedStationsList.length;
  const notCompletedCount = notCompletedStationsList.length;

  // Filter completed stations by search term
  const filteredCompleted = completedStationsList.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.station.name.toLowerCase().includes(term) ||
      item.station.station_no.toLowerCase().includes(term) ||
      (item.station.location && item.station.location.toLowerCase().includes(term))
    );
  });

  // Filter not completed stations by search term
  const filteredNotCompleted = notCompletedStationsList.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.station.name.toLowerCase().includes(term) ||
      item.station.station_no.toLowerCase().includes(term) ||
      (item.station.location && item.station.location.toLowerCase().includes(term))
    );
  });

  // Pagination for Completed Audit list (Strictly 10 per page)
  const totalCompletedItems = filteredCompleted.length;
  const totalCompletedPages = Math.max(1, Math.ceil(totalCompletedItems / ITEMS_PER_PAGE));
  const safeCompletedPage = Math.min(completedPage, totalCompletedPages);
  const startCompletedIdx = (safeCompletedPage - 1) * ITEMS_PER_PAGE;
  const endCompletedIdx = Math.min(startCompletedIdx + ITEMS_PER_PAGE, totalCompletedItems);
  const paginatedCompleted = filteredCompleted.slice(startCompletedIdx, endCompletedIdx);

  // Pagination for Not Completed Audit list (Strictly 10 per page)
  const totalNotCompletedItems = filteredNotCompleted.length;
  const totalNotCompletedPages = Math.max(1, Math.ceil(totalNotCompletedItems / ITEMS_PER_PAGE));
  const safeNotCompletedPage = Math.min(notCompletedPage, totalNotCompletedPages);
  const startNotCompletedIdx = (safeNotCompletedPage - 1) * ITEMS_PER_PAGE;
  const endNotCompletedIdx = Math.min(startNotCompletedIdx + ITEMS_PER_PAGE, totalNotCompletedItems);
  const paginatedNotCompleted = filteredNotCompleted.slice(startNotCompletedIdx, endNotCompletedIdx);

  // Page Numbers Generator Helper: Previous | 1 | 2 | 3 | ... | Last Page | Next
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
    <div className="space-y-6 pt-2">
      {/* 1. SECTION HEADER & SEPARATE MONTH & YEAR SELECTORS */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl p-5 sm:p-6 shadow-md ring-1 ring-slate-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            <span>Monthly Dashboard Audit Monitoring</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Station Registry Master List audit completion status for selected month
          </p>
        </div>

        {/* Separate Month and Year Selectors */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200/90 p-2 rounded-xl">
          <Calendar className="w-4 h-4 text-sky-600 ms-1" />
          
          {/* Month Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-700">Month:</span>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="appearance-none bg-white border border-sky-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-black text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-700">Year:</span>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-white border border-sky-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-black text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Registered Stations */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Stations</span>
            <p className="text-3xl font-black font-mono mt-1 text-white">{totalActiveStationsCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Active master list stations</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-slate-200">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Audit */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md border border-emerald-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Completed Audit</span>
            <p className="text-3xl font-black font-mono mt-1 text-white">{completedCount}</p>
            <p className="text-[10px] text-emerald-300/80 mt-1 font-medium">
              {totalActiveStationsCount > 0 ? ((completedCount / totalActiveStationsCount) * 100).toFixed(1) : 0}% of master list
            </p>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Not Completed Audit */}
        <div className="bg-gradient-to-br from-rose-900 to-rose-950 text-white rounded-2xl p-5 shadow-md border border-rose-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">Not Completed Audit</span>
            <p className="text-3xl font-black font-mono mt-1 text-white">{notCompletedCount}</p>
            <p className="text-[10px] text-rose-300/80 mt-1 font-medium">
              {totalActiveStationsCount > 0 ? ((notCompletedCount / totalActiveStationsCount) * 100).toFixed(1) : 0}% of master list
            </p>
          </div>
          <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-400/30 text-rose-300">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. TABS AND SEARCH CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Audit</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20">
                {completedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('not_completed')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'not_completed'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Not Completed Audit</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20">
                {notCompletedCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search station name or code..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
            />
          </div>
        </div>

        {/* 4. COMPLETED AUDIT TABLE */}
        {activeTab === 'completed' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Station Code / ID</th>
                    <th className="py-3 px-4">Station Name</th>
                    <th className="py-3 px-4">Audit Date</th>
                    <th className="py-3 px-4 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                  {paginatedCompleted.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                        No completed audits found for {formatMonthLabel(selectedMonth, selectedYear)}
                      </td>
                    </tr>
                  ) : (
                    paginatedCompleted.map(({ station, audit }) => (
                      <tr key={station.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-sky-900">{station.station_no}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">
                          {station.name}
                          {station.location && <span className="block text-[11px] text-slate-400 font-normal">{station.location}</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 font-bold">{audit.audit_date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300">
                            Completed Audit
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls — EXACTLY 10 STATIONS PER PAGE */}
            {totalCompletedItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-mono font-bold">
                  {isRTL
                    ? `عرض ${startCompletedIdx + 1}–${endCompletedIdx} من إجمالي ${totalCompletedItems} محطة`
                    : `Showing ${startCompletedIdx + 1}–${endCompletedIdx} of ${totalCompletedItems} stations`}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCompletedPage((prev) => Math.max(1, prev - 1))}
                    disabled={safeCompletedPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs flex items-center gap-1 min-h-[34px]"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500 rtl:rotate-180" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 font-mono font-bold">
                    {generatePageNumbers(safeCompletedPage, totalCompletedPages).map((p, idx) =>
                      typeof p === 'number' ? (
                        <button
                          key={p}
                          onClick={() => setCompletedPage(p)}
                          className={`min-w-[34px] h-8 rounded-xl flex items-center justify-center transition-all px-2 ${
                            safeCompletedPage === p
                              ? 'bg-emerald-600 text-white font-black shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-black">
                          ...
                        </span>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => setCompletedPage((prev) => Math.min(totalCompletedPages, prev + 1))}
                    disabled={safeCompletedPage === totalCompletedPages || totalCompletedPages === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs flex items-center gap-1 min-h-[34px]"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. NOT COMPLETED AUDIT TABLE */}
        {activeTab === 'not_completed' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Station Code / ID</th>
                    <th className="py-3 px-4">Station Name</th>
                    <th className="py-3 px-4 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                  {paginatedNotCompleted.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500 italic">
                        All registered stations completed their audit for {formatMonthLabel(selectedMonth, selectedYear)}
                      </td>
                    </tr>
                  ) : (
                    paginatedNotCompleted.map(({ station, statusLabel, statusBadgeClass }) => (
                      <tr key={station.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{station.station_no}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">
                          {station.name}
                          {station.location && <span className="block text-[11px] text-slate-400 font-normal">{station.location}</span>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadgeClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls — EXACTLY 10 STATIONS PER PAGE */}
            {totalNotCompletedItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-mono font-bold">
                  {isRTL
                    ? `عرض ${startNotCompletedIdx + 1}–${endNotCompletedIdx} من إجمالي ${totalNotCompletedItems} محطة`
                    : `Showing ${startNotCompletedIdx + 1}–${endNotCompletedIdx} of ${totalNotCompletedItems} stations`}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNotCompletedPage((prev) => Math.max(1, prev - 1))}
                    disabled={safeNotCompletedPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs flex items-center gap-1 min-h-[34px]"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500 rtl:rotate-180" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 font-mono font-bold">
                    {generatePageNumbers(safeNotCompletedPage, totalNotCompletedPages).map((p, idx) =>
                      typeof p === 'number' ? (
                        <button
                          key={p}
                          onClick={() => setNotCompletedPage(p)}
                          className={`min-w-[34px] h-8 rounded-xl flex items-center justify-center transition-all px-2 ${
                            safeNotCompletedPage === p
                              ? 'bg-rose-600 text-white font-black shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-black">
                          ...
                        </span>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => setNotCompletedPage((prev) => Math.min(totalNotCompletedPages, prev + 1))}
                    disabled={safeNotCompletedPage === totalNotCompletedPages || totalNotCompletedPages === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs flex items-center gap-1 min-h-[34px]"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
