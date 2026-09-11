// Authentication Service for Nalathunai Patient Platform
// Isolated service layer for mock authentication & token management

import { initialPatientProfile } from '../data/mockData';
import { doctorAuthService } from './doctorAuthService';
import { organizationAuthService } from './organizationAuthService';

const AUTH_STORAGE_KEY = 'nalathunai_auth_user';
const TOKEN_KEY = 'nalathunai_auth_token';
const REGISTERED_USERS_KEY = 'nalathunai_registered_users';

// Helper to get registered users array from localStorage
const getRegisteredUsers = () => {
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const authService = {
  /**
   * Mock Aadhaar OTP Send
   * TODO: Replace mock Aadhaar verification with SNS Workbench/backend API
   */
  async sendAadhaarOTP(aadhaarNumber) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!aadhaarNumber || aadhaarNumber.replace(/\D/g, '').length < 12) {
      throw new Error('Please enter a valid 12-digit Aadhaar number.');
    }
    return { success: true, message: 'OTP sent successfully.' };
  },

  /**
   * Mock Aadhaar OTP Verification
   * TODO: Replace mock Aadhaar verification with SNS Workbench/backend API
   */
  async verifyAadhaarOTP(aadhaarNumber, otp) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // Accept 123456 or any 6-digit code for MVP demonstration
    if (!otp || otp.length !== 6) {
      throw new Error('Incorrect OTP. Please try again.');
    }
    if (otp !== '123456' && otp !== '000000' && otp.length === 6) {
      // Allow any 6 digit input for prototype testing flexibility
    }
    return { success: true, message: 'Identity verified successfully.' };
  },

  /**
   * Save Personal Details step
   */
  async savePersonalDetails(details) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const { fullName, dateOfBirth, bloodGroup, email } = details;
    if (!fullName || !dateOfBirth || !bloodGroup || !email) {
      throw new Error('Please fill in all required personal details.');
    }
    return { success: true };
  },

  /**
   * Mock Email OTP Send
   * TODO: Replace mock email verification with SNS Workbench notification/authentication API
   */
  async sendEmailOTP(email) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    return { success: true, message: 'OTP sent successfully.' };
  },

  /**
   * Mock Email OTP Verification
   * TODO: Replace mock email verification with SNS Workbench notification/authentication API
   */
  async verifyEmailOTP(email, otp) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!otp || otp.length !== 6) {
      throw new Error('Incorrect OTP. Please try again.');
    }
    return { success: true, message: 'Email verified successfully.' };
  },

  /**
   * Create Account in localStorage
   * TODO: Replace with secure backend password hashing and SNS Workbench user creation endpoint: POST /auth/register
   * NOTE: Passwords MUST NOT be stored in plain text in production. This is only mock data for the frontend prototype.
   */
  async createAccount(registrationData) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const users = getRegisteredUsers();
    
    // Check if email already registered
    const existing = users.find(u => u.email.toLowerCase() === registrationData.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      name: registrationData.fullName,
      email: registrationData.email,
      phone: registrationData.mobile || '+91 98765 43210',
      dateOfBirth: registrationData.dateOfBirth,
      bloodGroup: registrationData.bloodGroup,
      aadhaarNumber: registrationData.aadhaarNumber,
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      password: registrationData.password, // Plaintext mock storage ONLY for prototype
      emergencyContact: '+91 98765 43211',
      city: 'Chennai, Tamil Nadu',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    return { success: true, user: newUser };
  },

  /**
   * Log in a patient using phone/email and password.
   * Validates against registered users in localStorage as well as demo account.
   * 
   * TODO: Replace mock API with SNS Workbench endpoint: POST /auth/login
   */
  /**
   * Log in a user (Patient or Doctor) using identifier and password.
   * Preserves exact patient login behavior.
   */
  async login(identifier, password, role = 'patient') {
    if (role === 'doctor') {
      return this.loginDoctor(identifier, password);
    }
    if (role === 'organization') {
      return this.loginOrganization(identifier, password);
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!identifier || !password) {
      throw new Error('Invalid email or password.');
    }

    const cleanIdent = identifier.trim().toLowerCase();

    // Check registered users
    const registeredUsers = getRegisteredUsers();
    const foundUser = registeredUsers.find(
      (u) => (u.email.toLowerCase() === cleanIdent || u.phone.replace(/\s+/g, '') === cleanIdent) && u.password === password
    );

    let userObj;
    if (foundUser) {
      userObj = {
        ...foundUser,
        role: 'patient',
        token: `mock-jwt-token-${foundUser.id}`,
        loggedInAt: new Date().toISOString(),
      };
    } else if (
      (cleanIdent === '9876543210' || cleanIdent === 'patient@example.com' || cleanIdent === 'ananya@example.com') &&
      (password === 'password123' || password === 'Password@123')
    ) {
      // Default prototype demo account fallback
      userObj = {
        ...initialPatientProfile,
        role: 'patient',
        token: 'mock-jwt-token-nalathunai-2026',
        loggedInAt: new Date().toISOString(),
      };
    } else {
      throw new Error('Invalid email or password.');
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
    localStorage.setItem(TOKEN_KEY, userObj.token);

    return userObj;
  },

  /**
   * Log in a verified doctor.
   */
  async loginDoctor(identifier, password) {
    const doc = await doctorAuthService.login(identifier, password);
    const userObj = {
      ...doc,
      role: 'doctor',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
    localStorage.setItem(TOKEN_KEY, doc.token);
    return userObj;
  },

  /**
   * Log in an organization / hospital facility node.
   */
  async loginOrganization(identifier, password) {
    const org = await organizationAuthService.login(identifier, password);
    const userObj = {
      ...org,
      role: 'organization',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
    localStorage.setItem(TOKEN_KEY, org.token);
    return userObj;
  },

  /**
   * Log out current user and clear local persistence.
   */
  async logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    await doctorAuthService.logout();
    await organizationAuthService.logout();
    return true;
  },

  /**
   * Get currently authenticated user from localStorage.
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user session exists.
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Update patient profile basic fields.
   * 
   * TODO: Replace mock profile update with SNS Workbench endpoint: PUT /patient/profile
   */
  async updateProfile(updatedFields) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const current = this.getCurrentUser() || initialPatientProfile;
    const updated = { ...current, ...updatedFields };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};

