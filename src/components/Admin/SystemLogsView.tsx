import React from 'react';
import type { AuditLog } from '../../types/audit';
import { Terminal } from 'lucide-react';

interface Props {
  logs: AuditLog[];
}

export const SystemLogsView: React.FC<Props> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur-3xl border border-white/25 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <h3 className="text-sm font-black text-white flex items-center gap-2 drop-shadow-sm">
          <Terminal className="w-4 h-4 text-sky-300" />
          <span>Security Audit & Activity Logs</span>
        </h3>
        <span className="text-xs text-sky-200 font-extrabold">{logs.length} Total Audit Events</span>
      </div>

      <div className="bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[28px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/15 text-white uppercase font-extrabold border-b border-white/25">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Event Details</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15 text-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/15 transition-colors">
                  <td className="p-4 text-sky-200/80 font-semibold">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-black text-sky-300">
                    {log.user_name || 'System'}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/20 text-sky-200 border border-sky-400/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-white font-medium">{log.details}</td>
                  <td className="p-4 text-sky-300/70">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
