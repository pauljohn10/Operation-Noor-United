import React, { useState } from 'react';
import type { User, Station, UserRole } from '../../types/audit';
import { UserCheck, Plus, Search, Edit2, Trash2, Key, CheckCircle, XCircle } from 'lucide-react';


interface Props {
  users: User[];
  stations: Station[];
  onSaveUser: (user: User) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export const UserManagement: React.FC<Props> = ({
  users,
  stations,
  onSaveUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setCustomPassword('');
    setErrorMessage(null);
    setEditingUser({
      id: '',
      employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: '',
      email: '',
      username: '',
      password_hash: '',
      mobile_number: '',
      position: 'Operation Supervisor',
      role: 'Operation Supervisor',
      status: 'active',
      signature_url: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setCustomPassword('');
    setErrorMessage(null);
    setEditingUser({ ...user, password_hash: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.full_name || !editingUser.email) return;

    const enteredPass = customPassword.trim();
    const isNew = !editingUser.id || !users.some((u) => u.id === editingUser.id);

    if (isNew && (!enteredPass || enteredPass.length < 6)) {
      setErrorMessage('Please enter a password of at least 6 characters for the new user account.');
      return;
    }
    if (!isNew && enteredPass && enteredPass.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    const assignedSt = stations.find((s) => s.id === editingUser.assigned_station_id);

    const userObj: User = {
      id: editingUser.id || '',
      employee_id: editingUser.employee_id || `EMP-${Date.now().toString().slice(-4)}`,
      full_name: editingUser.full_name,
      email: editingUser.email.trim().toLowerCase(),
      username: editingUser.username || editingUser.email.split('@')[0],
      password_hash: enteredPass,
      mobile_number: editingUser.mobile_number || '',
      position: editingUser.position || editingUser.role || 'Staff Member',
      role: (editingUser.role as UserRole) || 'Operation Supervisor',
      assigned_station_id: editingUser.assigned_station_id,
      assigned_station_name: assignedSt ? assignedSt.name : undefined,
      signature_url: editingUser.signature_url || '',
      status: editingUser.status || 'active',
      created_at: editingUser.created_at || new Date().toISOString(),
    };

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSaveUser(userObj);
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  const handleOpenResetModal = (user: User) => {
    setResetTargetUser(user);
    setResetPasswordInput('');
    setResetErrorMessage(null);
    setIsResetModalOpen(true);
  };

  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    const newPass = resetPasswordInput.trim();
    if (!newPass || newPass.length < 6) {
      setResetErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setIsSubmitting(true);
    setResetErrorMessage(null);
    try {
      const updatedUser: User = {
        ...resetTargetUser,
        password_hash: newPass,
      };
      await onSaveUser(updatedUser);
      setIsResetModalOpen(false);
      setResetTargetUser(null);
      setResetPasswordInput('');
    } catch (err: any) {
      setResetErrorMessage(err.message || 'Failed to reset user password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl border border-white/90 p-4 rounded-2xl shadow-[0_15px_35px_rgba(14,165,233,0.10)]">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sky-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, employee ID, email, position..."
              className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-inner"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white/70 backdrop-blur-md border border-sky-200/80 text-xs font-extrabold rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Management">Management</option>
            <option value="Account Manager">Account Manager</option>
            <option value="Accountant">Accountant</option>
            <option value="Operation Supervisor">Operation Supervisor</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white/50 backdrop-blur-2xl border border-white/90 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/80 text-slate-700 uppercase font-extrabold border-b border-sky-100">
              <tr>
                <th className="p-4">User & Emp ID</th>
                <th className="p-4">Role & Position</th>
                <th className="p-4">Contact Email</th>
                <th className="p-4">Station</th>
                <th className="p-4">Signature</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 text-slate-700">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-sky-50/60 transition-colors">
                  <td className="p-4">
                    <p className="font-extrabold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-sky-600" />
                      <span>{u.full_name}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">ID: {u.employee_id}</p>
                  </td>

                  <td className="p-4">
                    <span className="font-extrabold text-purple-700 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 text-[11px]">
                      {u.role}
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">{u.position}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-900">{u.email}</p>
                    <p className="text-[10px] text-slate-500 font-mono">@{u.username}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-900">{u.assigned_station_name || 'Central Office'}</p>
                  </td>

                  <td className="p-4">
                    {u.signature_url ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Recorded
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 italic">None</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenResetModal(u)}
                        className="p-2 bg-white/80 hover:bg-white text-sky-700 rounded-xl border border-sky-200/80 shadow-sm transition-all"
                        title="Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 bg-white/80 hover:bg-white text-sky-700 rounded-xl border border-sky-200/80 shadow-sm transition-all"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${u.full_name}?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="p-2 bg-white/80 hover:bg-white text-rose-600 rounded-xl border border-rose-200/80 shadow-sm transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT USER MODAL */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-2xl max-w-xl w-full p-6 shadow-2xl ring-1 ring-white/60">
            <h3 className="text-base font-black text-slate-900 mb-4">
              {editingUser.id && users.some((u) => u.id === editingUser.id)
                ? 'Edit User Account'
                : 'Create New User Account'}
            </h3>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Employee ID #</label>
                  <input
                    type="text"
                    required
                    value={editingUser.employee_id || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, employee_id: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role Assignment</label>
                  <select
                    value={editingUser.role || 'Operation Supervisor'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Management">Management</option>
                    <option value="Account Manager">Account Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Operation Supervisor">Operation Supervisor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Position / Job Title</label>
                  <input
                    type="text"
                    required
                    value={editingUser.position || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required={!editingUser.id || !users.some((u) => u.id === editingUser.id)}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-mono"
                    placeholder={editingUser.id && users.some((u) => u.id === editingUser.id) ? 'Leave blank to keep existing password' : 'Enter account password'}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Status</label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Station</label>
                <select
                  value={editingUser.assigned_station_id || ''}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, assigned_station_id: e.target.value })
                  }
                  className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="">-- All / Central System Access --</option>
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.station_no} - {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">Digital Signature</label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingUser({
                        ...editingUser,
                        signature_url: '',
                      })
                    }
                    className="text-sky-600 hover:text-sky-700 font-extrabold text-[11px]"
                  >
                    Clear Signature
                  </button>
                </div>
                {editingUser.signature_url && (
                  <div className="bg-white p-2 rounded-xl border border-sky-200 text-center shadow-sm">
                    <img src={editingUser.signature_url} alt="Sig" className="h-12 mx-auto object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-sky-100 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Account...</span>
                    </>
                  ) : (
                    <span>Save User Record</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED RESET PASSWORD MODAL */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-2xl max-w-md w-full p-6 shadow-2xl ring-1 ring-white/60 space-y-4">
            <div className="flex items-center gap-3 border-b border-sky-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Reset User Password</h3>
                <p className="text-xs text-slate-600 font-medium">{resetTargetUser.full_name} ({resetTargetUser.email})</p>
              </div>
            </div>

            {resetErrorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{resetErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleExecuteResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (minimum 6 characters)
                </label>
                <input
                  type="password"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Enter new account password..."
                  autoComplete="new-password"
                  className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="pt-3 border-t border-sky-100 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetTargetUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Supabase Auth...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
