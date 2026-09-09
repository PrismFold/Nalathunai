// Health Record Service for Nalathunai Patient Platform
import { initialRecords, initialRecordRequests } from '../data/mockData';

const RECORDS_STORAGE_KEY = 'nalathunai_records';
const UPLOADED_RECORDS_KEY = 'nalathunai_uploaded_records';
const LINKED_RECORDS_KEY = 'nalathunai_linked_records';
const REQUESTS_STORAGE_KEY = 'nalathunai_record_requests';

const initialUploadedRecords = [
  {
    id: "UPL-301",
    title: "Self-Uploaded Cholesterol Test",
    type: "Lab Reports",
    hospital: "Self / Home Diagnostics",
    date: "01 Sep 2026",
    uploadedDate: "01 Sep 2026, 10:15 AM",
    description: "PDF report downloaded from home lab testing portal.",
    status: "Uploaded",
    fileFormat: "PDF",
    fileSize: "850 KB",
  },
  {
    id: "UPL-302",
    title: "Previous Allergy Consultation Note",
    type: "Consultations",
    hospital: "Metropolis Clinic",
    date: "14 Jun 2026",
    uploadedDate: "20 Jun 2026, 03:40 PM",
    description: "Scanned paper prescription note from previous visit.",
    status: "Uploaded",
    fileFormat: "JPG / Scan",
    fileSize: "2.1 MB",
  },
];

const initialLinkedRecords = [
  {
    id: "LINK-401",
    title: "Cardiology Care Package (Blood Test + Prescription)",
    primaryRecord: "Complete Blood Count (CBC) Report (PSG Hospital)",
    linkedRecord: "Amoxicillin & Pain Relief Prescription (City Hospital)",
    dateLinked: "02 Sep 2026",
    notes: "Grouped together for upcoming Cardiology consultation.",
    status: "Linked",
  },
];

const getStoredRecords = () => {
  const stored = localStorage.getItem(RECORDS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(initialRecords));
    return initialRecords;
  }
  return JSON.parse(stored);
};

const getStoredUploadedRecords = () => {
  const stored = localStorage.getItem(UPLOADED_RECORDS_KEY);
  if (!stored) {
    localStorage.setItem(UPLOADED_RECORDS_KEY, JSON.stringify(initialUploadedRecords));
    return initialUploadedRecords;
  }
  return JSON.parse(stored);
};

const getStoredLinkedRecords = () => {
  const stored = localStorage.getItem(LINKED_RECORDS_KEY);
  if (!stored) {
    localStorage.setItem(LINKED_RECORDS_KEY, JSON.stringify(initialLinkedRecords));
    return initialLinkedRecords;
  }
  return JSON.parse(stored);
};

const getStoredRequests = () => {
  const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(initialRecordRequests));
    return initialRecordRequests;
  }
  return JSON.parse(stored);
};

export const recordService = {
  /**
   * Get all received records from hospitals.
   * TODO: Replace mock API with SNS Workbench endpoint: GET /records/received
   */
  async getRecords(category = 'All') {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const records = getStoredRecords();
    if (!category || category === 'All') return records;
    return records.filter((r) => r.type.toLowerCase() === category.toLowerCase());
  },

  /**
   * Get patient's self-uploaded records.
   * TODO: Replace mock API with SNS Workbench endpoint: GET /records/uploaded
   */
  async getUploadedRecords() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredUploadedRecords();
  },

  /**
   * Get patient's linked health record bundles.
   * TODO: Replace mock API with SNS Workbench endpoint: GET /records/linked
   */
  async getLinkedRecords() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredLinkedRecords();
  },

  /**
   * Upload a new patient medical record.
   * TODO: Replace mock upload with SNS Workbench endpoint: POST /records/upload
   */
  async uploadRecord(data) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const current = getStoredUploadedRecords();

    const newRecord = {
      id: `UPL-${Date.now().toString().slice(-4)}`,
      title: data.title || `${data.type} Record`,
      type: data.type || 'Lab Reports',
      hospital: data.hospital || 'Patient Upload',
      date: data.date || new Date().toISOString().split('T')[0],
      uploadedDate: 'Just now',
      description: data.description || 'Self-uploaded document',
      status: 'Uploaded',
      fileFormat: data.fileName ? data.fileName.split('.').pop().toUpperCase() : 'PDF',
      fileSize: '1.5 MB',
    };

    const updated = [newRecord, ...current];
    localStorage.setItem(UPLOADED_RECORDS_KEY, JSON.stringify(updated));
    return newRecord;
  },

  /**
   * Link an uploaded or received record with another record.
   * TODO: Replace mock link API with SNS Workbench endpoint: POST /records/link
   */
  async linkRecords(primaryTitle, linkedTitle, notes) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const current = getStoredLinkedRecords();

    const newLink = {
      id: `LINK-${Date.now().toString().slice(-4)}`,
      title: `${primaryTitle} + ${linkedTitle}`,
      primaryRecord: primaryTitle,
      linkedRecord: linkedTitle,
      dateLinked: 'Just now',
      notes: notes || 'Linked records by patient',
      status: 'Linked',
    };

    const updated = [newLink, ...current];
    localStorage.setItem(LINKED_RECORDS_KEY, JSON.stringify(updated));
    return newLink;
  },

  /**
   * Get single medical record details by ID.
   */
  async getRecordById(id) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const records = getStoredRecords();
    return records.find((r) => r.id === id) || null;
  },

  /**
   * Get patient's record retrieval requests.
   */
  async getRecordRequests() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredRequests();
  },

  /**
   * Submit a new health record retrieval request.
   * TODO: Replace mock API with SNS Workbench endpoint: POST /records/request
   */
  async submitRecordRequest(requestData) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const currentRequests = getStoredRequests();
    
    const newRequest = {
      id: `RET-${Date.now().toString().slice(-4)}`,
      hospitalName: requestData.hospitalName,
      recordType: requestData.recordType,
      dateRange: requestData.dateRange || 'Recent 30 Days',
      reason: requestData.reason || 'Patient retrieval request',
      status: 'Requested',
      requestedAt: 'Just now',
      notes: requestData.notes || 'Patient self-retrieval request',
    };

    const updated = [newRequest, ...currentRequests];
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    return newRequest;
  }
};
