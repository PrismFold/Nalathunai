// Hospital & Doctor Backend Integration Service for Nalathunai
// Manages registration, authentication, patient search, consent requests, and governance audits

import { supabaseService, SUPABASE_CONFIG } from './supabaseService.js';
import { getRegisteredUsers } from './authService.js';
import { initialPatientProfile } from '../data/mockData.js';

const HOSPITALS_STORAGE_KEY = 'nalathunai_hospitals';
const DOCTORS_STORAGE_KEY = 'nalathunai_doctors';
const DOCTOR_CONSENTS_KEY = 'nalathunai_doctor_consents';
const ACCESS_LOGS_KEY = 'nalathunai_hospital_access_logs';
const PENDING_STORAGE_KEY = 'nalathunai_pending_requests';
const CONSENTS_STORAGE_KEY = 'nalathunai_active_consents';

// Initial Seed Hospitals
const SEED_HOSPITALS = [
  {
    id: 'HOSP-001',
    name: 'Ganga Hospital',
    licenseNo: 'NABH-TN-CBE-041',
    hospitalType: 'Tertiary Care & Orthopedics',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '313 Mettupalayam Road, Coimbatore - 641043',
    email: 'admin@gangahospital.com',
    phone: '+91 422 2485000',
    adminName: 'Dr. S. Rajashekaran',
    password: 'Password@123',
    supabaseTable: 'ganga_hospital',
    bedCount: 450,
    accreditation: 'NABH & NABL Accredited',
    status: 'Active',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'HOSP-002',
    name: 'KMCH Hospital',
    licenseNo: 'NABH-TN-CBE-088',
    hospitalType: 'Multispecialty & Cardiac Sciences',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: 'Avinashi Road, Peelamedu, Coimbatore - 641014',
    email: 'admin@kmch.org',
    phone: '+91 422 4323800',
    adminName: 'Dr. Nalla G Palaniswami',
    password: 'Password@123',
    supabaseTable: 'kmch_hospital',
    bedCount: 600,
    accreditation: 'NABH Certified',
    status: 'Active',
    createdAt: '2026-01-12T11:30:00Z',
  },
  {
    id: 'HOSP-003',
    name: 'Kongunad Hospital',
    licenseNo: 'NABH-TN-CBE-112',
    hospitalType: 'Multispecialty Hospital',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '11th Street, Tatabad, Coimbatore - 641012',
    email: 'admin@kongunadhospital.com',
    phone: '+91 422 2499111',
    adminName: 'Dr. Raju M',
    password: 'Password@123',
    supabaseTable: 'kongunad_hospital',
    bedCount: 250,
    accreditation: 'State Health Board Approved',
    status: 'Active',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'HOSP-004',
    name: 'PSG Hospital',
    licenseNo: 'NABH-TN-CBE-029',
    hospitalType: 'Super Specialty Teaching Hospital',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: 'Peelamedu, Coimbatore - 641004',
    email: 'admin@psghospitals.com',
    phone: '+91 422 2570170',
    adminName: 'Dr. J.S. Bhuvaneswaran',
    password: 'Password@123',
    supabaseTable: 'psg_hospital',
    bedCount: 800,
    accreditation: 'NABH & Green OT Certified',
    status: 'Active',
    createdAt: '2026-02-15T14:20:00Z',
  },
  {
    id: 'HOSP-005',
    name: 'Sri Ramakrishna Hospital',
    licenseNo: 'NABH-TN-CBE-065',
    hospitalType: 'Super Specialty Hospital & Cancer Center',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '395, Sarojini Naidu Rd, Siddhapudur, Coimbatore - 641044',
    email: 'admin@sriramakrishnahospital.com',
    phone: '+91 422 4500000',
    adminName: 'R. Sundar',
    password: 'Password@123',
    supabaseTable: 'sri_ramakrishna_hospital',
    bedCount: 500,
    accreditation: 'NABH Accredited',
    status: 'Active',
    createdAt: '2026-03-01T08:45:00Z',
  },
];

// Initial Seed Doctors
const SEED_DOCTORS = [
  {
    id: 'DOC-101',
    hospitalId: 'HOSP-001',
    hospitalName: 'Ganga Hospital',
    name: 'Dr. Vikram Seth',
    regNumber: 'NMC-TN-2015-8491',
    specialization: 'Cardiology',
    department: 'Department of Cardiology',
    email: 'dr.vikram@gangahospital.com',
    phone: '+91 98421 11220',
    experienceYears: 12,
    qualification: 'MBBS, MD, DM (Cardiology)',
    password: 'Doctor@123',
    status: 'Active',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'DOC-102',
    hospitalId: 'HOSP-001',
    hospitalName: 'Ganga Hospital',
    name: 'Dr. S. Malathi',
    regNumber: 'NMC-TN-2018-4912',
    specialization: 'Internal Medicine',
    department: 'General Medicine & Pathology',
    email: 'dr.malathi@gangahospital.com',
    phone: '+91 98421 33440',
    experienceYears: 8,
    qualification: 'MBBS, MD (Medicine)',
    password: 'Doctor@123',
    status: 'Active',
    createdAt: '2026-02-12T11:00:00Z',
  },
  {
    id: 'DOC-103',
    hospitalId: 'HOSP-002',
    hospitalName: 'KMCH Hospital',
    name: 'Dr. Rajesh V',
    regNumber: 'NMC-TN-2012-1082',
    specialization: 'Interventional Cardiology',
    department: 'Cardiovascular Sciences',
    email: 'dr.rajesh@kmch.org',
    phone: '+91 98765 44321',
    experienceYears: 15,
    qualification: 'MBBS, MS, MCh (Cardio)',
    password: 'Doctor@123',
    status: 'Active',
    createdAt: '2026-02-14T09:30:00Z',
  },
  {
    id: 'DOC-104',
    hospitalId: 'HOSP-002',
    hospitalName: 'KMCH Hospital',
    name: 'Dr. Priya Nair',
    regNumber: 'NMC-TN-2020-7731',
    specialization: 'Endocrinology & Diabetology',
    department: 'Endocrinology Unit',
    email: 'dr.priya@kmch.org',
    phone: '+91 98765 88900',
    experienceYears: 6,
    qualification: 'MBBS, DNB (Endocrinology)',
    password: 'Doctor@123',
    status: 'Active',
    createdAt: '2026-02-18T16:00:00Z',
  },
  {
    id: 'DOC-105',
    hospitalId: 'HOSP-004',
    hospitalName: 'PSG Hospital',
    name: 'Dr. Arun Kumar',
    regNumber: 'NMC-TN-2016-3390',
    specialization: 'Cardiothoracic Surgery',
    department: 'Surgical Sciences',
    email: 'dr.arun@psghospitals.com',
    phone: '+91 98422 66778',
    experienceYears: 10,
    qualification: 'MBBS, MS, MCh',
    password: 'Doctor@123',
    status: 'Active',
    createdAt: '2026-02-20T12:00:00Z',
  },
];

// Initial Doctor-Patient Consents
const SEED_CONSENTS = [
  {
    id: 'DCONS-501',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Vikram Seth',
    doctorSpecialization: 'Cardiology',
    hospitalId: 'HOSP-001',
    hospitalName: 'Ganga Hospital',
    patientId: 'PAT-9082',
    patientName: 'Ananya Ramesh',
    patientAadhaar: '8730-5083-3227',
    patientAbha: '91-4829-1029-4720',
    requestedRecords: ['Lab Reports', 'Prescriptions', 'Consultations'],
    purpose: 'Cardiovascular assessment and lipid panel review',
    duration: '30 Days',
    status: 'Active',
    requestedAt: '2026-09-01T10:00:00Z',
    approvedAt: '2026-09-01T10:30:00Z',
    expiresAt: '2026-10-01T10:30:00Z',
  },
  {
    id: 'DCONS-502',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Rajesh V',
    doctorSpecialization: 'Interventional Cardiology',
    hospitalId: 'HOSP-002',
    hospitalName: 'KMCH Hospital',
    patientId: 'PAT-9082',
    patientName: 'Ananya Ramesh',
    patientAadhaar: '8730-5083-3227',
    patientAbha: '91-4829-1029-4720',
    requestedRecords: ['All Medical Records', 'Scans'],
    purpose: 'Pre-procedure cardiovascular evaluation',
    duration: '30 Days',
    status: 'Pending',
    requestedAt: '2026-09-12T14:20:00Z',
    approvedAt: null,
    expiresAt: '2026-10-12T14:20:00Z',
  },
];

// Initial Access Logs
const SEED_ACCESS_LOGS = [
  {
    id: 'LOG-101',
    hospitalId: 'HOSP-001',
    hospitalName: 'Ganga Hospital',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Vikram Seth',
    patientId: 'PAT-9082',
    patientName: 'Ananya Ramesh',
    action: 'RECORD_VIEWED',
    resourceType: 'Lab Reports (Glucose & Lipid Panel)',
    details: 'Reviewed diagnostic biomarkers for cardiology consultation',
    timestamp: '2026-09-14T11:20:00Z',
  },
  {
    id: 'LOG-102',
    hospitalId: 'HOSP-001',
    hospitalName: 'Ganga Hospital',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Vikram Seth',
    patientId: 'PAT-9082',
    patientName: 'Ananya Ramesh',
    action: 'AI_SUMMARY_GENERATED',
    resourceType: 'Clinical Biomarker Summary',
    details: 'Generated Gemini clinical summary for multi-hospital records',
    timestamp: '2026-09-14T11:25:00Z',
  },
];

// LocalStorage helpers
const getStoredHospitals = () => {
  const raw = localStorage.getItem(HOSPITALS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(SEED_HOSPITALS));
    return SEED_HOSPITALS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_HOSPITALS;
  }
};

const getStoredDoctors = () => {
  const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(SEED_DOCTORS));
    return SEED_DOCTORS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_DOCTORS;
  }
};

export const getStoredDoctorConsents = () => {
  const raw = localStorage.getItem(DOCTOR_CONSENTS_KEY);
  if (!raw) {
    localStorage.setItem(DOCTOR_CONSENTS_KEY, JSON.stringify(SEED_CONSENTS));
    return SEED_CONSENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_CONSENTS;
  }
};

const getStoredAccessLogs = () => {
  const raw = localStorage.getItem(ACCESS_LOGS_KEY);
  if (!raw) {
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(SEED_ACCESS_LOGS));
    return SEED_ACCESS_LOGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_ACCESS_LOGS;
  }
};

export const hospitalDoctorService = {
  // ==========================================
  // HOSPITAL (ORGANIZATION) MANAGEMENT
  // ==========================================

  async getAllHospitals() {
    return getStoredHospitals();
  },

  async getHospitalById(id) {
    const list = getStoredHospitals();
    return list.find((h) => h.id === id) || null;
  },

  async registerHospital(hospitalData) {
    await new Promise((r) => setTimeout(r, 400));
    const hospitals = getStoredHospitals();

    // Check duplicate
    const exists = hospitals.some(
      (h) =>
        h.email.toLowerCase() === hospitalData.email.trim().toLowerCase() ||
        h.licenseNo.toLowerCase() === hospitalData.licenseNo.trim().toLowerCase()
    );
    if (exists) {
      throw new Error('A hospital with this official email or license number already exists.');
    }

    const newHospital = {
      id: `HOSP-${Date.now().toString().slice(-4)}`,
      name: hospitalData.name.trim(),
      licenseNo: hospitalData.licenseNo.trim(),
      hospitalType: hospitalData.hospitalType || 'Multispecialty Hospital',
      city: hospitalData.city || 'Coimbatore',
      state: hospitalData.state || 'Tamil Nadu',
      address: hospitalData.address || `${hospitalData.city}, Tamil Nadu`,
      email: hospitalData.email.trim().toLowerCase(),
      phone: hospitalData.phone.trim(),
      adminName: hospitalData.adminName.trim(),
      password: hospitalData.password,
      supabaseTable: hospitalData.supabaseTable || 'ganga_hospital',
      bedCount: Number(hospitalData.bedCount) || 300,
      accreditation: hospitalData.accreditation || 'NABH Certified',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    hospitals.push(newHospital);
    localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitals));

    // Non-blocking sync to Supabase backend table
    supabaseService.insertHospital({
      id: newHospital.id,
      name: newHospital.name,
      license_no: newHospital.licenseNo,
      hospital_type: newHospital.hospitalType,
      city: newHospital.city,
      state: newHospital.state,
      address: newHospital.address,
      email: newHospital.email,
      phone: newHospital.phone,
      admin_name: newHospital.adminName,
      password_hash: newHospital.password,
      supabase_table: newHospital.supabaseTable,
      bed_count: newHospital.bedCount,
      accreditation: newHospital.accreditation,
    }).catch(() => {});

    return newHospital;
  },

  async loginHospital(identifier, password) {
    await new Promise((r) => setTimeout(r, 350));
    if (!identifier || !password) {
      throw new Error('Please enter official email / license number and password.');
    }

    const clean = identifier.trim().toLowerCase();
    const hospitals = getStoredHospitals();
    const match = hospitals.find(
      (h) =>
        (h.email.toLowerCase() === clean || h.licenseNo.toLowerCase() === clean) &&
        h.password === password
    );

    if (!match) {
      throw new Error('Invalid organization credentials. Please check your license number/email.');
    }

    return {
      ...match,
      role: 'hospital',
      loggedInAt: new Date().toISOString(),
    };
  },

  // ==========================================
  // DOCTOR MANAGEMENT
  // ==========================================

  async getAllDoctors(hospitalId = null) {
    const list = getStoredDoctors();
    if (hospitalId) {
      return list.filter((d) => d.hospitalId === hospitalId);
    }
    return list;
  },

  async getDoctorById(id) {
    const list = getStoredDoctors();
    return list.find((d) => d.id === id) || null;
  },

  async registerDoctor(doctorData) {
    await new Promise((r) => setTimeout(r, 400));
    const doctors = getStoredDoctors();

    // Check duplicate
    const exists = doctors.some(
      (d) =>
        d.email.toLowerCase() === doctorData.email.trim().toLowerCase() ||
        d.regNumber.toLowerCase() === doctorData.regNumber.trim().toLowerCase()
    );
    if (exists) {
      throw new Error('A doctor with this email or Medical Council Registration Number already exists.');
    }

    // Resolve hospital name
    let hospitalName = doctorData.hospitalName || 'Ganga Hospital';
    if (doctorData.hospitalId) {
      const h = await this.getHospitalById(doctorData.hospitalId);
      if (h) hospitalName = h.name;
    }

    const newDoctor = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      hospitalId: doctorData.hospitalId || 'HOSP-001',
      hospitalName,
      name: doctorData.name.startsWith('Dr.') ? doctorData.name.trim() : `Dr. ${doctorData.name.trim()}`,
      regNumber: doctorData.regNumber.trim().toUpperCase(),
      specialization: doctorData.specialization || 'Internal Medicine',
      department: doctorData.department || `${doctorData.specialization || 'Clinical'} Department`,
      email: doctorData.email.trim().toLowerCase(),
      phone: doctorData.phone.trim(),
      experienceYears: Number(doctorData.experienceYears) || 5,
      qualification: doctorData.qualification || 'MBBS, MD',
      password: doctorData.password,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    doctors.push(newDoctor);
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));

    // Non-blocking sync to Supabase backend table
    supabaseService.insertDoctor({
      id: newDoctor.id,
      hospital_id: newDoctor.hospitalId,
      hospital_name: newDoctor.hospitalName,
      name: newDoctor.name,
      reg_number: newDoctor.regNumber,
      specialization: newDoctor.specialization,
      department: newDoctor.department,
      email: newDoctor.email,
      phone: newDoctor.phone,
      experience_years: newDoctor.experienceYears,
      qualification: newDoctor.qualification,
      password_hash: newDoctor.password,
      status: newDoctor.status,
    }).catch(() => {});

    return newDoctor;
  },

  async loginDoctor(identifier, password) {
    await new Promise((r) => setTimeout(r, 350));
    if (!identifier || !password) {
      throw new Error('Please enter Medical Council Reg No. / Email and password.');
    }

    const clean = identifier.trim().toLowerCase();
    const doctors = getStoredDoctors();
    const match = doctors.find(
      (d) =>
        (d.email.toLowerCase() === clean || d.regNumber.toLowerCase() === clean) &&
        d.password === password
    );

    if (!match) {
      throw new Error('Invalid doctor credentials. Please verify your registration number and password.');
    }

    return {
      ...match,
      role: 'doctor',
      loggedInAt: new Date().toISOString(),
    };
  },

  // ==========================================
  // DOCTOR PATIENT SEARCH & CONSENT REQUEST
  // ==========================================

  /**
   * Search patients by Name, Aadhaar, ABHA ID, or Patient ID
   */
  async searchPatients(query = '', doctorId = null) {
    await new Promise((r) => setTimeout(r, 200));
    const term = (query || '').trim().toLowerCase().replace(/[- ]/g, '');

    // Collect registered patients from local database
    const registered = getRegisteredUsers();
    
    // Baseline patient pool
    const pool = [
      initialPatientProfile,
      {
        id: 'USR-162674',
        name: 'Jeremiah',
        aadhaarNumber: '8730-5083-3227',
        abhaId: '91-4829-1029-4720',
        phone: '8015143178',
        email: 'jeremiahgriffinpaul111@gmail.com',
        dob: '12 Aug 1996',
        bloodGroup: 'B+',
        city: 'Coimbatore',
        primaryHospital: 'Ganga Hospital',
      },
      {
        id: 'PAT-4029',
        name: 'Vasantha Kumaraswamy',
        aadhaarNumber: '9901-4421-8812',
        abhaId: '91-1029-4482-9901',
        phone: '98421 99001',
        email: 'vasantha.k@example.com',
        dob: '05 Mar 1968',
        bloodGroup: 'A+',
        city: 'Coimbatore',
        primaryHospital: 'KMCH Hospital',
      },
      ...registered,
    ];

    // Deduplicate by Aadhaar or ID
    const uniqueMap = new Map();
    pool.forEach((p) => {
      const key = p.aadhaarNumber || p.aadhaar || p.id;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: p.id,
          name: p.name || p.fullName,
          aadhaar: p.aadhaarNumber || p.aadhaar || '8730-5083-3227',
          abhaId: p.abhaId || '91-4829-1029-4720',
          phone: p.phone || p.mobile || '+91 98765 43210',
          email: p.email || 'patient@example.com',
          dob: p.dob || p.dateOfBirth || '14 May 1994',
          gender: p.gender || 'Female',
          bloodGroup: p.bloodGroup || 'O+',
          city: p.city || 'Coimbatore',
          primaryHospital: p.primaryHospital || 'Lotus Valley Multispeciality Hospital',
        });
      }
    });

    let results = Array.from(uniqueMap.values());

    if (term) {
      results = results.filter((p) => {
        const cleanAadhaar = (p.aadhaar || '').replace(/[- ]/g, '').toLowerCase();
        const cleanAbha = (p.abhaId || '').replace(/[- ]/g, '').toLowerCase();
        const cleanName = (p.name || '').toLowerCase();
        const cleanId = (p.id || '').toLowerCase();
        return (
          cleanAadhaar.includes(term) ||
          cleanAbha.includes(term) ||
          cleanName.includes(term) ||
          cleanId.includes(term)
        );
      });
    }

    // Attach consent status for the given doctor
    const doctorConsents = getStoredDoctorConsents();
    return results.map((patient) => {
      const activeConsent = doctorConsents.find(
        (c) =>
          (!doctorId || c.doctorId === doctorId) &&
          (c.patientAadhaar === patient.aadhaar || c.patientId === patient.id) &&
          c.status === 'Active'
      );
      const pendingConsent = doctorConsents.find(
        (c) =>
          (!doctorId || c.doctorId === doctorId) &&
          (c.patientAadhaar === patient.aadhaar || c.patientId === patient.id) &&
          c.status === 'Pending'
      );

      return {
        ...patient,
        consentStatus: activeConsent ? 'Active' : pendingConsent ? 'Pending' : 'None',
        activeConsentDetails: activeConsent || null,
        pendingConsentDetails: pendingConsent || null,
      };
    });
  },

  /**
   * Doctor creates a granular consent request for a patient
   */
  async requestConsent({
    doctorId,
    doctorName,
    doctorSpecialization,
    hospitalId,
    hospitalName,
    patientId,
    patientName,
    patientAadhaar,
    patientAbha,
    requestedRecords = ['All Medical Records'],
    purpose,
    duration = '30 Days',
    notes = '',
  }) {
    await new Promise((r) => setTimeout(r, 400));
    if (!purpose || !purpose.trim()) {
      throw new Error('Please specify the clinical purpose for requesting patient records.');
    }

    const consentId = `DCONS-${Date.now().toString().slice(-5)}`;
    const newConsent = {
      id: consentId,
      doctorId,
      doctorName: doctorName || 'Dr. Specialist',
      doctorSpecialization: doctorSpecialization || 'Clinical Specialist',
      hospitalId,
      hospitalName: hospitalName || 'Hospital Center',
      patientId,
      patientName,
      patientAadhaar,
      patientAbha,
      requestedRecords: Array.isArray(requestedRecords) && requestedRecords.length > 0 ? requestedRecords : ['All Medical Records'],
      purpose: purpose.trim(),
      duration: duration || '30 Days',
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      expiresAt: null,
      notes: notes || '',
    };

    // 1. Store in doctor consents list
    const doctorConsents = getStoredDoctorConsents();
    const updatedConsents = [newConsent, ...doctorConsents.filter((c) => c.id !== consentId)];
    localStorage.setItem(DOCTOR_CONSENTS_KEY, JSON.stringify(updatedConsents));

    // 2. Synchronize to Patient's pending requests queue (`nalathunai_pending_requests`)
    try {
      const rawPending = localStorage.getItem(PENDING_STORAGE_KEY);
      const pendingList = rawPending ? JSON.parse(rawPending) : [];
      const patientPendingItem = {
        id: `REQ-${consentId.slice(-4)}`,
        consentRefId: consentId,
        requesterName: `${newConsent.doctorName} (${newConsent.doctorSpecialization})`,
        hospitalName: newConsent.hospitalName,
        accessLevel: newConsent.requestedRecords.join(', '),
        requestedRecords: newConsent.requestedRecords,
        duration: newConsent.duration,
        purpose: newConsent.purpose,
        requestDate: 'Today',
        expiryWindow: `Expires in ${newConsent.duration}`,
        patientAadhaar,
        patientName,
      };
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify([patientPendingItem, ...pendingList]));
    } catch (e) {
      console.warn('Could not sync to patient pending requests:', e);
    }

    // 3. Log audit event
    this.logAuditEvent({
      hospitalId,
      hospitalName,
      doctorId,
      doctorName: newConsent.doctorName,
      patientId,
      patientName,
      action: 'CONSENT_REQUESTED',
      resourceType: newConsent.requestedRecords.join(', '),
      details: `Requested access for ${newConsent.duration}. Purpose: ${newConsent.purpose}`,
    });

    // 4. Non-blocking sync to Supabase backend table
    supabaseService.insertConsent({
      id: newConsent.id,
      doctor_id: newConsent.doctorId,
      doctor_name: newConsent.doctorName,
      doctor_specialization: newConsent.doctorSpecialization,
      hospital_id: newConsent.hospitalId,
      hospital_name: newConsent.hospitalName,
      patient_id: newConsent.patientId,
      patient_name: newConsent.patientName,
      patient_aadhaar: newConsent.patientAadhaar,
      patient_abha: newConsent.patientAbha,
      requested_records: newConsent.requestedRecords,
      purpose: newConsent.purpose,
      duration: newConsent.duration,
      status: 'Pending',
      requested_at: newConsent.requestedAt,
    }).catch(() => {});

    return newConsent;
  },

  /**
   * Get all consents initiated by a doctor
   */
  async getDoctorConsentRequests(doctorId) {
    const list = getStoredDoctorConsents();
    if (!doctorId) return list;
    return list.filter((c) => c.doctorId === doctorId);
  },

  // ==========================================
  // HOSPITAL GOVERNANCE & ACCESS AUDIT
  // ==========================================

  /**
   * Get all doctor-patient access permissions for an organization
   */
  async getHospitalDoctorAccessGovernance(hospitalId) {
    const consents = getStoredDoctorConsents();
    const doctors = getStoredDoctors();

    if (!hospitalId) return consents;

    // Filter consents for doctors affiliated with this hospital
    const hospitalDoctorIds = new Set(doctors.filter((d) => d.hospitalId === hospitalId).map((d) => d.id));
    return consents.filter(
      (c) => c.hospitalId === hospitalId || hospitalDoctorIds.has(c.doctorId)
    );
  },

  /**
   * Get audit access logs for a hospital
   */
  async getHospitalAccessLogs(hospitalId = null) {
    const logs = getStoredAccessLogs();
    if (!hospitalId) return logs;
    return logs.filter((l) => l.hospitalId === hospitalId);
  },

  /**
   * Log an audit event
   */
  logAuditEvent({
    hospitalId,
    hospitalName,
    doctorId,
    doctorName,
    patientId,
    patientName,
    action,
    resourceType,
    details,
  }) {
    const logs = getStoredAccessLogs();
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      hospitalId: hospitalId || 'HOSP-001',
      hospitalName: hospitalName || 'Ganga Hospital',
      doctorId: doctorId || null,
      doctorName: doctorName || 'Medical Staff',
      patientId: patientId || 'PAT-0000',
      patientName: patientName || 'Patient',
      action: action || 'RECORD_VIEWED',
      resourceType: resourceType || 'Medical Records',
      details: details || '',
      timestamp: new Date().toISOString(),
    };

    const updated = [newLog, ...logs];
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(updated.slice(0, 100)));

    // Non-blocking sync to Supabase
    supabaseService.logAccess({
      id: newLog.id,
      hospital_id: newLog.hospitalId,
      hospital_name: newLog.hospitalName,
      doctor_id: newLog.doctorId,
      doctor_name: newLog.doctorName,
      patient_id: newLog.patientId,
      patient_name: newLog.patientName,
      action: newLog.action,
      resource_type: newLog.resourceType,
      details: newLog.details,
      timestamp: newLog.timestamp,
    }).catch(() => {});

    return newLog;
  },

  /**
   * Sync patient-approved consent back to doctor & organization records
   * Called when patient approves a consent in ConsentPage.jsx
   */
  syncPatientApproval(patientRequesterName, patientHospitalName, patientConsent) {
    const list = getStoredDoctorConsents();
    let updated = false;

    const modified = list.map((c) => {
      // Check matching hospital and requester
      const matches =
        (patientRequesterName && c.doctorName && patientRequesterName.includes(c.doctorName)) ||
        (patientHospitalName && c.hospitalName === patientHospitalName);

      if (matches && c.status === 'Pending') {
        updated = true;
        const now = new Date();
        const exp = new Date(now);
        exp.setDate(now.getDate() + 30);
        return {
          ...c,
          status: 'Active',
          approvedAt: now.toISOString(),
          expiresAt: exp.toISOString(),
        };
      }
      return c;
    });

    if (updated) {
      localStorage.setItem(DOCTOR_CONSENTS_KEY, JSON.stringify(modified));
    }
  },
};
