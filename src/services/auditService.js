// Doctor Audit & Access History Service for Nalathunai Platform
import { initialDoctorAccessHistory } from '../data/mockDoctorData';

const DOCTOR_AUDIT_STORAGE_KEY = 'nalathunai_doctor_audit_history';

const getStoredAudit = () => {
  try {
    const item = localStorage.getItem(DOCTOR_AUDIT_STORAGE_KEY);
    if (!item) {
      localStorage.setItem(DOCTOR_AUDIT_STORAGE_KEY, JSON.stringify(initialDoctorAccessHistory));
      return initialDoctorAccessHistory;
    }
    return JSON.parse(item);
  } catch {
    return initialDoctorAccessHistory;
  }
};

export const auditService = {
  /**
   * Get all doctor access history logs.
   */
  async getAccessHistory() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getStoredAudit();
  },

  /**
   * Log an access event.
   */
  async logAccess({
    patientId,
    patientName,
    recordTitle,
    hospital,
    accessStatus,
    consentId,
    reason,
  }) {
    const list = getStoredAudit();
    const newEntry = {
      id: `DACT-${Date.now().toString().slice(-4)}`,
      patientId: patientId || 'PAT-UNKNOWN',
      patientName: patientName || 'Patient',
      recordTitle: recordTitle || 'Record View',
      hospital: hospital || 'Healthcare Facility',
      timestamp: 'Just now',
      accessStatus: accessStatus || 'Authorized - Active Consent',
      consentId: consentId || 'N/A',
      reason: reason || 'Clinical Consultation',
    };

    const updated = [newEntry, ...list];
    localStorage.setItem(DOCTOR_AUDIT_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  }
};
