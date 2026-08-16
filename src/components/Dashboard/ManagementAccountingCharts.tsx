import React, { useState } from 'react';
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

  const total = audits.length;
  const completed = audits.filter((a) => a.current_status === 'approved').length;
  const returned = audits.filter((a) => a.current_status === 'returned_for_correction').length;
  const rejected = audits.filter((a) => a.current_status === 'rejected').length;
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
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/20">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Audit Status Breakdown</h3>
            <p className="text-[11px] text-slate-500 font-medium">Distribution by workflow status</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-lg font-mono">
          Total: {total}
        </span>
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
