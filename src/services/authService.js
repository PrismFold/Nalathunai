// Authentication Service for Nalathunai Patient Platform
// Manages real user registration, dynamic SMS OTP verification, and JWT session handling

import {
  verifyDummyAadhaar,
  generateOtpCode,
  dispatchSmsOtp,
  verifyActiveOtp,
  DUMMY_AADHAAR_REGISTRY
} from '../data/aadhaarDatabase.js';
import { hospitalDoctorService } from './hospitalDoctorService.js';

const AUTH_STORAGE_KEY = 'nalathunai_auth_user';
const TOKEN_KEY = 'nalathunai_auth_token';
const REGISTERED_USERS_KEY = 'nalathunai_registered_users';

// Active dynamic email OTP storage
const ACTIVE_EMAIL_OTPS = new Map();
// Active dynamic login OTP storage
const ACTIVE_LOGIN_OTPS = new Map();

// Helper to construct a structurally compliant base64url JWT token
const createJwtToken = (user, role = 'patient') => {
  const toBase64Url = (str) => {
    try {
      return btoa(unescape(encodeURIComponent(str)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    } catch {
      return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }
  };

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({
      sub: user.id || 'PAT-9082',
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: role || user.role || 'patient',
      abhaId: user.abhaId || '91-4829-1029-4720',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 // 7 days
    })
  );
  const signature = toBase64Url(`sig_${user.id}_${user.role || role}_${Date.now()}`);
  return `${header}.${payload}.${signature}`;
};

// Helper to get registered users array from localStorage
export const getRegisteredUsers = () => {
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const authService = {
  /**
   * Dummy Aadhaar verification & Real Phone SMS OTP Dispatch
   */
  async sendAadhaarOTP(aadhaarNumber, phoneNumber) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!aadhaarNumber || aadhaarNumber.replace(/\D/g, '').length !== 12) {
      throw new Error('Please enter a valid 12-digit Aadhaar number.');
    }

    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      throw new Error('Please enter a valid 10-digit mobile phone number.');
    }

    // Verify against dummy Aadhaar registry
    const dummyRecord = verifyDummyAadhaar(aadhaarNumber);
    if (!dummyRecord) {
      const availableList = DUMMY_AADHAAR_REGISTRY.map(r => r.formatted).join(', ');
      throw new Error(
        `Aadhaar number not found in dummy government registry. Please use one of the verified dummy Aadhaars: ${availableList}`
      );
    }

    // Generate dynamic 6-digit OTP
    const otp = generateOtpCode();

    // Dispatch SMS to the real phone number entered by user
    const dispatchResult = await dispatchSmsOtp(phoneNumber, otp, dummyRecord);

    return {
      success: true,
      otp, // provided so in-app prompt/banner can show OTP in case SMS network blocks commercial delivery
      phone: phoneNumber,
      profile: dummyRecord,
      message: `Verification code sent via SMS to ${phoneNumber}.`
    };
  },

  /**
   * Verify dynamic Aadhaar SMS OTP
   * Validates strictly against generated OTP; demo bypasses removed
   */
  async verifyAadhaarOTP(phoneNumber, submittedOtp) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!submittedOtp || submittedOtp.trim().length !== 6) {
      throw new Error('Please enter the 6-digit OTP sent to your phone.');
    }

    const verification = verifyActiveOtp(phoneNumber, submittedOtp);
    return {
      success: true,
      profile: verification.profile,
      message: 'Aadhaar identity verified successfully.'
    };
  },

  /**
   * Save Personal Details step
   */
  async savePersonalDetails(details) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const { fullName, dateOfBirth, bloodGroup, email } = details;
    if (!fullName || !dateOfBirth || !bloodGroup || !email) {
      throw new Error('Please fill in all required personal details.');
    }
    return { success: true };
  },

  /**
   * Send Dynamic Email OTP
   */
  async sendEmailOTP(email) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    const emailOtp = generateOtpCode();
    ACTIVE_EMAIL_OTPS.set(email.toLowerCase(), {
      otp: emailOtp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    console.log(`[Email OTP Dispatch] To: ${email} | Code: ${emailOtp}`);

    return {
      success: true,
      otp: emailOtp,
      message: `OTP sent to ${email}.`
    };
  },

  /**
   * Verify Email OTP
   */
  async verifyEmailOTP(email, submittedOtp) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!submittedOtp || submittedOtp.trim().length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }

    const session = ACTIVE_EMAIL_OTPS.get((email || '').toLowerCase());
    if (!session) {
      // If email session missing, generate and allow check
      throw new Error('Verification session not found. Please request a new OTP.');
    }

    if (Date.now() > session.expiresAt) {
      ACTIVE_EMAIL_OTPS.delete(email.toLowerCase());
      throw new Error('Email OTP has expired. Please request a new one.');
    }

    if (session.otp !== submittedOtp.trim()) {
      throw new Error('Incorrect email verification code.');
    }

    ACTIVE_EMAIL_OTPS.delete(email.toLowerCase());
    return { success: true, message: 'Email verified successfully.' };
  },

  /**
   * Create Account in localStorage registry
   */
  async createAccount(registrationData) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const users = getRegisteredUsers();
    
    // Check if email or phone already registered
    const existing = users.find(
      u => u.email.toLowerCase() === registrationData.email.toLowerCase() ||
           (registrationData.mobile && u.phone.replace(/\D/g, '') === registrationData.mobile.replace(/\D/g, ''))
    );
    if (existing) {
      throw new Error('An account with this email or mobile number already exists.');
    }

    const newUser = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: registrationData.fullName,
      email: registrationData.email.trim().toLowerCase(),
      phone: registrationData.mobile || registrationData.phone || '',
      dateOfBirth: registrationData.dateOfBirth,
      bloodGroup: registrationData.bloodGroup,
      aadhaarNumber: registrationData.aadhaarNumber,
      abhaId: registrationData.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      password: registrationData.password,
      emergencyContact: registrationData.emergencyContact || 'Emergency Contact — Available upon consent',
      city: registrationData.city || 'Tamil Nadu, India',
      primaryHospital: registrationData.primaryHospital || 'Lotus Valley Multispeciality Hospital',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    return { success: true, user: newUser };
  },

  /**
   * Log in a user (patient, doctor, or hospital)
   */
  async login(identifier, password, role = 'patient') {
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!identifier || !password) {
      throw new Error('Please enter your identifier and password.');
    }

    if (role === 'doctor') {
      const doctor = await hospitalDoctorService.loginDoctor(identifier, password);
      const token = createJwtToken(doctor, 'doctor');
      const userObj = {
        ...doctor,
        role: 'doctor',
        token,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      localStorage.setItem(TOKEN_KEY, token);
      return userObj;
    }

    if (role === 'hospital' || role === 'organization') {
      const hospital = await hospitalDoctorService.loginHospital(identifier, password);
      const token = createJwtToken(hospital, 'hospital');
      const userObj = {
        ...hospital,
        role: 'hospital',
        token,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      localStorage.setItem(TOKEN_KEY, token);
      return userObj;
    }

    // Patient login
    const cleanIdent = identifier.trim().toLowerCase();
    const cleanDigits = cleanIdent.replace(/\D/g, '');

    const registeredUsers = getRegisteredUsers();
    let foundUser = registeredUsers.find((u) => {
      const matchesEmail = u.email?.toLowerCase() === cleanIdent;
      const matchesPhone = cleanDigits.length >= 10 && u.phone?.replace(/\D/g, '').includes(cleanDigits);
      return (matchesEmail || matchesPhone) && u.password === password;
    });

    // Default baseline user fallback for testing/demo
    if (!foundUser) {
      const defaultPatients = [
        {
          id: 'PAT-9082',
          name: 'Ananya Ramesh',
          email: 'ananya.ramesh@example.com',
          phone: '+91 98765 43210',
          password: 'Password@123',
          aadhaarNumber: '8730-5083-3227',
          abhaId: '91-4829-1029-4720',
          role: 'patient',
          city: 'Coimbatore, Tamil Nadu',
          primaryHospital: 'Ganga Hospital',
        },
        {
          id: 'USR-162674',
          name: 'Jeremiah',
          email: 'jeremiahgriffinpaul111@gmail.com',
          phone: '8015143178',
          password: 'Password@123',
          aadhaarNumber: '8730-5083-3227',
          abhaId: '91-4829-1029-4720',
          role: 'patient',
          city: 'Coimbatore, Tamil Nadu',
          primaryHospital: 'Ganga Hospital',
        },
      ];
      foundUser = defaultPatients.find((p) => {
        const matchesEmail = p.email.toLowerCase() === cleanIdent;
        const matchesPhone = cleanDigits.length >= 10 && p.phone.replace(/\D/g, '').includes(cleanDigits);
        return (matchesEmail || matchesPhone) && (p.password === password || password === 'Password@123');
      });
    }

    if (!foundUser) {
      throw new Error('Invalid credentials. Please enter a valid registered mobile/email and password.');
    }

    const token = createJwtToken(foundUser, 'patient');
    const userObj = {
      ...foundUser,
      role: 'patient',
      token,
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
    localStorage.setItem(TOKEN_KEY, token);

    return userObj;
  },

  /**
   * Log out current user and clear local session
   */
  async logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return true;
  },

  /**
   * Get currently authenticated user from localStorage
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
   * Check if user session exists
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Request dynamic OTP authorization for Gmail account or Phone number
   */
  async requestLoginOtp(identifier, preferredChannel = 'auto', role = 'patient') {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const rawIdent = (identifier || '').trim();
    if (!rawIdent) {
      throw new Error('Please enter your registered Gmail/Email or 10-digit mobile phone number.');
    }

    const isEmail = rawIdent.includes('@');
    const digitsOnly = rawIdent.replace(/\D/g, '');
    const isPhone = !isEmail && digitsOnly.length >= 10;

    if (!isEmail && !isPhone) {
      throw new Error('Please enter a valid Gmail address (e.g. name@gmail.com) or 10-digit phone number.');
    }

    const cleanIdent = rawIdent.toLowerCase();
    const cleanKey = isEmail ? cleanIdent : digitsOnly.slice(-10);

    // Determine delivery channel
    let channel = isEmail ? 'email' : 'sms';
    if (preferredChannel === 'email' && isEmail) channel = 'email';
    if (preferredChannel === 'sms' && isPhone) channel = 'sms';

    // Locate or authorize user across roles
    let matchedUser = null;
    let effectiveRole = role;

    if (role === 'doctor') {
      const doctors = await hospitalDoctorService.getAllDoctors();
      matchedUser = doctors.find((d) => 
        (d.email && d.email.toLowerCase() === cleanIdent) ||
        (d.phone && d.phone.replace(/\D/g, '').includes(cleanKey))
      );
      if (!matchedUser) {
        // Authorize with medical credentials format
        matchedUser = {
          id: `DOC-${Date.now().toString().slice(-4)}`,
          name: isEmail ? `Dr. ${rawIdent.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : `Dr. Specialist`,
          email: isEmail ? cleanIdent : `dr.${cleanKey}@hospital.org`,
          phone: isPhone ? rawIdent : '+91 98765 43210',
          role: 'doctor',
          department: 'General Medicine',
          mciNumber: `NMC-TN-${Math.floor(2010 + Math.random() * 14)}-${Math.floor(1000 + Math.random() * 9000)}`,
          hospitalId: 'HOSP-01',
          hospitalName: 'Ganga Hospital',
          rating: 4.8,
        };
      }
    } else if (role === 'hospital' || role === 'organization') {
      const hospitals = await hospitalDoctorService.getAllHospitals();
      matchedUser = hospitals.find((h) =>
        (h.email && h.email.toLowerCase() === cleanIdent) ||
        (h.phone && h.phone.replace(/\D/g, '').includes(cleanKey))
      );
      if (!matchedUser) {
        matchedUser = {
          id: `HOSP-${Date.now().toString().slice(-4)}`,
          name: isEmail ? rawIdent.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Medical Center' : 'Regional Care Hospital',
          email: isEmail ? cleanIdent : `admin.${cleanKey}@hospital.org`,
          phone: isPhone ? rawIdent : '+91 422 248 5000',
          role: 'hospital',
          licenseNumber: `NABH-TN-${Math.floor(100 + Math.random() * 900)}`,
          city: 'Coimbatore, Tamil Nadu',
          totalBeds: 250,
        };
      }
    } else {
      // Patient lookup
      effectiveRole = 'patient';
      const registeredUsers = getRegisteredUsers();
      matchedUser = registeredUsers.find((u) => 
        (u.email && u.email.toLowerCase() === cleanIdent) ||
        (u.phone && u.phone.replace(/\D/g, '').includes(cleanKey))
      );

      if (!matchedUser) {
        // Check default patient profiles
        const defaultPatients = [
          {
            id: 'PAT-9082',
            name: 'Ananya Ramesh',
            email: 'ananya.ramesh@example.com',
            phone: '+91 98765 43210',
            aadhaarNumber: '8730-5083-3227',
            abhaId: '91-4829-1029-4720',
            role: 'patient',
            city: 'Coimbatore, Tamil Nadu',
            primaryHospital: 'Ganga Hospital',
          },
          {
            id: 'USR-162674',
            name: 'Jeremiah',
            email: 'jeremiahgriffinpaul111@gmail.com',
            phone: '8015143178',
            aadhaarNumber: '8730-5083-3227',
            abhaId: '91-4829-1029-4720',
            role: 'patient',
            city: 'Coimbatore, Tamil Nadu',
            primaryHospital: 'Ganga Hospital',
          },
        ];

        matchedUser = defaultPatients.find((p) => 
          (p.email.toLowerCase() === cleanIdent) ||
          (p.phone.replace(/\D/g, '').includes(cleanKey))
        );
      }

      // If not previously recorded, auto-authorize and create an ABHA-linked patient profile for this Gmail/Phone
      if (!matchedUser) {
        const derivedName = isEmail 
          ? rawIdent.split('@')[0].replace(/[._\d]/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase()) || 'Authorized Patient'
          : `Patient ${cleanKey.slice(-4)}`;

        matchedUser = {
          id: `USR-${Date.now().toString().slice(-6)}`,
          name: derivedName,
          email: isEmail ? cleanIdent : `${cleanKey}@patient.nalathunai.in`,
          phone: isPhone ? rawIdent : '+91 98765 43210',
          role: 'patient',
          aadhaarNumber: '8730-5083-3227',
          abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          city: 'Tamil Nadu, India',
          primaryHospital: 'Ganga Hospital',
          createdAt: new Date().toISOString()
        };

        // Cache in registered users
        try {
          const allUsers = getRegisteredUsers();
          allUsers.push(matchedUser);
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(allUsers));
        } catch (err) {
          console.warn('Could not cache user in localStorage', err);
        }
      }
    }

    // Generate fresh dynamic 6-digit OTP
    const dynamicOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const targetDisplay = isEmail ? cleanIdent : (matchedUser.phone || rawIdent);

    // Persist OTP session
    ACTIVE_LOGIN_OTPS.set(cleanKey, {
      otp: dynamicOtp,
      channel,
      target: targetDisplay,
      user: matchedUser,
      role: effectiveRole,
      expiresAt,
      createdAt: Date.now()
    });

    // Also store by full raw identity if different
    if (cleanKey !== cleanIdent) {
      ACTIVE_LOGIN_OTPS.set(cleanIdent, ACTIVE_LOGIN_OTPS.get(cleanKey));
    }

    // Dispatch SMS or webhook notification
    if (channel === 'sms') {
      try {
        await dispatchSmsOtp(targetDisplay, dynamicOtp);
      } catch (err) {
        console.warn('SMS dispatch handled in demo fallback mode:', err);
      }
    }

    // Send async event to SNS workflow webhook endpoint
    try {
      fetch('https://api.agents.snsihub.ai/webhook-test/records/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'AUTHORIZE_LOGIN_OTP',
          channel,
          target: targetDisplay,
          otp: dynamicOtp,
          role: effectiveRole,
          userName: matchedUser.name,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch {
      // Non-blocking network call
    }

    return {
      success: true,
      channel,
      target: targetDisplay,
      otp: dynamicOtp, // Provided for easy demo testing & immediate entry
      role: effectiveRole,
      userName: matchedUser.name,
      expiresInSeconds: 300,
      message: `Dynamic 6-digit OTP dispatched to ${channel === 'email' ? 'Gmail' : 'mobile phone'} (${targetDisplay}).`
    };
  },

  /**
   * Verify dynamic login OTP and authenticate user session
   */
  async verifyLoginOtp(identifier, submittedOtp, role = 'patient') {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const rawIdent = (identifier || '').trim();
    if (!rawIdent) {
      throw new Error('Please specify your registered Gmail or phone number.');
    }
    if (!submittedOtp || submittedOtp.trim().length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP code.');
    }

    const isEmail = rawIdent.includes('@');
    const digitsOnly = rawIdent.replace(/\D/g, '');
    const cleanIdent = rawIdent.toLowerCase();
    const cleanKey = isEmail ? cleanIdent : digitsOnly.slice(-10);

    // Look up session
    let session = ACTIVE_LOGIN_OTPS.get(cleanKey) || ACTIVE_LOGIN_OTPS.get(cleanIdent);

    // If not found directly, search all entries for matching target or user
    if (!session) {
      for (const [, val] of ACTIVE_LOGIN_OTPS.entries()) {
        if (
          val.target?.toLowerCase() === cleanIdent ||
          val.user?.email?.toLowerCase() === cleanIdent ||
          (digitsOnly.length >= 10 && val.user?.phone?.replace(/\D/g, '').includes(digitsOnly.slice(-10)))
        ) {
          session = val;
          break;
        }
      }
    }

    if (!session) {
      throw new Error('No active OTP session found for this account. Please request a new verification code.');
    }

    if (Date.now() > session.expiresAt) {
      ACTIVE_LOGIN_OTPS.delete(cleanKey);
      ACTIVE_LOGIN_OTPS.delete(cleanIdent);
      throw new Error('OTP has expired. Please request a new verification code.');
    }

    if (session.otp !== submittedOtp.trim()) {
      throw new Error('Invalid verification code. Please check the 6-digit code and try again.');
    }

    // Clean up used OTP
    ACTIVE_LOGIN_OTPS.delete(cleanKey);
    ACTIVE_LOGIN_OTPS.delete(cleanIdent);

    const authenticatedUser = session.user;
    const effectiveRole = session.role || role || authenticatedUser.role || 'patient';
    const token = createJwtToken(authenticatedUser, effectiveRole);

    const userObj = {
      ...authenticatedUser,
      role: effectiveRole,
      token,
      loggedInAt: new Date().toISOString(),
      authMethod: session.channel === 'email' ? 'gmail_otp' : 'phone_sms_otp'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
    localStorage.setItem(TOKEN_KEY, token);

    return userObj;
  },

  /**
   * Update patient profile basic fields
   */
  async updateProfile(updatedFields) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = this.getCurrentUser();
    if (!current) throw new Error('No user logged in.');
    
    const updated = { ...current, ...updatedFields };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));

    // Also update in registered users array
    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedFields };
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    }

    return updated;
  }
};
