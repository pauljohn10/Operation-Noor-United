import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuditStatus, ApprovalRole } from '../types/audit';
import {
  authenticateUser,
  saveSession,
  loadSession,
  saveUser,
  logActivity,
  fetchUsers,
} from '../lib/supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<User | null>;
  canCreateAudit: boolean;
  canApproveAuditStatus: (status: AuditStatus) => boolean;
  getApprovalRoleForStatus: (status: AuditStatus) => ApprovalRole | null;
  allUsers: User[];
  reloadUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadSession());
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const reloadUsers = async () => {
    const list = await fetchUsers();
    setAllUsers(list);
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const login = async (identifier: string, pass: string, rememberMe: boolean = true) => {
    const res = await authenticateUser(identifier, pass);
    if (res.user) {
      const isSOUser = [
        'Head of Operation',
        'Safety & Quality Control',
        'Document Controller',
        'Engineering Department',
        'Al Noor United Management',
      ].includes(res.user.role || '');

      const targetHash = isSOUser ? '#station-opening' : '#dashboard';

      if (typeof window !== 'undefined') {
        window.location.hash = targetHash;
        history.replaceState({ tab: isSOUser ? 'station-opening' : 'dashboard' }, '', targetHash);
        sessionStorage.removeItem('last_visited_tab');
        localStorage.removeItem('last_visited_tab');
      }
      setCurrentUser(res.user);
      saveSession(res.user, rememberMe);
      await reloadUsers();
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid login credentials' };
  };

  const logout = async () => {
    if (currentUser) {
      await logActivity(currentUser.id, currentUser.full_name, 'USER_LOGOUT', 'User logged out');
    }
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      history.replaceState({ tab: 'dashboard' }, '', '#dashboard');
      sessionStorage.removeItem('last_visited_tab');
      localStorage.removeItem('last_visited_tab');
    }
    setCurrentUser(null);
    saveSession(null);
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<User | null> => {
    if (!currentUser) return null;
    const merged: User = {
      ...currentUser,
      ...updatedData,
      updated_at: new Date().toISOString(),
    };
    const saved = await saveUser(merged);
    setCurrentUser(saved);
    saveSession(saved);
    await reloadUsers();
    return saved;
  };

  // ONLY Operation Supervisor can create audits
  const canCreateAudit = Boolean(
    currentUser && currentUser.role === 'Operation Supervisor'
  );

  const getApprovalRoleForStatus = (status: AuditStatus): ApprovalRole | null => {
    switch (status) {
      case 'pending_accountant':
        return 'accountant';
      case 'pending_account_manager':
        return 'account_manager';
      case 'pending_management':
        return 'management';
      default:
        return null;
    }
  };

  const canApproveAuditStatus = (status: AuditStatus): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Super Admin') return true;

    // Management Executive override authority: can approve at any pending workflow stage
    if (currentUser.role === 'Management') {
      return (
        status === 'pending_accountant' ||
        status === 'pending_account_manager' ||
        status === 'pending_management'
      );
    }

    switch (status) {
      case 'pending_accountant':
        return currentUser.role === 'Accountant';
      case 'pending_account_manager':
        return currentUser.role === 'Account Manager';
      case 'pending_management':
        return true;
      case 'returned_for_correction':
      case 'draft':
        return currentUser.role === 'Operation Supervisor';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        logout,
        updateProfile,
        canCreateAudit,
        canApproveAuditStatus,
        getApprovalRoleForStatus,
        allUsers,
        reloadUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
