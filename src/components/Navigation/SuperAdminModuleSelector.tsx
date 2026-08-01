import React from 'react';
import { Fuel, Building, ShieldCheck } from 'lucide-react';

interface Props {
  activeModule: 'audits' | 'station-openings';
  onSelectModule: (module: 'audits' | 'station-openings') => void;
}

export const SuperAdminModuleSelector: React.FC<Props> = ({
  activeModule,
  onSelectModule,
}) => {

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-3 sm:p-4 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.12)] ring-1 ring-white/60">
        {/* TOP BAR / LABEL */}
        <div className="flex items-center justify-between gap-3 mb-3 px-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 text-purple-700 rounded-xl border border-purple-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 tracking-tight">Super Admin System Switcher</span>
              <span className="hidden sm:inline-block text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full ml-2 border border-purple-200">
                Full System Control
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-extrabold hidden md:inline-block">
            Select Active Module to Oversee
          </span>
        </div>

        {/* 2 VISUALLY DISTINCT SEGMENTED MODULE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CARD 1: STATION AUDIT SYSTEM */}
          <button
            onClick={() => onSelectModule('audits')}
            className={`group relative text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between border ${
              activeModule === 'audits'
                ? 'bg-gradient-to-r from-sky-600/10 via-blue-600/10 to-indigo-600/15 border-sky-500/60 shadow-lg shadow-sky-600/10 ring-2 ring-sky-500/40'
                : 'bg-white/50 hover:bg-white/80 border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div
                className={`p-3 rounded-2xl transition-all ${
                  activeModule === 'audits'
                    ? 'bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30 scale-105'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700'
                }`}
              >
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-black tracking-tight ${activeModule === 'audits' ? 'text-sky-950' : 'text-slate-900'}`}>
                    Station Audit System
                  </h3>
                  {activeModule === 'audits' && (
                    <span className="px-2 py-0.5 bg-sky-600 text-white text-[9px] font-black uppercase rounded-full tracking-wider shadow-sm">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Fuel Inventory, Pumps, Tanks & Cash Audits
                </p>
              </div>
            </div>

            <div
              className={`w-3 h-3 rounded-full border-2 transition-all shrink-0 ${
                activeModule === 'audits'
                  ? 'border-sky-600 bg-sky-600 ring-4 ring-sky-500/20'
                  : 'border-slate-300 bg-transparent group-hover:border-sky-400'
              }`}
            />
          </button>

          {/* CARD 2: STATION OPENING FORM */}
          <button
            onClick={() => onSelectModule('station-openings')}
            className={`group relative text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between border ${
              activeModule === 'station-openings'
                ? 'bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-emerald-600/15 border-amber-500/60 shadow-lg shadow-amber-600/10 ring-2 ring-amber-500/40'
                : 'bg-white/50 hover:bg-white/80 border-slate-200/80 hover:border-amber-300 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div
                className={`p-3 rounded-2xl transition-all ${
                  activeModule === 'station-openings'
                    ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30 scale-105'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700'
                }`}
              >
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-black tracking-tight ${activeModule === 'station-openings' ? 'text-amber-950' : 'text-slate-900'}`}>
                    Station Opening Form
                  </h3>
                  {activeModule === 'station-openings' && (
                    <span className="px-2 py-0.5 bg-amber-600 text-white text-[9px] font-black uppercase rounded-full tracking-wider shadow-sm">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  New Station Onboarding & Multi-Stage Approvals
                </p>
              </div>
            </div>

            <div
              className={`w-3 h-3 rounded-full border-2 transition-all shrink-0 ${
                activeModule === 'station-openings'
                  ? 'border-amber-600 bg-amber-600 ring-4 ring-amber-500/20'
                  : 'border-slate-300 bg-transparent group-hover:border-amber-400'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
