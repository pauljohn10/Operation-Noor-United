import React from 'react';
import type { AuditLog } from '../../types/audit';
import { Terminal } from 'lucide-react';

interface Props {
  logs: AuditLog[];
}

export const SystemLogsView: React.FC<Props> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-600" />
          <span>Security Audit & Activity Logs</span>
        </h3>
        <span className="text-xs text-sky-900 font-black bg-sky-50 px-3 py-1 rounded-full border border-sky-200">{logs.length} Total Audit Events</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Event Details</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-slate-500 font-bold">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-black text-sky-900">
                    {log.user_name || 'System'}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-50 text-sky-800 border border-sky-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-900 font-bold">{log.details}</td>
                  <td className="p-4 text-slate-500 font-semibold">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
