import React, { createContext, useContext, useState, useEffect } from 'react';

const REG_STORAGE_KEY = 'nalathunai_reg_temp_state';

const initialRegState = {
  aadhaarNumber: '',
  phoneNumber: '',
  aadhaarVerified: false,
  verifiedDemographics: null,
  personalDetails: {
    fullName: '',
    dateOfBirth: '',
    bloodGroup: 'O+',
    email: '',
    mobile: '',
  },
  detailsCompleted: false,
  emailVerified: false,
  accountCreated: false,
};

const RegistrationContext = createContext(null);

export const RegistrationProvider = ({ children }) => {
  const [regState, setRegState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(REG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialRegState;
    } catch {
      return initialRegState;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(REG_STORAGE_KEY, JSON.stringify(regState));
    } catch (e) {
      // ignore storage errors
    }
  }, [regState]);

  const setAadhaarVerified = (aadhaarNumber, phoneNumber, verifiedDemographics = null) => {
    setRegState((prev) => ({
      ...prev,
      aadhaarNumber,
      phoneNumber,
      aadhaarVerified: true,
      verifiedDemographics,
      personalDetails: {
        ...prev.personalDetails,
        fullName: verifiedDemographics?.name || prev.personalDetails.fullName,
        dateOfBirth: verifiedDemographics?.dateOfBirth || prev.personalDetails.dateOfBirth,
        bloodGroup: verifiedDemographics?.bloodGroup || prev.personalDetails.bloodGroup,
        email: verifiedDemographics?.email || prev.personalDetails.email,
        mobile: phoneNumber || prev.personalDetails.mobile,
      }
    }));
  };

  const setPersonalDetails = (details) => {
    setRegState((prev) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, ...details },
      detailsCompleted: true,
    }));
  };

  const setEmailVerified = () => {
    setRegState((prev) => ({
      ...prev,
      emailVerified: true,
    }));
  };

  const setAccountCreated = () => {
    setRegState((prev) => ({
      ...prev,
      accountCreated: true,
    }));
  };

  const resetRegistration = () => {
    setRegState(initialRegState);
    sessionStorage.removeItem(REG_STORAGE_KEY);
  };

  return (
    <RegistrationContext.Provider
      value={{
        regState,
        setAadhaarVerified,
        setPersonalDetails,
        setEmailVerified,
        setAccountCreated,
        resetRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
