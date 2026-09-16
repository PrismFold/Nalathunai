// Doctor Authentication Service for Nalathunai Platform MVP
// Manages mock Doctor registration, login, and session persistence

import { initialDoctorProfile } from '../data/mockDoctorData';

const DOCTOR_AUTH_STORAGE_KEY = 'nalathunai_doctor_auth_user';
const DOCTOR_TOKEN_KEY = 'nalathunai_doctor_auth_token';
const REGISTERED_DOCTORS_KEY = 'nalathunai_registered_doctors';

const getRegisteredDoctors = () => {
  try {
    const data = localStorage.getItem(REGISTERED_DOCTORS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const doctorAuthService = {
  /**
   * Mock Aadhaar OTP Send
   * Disclaimer: Purely mock for prototype demonstration.
   */
  async sendAadhaarOTP(aadhaarNumber) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!aadhaarNumber || aadhaarNumber.replace(/\D/g, '').length < 12) {
      throw new Error('Please enter a valid 12-digit Aadhaar number.');
    }
    return { success: true, message: 'OTP sent to mobile linked with Aadhaar.' };
  },

  /**
   * Mock Aadhaar OTP Verify
   */
  async verifyAadhaarOTP(aadhaarNumber, otp) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!otp || otp.length !== 6) {
      throw new Error('Incorrect OTP. Please enter the 6-digit code.');
    }
    return { success: true, message: 'Identity verified successfully.' };
  },

  /**
   * Mock Contact OTP Send (Email or Mobile)
   */
  async sendContactOTP(contact) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const clean = contact ? contact.trim() : '';
    const isEmail = clean.includes('@');
    const isPhone = clean.replace(/\D/g, '').length >= 10;
    if (!isEmail && !isPhone) {
      throw new Error('Please enter a valid email address or 10-digit mobile number.');
    }
    return { success: true, message: `OTP sent successfully to ${clean}.` };
  },

  /**
   * Mock Contact OTP Verify
   */
  async verifyContactOTP(contact, otp) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!otp || otp.length !== 6) {
      throw new Error('Incorrect OTP. Please enter the 6-digit verification code.');
    }
    return { success: true, message: 'Contact verified successfully.' };
  },

  /**
   * Create Doctor Account
   */
  async createDoctorAccount(registrationData) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const doctors = getRegisteredDoctors();

    // Check existing
    const existing = doctors.find(
      (d) =>
        d.registrationNumber?.toUpperCase() === registrationData.registrationNumber?.toUpperCase() ||
        d.email?.toLowerCase() === registrationData.contact?.toLowerCase()
    );

    if (existing) {
      throw new Error('A doctor account with this registration number or contact already exists.');
    }

    const newDoctor = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: registrationData.doctorName,
      registrationNumber: registrationData.registrationNumber,
      council: registrationData.council || 'State Medical Council',
      qualification: registrationData.qualification || 'MBBS',
      specialty: registrationData.specialty || 'General Practitioner',
      hospital: registrationData.hospital || 'Nalathunai Network Clinic',
      email: registrationData.contact.includes('@') ? registrationData.contact : `${registrationData.doctorName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      mobile: registrationData.contact.includes('@') ? '+91 98765 11223' : registrationData.contact,
      aadhaarLastFour: registrationData.aadhaarNumber ? registrationData.aadhaarNumber.slice(-4) : '0000',
      password: registrationData.password, // Prototype mock storage
      status: 'Verified',
      accountStatus: 'Active',
      role: 'doctor',
      createdAt: new Date().toISOString(),
    };

    doctors.push(newDoctor);
    localStorage.setItem(REGISTERED_DOCTORS_KEY, JSON.stringify(doctors));

    return { success: true, doctor: newDoctor };
  },

  /**
   * Doctor Login
   * Validates against registered doctors or default demo doctor (Dr. Ananya Kumar)
   */
  async login(identifier, password) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!identifier || !password) {
      throw new Error('Please provide identifier and password.');
    }

    const cleanIdent = identifier.trim().toLowerCase();
    const registered = getRegisteredDoctors();

    const found = registered.find(
      (d) =>
        (d.email?.toLowerCase() === cleanIdent ||
         d.mobile?.replace(/\s+/g, '') === cleanIdent ||
         d.registrationNumber?.toLowerCase() === cleanIdent) &&
        d.password === password
    );

    let docUser;
    if (found) {
      docUser = {
        ...found,
        role: 'doctor',
        token: `mock-doc-jwt-${found.id}`,
        loggedInAt: new Date().toISOString(),
      };
    } else if (
      // Demo doctor login fallback
      (cleanIdent === 'dr.ananya@example.com' ||
       cleanIdent === 'doctor@example.com' ||
       cleanIdent === 'tn-med-00123' ||
       cleanIdent === '9876511223') &&
      (password === 'password123' || password === 'Password@123')
    ) {
      docUser = {
        ...initialDoctorProfile,
        role: 'doctor',
        token: 'mock-doc-jwt-ananya-2026',
        loggedInAt: new Date().toISOString(),
      };
    } else {
      throw new Error('Invalid doctor credentials. Please check your Medical Registration Number / Email and password.');
    }

    localStorage.setItem(DOCTOR_AUTH_STORAGE_KEY, JSON.stringify(docUser));
    localStorage.setItem(DOCTOR_TOKEN_KEY, docUser.token);

    return docUser;
  },

  /**
   * Doctor Logout
   */
  async logout() {
    localStorage.removeItem(DOCTOR_AUTH_STORAGE_KEY);
    localStorage.removeItem(DOCTOR_TOKEN_KEY);
    return true;
  },

  /**
   * Get current doctor user
   */
  getCurrentDoctor() {
    try {
      const stored = localStorage.getItem(DOCTOR_AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isDoctorAuthenticated() {
    return !!localStorage.getItem(DOCTOR_TOKEN_KEY);
  }
};
