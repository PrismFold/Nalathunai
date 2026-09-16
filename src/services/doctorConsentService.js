// Doctor Consent Management Service for Nalathunai Platform
// Interoperates seamlessly with Patient Consent storage and notification systems

const CONSENTS_STORAGE_KEY = 'nalathunai_active_consents';
const PENDING_STORAGE_KEY = 'nalathunai_pending_requests';
const REJECTED_STORAGE_KEY = 'nalathunai_rejected_requests';
const NOTIFICATIONS_STORAGE_KEY = 'nalathunai_notifications';

const getStoredList = (key, fallback = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const doctorConsentService = {
  /**
   * Check consent status for a specific patient from a doctor's perspective.
   * Returns: 'Accepted' | 'Pending' | 'Rejected' | 'Revoked' | 'None'
   */
  async getPatientConsentStatus(patientId, doctorRegNo = 'TN-MED-00123') {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const consents = getStoredList(CONSENTS_STORAGE_KEY);
    const pending = getStoredList(PENDING_STORAGE_KEY);
    const rejected = getStoredList(REJECTED_STORAGE_KEY);

    // 1. Check for Active / Accepted consent
    const activeConsent = consents.find(
      (c) =>
        (c.patientId === patientId || (!c.patientId && patientId === 'PAT-9082')) &&
        (c.status === 'Active' || c.status === 'Accepted') &&
        (c.doctorRegNo === doctorRegNo ||
         c.doctorName?.toLowerCase().includes('ananya') ||
         c.doctorName?.toLowerCase().includes('malathi') ||
         c.doctorName?.toLowerCase().includes('arun'))
    );
    if (activeConsent) {
      return { status: 'Accepted', consent: activeConsent };
    }

    // 2. Check for Revoked consent
    const revokedConsent = consents.find(
      (c) =>
        (c.patientId === patientId || (!c.patientId && patientId === 'PAT-9082')) &&
        c.status === 'Revoked' &&
        (c.doctorRegNo === doctorRegNo || c.doctorName?.toLowerCase().includes('ananya'))
    );
    if (revokedConsent) {
      return { status: 'Revoked', consent: revokedConsent };
    }

    // 3. Check for Pending request
    const pendingRequest = pending.find(
      (r) =>
        (r.patientId === patientId || (!r.patientId && patientId === 'PAT-9082')) &&
        (r.doctorRegNo === doctorRegNo || r.requesterName?.toLowerCase().includes('ananya'))
    );
    if (pendingRequest) {
      return { status: 'Pending', request: pendingRequest };
    }

    // 4. Check for Rejected request
    const rejectedRequest = rejected.find(
      (r) =>
        (r.patientId === patientId || (!r.patientId && patientId === 'PAT-9082')) &&
        (r.doctorRegNo === doctorRegNo || r.requesterName?.toLowerCase().includes('ananya'))
    );
    if (rejectedRequest) {
      return { status: 'Rejected', request: rejectedRequest };
    }

    return { status: 'None', consent: null };
  },

  /**
   * Submit a new Consent Request from Doctor to Patient.
   * Stores in shared pending requests list and creates patient notification.
   */
  async requestConsent({
    patientId,
    patientName,
    doctorName,
    doctorRegNo,
    hospitalName,
    requestedRecords,
    duration,
    purpose,
  }) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const pending = getStoredList(PENDING_STORAGE_KEY);
    const rejected = getStoredList(REJECTED_STORAGE_KEY);

    // Remove from rejected if doctor is re-requesting
    const cleanedRejected = rejected.filter(
      (r) => !(r.patientId === patientId && r.doctorRegNo === doctorRegNo)
    );
    localStorage.setItem(REJECTED_STORAGE_KEY, JSON.stringify(cleanedRejected));

    const newRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      patientId,
      patientName,
      requesterName: `${doctorName} (${doctorRegNo})`,
      doctorName,
      doctorRegNo,
      hospitalName: hospitalName || 'PSG Institute of Medical Sciences',
      accessLevel: requestedRecords?.join(', ') || 'Medical Records & Prescriptions',
      requestedRecords: requestedRecords || ['Consultations', 'Prescriptions', 'Lab Reports'],
      duration: duration || '30 Days',
      purpose: purpose || 'Clinical consultation & diagnosis assessment',
      requestDate: 'Today',
      expiryWindow: 'Expires in 48 hours',
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };

    const updatedPending = [newRequest, ...pending];
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(updatedPending));

    // Send mock notification to patient portal
    try {
      const notifications = getStoredList(NOTIFICATIONS_STORAGE_KEY);
      const newNotification = {
        id: `NOT-${Date.now().toString().slice(-4)}`,
        title: 'New Access Request',
        message: `${doctorName} (${hospitalName || 'PSG Institute'}) requested access to your medical records for ${purpose || 'Clinical evaluation'}.`,
        timestamp: 'Just now',
        read: false,
        type: 'request',
        link: '/consent',
      };
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify([newNotification, ...notifications])
      );
    } catch (e) {
      console.warn('Could not queue notification', e);
    }

    return newRequest;
  },

  /**
   * Get all consent requests created by or related to this doctor.
   */
  async getAllDoctorRequests(doctorRegNo = 'TN-MED-00123') {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const consents = getStoredList(CONSENTS_STORAGE_KEY);
    const pending = getStoredList(PENDING_STORAGE_KEY);
    const rejected = getStoredList(REJECTED_STORAGE_KEY);

    const items = [];

    // Pending requests
    pending.forEach((p) => {
      items.push({
        id: p.id,
        patientId: p.patientId || 'PAT-9082',
        patientName: p.patientName || 'Ananya Ramesh',
        doctorName: p.doctorName || p.requesterName,
        doctorRegNo: p.doctorRegNo || doctorRegNo,
        hospitalName: p.hospitalName,
        purpose: p.purpose,
        duration: p.duration,
        requestedRecords: p.requestedRecords || ['Medical Records'],
        status: 'Pending',
        statusLabel: 'Pending Patient Approval',
        date: p.requestDate || 'Recent',
      });
    });

    // Active & Revoked Consents
    consents.forEach((c) => {
      const isAccepted = c.status === 'Active' || c.status === 'Approved';
      items.push({
        id: c.id,
        patientId: c.patientId || 'PAT-9082',
        patientName: c.patientName || 'Ananya Ramesh',
        doctorName: c.doctorName,
        doctorRegNo: c.doctorRegNo || doctorRegNo,
        hospitalName: c.hospitalName,
        purpose: c.purpose,
        duration: c.duration,
        requestedRecords: c.requestedRecords || ['Medical Records'],
        status: isAccepted ? 'Accepted' : c.status,
        statusLabel: isAccepted ? 'Access Granted' : 'Access Revoked',
        date: c.grantedDate || 'Recent',
        expiryDate: c.expiryDate,
      });
    });

    // Rejected Requests
    rejected.forEach((r) => {
      items.push({
        id: r.id,
        patientId: r.patientId || 'PAT-9082',
        patientName: r.patientName || 'Ananya Ramesh',
        doctorName: r.doctorName || r.requesterName,
        doctorRegNo: r.doctorRegNo || doctorRegNo,
        hospitalName: r.hospitalName,
        purpose: r.purpose,
        duration: r.duration,
        requestedRecords: r.requestedRecords || ['Medical Records'],
        status: 'Rejected',
        statusLabel: 'Access Denied',
        date: r.requestDate || 'Recent',
      });
    });

    return items;
  }
};
