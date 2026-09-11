// Organization Patient Consent & Record Requests Service
// Handles hospital-initiated requests to patients for medical records access.

import { initialOrganizationRequests } from '../data/mockOrganizationData';

const ORG_REQUESTS_KEY = 'nalathunai_org_requests_data';

const getStoredRequests = () => {
  try {
    const raw = localStorage.getItem(ORG_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : initialOrganizationRequests;
  } catch {
    return initialOrganizationRequests;
  }
};

const saveStoredRequests = (requests) => {
  localStorage.setItem(ORG_REQUESTS_KEY, JSON.stringify(requests));
};

export const organizationRequestService = {
  /**
   * Get all requests initiated by or related to an organization
   */
  async getRequests(orgId = 'HOSP-PSG-01', status = 'all') {
    await new Promise((r) => setTimeout(r, 200));
    const all = getStoredRequests();
    let filtered = all.filter(
      (req) => req.hospitalOrgId?.toUpperCase() === orgId?.toUpperCase()
    );

    if (status && status !== 'all') {
      filtered = filtered.filter((req) => req.status.toLowerCase() === status.toLowerCase());
    }

    return filtered;
  },

  /**
   * Create a new consent request from organization to a patient
   */
  async createRequest(orgId, requestData) {
    await new Promise((r) => setTimeout(r, 350));
    const all = getStoredRequests();

    const newReq = {
      id: `ORG-REQ-${Date.now().toString().slice(-4)}`,
      hospitalOrgId: orgId,
      hospitalName: requestData.hospitalName || 'PSG Institute of Medical Sciences & Research',
      doctorName: requestData.doctorName,
      doctorId: requestData.doctorId || 'D001',
      patientName: requestData.patientName,
      patientId: requestData.patientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientAbha: requestData.patientAbha || '91-4829-1029-4720',
      purpose: requestData.purpose,
      recordTypes: requestData.recordTypes || ['All Available Records'],
      requestDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      accessLevel: requestData.accessLevel || 'View Only',
      notes: requestData.notes || 'Consent request transmitted via ABDM gateway.',
    };

    all.unshift(newReq);
    saveStoredRequests(all);
    return newReq;
  },

  /**
   * Cancel or Revoke a pending request
   */
  async cancelRequest(requestId) {
    await new Promise((r) => setTimeout(r, 200));
    const all = getStoredRequests();
    const index = all.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      all[index].status = 'Cancelled';
      all[index].notes = 'Request revoked by hospital administrator.';
      saveStoredRequests(all);
      return all[index];
    }
    throw new Error('Request not found');
  },
};
