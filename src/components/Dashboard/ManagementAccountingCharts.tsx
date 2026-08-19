import React, { useState, useMemo } from 'react';
import type { StationAudit } from '../../types/audit';
import { PieChart, TrendingUp, Calendar } from 'lucide-react';

interface Props {
  audits: StationAudit[];
}

/**
 * Audit Status Donut Chart
 * Slices: Completed (approved), Pending, Returned (returned_for_correction), Rejected (rejected)
 */
export const AuditStatusDonutChart: React.FC<Props> = ({ audits }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Month & Year filter state (defaults to current month and year)
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Available Years dropdown choices
  const years = useMemo(() => {
    const currentYr = new Date().getFullYear();
    const yrSet = new Set<number>([2024, 2025, 2026, 2027, currentYr]);
    audits.forEach((a) => {
      if (a.audit_date) {
        const yr = parseInt(a.audit_date.split('-')[0], 10);
        if (!isNaN(yr)) yrSet.add(yr);
      }
    });
    return Array.from(yrSet).sort((a, b) => b - a);
  }, [audits]);

  // Filter audits matching selected official audit_date month and year
  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      if (!a.audit_date) return false;
      const parts = a.audit_date.split('-'); // Format: YYYY-MM-DD
      if (parts.length < 2) return false;
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10);
      return yr === selectedYear && mo === selectedMonth;
    });
  }, [audits, selectedMonth, selectedYear]);

  const total = filteredAudits.length;
  const completed = filteredAudits.filter((a) => a.current_status === 'approved').length;
  const returned = filteredAudits.filter((a) => a.current_status === 'returned_for_correction').length;
  const rejected = filteredAudits.filter((a) => a.current_status === 'rejected').length;
  const pending = total - (completed + returned + rejected);

  const statusItems = [
    { label: 'Completed', count: completed, color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600', borderClass: 'border-emerald-200' },
    { label: 'Pending', count: pending, color: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-600', borderClass: 'border-amber-200' },
    { label: 'Returned', count: returned, color: '#0284c7', bgClass: 'bg-sky-500', textClass: 'text-sky-600', borderClass: 'border-sky-200' },
    { label: 'Rejected', count: rejected, color: '#f43f5e', bgClass: 'bg-rose-500', textClass: 'text-rose-600', borderClass: 'border-rose-200' },
  ];

  // SVG Donut calculation
  const radius = 68;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius; // ~427.25

  let accumulatedPercent = 0;

  const slices = statusItems.map((item, idx) => {
    const percent = total > 0 ? item.count / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...item,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl p-5 sm:p-6 shadow-md ring-1 ring-slate-900/5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Audit Status Breakdown</h3>
            <p className="text-[11px] text-slate-500 font-medium">Distribution by workflow status</p>
          </div>
        </div>

        {/* Separate Month and Year Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-extrabold text-slate-600">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-extrabold text-slate-600">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer shadow-2xs"
            >
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-lg font-mono ms-1">
            Total: {total}
          </span>
        </div>
      </div>

      {/* Donut & Legend Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-auto">
        {/* Donut SVG */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 180 180">
            {/* Background Circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {total > 0 &&
              slices.map((slice) => (
                <circle
                  key={slice.label}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer hover:opacity-85"
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
          </svg>
          {/* Donut Inner Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-black text-slate-900 font-mono leading-none">
              {hoveredIdx !== null ? slices[hoveredIdx].count : total}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              {hoveredIdx !== null ? slices[hoveredIdx].label : 'Total Audits'}
            </span>
            {hoveredIdx !== null && total > 0 && (
              <span className="text-[10px] font-extrabold text-sky-600 mt-0.5">
                {slices[hoveredIdx].percent}%
              </span>
            )}
          </div>
        </div>

        {/* Legend Grid */}
        <div className="space-y-2.5">
          {slices.map((slice) => (
            <div
              key={slice.label}
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                hoveredIdx === slice.idx
                  ? 'bg-slate-100/90 border-slate-300 shadow-xs scale-[1.02]'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${slice.bgClass} shadow-2xs`} />
                <span className="text-xs font-bold text-slate-800">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs font-black text-slate-900">{slice.count}</span>
                <span className="text-[10px] font-bold text-slate-500">
                  ({slice.percent}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Monthly Audits Line Chart
 * Maps audits count across 12 months (Jan - Dec) using official audit_date
 */
export const MonthlyAuditsLineChart: React.FC<Props> = ({ audits }) => {
  const [hoveredMonth, setHoveredMonth] = useState<{ month: string; count: number; x: number; y: number } | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Count audits per month (0 to 11) using audit_date
  const monthlyCounts = new Array(12).fill(0);
  audits.forEach((audit) => {
    if (audit.audit_date) {
      const dateObj = new Date(audit.audit_date);
      if (!isNaN(dateObj.getTime())) {
        const month = dateObj.getMonth();
        if (month >= 0 && month < 12) {
          monthlyCounts[month]++;
        }
      }
    }
  });

  const maxCount = Math.max(...monthlyCounts, 5); // At least 5 for Y-scale headroom

  // SVG dimensions
  const svgWidth = 460;
  const svgHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute (x, y) coordinates for each of the 12 data points
  const points = monthlyCounts.map((count, i) => {
    const x = paddingLeft + (i / 11) * chartWidth;
    const y = paddingTop + chartHeight - (count / maxCount) * chartHeight;
    return { month: monthNames[i], count, x, y };
  });

  // SVG path definitions
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Closed area path for background gradient fill
  const areaD = `${pathD} L ${points[11].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Grid line Y values (3 horizontal lines)
  const yTicks = [0, Math.round(maxCount / 2), maxCount];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl p-5 sm:p-6 shadow-md ring-1 ring-slate-900/5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Monthly Audits Trend</h3>
            <p className="text-[11px] text-slate-500 font-medium">Audit volume per month (Jan – Dec)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-200">
          <Calendar className="w-3.5 h-3.5" />
          <span>Audit Date Source</span>
        </div>
      </div>

      {/* Line Chart SVG Container */}
      <div className="relative w-full overflow-hidden my-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Grid Lines */}
          {yTicks.map((val) => {
            const y = paddingTop + chartHeight - (val / maxCount) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="700"
                  fill="#64748b"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#lineGrad)" />

          {/* Main Trend Line */}
          <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Data Points */}
          {points.map((pt) => (
            <g key={pt.month}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth="2"
                className="transition-all duration-150 cursor-pointer hover:r-6 hover:fill-indigo-600"
                onMouseEnter={() => setHoveredMonth(pt)}
                onMouseLeave={() => setHoveredMonth(null)}
              />
              {/* X-Axis Month Label */}
              <text
                x={pt.x}
                y={svgHeight - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#475569"
              >
                {pt.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredMonth && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-xl border border-slate-700 transform -translate-x-1/2 -translate-y-full mb-2 transition-all"
            style={{
              left: `${(hoveredMonth.x / svgWidth) * 100}%`,
              top: `${(hoveredMonth.y / svgHeight) * 100}%`,
            }}
          >
            <div>{hoveredMonth.month}: <span className="text-sky-400 font-mono">{hoveredMonth.count}</span> Audits</div>
          </div>
        )}
      </div>
    </div>
  );
};

import { Coins } from 'lucide-react';
import { formatCurrency } from '../../lib/calculations';

/**
 * Monthly Discrepancy Chart
 * Shows total audit discrepancy in SAR per month (Jan - Dec) grouped by official audit_date
 */
export const MonthlyDiscrepancyBarChart: React.FC<Props> = ({ audits }) => {
  const [hoveredData, setHoveredData] = useState<{ month: string; amount: number; x: number; y: number; width: number } | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Sum audit discrepancy in SAR per month (0 to 11) using audit_date
  const monthlyDiscrepancies = new Array(12).fill(0);

  audits.forEach((audit) => {
    if (audit.audit_date && audit.discrepancy_amount != null) {
      const dateObj = new Date(audit.audit_date);
      if (!isNaN(dateObj.getTime())) {
        const month = dateObj.getMonth();
        if (month >= 0 && month < 12) {
          // Take absolute value of shortage/discrepancy amount in SAR
          const disc = Math.abs(Number(audit.discrepancy_amount));
          monthlyDiscrepancies[month] += disc;
        }
      }
    }
  });

  const totalAnnualDiscrepancy = monthlyDiscrepancies.reduce((a, b) => a + b, 0);
  const maxDiscrepancy = Math.max(...monthlyDiscrepancies, 100); // Minimum 100 SAR for scale headroom

  // SVG Dimensions
  const svgWidth = 920;
  const svgHeight = 220;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const barWidth = 32;
  const numBars = 12;
  const gap = (chartWidth - numBars * barWidth) / (numBars - 1);

  const bars = monthlyDiscrepancies.map((amount, i) => {
    const x = paddingLeft + i * (barWidth + gap);
    const h = (amount / maxDiscrepancy) * chartHeight;
    const y = paddingTop + chartHeight - h;
    return { month: monthNames[i], amount: Number(amount.toFixed(2)), x, y, h, width: barWidth };
  });

  // Grid line Y values (3 horizontal ticks)
  const yTicks = [0, Math.round(maxDiscrepancy / 2), Math.round(maxDiscrepancy)];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl p-5 sm:p-6 shadow-md ring-1 ring-slate-900/5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Monthly Discrepancy (SAR)</h3>
            <p className="text-[11px] text-slate-500 font-medium">Total audit discrepancy per month grouped by official audit date</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-black flex items-center gap-1.5 font-mono">
            <span className="text-[10px] text-rose-600 uppercase font-sans font-bold">Total Discrepancy:</span>
            <span>{formatCurrency(totalAnnualDiscrepancy)} SAR</span>
          </div>
        </div>
      </div>

      {/* Bar Chart SVG Container */}
      <div className="relative w-full overflow-hidden my-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Y-Axis Grid Lines */}
          {yTicks.map((val) => {
            const y = paddingTop + chartHeight - (val / maxDiscrepancy) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft - 5}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="700"
                  fill="#64748b"
                  fontFamily="monospace"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {bars.map((bar) => {
            const isHovered = hoveredData?.month === bar.month;
            return (
              <g key={bar.month} className="cursor-pointer">
                {/* Bar Rect */}
                <rect
                  x={bar.x}
                  y={bar.h > 0 ? bar.y : paddingTop + chartHeight - 2}
                  width={bar.width}
                  height={bar.h > 0 ? bar.h : 2}
                  rx="6"
                  ry="6"
                  fill={isHovered ? 'url(#barHoverGradient)' : 'url(#barGradient)'}
                  className="transition-all duration-200 hover:opacity-90"
                  onMouseEnter={() => setHoveredData(bar)}
                  onMouseLeave={() => setHoveredData(null)}
                />

                {/* Top Amount Badge for bars > 0 */}
                {bar.amount > 0 && (
                  <text
                    x={bar.x + bar.width / 2}
                    y={bar.y - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="800"
                    fill="#be123c"
                    fontFamily="monospace"
                  >
                    {Math.round(bar.amount)}
                  </text>
                )}

                {/* X-Axis Month Label */}
                <text
                  x={bar.x + bar.width / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill={isHovered ? '#be123c' : '#475569'}
                >
                  {bar.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredData && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 transform -translate-x-1/2 -translate-y-full mb-2 transition-all"
            style={{
              left: `${((hoveredData.x + hoveredData.width / 2) / svgWidth) * 100}%`,
              top: `${(hoveredData.y / svgHeight) * 100}%`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span>{hoveredData.month}:</span>
              <span className="text-rose-400 font-mono">{formatCurrency(hoveredData.amount)} SAR</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { UserCheck, ChevronDown, Award } from 'lucide-react';

/**
 * Operation Supervisor Performance Bar Chart
 * Shows completed audits per Operation Supervisor for the selected month
 */
export const SupervisorPerformanceBarChart: React.FC<Props> = ({ audits }) => {
  const currentYear = new Date().getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Derive available YYYY-MM month keys dynamically from audit_date
  const availableMonthKeys = Array.from(
    new Set(
      audits
        .map((a) => a.audit_date?.substring(0, 7))
        .filter((val): val is string => Boolean(val && /^\d{4}-\d{2}$/.test(val)))
    )
  ).sort().reverse();

  // Fallback to current month if no dates in audits
  const todayKey = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  if (!availableMonthKeys.includes(todayKey)) {
    availableMonthKeys.unshift(todayKey);
  }

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(availableMonthKeys[0] || todayKey);

  // Filter completed audits for selected month
  const monthAudits = audits.filter((a) => {
    return a.audit_date?.startsWith(selectedMonthKey) && a.current_status === 'approved';
  });

  // Group by Operation Supervisor name
  const supervisorCounts: Record<string, number> = {};
  monthAudits.forEach((a) => {
    const name = a.created_by_name || 'Operation Supervisor';
    supervisorCounts[name] = (supervisorCounts[name] || 0) + 1;
  });

  const sortedData = Object.entries(supervisorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Format month key for display e.g. "2026-08" -> "August 2026"
  const formatMonthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const mIdx = parseInt(m, 10) - 1;
    return `${monthNames[mIdx] || 'Month'} ${y}`;
  };

  const maxCount = Math.max(...sortedData.map((d) => d.count), 5);
  const totalMonthCompleted = sortedData.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl p-5 sm:p-6 shadow-md ring-1 ring-slate-900/5 flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Operation Supervisor Performance</h3>
            <p className="text-[11px] text-slate-500 font-medium">Completed audits per Operation Supervisor for the selected month</p>
          </div>
        </div>

        {/* Month Selector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700">Month:</span>
          <div className="relative">
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="appearance-none bg-white border border-sky-200/90 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-extrabold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
            >
              {availableMonthKeys.map((key) => (
                <option key={key} value={key}>
                  {formatMonthLabel(key)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {sortedData.length === 0 ? (
        <div className="py-12 text-center my-auto">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">No completed audits recorded for {formatMonthLabel(selectedMonthKey)}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Select another month from the dropdown filter above.</p>
        </div>
      ) : (
        <div className="space-y-4 my-auto">
          {/* Horizontal Bar Visualizations */}
          <div className="space-y-3">
            {sortedData.map((item, idx) => {
              const percent = Math.round((item.count / maxCount) * 100);
              const totalPercent = totalMonthCompleted > 0 ? Math.round((item.count / totalMonthCompleted) * 100) : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg text-[11px]">
                      {item.count} Audits <span className="text-slate-400 font-sans font-bold">({totalPercent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Summary Table */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-1.5 px-2">Operation Supervisor</th>
                    <th className="py-1.5 px-2 text-right">Completed Audits</th>
                    <th className="py-1.5 px-2 text-right">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {sortedData.map((item) => (
                    <tr key={item.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-2 font-extrabold text-slate-900">{item.name}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-sky-700">{item.count}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-500">
                        {totalMonthCompleted > 0 ? ((item.count / totalMonthCompleted) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
