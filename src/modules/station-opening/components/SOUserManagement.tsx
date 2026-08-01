import React, { useState } from 'react';
import type { StationOpeningUser, StationOpeningSystemRole } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { generateUuidV4 } from '../../../lib/supabaseClient';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Key,
  Lock,
  Unlock,
  Users,
  XCircle,
} from 'lucide-react';

interface Props {
  users: StationOpeningUser[];
  currentUser: any;
  onSaveUser: (user: StationOpeningUser, password?: string) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onResetPassword: (id: string, newPass: string) => Promise<void>;
  onToggleLogin: (id: string, loginEnabled: boolean, status: 'active' | 'inactive') => Promise<void>;
}

export const SOUserManagement: React.FC<Props> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onResetPassword,
  onToggleLogin,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<Partial<StationOpeningUser> | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetTargetUser, setResetTargetUser] = useState<StationOpeningUser | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    setCustomPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setEditingUser({
      id: '',
      employee_id: `SO-EMP-${Math.floor(100 + Math.random() * 900)}`,
      full_name: '',
      email: '',
      username: '',
      role: 'Head of Operation',
      mobile_number: '',
      status: 'active',
      login_enabled: true,
      profile_photo_url: '',
      signature_url: '',
      created_by_name: currentUser?.full_name || 'Super Admin',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: StationOpeningUser) => {
    setCustomPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleOpenResetPassword = (user: StationOpeningUser) => {
    setResetTargetUser(user);
    setResetPasswordInput('');
    setErrorMessage(null);
    setIsResetModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!editingUser?.full_name || !editingUser?.email) {
      setErrorMessage('Full Name and Email Address are required.');
      return;
    }

    if (!editingUser.id && !customPassword) {
      setErrorMessage('Password is required for new user creation.');
      return;
    }

    if (customPassword && customPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const username = editingUser.username && editingUser.username.trim()
      ? editingUser.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
      : editingUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');

    const userToSave: StationOpeningUser = {
      id: editingUser.id || generateUuidV4(),
      employee_id: editingUser.employee_id || `SO-EMP-${Math.floor(100 + Math.random() * 900)}`,
      full_name: editingUser.full_name.trim(),
      email: editingUser.email.trim().toLowerCase(),
      username: username,
      role: (editingUser.role as StationOpeningSystemRole) || 'Head of Operation',
      mobile_number: editingUser.mobile_number || '',
      status: editingUser.status || 'active',
      login_enabled: editingUser.login_enabled ?? true,
      profile_photo_url: editingUser.profile_photo_url || '',
      signature_url: editingUser.signature_url || '',
      created_by_name: editingUser.created_by_name || currentUser?.full_name || 'Super Admin',
      created_at: editingUser.created_at || new Date().toISOString(),
      last_login_at: editingUser.last_login_at,
    };

    try {
      await onSaveUser(userToSave, customPassword || undefined);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error saving user account.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetTargetUser || !resetPasswordInput || resetPasswordInput.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      await onResetPassword(resetTargetUser.id, resetPasswordInput);
      setIsResetModalOpen(false);
      alert(`Password for ${resetTargetUser.full_name} updated successfully.`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error resetting password.');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/45 backdrop-blur-2xl border border-white/80 p-6 rounded-[28px] shadow-[0_20px_50px_rgba(14,165,233,0.15)] ring-1 ring-white/60">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>{t('so.userDirTitle')}</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {t('so.userDirSub')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all shrink-0 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('so.newUserAccount')}</span>
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/50 backdrop-blur-xl border border-white/90 p-4 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)]">
        <div className="relative">
          <Search className="w-4 h-4 text-sky-600/70 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('so.searchUsersPlaceholder')}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl ps-10 pe-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-inner"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 text-xs font-extrabold rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 cursor-pointer"
        >
          <option value="ALL">{t('so.allDepartmentRoles')}</option>
          <option value="Head of Operation">{t('so.roleHeadOfOp')}</option>
          <option value="Safety & Quality Control">{t('so.roleSafetyQuality')}</option>
          <option value="Document Controller">{t('so.roleDocController')}</option>
          <option value="Engineering Department">{t('so.roleEngineering')}</option>
          <option value="Al Noor United Management">{t('so.roleManagement')}</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 text-xs font-extrabold rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 cursor-pointer"
        >
          <option value="ALL">{t('auditsList.allStatuses')}</option>
          <option value="active">{t('so.active')}</option>
          <option value="inactive">{t('so.inactive')}</option>
        </select>
      </div>

      {/* USERS ACCOUNT DIRECTORY TABLE */}
      <div className="bg-white/50 backdrop-blur-2xl border border-white/90 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/80 text-slate-700 uppercase font-extrabold border-b border-sky-100">
              <tr>
                <th className="p-4">User Profile</th>
                <th className="p-4">Station Opening Role</th>
                <th className="p-4">Credentials & Contact</th>
                <th className="p-4">Status & Access</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 font-bold text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium italic">
                    No user accounts match your search filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-sky-50/60 transition-colors">
                    {/* Name & Photo */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-800 font-black flex items-center justify-center shrink-0">
                          {u.profile_photo_url ? (
                            <img src={u.profile_photo_url} alt={u.full_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            u.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{u.full_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Emp #: {u.employee_id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className="px-3 py-1 bg-sky-500/10 text-sky-700 border border-sky-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {u.role}
                      </span>
                    </td>

                    {/* Username & Email */}
                    <td className="p-4">
                      <p className="font-mono text-slate-900">@{u.username}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                      {u.mobile_number && <p className="text-[10px] text-slate-400 font-mono">{u.mobile_number}</p>}
                    </td>

                    {/* Status & Access */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Login: <strong className={u.login_enabled ? 'text-emerald-700' : 'text-rose-700'}>{u.login_enabled ? 'Enabled' : 'Disabled'}</strong>
                        </p>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="p-4">
                      <p className="text-slate-700 font-mono text-[11px]">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleLogin(u.id, !u.login_enabled, u.login_enabled ? 'inactive' : 'active')}
                          className={`p-2 rounded-xl border transition-all ${
                            u.login_enabled
                              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                          title={u.login_enabled ? 'Disable Login' : 'Enable Login'}
                        >
                          {u.login_enabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenResetPassword(u)}
                          className="p-2 bg-white hover:bg-slate-50 text-sky-700 border border-sky-200/80 rounded-xl transition-all"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl transition-all"
                          title="Edit Account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {currentUser?.id !== u.id && (
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete user ${u.full_name}?`)) {
                                await onDeleteUser(u.id);
                              }
                            }}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT ACCOUNT MODAL */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-slate-900 border-b border-sky-100 pb-3">
              {editingUser.id ? 'Edit Station Opening Account' : 'Provision Station Opening Account'}
            </h3>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Employee ID # *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.employee_id || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, employee_id: e.target.value })}
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Username (Optional)</label>
                  <input
                    type="text"
                    value={editingUser.username || ''}
                    placeholder="Auto-generated from email"
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Station Opening System Role *</label>
                <select
                  value={editingUser.role || 'Head of Operation'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-extrabold focus:ring-2 focus:ring-sky-500 shadow-sm"
                >
                  <option value="Head of Operation">Head of Operation (Form Creator & Submitter)</option>
                  <option value="Safety & Quality Control">Safety & Quality Control (Step 1 Approver)</option>
                  <option value="Document Controller">Document Controller (Step 2 Approver)</option>
                  <option value="Engineering Department">Engineering Department (Step 3 Approver)</option>
                  <option value="Al Noor United Management">Al Noor United Management (Step 4 Final Approver)</option>
                </select>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-sky-100">
                <div>
                  <label className="block mb-1">Password {!editingUser.id && '*'}</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required={!editingUser.id}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder={editingUser.id ? 'Leave blank to keep existing' : 'Min 6 characters'}
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editingUser.mobile_number || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, mobile_number: e.target.value })}
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Account Status</label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-extrabold focus:ring-2 focus:ring-sky-500 shadow-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-slate-900 border-b border-sky-100 pb-3">
              Reset User Password
            </h3>
            <p className="text-xs text-slate-600 font-semibold">
              Enter new password for <strong className="text-slate-900">{resetTargetUser.full_name}</strong> (@{resetTargetUser.username}):
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
