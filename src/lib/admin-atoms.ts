import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { z } from 'zod';
import { selectUserSchema } from './drizzle/schema';

// Admin user data atom
export const adminUserAtom = atom<z.infer<typeof selectUserSchema> | null>(null);

// Loading state atom
export const adminLoadingAtom = atom(true);

// Error state atom
export const adminErrorAtom = atom<string | null>(null);

// Form state atoms
export const showPasswordAtom = atom(false);
export const isFormPendingAtom = atom(false);

// Form data atoms
export const formDataAtom = atom({
  id: '',
  fullName: '',
  email: '',
  phone: '',
  passwordText: '',
});

// Form validation state atom
export const formValidationAtom = atom((get) => {
  const formData = get(formDataAtom);
  return {
    isValid: formData.id && formData.fullName,
    hasChanges: false, // This would be computed based on original vs current values
  };
});

// Admin panel UI state atoms
export const adminPanelCollapsedAtom = atomWithStorage('admin-panel-collapsed', false);
export const selectedTabAtom = atomWithStorage('admin-selected-tab', 'overview');

// Quick access stats atoms
export const quickStatsAtom = atom({
  totalUsers: 0,
  totalCars: 0,
  pendingApprovals: 0,
  recentActivity: 0,
});

// Admin notifications atom
export const adminNotificationsAtom = atom<Array<{
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
  read: boolean;
}>>([]);

// Admin activity log atom
export const adminActivityLogAtom = atom<Array<{
  id: string;
  action: string;
  details: string;
  timestamp: number;
  userId?: string;
}>>([]);

// Reset admin form atom
export const resetAdminFormAtom = atom(
  null,
  (get, set, user: z.infer<typeof selectUserSchema>) => {
    set(formDataAtom, {
      id: user?.id || '',
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      passwordText: user?.passwordText || '',
    });
    set(showPasswordAtom, false);
    set(isFormPendingAtom, false);
  }
);

// Update form field atom
export const updateFormFieldAtom = atom(
  null,
  (get, set, field: 'id' | 'fullName' | 'email' | 'phone' | 'passwordText', value: string) => {
    const currentData = get(formDataAtom);
    set(formDataAtom, {
      ...currentData,
      [field]: value,
    });
  }
);

// Toggle password visibility atom
export const togglePasswordVisibilityAtom = atom(
  null,
  (get, set) => {
    set(showPasswordAtom, !get(showPasswordAtom));
  }
);

// Add notification atom
export const addNotificationAtom = atom(
  null,
  (get, set, notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }) => {
    const notifications = get(adminNotificationsAtom);
    const newNotification = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...notification,
    };
    
    // Keep only last 50 notifications
    const updatedNotifications = [newNotification, ...notifications.slice(0, 49)];
    set(adminNotificationsAtom, updatedNotifications);
  }
);

// Mark notification as read atom
export const markNotificationReadAtom = atom(
  null,
  (get, set, notificationId: string) => {
    const notifications = get(adminNotificationsAtom);
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    set(adminNotificationsAtom, updatedNotifications);
  }
);

// Clear all notifications atom
export const clearNotificationsAtom = atom(
  null,
  (get, set) => {
    set(adminNotificationsAtom, []);
  }
);

// Add activity log entry atom
export const addActivityLogAtom = atom(
  null,
  (get, set, activity: {
    action: string;
    details: string;
    userId?: string;
  }) => {
    const activityLog = get(adminActivityLogAtom);
    const newEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...activity,
    };
    
    // Keep only last 100 entries
    const updatedLog = [newEntry, ...activityLog.slice(0, 99)];
    set(adminActivityLogAtom, updatedLog);
  }
);

// Update quick stats atom
export const updateQuickStatsAtom = atom(
  null,
  (get, set, stats: Partial<{
    totalUsers: number;
    totalCars: number;
    pendingApprovals: number;
    recentActivity: number;
  }>) => {
    const currentStats = get(quickStatsAtom);
    set(quickStatsAtom, {
      ...currentStats,
      ...stats,
    });
  }
);

// Toggle admin panel collapsed state atom
export const toggleAdminPanelAtom = atom(
  null,
  (get, set) => {
    set(adminPanelCollapsedAtom, !get(adminPanelCollapsedAtom));
  }
);

// Set selected tab atom
export const setSelectedTabAtom = atom(
  null,
  (get, set, tab: string) => {
    set(selectedTabAtom, tab);
  }
); 