import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const current = authService.getCurrentUser();
    if (current) {
      setUser(current);
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password, role = 'patient') => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(identifier, password, role);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedFields) => {
    const updated = await authService.updateProfile(updatedFields);
    setUser(updated);
    return updated;
  };

  const requestLoginOtp = async (identifier, preferredChannel = 'auto', role = 'patient') => {
    return await authService.requestLoginOtp(identifier, preferredChannel, role);
  };

  const verifyLoginOtp = async (identifier, submittedOtp, role = 'patient') => {
    setLoading(true);
    try {
      const loggedUser = await authService.verifyLoginOtp(identifier, submittedOtp, role);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role || 'patient';
  const isDoctor = role === 'doctor';
  const isHospital = role === 'hospital';
  const isPatient = role === 'patient';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isDoctor,
        isHospital,
        isPatient,
        loading,
        login,
        requestLoginOtp,
        verifyLoginOtp,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
