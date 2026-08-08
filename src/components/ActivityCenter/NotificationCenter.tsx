import React, { useState } from 'react';
import type { AuditNotification } from '../../types/audit';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  MessageSquare,
  ExternalLink,
  Check,
  CheckCheck,
  Trash2,
  Filter,
} from 'lucide-react';

interface Props {
  notifications: AuditNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onOpenAudit: (auditId: string) => void;
}

export const NotificationCenter: React.FC<Props> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onOpenAudit,
}) => {
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const displayedNotifications =
    filterTab === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-sky-600" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'returned':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'commented':
        return <MessageSquare className="w-4 h-4 text-cyan-600" />;
      default:
        return <Bell className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* HEADER CARD */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Bell className="w-6 h-6 text-sky-600" />
            <span>{t('notifications.title')}</span>
            {unreadCount > 0 && (
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-xs border border-amber-400">
                {unreadCount} {t('notifications.unread') || 'Unread'}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-extrabold mt-1">
            {t('notifications.subtitle')}
          </p>
        </div>

        {/* HEADER ACTIONS: MARK ALL READ */}
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 border border-emerald-500"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{t('notifications.markAllRead') || 'Mark All as Read'}</span>
          </button>
        )}
      </div>

      {/* FILTER TABS (ALL vs UNREAD) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              filterTab === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-extrabold'
            }`}
          >
            <span>{t('common.all') || 'All'}</span>
            <span className="px-2 py-0.2 text-[10px] rounded-full bg-white/20 font-mono font-bold">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('unread')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              filterTab === 'unread'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-extrabold'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t('notifications.unread') || 'Unread'}</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black font-mono shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs font-black text-sky-900 bg-sky-50 px-3.5 py-1 rounded-full border border-sky-200 shadow-2xs">
          {displayedNotifications.length} {displayedNotifications.length === 1 ? 'activity' : 'activities'} listed
        </span>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3.5">
        {displayedNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-600 font-extrabold shadow-sm">
            {filterTab === 'unread'
              ? (t('notifications.allCaughtUp') || 'All notifications caught up!')
              : (t('notifications.noNotifications') || 'No notifications available')}
          </div>
        ) : (
          displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4.5 sm:p-5 rounded-2xl transition-all flex items-start justify-between gap-4 ${
                !notif.is_read
                  ? 'bg-white border-2 border-sky-500 shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-900 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-sky-300 shadow-xs shrink-0 mt-0.5">
                  {getActionIcon(notif.action_type)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* AUDIT NUMBER BADGE */}
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-600 text-white font-black text-xs font-mono shadow-xs">
                      #{notif.audit_number}
                    </span>

                    {/* STATION NAME */}
                    <span className="font-black text-slate-950 text-xs sm:text-sm">{notif.station_name}</span>

                    {/* AUDIT DATE */}
                    {notif.audit_date && (
                      <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
                        Date: {notif.audit_date}
                      </span>
                    )}

                    {/* ACTION BADGE */}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider shadow-2xs ${
                        notif.action_type === 'approved'
                          ? 'bg-emerald-600 text-white border border-emerald-500'
                          : notif.action_type === 'rejected'
                          ? 'bg-rose-600 text-white border border-rose-500'
                          : notif.action_type === 'returned'
                          ? 'bg-amber-600 text-white border border-amber-500'
                          : 'bg-sky-600 text-white border border-sky-500'
                      }`}
                    >
                      {notif.action_type}
                    </span>

                    {/* UNREAD STATUS TAG */}
                    {!notif.is_read && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wide shadow-2xs">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* NOTIFICATION MESSAGE */}
                  <p className="text-xs sm:text-sm text-slate-900 font-extrabold leading-relaxed">{notif.message}</p>

                  {/* SENDER & TIMESTAMP METADATA */}
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-bold flex-wrap pt-0.5">
                    <span>Performed By: <strong className="text-slate-950 font-black">{notif.sender_name}</strong></span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-800 font-mono font-bold">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-xl text-xs font-black flex items-center gap-1 border border-emerald-300 shadow-2xs transition-all active:scale-95"
                    title={t('notifications.markAsRead') || 'Mark as Read'}
                  >
                    <Check className="w-4 h-4 text-emerald-600 hover:text-white" />
                  </button>
                )}

                <button
                  onClick={() => onDeleteNotification(notif.id)}
                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white rounded-xl text-xs font-black flex items-center gap-1 border border-rose-300 shadow-2xs transition-all active:scale-95"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 hover:text-white" />
                </button>

                <button
                  onClick={() => onOpenAudit(notif.audit_id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-black border border-sky-400/40 transition-all shadow-md active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{t('auditsList.viewEdit')}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

