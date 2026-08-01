import React from 'react';
import type { AuditNotification } from '../../types/audit';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, CheckCircle2, Clock, XCircle, RotateCcw, MessageSquare, ExternalLink, Check } from 'lucide-react';

interface Props {
  notifications: AuditNotification[];
  onMarkAsRead: (id: string) => void;
  onOpenAudit: (auditId: string) => void;
}

export const NotificationCenter: React.FC<Props> = ({
  notifications,
  onMarkAsRead,
  onOpenAudit,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Filter notifications relevant to current user role or ALL
  const userNotifications = notifications.filter(
    (n) => n.recipient_role === 'ALL' || n.recipient_role === currentUser?.role || currentUser?.role === 'Super Admin'
  );

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



      <div className="flex items-center justify-between bg-white/45 backdrop-blur-2xl border border-white/80 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-600" />
            <span>{t('notifications.title')}</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {t('notifications.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {userNotifications.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-xl border border-white/90 p-8 rounded-2xl text-center text-slate-500 font-medium italic">
            {t('notifications.noNotifications')}
          </div>
        ) : (
          userNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 backdrop-blur-xl ${
                !notif.is_read
                  ? 'bg-white/70 border-sky-400/60 shadow-[0_10px_25px_rgba(14,165,233,0.15)] ring-1 ring-sky-400/30'
                  : 'bg-white/45 border-white/80 text-slate-600'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/80 border border-sky-200/80 shadow-sm shrink-0 mt-0.5">
                  {getActionIcon(notif.action_type)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sky-700 text-xs">{notif.audit_number}</span>
                    <span className="font-bold text-slate-900 text-xs">{notif.station_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium mt-1.5 leading-relaxed">{notif.message}</p>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-semibold">
                    <span>Sender: <strong className="text-slate-800">{notif.sender_name}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="p-2 bg-white/80 hover:bg-white text-slate-700 rounded-xl text-xs flex items-center gap-1 border border-sky-200/80 shadow-sm transition-all"
                    title={t('notifications.markAsRead')}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                )}

                <button
                  onClick={() => onOpenAudit(notif.audit_id)}
                  className="flex items-center gap-1 px-3.5 py-2 bg-sky-600/10 hover:bg-sky-600/20 text-sky-700 rounded-xl text-xs font-bold border border-sky-500/30 transition-all shadow-sm"
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

