import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole, User } from '../../types/audit';
import { ShieldCheck, UserCheck, CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserRoleSwitcherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, login, allUsers } = useAuth();

  if (!isOpen || !currentUser) return null;

  const roleColors: Record<UserRole, string> = {
    'Super Admin': 'border-purple-500 bg-purple-950/40 text-purple-300',
    'Management': 'border-blue-500 bg-blue-950/40 text-blue-300',
    'Account Manager': 'border-indigo-500 bg-indigo-950/40 text-indigo-300',
    'Accountant': 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
    'Operation Supervisor': 'border-amber-500 bg-amber-950/40 text-amber-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg text-white shadow-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Switch Active Account</h3>
              <p className="text-xs text-slate-400">
                Authenticate as any seed user account to test production RBAC approval permissions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {allUsers.map((user: User) => {
            const isSelected = currentUser.id === user.id;
            const badgeClass = roleColors[user.role];

            return (
              <button
                key={user.id}
                onClick={async () => {
                  await login(user.email, user.password_hash || '');
                  onClose();
                }}
                className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg ring-1 ring-amber-500/50'
                    : 'border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xs border border-amber-500/40">
                    {user.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{user.full_name}</span>
                    </div>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {user.role}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{user.position}</p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Database Authentication & RBAC Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
