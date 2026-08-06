import React, { useState, useEffect } from 'react';
import type {
  StationOpeningForm,
  StationOpeningApprovalRole,
  StationOpeningUser,
  StationOpeningNotification,
  StationOpeningActivityLog,
} from './types';
import type { Station } from '../../types/audit';
import { createEmptyStationOpeningForm } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { generateUuidV4 } from '../../lib/supabaseClient';
import {
  fetchStationOpeningForms,
  saveStationOpeningForm,
  deleteStationOpeningForm,
  fetchStationOpeningUsers,
  saveStationOpeningUser,
  deleteStationOpeningUser,
  resetStationOpeningUserPassword,
  toggleStationOpeningUserLogin,
  addStationOpeningNotification,
  fetchStationOpeningNotifications,
  markStationOpeningNotificationAsRead,
  markAllStationOpeningNotificationsAsRead,
  fetchStationOpeningActivityLogs,
  addStationOpeningActivityLog,
} from './supabaseClient';
import { SODashboard } from './components/SODashboard';
import { SOListView } from './components/SOListView';
import { SOFormView } from './components/SOFormView';
import { SOUserManagement } from './components/SOUserManagement';
import { SONotifications } from './components/SONotifications';
import { SOStationSelectModal } from './components/SOStationSelectModal';
import { SOActivityView } from './components/SOActivityView';
import { Building, LayoutDashboard, ListFilter, Users, Bell, Activity } from 'lucide-react';

interface Props {
  currentUser: any;
  stations: Station[];
}

export const StationOpeningModule: React.FC<Props> = ({ currentUser, stations }) => {
  const { t } = useLanguage();
  const getTabFromHash = (): 'dashboard' | 'repository' | 'form' | 'users' | 'notifications' | 'activity' => {
    const hash = window.location.hash;
    if (hash === '#station-opening/new') {
      if (currentUser.role !== 'Head of Operation') {
        window.location.hash = '#station-opening';
        return 'dashboard';
      }
      return 'form';
    }
    if (hash === '#station-opening/forms') return 'repository';
    if (hash === '#station-opening/users') return 'users';
    if (hash === '#station-opening/notifications') return 'notifications';
    if (hash === '#station-opening/activity') return 'activity';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'repository' | 'form' | 'users' | 'notifications' | 'activity'>(getTabFromHash);
  const [forms, setForms] = useState<StationOpeningForm[]>([]);
  const [soUsers, setSoUsers] = useState<StationOpeningUser[]>([]);
  const [soNotifications, setSoNotifications] = useState<StationOpeningNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<StationOpeningActivityLog[]>([]);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  const isSuperAdmin = currentUser.role === 'Super Admin';
  const isHeadOfOp = currentUser.role === 'Head of Operation';

  const changeTab = (tab: 'dashboard' | 'repository' | 'form' | 'users' | 'notifications' | 'activity') => {
    if (tab === 'form' && !currentFormId && currentUser.role !== 'Head of Operation') {
      alert('Access Denied: Only the Operation Supervisor can create new Station Opening Forms.');
      return;
    }
    setActiveTab(tab);
    let newHash = '#station-opening';
    if (tab === 'repository') newHash = '#station-opening/forms';
    if (tab === 'form') newHash = '#station-opening/new';
    if (tab === 'users') newHash = '#station-opening/users';
    if (tab === 'notifications') newHash = '#station-opening/notifications';
    if (tab === 'activity') newHash = '#station-opening/activity';

    if (window.location.hash !== newHash) {
      history.pushState({ tab }, '', newHash);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#station-opening')) {
        setActiveTab(getTabFromHash());
      }
    };
    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [formsData, usersData, notifsData, logsData] = await Promise.all([
      fetchStationOpeningForms(isSuperAdmin ? undefined : currentUser.id, currentUser.role),
      fetchStationOpeningUsers(),
      fetchStationOpeningNotifications(isSuperAdmin ? undefined : currentUser.id, currentUser.role),
      fetchStationOpeningActivityLogs(isSuperAdmin ? undefined : currentUser.id, currentUser.role),
    ]);
    setForms(formsData);
    setSoUsers(usersData);
    setSoNotifications(notifsData);
    setActivityLogs(logsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeForm = forms.find((f) => f.id === currentFormId) || null;

  // Handlers
  const handleOpenStationModal = () => {
    if (currentUser.role !== 'Head of Operation') {
      alert('Access Denied: Only the Operation Supervisor can create new Station Opening Forms.');
      return;
    }
    setIsStationModalOpen(true);
  };

  const handleStationSelected = async (selectedStation: Station) => {
    if (currentUser.role !== 'Head of Operation') {
      alert('Access Denied: Only the Operation Supervisor can create new Station Opening Forms.');
      return;
    }
    setIsStationModalOpen(false);

    // Create a clean blank form with ONLY station information loaded
    const newForm = createEmptyStationOpeningForm(
      selectedStation.id || '',
      selectedStation.station_no || 'ST-101',
      selectedStation.name || 'Station Name',
      (selectedStation as any).address || (selectedStation as any).city || 'Saudi Arabia',
      currentUser.id,
      currentUser.full_name,
      currentUser.role
    );

    const saved = await saveStationOpeningForm(newForm, currentUser.role);
    setForms((prev) => [saved, ...prev]);
    setCurrentFormId(saved.id);

    // Record activity log for creation
    const creationLog: StationOpeningActivityLog = {
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_id: saved.station_id,
      station_name: saved.station_name,
      action_type: 'created',
      action_title: 'New Station Opening Form Created',
      action_description: `Station Opening Form initialized for ${saved.station_name} (${saved.station_no}). All technical fields clean and pending manual entry.`,
      status_at_time: 'pending_safety_quality',
      actor_id: currentUser.id,
      actor_name: currentUser.full_name,
      actor_role: currentUser.role,
      form_creator_id: currentUser.id,
      created_at: new Date().toISOString(),
    };

    await addStationOpeningActivityLog(creationLog);
    setActivityLogs((prev) => [creationLog, ...prev]);

    setActiveTab('form');
  };

  const handleOpenForm = (id: string) => {
    setCurrentFormId(id);
    setActiveTab('form');
  };

  const handleSaveForm = async (updated: StationOpeningForm) => {
    const saved = await saveStationOpeningForm(updated);
    setForms((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));

    // Record activity log
    const saveLog: StationOpeningActivityLog = {
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_id: saved.station_id,
      station_name: saved.station_name,
      action_type: 'updated',
      action_title: 'Form Updated',
      action_description: `Station Opening Form updated by ${currentUser.full_name}.`,
      status_at_time: saved.current_status,
      actor_id: currentUser.id,
      actor_name: currentUser.full_name,
      actor_role: currentUser.role,
      form_creator_id: saved.created_by || currentUser.id,
      created_at: new Date().toISOString(),
    };

    await addStationOpeningActivityLog(saveLog);
    setActivityLogs((prev) => [saveLog, ...prev]);

    alert('Station Opening Form saved successfully.');
  };

  const handleSubmitForm = async (updated: StationOpeningForm) => {
    const isResubmission = updated.current_status === 'returned';

    const formToSubmit: StationOpeningForm = {
      ...updated,
      current_status: 'pending_safety_quality',
      current_approver_role: 'safety_quality',
    };
    const saved = await saveStationOpeningForm(formToSubmit);
    setForms((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));

    // Send targeted notification to Safety & Quality Control
    await addStationOpeningNotification({
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_name: saved.station_name,
      recipient_role: 'Safety & Quality Control' as any,
      form_creator_id: saved.created_by || currentUser.id,
      sender_name: currentUser.full_name,
      action_type: isResubmission ? 'resubmitted' : 'submitted',
      message: `Station Opening Form ${saved.form_number} for ${saved.station_name} ${isResubmission ? 'resubmitted' : 'submitted'} by Operation Supervisor and is awaiting your review.`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Record activity log
    const submitLog: StationOpeningActivityLog = {
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_id: saved.station_id,
      station_name: saved.station_name,
      action_type: isResubmission ? 'resubmitted' : 'submitted',
      action_title: isResubmission ? 'Form Resubmitted after Revision' : 'Form Submitted for Review',
      action_description: `Form submitted to Safety & Quality Control for first-level review.`,
      status_at_time: 'pending_safety_quality',
      actor_id: currentUser.id,
      actor_name: currentUser.full_name,
      actor_role: currentUser.role,
      form_creator_id: saved.created_by || currentUser.id,
      created_at: new Date().toISOString(),
    };

    await addStationOpeningActivityLog(submitLog);
    setActivityLogs((prev) => [submitLog, ...prev]);

    alert(`Station Opening Form ${saved.form_number} submitted to Safety & Quality Control!`);
    setActiveTab('repository');
  };

  const handleDeleteForm = async (id: string) => {
    await deleteStationOpeningForm(id);
    setForms((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDeleteSoUser = async (id: string) => {
    await deleteStationOpeningUser(id);
    setSoUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleApproveStage = async (
    formId: string,
    role: StationOpeningApprovalRole,
    comments: string,
    signatureUrl?: string
  ) => {
    const target = forms.find((f) => f.id === formId);
    if (!target) return;

    let nextStatus: any = 'approved';
    let nextApproverRole: any = null;
    let nextTargetRole = 'Head of Operation';

    if (role === 'safety_quality') {
      nextStatus = 'pending_document_controller';
      nextApproverRole = 'document_controller';
      nextTargetRole = 'Document Controller';
    } else if (role === 'document_controller') {
      nextStatus = 'pending_engineering';
      nextApproverRole = 'engineering';
      nextTargetRole = 'Engineering Department';
    } else if (role === 'engineering') {
      nextStatus = 'pending_management';
      nextApproverRole = 'management';
      nextTargetRole = 'Al Noor United Management';
    } else if (role === 'management') {
      nextStatus = 'approved';
      nextApproverRole = null;
      nextTargetRole = 'Head of Operation';
    }

    const updatedApprovals = target.approvals.map((app) => {
      if (app.role === role) {
        return {
          ...app,
          status: 'approved' as const,
          approver_id: currentUser.id,
          approver_name: currentUser.full_name,
          approver_position: currentUser.position || currentUser.role,
          comments: comments || 'Approved',
          signature_url: signatureUrl || currentUser.signature_url || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          action_timestamp: new Date().toISOString(),
        };
      }
      return app;
    });

    const updatedForm: StationOpeningForm = {
      ...target,
      current_status: nextStatus,
      current_approver_role: nextApproverRole,
      returned_by_role: null,
      return_reason: null,
      approvals: updatedApprovals,
    };

    const saved = await saveStationOpeningForm(updatedForm);
    setForms((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));

    // Send targeted notification
    await addStationOpeningNotification({
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_name: saved.station_name,
      recipient_role: nextTargetRole as any,
      recipient_id: nextStatus === 'approved' ? (target.created_by || saved.created_by) : undefined,
      form_creator_id: target.created_by || saved.created_by,
      sender_name: currentUser.full_name,
      action_type: nextStatus === 'approved' ? 'final_approval' : 'approved',
      message: nextStatus === 'approved'
        ? `Station Opening Form ${saved.form_number} for ${saved.station_name} has received FINAL APPROVAL!`
        : `Station Opening Form ${saved.form_number} for ${saved.station_name} has been approved by ${currentUser.role} and is now assigned to ${nextTargetRole}.`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Record activity log
    const isFinal = nextStatus === 'approved';
    const appLog: StationOpeningActivityLog = {
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_id: saved.station_id,
      station_name: saved.station_name,
      action_type: isFinal ? 'final_approval' : 'approved_stage',
      action_title: isFinal ? 'Final Approval Completed' : `Approved by ${currentUser.role}`,
      action_description: isFinal
        ? `All department reviews completed. Form ${saved.form_number} is fully approved.`
        : `Approved stage ${role.replace(/_/g, ' ')}. Advanced to ${nextTargetRole}. Comments: ${comments || 'None'}`,
      status_at_time: nextStatus,
      actor_id: currentUser.id,
      actor_name: currentUser.full_name,
      actor_role: currentUser.role,
      form_creator_id: target.created_by || saved.created_by,
      created_at: new Date().toISOString(),
    };

    await addStationOpeningActivityLog(appLog);
    setActivityLogs((prev) => [appLog, ...prev]);

    alert(`Step ${role.replace(/_/g, ' ')} approved successfully!`);
  };

  const handleReturnStage = async (
    formId: string,
    role: StationOpeningApprovalRole,
    comments: string
  ) => {
    const target = forms.find((f) => f.id === formId);
    if (!target) return;

    const updatedApprovals = target.approvals.map((app) => {
      if (app.role === role) {
        return {
          ...app,
          status: 'returned' as const,
          approver_id: currentUser.id,
          approver_name: currentUser.full_name,
          comments: comments,
          action_timestamp: new Date().toISOString(),
        };
      }
      return app;
    });

    const updatedForm: StationOpeningForm = {
      ...target,
      current_status: 'returned',
      returned_by_role: role,
      return_reason: comments,
      approvals: updatedApprovals,
    };

    const saved = await saveStationOpeningForm(updatedForm);
    setForms((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));

    // Send returned notification
    await addStationOpeningNotification({
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_name: saved.station_name,
      recipient_role: 'Head of Operation',
      recipient_id: target.created_by || saved.created_by,
      form_creator_id: target.created_by || saved.created_by,
      sender_name: currentUser.full_name,
      action_type: 'returned',
      message: `Station Opening Form ${saved.form_number} for ${saved.station_name} was returned by ${currentUser.role} for revision. Reason: ${comments}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Record activity log
    const returnLog: StationOpeningActivityLog = {
      id: generateUuidV4(),
      form_id: saved.id,
      form_number: saved.form_number,
      station_id: saved.station_id,
      station_name: saved.station_name,
      action_type: 'returned',
      action_title: `Returned by ${currentUser.role}`,
      action_description: `Form returned to Head of Operation for revision. Reason: ${comments}`,
      status_at_time: 'returned',
      actor_id: currentUser.id,
      actor_name: currentUser.full_name,
      actor_role: currentUser.role,
      form_creator_id: target.created_by || saved.created_by,
      created_at: new Date().toISOString(),
    };

    await addStationOpeningActivityLog(returnLog);
    setActivityLogs((prev) => [returnLog, ...prev]);

    const notifs = await fetchStationOpeningNotifications();
    setSoNotifications(notifs);

    alert(`Form returned to Head of Operation for correction.`);
  };

  const handleMarkAsRead = async (id: string) => {
    await markStationOpeningNotificationAsRead(id);
    setSoNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    await markAllStationOpeningNotificationsAsRead(currentUser.role);
    setSoNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // Role-based Notifications Isolation:
  // 1. Super Admin -> All notifications
  // 2. Head of Operation -> ONLY notifications for forms created by that specific Head of Operation
  // 3. Department Approvers -> ONLY notifications for forms currently pending their stage
  const visibleNotifications = soNotifications.filter((n) => {
    if (isSuperAdmin) return true;

    const parentForm = forms.find((f) => f.id === n.form_id || f.form_number === n.form_number);

    if (currentUser.role === 'Head of Operation') {
      const creatorId = n.form_creator_id || n.recipient_id || parentForm?.created_by;
      return creatorId === currentUser.id;
    }

    if (!parentForm) return false;

    if (currentUser.role === 'Safety & Quality Control') {
      return parentForm.current_status === 'pending_safety_quality' && n.recipient_role === 'Safety & Quality Control';
    }
    if (currentUser.role === 'Document Controller') {
      return parentForm.current_status === 'pending_document_controller' && n.recipient_role === 'Document Controller';
    }
    if (currentUser.role === 'Engineering Department') {
      return parentForm.current_status === 'pending_engineering' && n.recipient_role === 'Engineering Department';
    }
    if (currentUser.role === 'Al Noor United Management') {
      return parentForm.current_status === 'pending_management' && n.recipient_role === 'Al Noor United Management';
    }

    return false;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-transparent pb-12">
      {/* MODULE HEADER BAR (GLASSMORPHISM STYLE) */}
      <div className="bg-white/60 backdrop-blur-2xl border-b border-white/80 shadow-md shadow-sky-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-700 rounded-2xl border border-amber-500/20 shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">{t('so.moduleTitle')}</h2>
              <p className="text-[11px] text-sky-800 font-extrabold">{t('so.moduleSub')}</p>
            </div>
          </div>

          {/* INNER MODULE TAB BUTTONS (GLASSMORPHISM PILL CONTROL) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border border-sky-100 shadow-inner">
            <button
              onClick={() => changeTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t('so.dashboard')}</span>
            </button>

            <button
              onClick={() => changeTab('repository')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'repository'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{t('so.openingForms')}</span>
            </button>

            {isHeadOfOp && (
              <button
                onClick={() => changeTab('activity')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'activity'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t('so.activityLog')}</span>
              </button>
            )}

            <button
              onClick={() => changeTab('notifications')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 relative ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t('so.notifications')}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => changeTab('users')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('so.userDirectory')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODULE CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(() => {
          // Compute role-based isolated forms list for Dashboard, Repository & Activity
          const visibleForms = forms.filter((f) => {
            if (isSuperAdmin) return true;
            if (currentUser.role === 'Head of Operation') {
              return f.created_by === currentUser.id;
            }
            if (currentUser.role === 'Safety & Quality Control') {
              return (
                f.current_status === 'pending_safety_quality' ||
                f.approvals?.some((a) => a.role === 'safety_quality' && a.status === 'approved')
              );
            }
            if (currentUser.role === 'Document Controller') {
              return (
                f.current_status === 'pending_document_controller' ||
                f.approvals?.some((a) => a.role === 'document_controller' && a.status === 'approved')
              );
            }
            if (currentUser.role === 'Engineering Department') {
              return (
                f.current_status === 'pending_engineering' ||
                f.approvals?.some((a) => a.role === 'engineering' && a.status === 'approved')
              );
            }
            if (currentUser.role === 'Al Noor United Management') {
              return (
                f.current_status === 'pending_management' ||
                f.approvals?.some((a) => a.role === 'management' && a.status === 'approved')
              );
            }
            return false;
          });

          if (isLoading) {
            return (
              <div className="py-12 text-center text-slate-500 font-extrabold text-sm">
                Loading Station Opening Forms...
              </div>
            );
          }

          if (activeTab === 'dashboard') {
            return (
              <SODashboard
                forms={visibleForms}
                currentUser={currentUser}
                onCreateNew={handleOpenStationModal}
                onOpenForm={handleOpenForm}
              />
            );
          }

          if (activeTab === 'repository') {
            return (
              <SOListView
                forms={visibleForms}
                currentUser={currentUser}
                onOpenForm={handleOpenForm}
                onCreateNew={handleOpenStationModal}
                onDeleteForm={handleDeleteForm}
              />
            );
          }

          if (activeTab === 'activity') {
            return (
              <SOActivityView
                activityLogs={activityLogs}
                forms={visibleForms}
                currentUser={currentUser}
                onOpenForm={handleOpenForm}
              />
            );
          }

          return null;
        })()}
        {activeTab === 'notifications' ? (
          <SONotifications
            notifications={visibleNotifications}
            currentUser={currentUser}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onOpenForm={(id) => {
              handleOpenForm(id);
            }}
          />
        ) : activeTab === 'users' ? (
          <SOUserManagement
            users={soUsers}
            currentUser={currentUser}
            onSaveUser={async (user, pass) => {
              const saved = await saveStationOpeningUser(user, pass);
              setSoUsers((prev) => {
                const idx = prev.findIndex((u) => u.id === saved.id);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = saved;
                  return copy;
                }
                return [saved, ...prev];
              });
              alert(`Station Opening user account ${saved.full_name} (${saved.role}) saved successfully.`);
            }}
            onDeleteUser={handleDeleteSoUser}
            onResetPassword={async (id, newPass) => {
              await resetStationOpeningUserPassword(id, newPass);
              const updated = await fetchStationOpeningUsers();
              setSoUsers(updated);
            }}
            onToggleLogin={async (id, loginEnabled, status) => {
              await toggleStationOpeningUserLogin(id, loginEnabled, status);
              const updated = await fetchStationOpeningUsers();
              setSoUsers(updated);
            }}
          />
        ) : activeTab === 'form' && activeForm ? (
          <SOFormView
            form={activeForm}
            stations={stations}
            currentUser={currentUser}
            onSave={handleSaveForm}
            onSubmit={handleSubmitForm}
            onApprove={handleApproveStage}
            onReturn={handleReturnStage}
            onBack={() => setActiveTab('repository')}
          />
        ) : activeTab === 'form' ? (
          <div className="bg-white/60 backdrop-blur-2xl border border-white/90 rounded-[28px] p-8 sm:p-12 text-center text-slate-700 font-extrabold text-xs shadow-lg space-y-4 max-w-lg mx-auto my-8">
            <p className="text-sm font-black text-slate-900">No Station Opening Form Selected</p>
            <p className="text-xs text-slate-500 font-medium">Please select a form from your repository or initialize a new station opening form.</p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              Return to Dashboard
            </button>
          </div>
        ) : null}
      </div>

      {/* STATION SELECTION DIALOG */}
      <SOStationSelectModal
        isOpen={isStationModalOpen}
        stations={stations}
        onSelectStation={handleStationSelected}
        onClose={() => setIsStationModalOpen(false)}
      />
    </div>
  );
};
