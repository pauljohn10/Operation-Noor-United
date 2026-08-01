import React, { useState } from 'react';
import type { StationOpeningNotification } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Bell,
  CheckCheck,
  Building,
  Clock,
  Send,
  CheckCircle2,
  RotateCcw,
  XCircle,
  FileCheck,
} from 'lucide-react';

interface Props {
  notifications: StationOpeningNotification[];
  currentUser: any;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onOpenForm: (formId: string) => void;
}

export const SONotifications: React.FC<Props> = ({
  notifications,
  currentUser,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenForm,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userRole = currentUser?.role || '';
  const isSuperAdmin = userRole === 'Super Admin';

  const relevantNotifs = notifications.filter((n) => {
    if (isSuperAdmin) return true;
    return n.recipient_role === userRole || n.recipient_role === 'ALL';
  });

  const filteredNotifs = relevantNotifs.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = relevantNotifs.filter((n) => !n.is_read).length;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-700 border border-sky-500/30 flex items-center gap-1">
            <Send className="w-3 h-3" /> Submitted
          </span>
        );
      case 'approved':
      case 'final_approval':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'returned':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/30 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Returned
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-700 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-700 border border-slate-500/30">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/45 backdrop-blur-2xl border border-white/80 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 text-sky-600 rounded-2xl border border-sky-500/20 relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>{t('so.notifications')}</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Workflow Status Updates, Approval Requests & Department Activity Alerts
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{t('notifications.markAllRead')}</span>
          </button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center justify-between gap-4 bg-white/50 backdrop-blur-xl border border-white/90 p-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'all'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Notifications ({relevantNotifs.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-sky-200 text-sky-900 rounded-full text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs text-slate-500 font-bold me-2">
          Assigned to: <strong className="text-slate-900">{userRole}</strong>
        </span>
      </div>

      {/* NOTIFICATION CARDS LIST */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl border border-white/90 rounded-[28px] p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Notifications</h3>
          <p className="text-xs text-slate-500 font-medium">
            {filter === 'unread'
              ? 'You have read all notifications assigned to your role.'
              : 'No activity notifications have been generated for your stage yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                !n.is_read
                  ? 'bg-white border-sky-300 shadow-md ring-2 ring-sky-500/20'
                  : 'bg-white/70 border-slate-200/90 shadow-sm opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-xs text-sky-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    {n.form_number}
                  </span>
                  <span className="font-black text-xs text-slate-900 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-sky-600" />
                    {n.station_name}
                  </span>
                  {getActionBadge(n.action_type)}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {n.message}
              </p>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-500 font-bold">
                  Performed by: <strong className="text-slate-900">{n.sender_name}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {!n.is_read && (
                    <button
                      onClick={() => onMarkAsRead(n.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  {n.form_id && (
                    <button
                      onClick={() => {
                        onMarkAsRead(n.id);
                        onOpenForm(n.form_id);
                      }}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Open Form</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
