import React, { useState } from 'react';
import type { Station, User } from '../../types/audit';
import { Building, Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { generateUUID } from '../../lib/supabaseClient';

interface Props {
  stations: Station[];
  users: User[];
  onSaveStation: (station: Station) => Promise<void>;
  onDeleteStation: (id: string) => Promise<void>;
}

export const StationManagement: React.FC<Props> = ({
  stations,
  users,
  onSaveStation,
  onDeleteStation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Partial<Station> | null>(null);

  const operationSupervisors = users.filter((u) => u.role === 'Operation Supervisor' || u.role === 'Super Admin');

  const sortedStations = [...stations].sort((a, b) => {
    const numA = parseInt(a.station_no.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.station_no.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  const filtered = sortedStations.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.station_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNextStationCode = (): string => {
    let maxCode = 0;
    stations.forEach((s) => {
      if (s.station_no) {
        const rawDigits = s.station_no.replace(/\D/g, '');
        const num = parseInt(rawDigits, 10);
        if (!isNaN(num) && num > maxCode) {
          maxCode = num;
        }
      }
    });
    return (maxCode + 1).toString();
  };

  const handleOpenAdd = () => {
    const nextCode = getNextStationCode();
    setEditingStation({
      id: generateUUID(),
      station_no: nextCode,
      name: '',
      location: '',
      region: 'Central Region',
      status: 'active',
      operation_supervisor_id: operationSupervisors[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (station: Station) => {
    setEditingStation(station);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation || !editingStation.name || !editingStation.station_no) return;

    const assignedSuper = operationSupervisors.find((u) => u.id === editingStation.operation_supervisor_id);

    const stationObj: Station = {
      id: editingStation.id || generateUUID(),
      station_no: editingStation.station_no,
      name: editingStation.name,
      location: editingStation.location || 'Saudi Arabia',
      region: editingStation.region || 'Central Region',
      status: editingStation.status || 'active',
      operation_supervisor_id: editingStation.operation_supervisor_id,
      operation_supervisor_name: assignedSuper ? assignedSuper.full_name : 'Unassigned',
      created_at: editingStation.created_at || new Date().toISOString(),
    };

    await onSaveStation(stationObj);
    setIsModalOpen(false);
    setEditingStation(null);
  };

  const handleToggleStatus = async (station: Station) => {
    const updated: Station = {
      ...station,
      status: station.status === 'active' ? 'inactive' : 'active',
    };
    await onSaveStation(updated);
  };

  return (
    <div className="space-y-6">
      {/* HEADER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/10 backdrop-blur-3xl border border-white/25 p-4 rounded-2xl shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-sky-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stations by name, station #, location..."
            className="w-full bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white placeholder-sky-200/70 focus:outline-none focus:bg-white/25 focus:border-white/50 focus:ring-4 focus:ring-sky-400/20 transition-all shadow-inner"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Station</span>
        </button>
      </div>

      {/* STATIONS TABLE */}
      <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[28px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/15 text-white uppercase font-extrabold border-b border-white/25">
              <tr>
                <th className="p-4 text-center w-16">Station #</th>
                <th className="p-4">Station Name</th>
                <th className="p-4">Location & Region</th>
                <th className="p-4">Operation Supervisor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15 text-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sky-200/80 font-medium italic">
                    No stations found.
                  </td>
                </tr>
              ) : (
                filtered.map((st, index) => (
                  <tr key={st.id} className="hover:bg-white/15 transition-colors">
                    <td className="p-4 font-black text-sky-300 font-mono text-center">{index + 1}</td>
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-sky-300 shrink-0" />
                        <div>
                          <span className="block font-black text-white text-xs">{st.name}</span>
                          <span className="inline-block text-[10px] text-sky-200/90 font-mono font-extrabold bg-white/10 px-2 py-0.5 rounded-md border border-white/20 mt-0.5">
                            Code: {st.station_no.replace(/^ST-0*/i, '').replace(/^ST-/i, '')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-bold">{st.location}</p>
                      <p className="text-[10px] text-sky-200/80 font-medium">{st.region || 'Central Region'}</p>
                    </td>
                    <td className="p-4 font-extrabold text-sky-200">
                      {st.operation_supervisor_name || 'Unassigned'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(st)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${
                          st.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                        }`}
                      >
                        {st.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-2 bg-white/80 hover:bg-white text-sky-700 rounded-xl border border-sky-200/80 shadow-sm transition-all"
                          title="Edit Station"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${st.name}?`)) {
                              onDeleteStation(st.id);
                            }
                          }}
                          className="p-2 bg-white/80 hover:bg-white text-rose-600 rounded-xl border border-rose-200/80 shadow-sm transition-all"
                          title="Delete Station"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ADD/EDIT STATION MODAL */}
      {isModalOpen && editingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl ring-1 ring-white/60">
            <h3 className="text-base font-black text-slate-900 mb-4">
              {editingStation.id && stations.some((s) => s.id === editingStation.id)
                ? 'Edit Fuel Station'
                : 'Create New Fuel Station'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Station Code (Sequential)</label>
                  <input
                    type="text"
                    required
                    value={editingStation.station_no || ''}
                    onChange={(e) => setEditingStation({ ...editingStation, station_no: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status</label>
                  <select
                    value={editingStation.status || 'active'}
                    onChange={(e) =>
                      setEditingStation({ ...editingStation, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  value={editingStation.name || ''}
                  onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
                  className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City / Location</label>
                  <input
                    type="text"
                    required
                    value={editingStation.location || ''}
                    onChange={(e) => setEditingStation({ ...editingStation, location: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Region</label>
                  <input
                    type="text"
                    required
                    value={editingStation.region || ''}
                    onChange={(e) => setEditingStation({ ...editingStation, region: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Operation Supervisor</label>
                <select
                  value={editingStation.operation_supervisor_id || ''}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, operation_supervisor_id: e.target.value })
                  }
                  className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="">-- Unassigned --</option>
                  {operationSupervisors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-sky-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-1.5"
                >
                  <span>Save Station Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
