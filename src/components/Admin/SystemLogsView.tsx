import React from 'react';
import type { AuditLog } from '../../types/audit';
import { Terminal } from 'lucide-react';

interface Props {
  logs: AuditLog[];
}

export const SystemLogsView: React.FC<Props> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-5 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-600" />
          <span>Security Audit & Activity Logs</span>
        </h3>
        <span className="text-xs text-slate-600 font-extrabold">{logs.length} Total Audit Events</span>
      </div>

      <div className="bg-white/50 backdrop-blur-2xl border border-white/90 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/80 text-slate-700 uppercase font-extrabold border-b border-sky-100">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Event Details</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-sky-50/60 transition-colors">
                  <td className="p-4 text-slate-500 font-semibold">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-black text-sky-700">
                    {log.user_name || 'System'}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/10 text-sky-700 border border-sky-500/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-900 font-medium">{log.details}</td>
                  <td className="p-4 text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
