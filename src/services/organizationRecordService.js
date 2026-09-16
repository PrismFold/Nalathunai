// Organization Medical Records Service
// Handles hospital-level repository of diagnostic reports, discharge summaries, and prescriptions.

import { initialOrganizationRecords } from '../data/mockOrganizationData';

const ORG_RECORDS_KEY = 'nalathunai_org_records_data';

const getStoredRecords = () => {
  try {
    const raw = localStorage.getItem(ORG_RECORDS_KEY);
    return raw ? JSON.parse(raw) : initialOrganizationRecords;
  } catch {
    return initialOrganizationRecords;
  }
};

const saveStoredRecords = (records) => {
  localStorage.setItem(ORG_RECORDS_KEY, JSON.stringify(records));
};

export const organizationRecordService = {
  /**
   * Get all medical records indexed/uploaded by an organization
   */
  async getRecords(orgId = 'HOSP-PSG-01', query = '', recordType = 'all') {
    await new Promise((r) => setTimeout(r, 200));
    const all = getStoredRecords();
    let filtered = all.filter(
      (rec) => rec.hospitalOrgId?.toUpperCase() === orgId?.toUpperCase()
    );

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (rec) =>
          rec.title.toLowerCase().includes(q) ||
          rec.patientName.toLowerCase().includes(q) ||
          rec.patientAbha.toLowerCase().includes(q) ||
          rec.doctorName.toLowerCase().includes(q) ||
          rec.department?.toLowerCase().includes(q)
      );
    }

    if (recordType && recordType !== 'all') {
      filtered = filtered.filter((rec) => rec.recordType.toLowerCase() === recordType.toLowerCase());
    }

    return filtered;
  },

  /**
   * Upload / Index a new patient record by the hospital
   */
  async uploadRecord(orgId, recordData) {
    await new Promise((r) => setTimeout(r, 400));
    const all = getStoredRecords();

    const newRec = {
      id: `HREC-${Date.now().toString().slice(-4)}`,
      hospitalOrgId: orgId,
      hospitalName: recordData.hospitalName || 'PSG Institute of Medical Sciences & Research',
      title: recordData.title,
      recordType: recordData.recordType || 'Lab Reports',
      patientName: recordData.patientName,
      patientId: recordData.patientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientAbha: recordData.patientAbha || '91-4829-1029-4720',
      doctorName: recordData.doctorName,
      doctorId: recordData.doctorId || 'D001',
      department: recordData.department || 'Clinical Department',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fileFormat: recordData.fileFormat || 'PDF',
      fileSize: recordData.fileSize || '1.1 MB',
      verificationStatus: 'Digitally Signed & Verified',
      abdmStatus: 'Synced to ABDM Health Locker',
      summary: recordData.summary || 'Clinical record uploaded directly from hospital EHR.',
    };

    all.unshift(newRec);
    saveStoredRecords(all);
    return newRec;
  },
};
