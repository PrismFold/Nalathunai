// Doctor Registration Flow Context
// Enforces step completion and prevents skipping verification steps

import React, { createContext, useContext, useState, useEffect } from 'react';

const DOC_REG_STORAGE_KEY = 'nalathunai_doc_reg_state';

const initialDocRegState = {
  // Step 1: Identity / Aadhaar
  aadhaarNumber: '',
  aadhaarVerified: false,

  // Step 2: Medical Registration
  doctorName: '',
  registrationNumber: '',
  council: '',
  qualification: '',
  specialty: '',
  hospitalAffiliation: '',
  medicalVerified: false,

  // Step 3: Contact (Email/Mobile)
  contact: '',
  contactType: 'email', // 'email' | 'mobile'
  contactVerified: false,

  // Step 4: Password & Completion
  accountCreated: false,
};

const DoctorRegistrationContext = createContext(null);

export const DoctorRegistrationProvider = ({ children }) => {
  const [docRegState, setDocRegState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(DOC_REG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialDocRegState;
    } catch {
      return initialDocRegState;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(DOC_REG_STORAGE_KEY, JSON.stringify(docRegState));
    } catch (e) {
      // ignore storage error
    }
  }, [docRegState]);

  // Step 1 Completed
  const setAadhaarVerified = (aadhaarNumber) => {
    setDocRegState((prev) => ({
      ...prev,
      aadhaarNumber,
      aadhaarVerified: true,
    }));
  };

  // Step 2 Completed
  const setMedicalVerified = (medicalData) => {
    setDocRegState((prev) => ({
      ...prev,
      doctorName: medicalData.doctorName,
      registrationNumber: medicalData.registrationNumber,
      council: medicalData.council || 'State Medical Council',
      qualification: medicalData.qualification || 'MBBS',
      specialty: medicalData.specialty || 'General Medicine',
      hospitalAffiliation: medicalData.hospitalAffiliation || '',
      medicalVerified: true,
    }));
  };

  // Step 3 Completed
  const setContactVerified = (contact, contactType = 'email') => {
    setDocRegState((prev) => ({
      ...prev,
      contact,
      contactType,
      contactVerified: true,
    }));
  };

  // Step 4 Completed
  const setDoctorAccountCreated = () => {
    setDocRegState((prev) => ({
      ...prev,
      accountCreated: true,
    }));
  };

  const resetDoctorRegistration = () => {
    setDocRegState(initialDocRegState);
    sessionStorage.removeItem(DOC_REG_STORAGE_KEY);
  };

  return (
    <DoctorRegistrationContext.Provider
      value={{
        docRegState,
        setAadhaarVerified,
        setMedicalVerified,
        setContactVerified,
        setDoctorAccountCreated,
        resetDoctorRegistration,
      }}
    >
      {children}
    </DoctorRegistrationContext.Provider>
  );
};

export const useDoctorRegistration = () => {
  const context = useContext(DoctorRegistrationContext);
  if (!context) {
    throw new Error('useDoctorRegistration must be used within a DoctorRegistrationProvider');
  }
  return context;
};
