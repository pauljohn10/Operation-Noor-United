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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/45 backdrop-blur-2xl border border-white/80 p-5 sm:p-6 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)] ring-1 ring-white/60">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-600" />
            <span>{t('notifications.title')}</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-2xs">
                {unreadCount} {t('notifications.unread') || 'Unread'}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {t('notifications.subtitle')}
          </p>
        </div>

        {/* HEADER ACTIONS: MARK ALL READ */}
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{t('notifications.markAllRead') || 'Mark All as Read'}</span>
          </button>
        )}
      </div>

      {/* FILTER TABS (ALL vs UNREAD) */}
      <div className="flex items-center justify-between border-b border-sky-100/50 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-white/40 backdrop-blur-md rounded-xl border border-white/60">
          <button
            onClick={() => setFilterTab('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterTab === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>{t('common.all') || 'All'}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('unread')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterTab === 'unread'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>{t('notifications.unread') || 'Unread'}</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black font-mono">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-[11px] font-extrabold text-sky-900 bg-sky-100/80 px-3 py-1 rounded-full border border-sky-300">
          {displayedNotifications.length} {displayedNotifications.length === 1 ? 'activity' : 'activities'} listed
        </span>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        {displayedNotifications.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-8 rounded-2xl text-center text-slate-500 font-medium italic">
            {filterTab === 'unread'
              ? (t('notifications.allCaughtUp') || 'All notifications caught up!')
              : (t('notifications.noNotifications') || 'No notifications available')}
          </div>
        ) : (
          displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 backdrop-blur-xl ${
                !notif.is_read
                  ? 'bg-white/80 border-sky-400/60 shadow-[0_10px_25px_rgba(14,165,233,0.12)] ring-1 ring-sky-400/30'
                  : 'bg-white/45 border-white/80 text-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/90 border border-sky-200/80 shadow-2xs shrink-0 mt-0.5">
                  {getActionIcon(notif.action_type)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-100/90 text-sky-900 font-black text-xs font-mono border border-sky-300 shadow-2xs">
                      #{notif.audit_number}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs">{notif.station_name}</span>
                    {notif.audit_date && (
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        Date: {notif.audit_date}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        notif.action_type === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : notif.action_type === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : notif.action_type === 'returned'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-sky-100 text-sky-800 border border-sky-300'
                      }`}
                    >
                      {notif.action_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-extrabold leading-relaxed mt-1">{notif.message}</p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 font-semibold flex-wrap">
                    <span>Performed By: <strong className="text-slate-900 font-black">{notif.sender_name}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="p-1.5 bg-white/90 hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs flex items-center gap-1 border border-emerald-300 shadow-2xs transition-all"
                    title={t('notifications.markAsRead') || 'Mark as Read'}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                )}

                <button
                  onClick={() => onDeleteNotification(notif.id)}
                  className="p-1.5 bg-white/90 hover:bg-rose-50 text-rose-600 rounded-lg text-xs flex items-center gap-1 border border-rose-200/80 shadow-2xs transition-all"
                  title="Delete Notification"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>

                <button
                  onClick={() => onOpenAudit(notif.audit_id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-sky-600/10 hover:bg-sky-600/20 text-sky-700 rounded-lg text-xs font-bold border border-sky-500/30 transition-all shadow-2xs"
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

