// Notification Service for Nalathunai Patient Platform
import { initialNotifications } from '../data/mockData';

const NOTIFICATIONS_STORAGE_KEY = 'nalathunai_notifications';

const getStoredNotifications = () => {
  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
    return initialNotifications;
  }
  return JSON.parse(stored);
};

export const notificationService = {
  /**
   * Get all notifications for the patient.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: GET /notifications
   */
  async getNotifications() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getStoredNotifications();
  },

  /**
   * Mark a notification as read.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: POST /notifications/:id/read
   */
  async markAsRead(id) {
    const list = getStoredNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Mark all notifications as read.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: POST /notifications/read-all
   */
  async markAllAsRead() {
    const list = getStoredNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};
