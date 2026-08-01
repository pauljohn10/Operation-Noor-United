import React, { useState } from 'react';
import type { Station } from '../../../types/audit';
import { useLanguage } from '../../../context/LanguageContext';
import { Search, Building2, MapPin, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  stations: Station[];
  onSelectStation: (station: Station) => void;
  onClose: () => void;
}

export const SOStationSelectModal: React.FC<Props> = ({
  isOpen,
  stations,
  onSelectStation,
  onClose,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredStations = stations.filter((s) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(term);
    const noMatch = s.station_no?.toLowerCase().includes(term);
    const cityMatch = (s as any).city?.toLowerCase().includes(term);
    const addressMatch = (s as any).address?.toLowerCase().includes(term);
    return nameMatch || noMatch || cityMatch || addressMatch;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[28px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL HEADER */}
        <div className="flex items-center gap-3 border-b border-sky-100 pb-4 shrink-0">
          <div className="p-3 bg-sky-500/10 text-sky-600 rounded-2xl border border-sky-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">{t('so.selectStationTitle')}</h3>
            <p className="text-xs text-slate-600 font-bold">
              {t('so.selectStationSub')}
            </p>
          </div>
        </div>

        {/* SEARCH INPUT BAR */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('so.searchStationPlaceholder')}
            className="w-full bg-white/80 backdrop-blur-md border border-sky-200/80 rounded-2xl ps-10 pe-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/15 focus:border-sky-500 shadow-sm"
          />
        </div>

        {/* STATIONS LIST CONTAINER */}
        <div className="overflow-y-auto space-y-3 pe-1 grow min-h-[250px]">
          {filteredStations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-extrabold text-xs">
              {t('so.noMatchingStations')}
            </div>
          ) : (
            filteredStations.map((station) => (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className="group bg-white/70 hover:bg-sky-500/10 backdrop-blur-md border border-sky-200/80 hover:border-sky-500/50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-700 font-black text-[11px] rounded-full border border-sky-500/20">
                      {station.station_no}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-sky-900">
                      {station.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{(station as any).address || (station as any).city || 'Saudi Arabia'}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white group-hover:bg-sky-600 group-hover:text-white text-sky-600 rounded-xl border border-sky-200/80 transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
