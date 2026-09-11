// Access & Consent Management Service for Nalathunai Patient Platform
import { initialConsents, initialPendingRequests } from '../data/mockData';

const CONSENTS_STORAGE_KEY = 'nalathunai_active_consents';
const PENDING_STORAGE_KEY = 'nalathunai_pending_requests';

const getStoredConsents = () => {
  const stored = localStorage.getItem(CONSENTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CONSENTS_STORAGE_KEY, JSON.stringify(initialConsents));
    return initialConsents;
  }
  return JSON.parse(stored);
};

const getStoredPendingRequests = () => {
  const stored = localStorage.getItem(PENDING_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(initialPendingRequests));
    return initialPendingRequests;
  }
  return JSON.parse(stored);
};

export const consentService = {
  /**
   * Get all active and past access permissions.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: GET /consents
   */
  async getConsents() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredConsents();
  },

  /**
   * Get all pending access requests waiting for patient approval.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: GET /consents/pending
   */
  async getPendingRequests() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredPendingRequests();
  },

  /**
   * Approve a pending access request.
   * Moves request from pending to active consents list.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: POST /consents/:id/approve
   */
  async approveConsent(requestId) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const pendingList = getStoredPendingRequests();
    const activeList = getStoredConsents();

    const targetRequest = pendingList.find((r) => r.id === requestId);
    if (!targetRequest) throw new Error('Request not found');

    const updatedPending = pendingList.filter((r) => r.id !== requestId);
    
    // Calculate mock expiry date (30 days from today)
    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + 30);
    
    const newConsent = {
      id: `CONS-${Date.now().toString().slice(-4)}`,
      patientId: targetRequest.patientId || 'PAT-9082',
      patientName: targetRequest.patientName || 'Ananya Ramesh',
      doctorName: targetRequest.doctorName || targetRequest.requesterName,
      doctorRegNo: targetRequest.doctorRegNo || 'TN-MED-00123',
      hospitalName: targetRequest.hospitalName,
      accessLevel: targetRequest.accessLevel,
      requestedRecords: targetRequest.requestedRecords || ['All Records'],
      status: 'Active',
      grantedDate: 'Today',
      expiryDate: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      duration: targetRequest.duration || '30 Days',
      purpose: targetRequest.purpose,
    };

    const updatedActive = [newConsent, ...activeList];

    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(updatedPending));
    localStorage.setItem(CONSENTS_STORAGE_KEY, JSON.stringify(updatedActive));

    return { approvedConsent: newConsent, remainingPending: updatedPending };
  },

  /**
   * Deny a pending access request.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: POST /consents/:id/deny
   */
  async denyConsent(requestId) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const pendingList = getStoredPendingRequests();
    const target = pendingList.find((r) => r.id === requestId);
    const updatedPending = pendingList.filter((r) => r.id !== requestId);
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(updatedPending));

    if (target) {
      try {
        const REJECTED_KEY = 'nalathunai_rejected_requests';
        const raw = localStorage.getItem(REJECTED_KEY);
        const rejectedList = raw ? JSON.parse(raw) : [];
        const rejectedItem = {
          ...target,
          status: 'Rejected',
          deniedDate: 'Today',
        };
        localStorage.setItem(REJECTED_KEY, JSON.stringify([rejectedItem, ...rejectedList]));
      } catch (e) {
        console.warn('Failed to store rejected request', e);
      }
    }

    return updatedPending;
  },

  /**
   * Revoke an existing active consent.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: POST /consents/:id/revoke
   */
  async revokeConsent(consentId) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const activeList = getStoredConsents();
    const updatedActive = activeList.map((c) => {
      if (c.id === consentId) {
        return { ...c, status: 'Revoked', revokedDate: 'Today' };
      }
      return c;
    });

    localStorage.setItem(CONSENTS_STORAGE_KEY, JSON.stringify(updatedActive));
    return updatedActive;
  }
};
