import React, { useState, useMemo } from 'react';
import type { Station, User } from '../../types/audit';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  X,
  MapPin,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Fuel,
  ShieldCheck,
} from 'lucide-react';


interface Props {
  isOpen: boolean;
  stations: Station[];
  currentUser: User;
  onSelectStation: (station: Station) => void;
  onClose: () => void;
}

export const StationSelectionModal: React.FC<Props> = ({
  isOpen,
  stations,
  currentUser,
  onSelectStation,
  onClose,
}) => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // 1. Filter authorized stations
  const authorizedStations = useMemo(() => {
    return stations.filter((s) => {
      // Must be active station
      if (s.status !== 'active') return false;

      // If user is Operation Supervisor, verify authorization
      if (currentUser.role === 'Operation Supervisor') {
        const isAssigned =
          s.operation_supervisor_id === currentUser.id ||
          s.id === currentUser.assigned_station_id ||
          (s.operation_supervisor_name &&
            s.operation_supervisor_name.toLowerCase().includes(currentUser.full_name.toLowerCase()));

        // If user has explicit assigned station, restrict to assigned station(s)
        if (currentUser.assigned_station_id) {
          return s.id === currentUser.assigned_station_id;
        }

        // Otherwise allow assigned stations or all active stations if unassigned
        return isAssigned || true;
      }

      // Super Admin, Management, Account Manager, Accountant see all active stations
      return true;
    });
  }, [stations, currentUser]);

  // 2. Filter by search query across station_no, name, location, region, supervisor
  const filteredStations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return authorizedStations;

    return authorizedStations.filter((s) => {
      const matchNo = s.station_no.toLowerCase().includes(term);
      const matchName = s.name.toLowerCase().includes(term);
      const matchLoc = s.location.toLowerCase().includes(term);
      const matchRegion = (s.region || '').toLowerCase().includes(term);
      const matchSup = (s.operation_supervisor_name || '').toLowerCase().includes(term);

      return matchNo || matchName || matchLoc || matchRegion || matchSup;
    });
  }, [authorizedStations, searchTerm]);

  if (!isOpen) return null;

  const handleConfirmSelection = (stationToConfirm?: Station) => {
    const target =
      stationToConfirm ||
      filteredStations.find((s) => s.id === selectedStationId) ||
      authorizedStations.find((s) => s.id === selectedStationId);

    if (target) {
      onSelectStation(target);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-600 rounded-xl text-white shadow-2xs">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{t('stationSelect.modalTitle')}</h3>
              <p className="text-xs text-sky-800 font-extrabold">{t('stationSelect.modalSub')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REAL-TIME SEARCH BOX */}
        <div className="mt-4 mb-3 relative shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-sky-600 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('stationSelect.searchPlaceholder')}
              className="w-full bg-white border border-slate-300 rounded-xl ps-10 pe-10 py-2.5 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-600 font-extrabold">
            <span>
              {t('stationSelect.showingStations')
                .replace('{count}', filteredStations.length.toString())
                .replace('{total}', authorizedStations.length.toString())}
            </span>
            <span className="flex items-center gap-1 text-emerald-800 font-black bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {t('stationSelect.authorizedOnly')}
            </span>
          </div>
        </div>

        {/* STATIONS LIST GRID */}
        <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-2.5 min-h-[220px] max-h-[380px]">
          {filteredStations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium italic">
              {t('stationSelect.noStationsFound')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredStations.map((station) => {
                const isSelected = selectedStationId === station.id;

                return (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStationId(station.id)}
                    onDoubleClick={() => handleConfirmSelection(station)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-600 shadow-sm ring-2 ring-sky-500/20'
                        : 'bg-slate-50 hover:bg-sky-50/50 border-slate-200 hover:border-sky-300 shadow-2xs'
                    }`}
                  >
                    {/* TOP BADGE ROW */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[11px] font-black font-mono px-2.5 py-0.5 rounded-md border ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                      >
                        {station.station_no}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in-50" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-sky-500" />
                      )}
                    </div>

                    {/* STATION NAME & LOCATION */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-sky-900 transition-colors">
                        {station.name}
                      </h4>
                      
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{station.location}</span>
                      </div>

                      {station.region && (
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5 ps-4">
                          {station.region}
                        </div>
                      )}
                    </div>

                    {/* SUPERVISOR FOOTER */}
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-bold">{t('stationSelect.supervisor')}:</span>
                      <span className="font-extrabold text-slate-900 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                        {station.operation_supervisor_name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER BUTTONS */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            {t('common.cancel')}
          </button>

          <button
            type="button"
            disabled={!selectedStationId}
            onClick={() => handleConfirmSelection()}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span>{t('stationSelect.continueBtn')}</span>
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
