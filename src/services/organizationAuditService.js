// Organization Access Audit Trail Service
// Tracks and exposes HIPAA/ABDM compliant access logs for record views, consent requests, and actions.

import { initialOrganizationAuditLogs } from '../data/mockOrganizationData';

const ORG_AUDIT_KEY = 'nalathunai_org_audit_data';

const getStoredAuditLogs = () => {
  try {
    const raw = localStorage.getItem(ORG_AUDIT_KEY);
    return raw ? JSON.parse(raw) : initialOrganizationAuditLogs;
  } catch {
    return initialOrganizationAuditLogs;
  }
};

const saveStoredAuditLogs = (logs) => {
  localStorage.setItem(ORG_AUDIT_KEY, JSON.stringify(logs));
};

export const organizationAuditService = {
  /**
   * Get audit logs for an organization with optional filters
   */
  async getAuditLogs(orgId = 'HOSP-PSG-01', query = '', actionFilter = 'all') {
    await new Promise((r) => setTimeout(r, 200));
    const all = getStoredAuditLogs();
    let filtered = all.filter(
      (log) => log.hospitalOrgId?.toUpperCase() === orgId?.toUpperCase()
    );

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (log) =>
          log.actorName.toLowerCase().includes(q) ||
          log.patientName.toLowerCase().includes(q) ||
          log.targetItem.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.actorRegNo?.toLowerCase().includes(q)
      );
    }

    if (actionFilter && actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.status.toLowerCase().includes(actionFilter.toLowerCase()));
    }

    return filtered;
  },

  /**
   * Append a new audit event
   */
  async recordAuditEvent(orgId, eventData) {
    const all = getStoredAuditLogs();
    const newLog = {
      id: `OAUD-${Date.now().toString().slice(-4)}`,
      hospitalOrgId: orgId,
      actorName: eventData.actorName || 'Hospital Staff',
      actorRole: eventData.actorRole || 'Clinical Staff',
      actorRegNo: eventData.actorRegNo || 'REG-N/A',
      patientName: eventData.patientName || 'N/A',
      patientId: eventData.patientId || 'PAT-N/A',
      action: eventData.action,
      targetItem: eventData.targetItem || 'EHR Record',
      consentRef: eventData.consentRef || 'N/A',
      timestamp: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ipAddress: eventData.ipAddress || '192.168.10.22 (Facility Gateway)',
      status: eventData.status || 'Authorized',
      reason: eventData.reason || 'Routine clinical operations',
    };

    all.unshift(newLog);
    saveStoredAuditLogs(all);
    return newLog;
  },
};
