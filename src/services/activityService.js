// Activity & Audit Logging Service for Nalathunai Patient Platform
import { initialActivityLog } from '../data/mockData';

const ACTIVITY_STORAGE_KEY = 'nalathunai_activity_log';

const getStoredActivity = () => {
  const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(initialActivityLog));
    return initialActivityLog;
  }
  return JSON.parse(stored);
};

export const activityService = {
  /**
   * Fetch audit history log of patient consent and record viewing activities.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: GET /activity
   */
  async getActivityLog() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredActivity();
  },

  /**
   * Log a new activity event locally for demo audit completeness.
   * 
   * TODO: Replace mock API with SNS Workbench audit event handler
   */
  async logEvent(title, description, type = 'general', icon = 'Shield') {
    const current = getStoredActivity();
    const newEvent = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      title,
      description,
      timestamp: 'Just now',
      type,
      icon,
    };
    const updated = [newEvent, ...current];
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
    return newEvent;
  }
};
