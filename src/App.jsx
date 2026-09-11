import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RegistrationProvider } from './context/RegistrationContext';
import { DoctorRegistrationProvider } from './context/DoctorRegistrationContext';

import { DashboardLayout } from './layouts/DashboardLayout';
import { DoctorDashboardLayout } from './layouts/DoctorDashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

// Patient Registration
import { AadhaarStep } from './pages/registration/AadhaarStep';
import { DetailsStep } from './pages/registration/DetailsStep';
import { EmailStep } from './pages/registration/EmailStep';
import { PasswordStep } from './pages/registration/PasswordStep';
import { SuccessStep } from './pages/registration/SuccessStep';

// Patient Portal Pages
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { RecordRequestPage } from './pages/RecordRequestPage';
import { ConsentPage } from './pages/ConsentPage';
import { ActivityPage } from './pages/ActivityPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';

// Doctor Registration Pages
import { DoctorAadhaarStep } from './pages/doctor/registration/DoctorAadhaarStep';
import { DoctorMedicalVerificationStep } from './pages/doctor/registration/DoctorMedicalVerificationStep';
import { DoctorContactStep } from './pages/doctor/registration/DoctorContactStep';
import { DoctorPasswordStep } from './pages/doctor/registration/DoctorPasswordStep';
import { DoctorSuccessStep } from './pages/doctor/registration/DoctorSuccessStep';

// Doctor Portal Pages
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';
import { DoctorPatientRecordPage } from './pages/doctor/DoctorPatientRecordPage';
import { DoctorConsentRequestsPage } from './pages/doctor/DoctorConsentRequestsPage';
import { DoctorAccessHistoryPage } from './pages/doctor/DoctorAccessHistoryPage';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';

// Organization Portal Layout & Pages
import { OrganizationDashboardLayout } from './layouts/OrganizationDashboardLayout';
import { OrganizationDashboardPage } from './pages/organization/OrganizationDashboardPage';
import { OrganizationDoctorsPage } from './pages/organization/OrganizationDoctorsPage';
import { OrganizationDoctorDetailPage } from './pages/organization/OrganizationDoctorDetailPage';
import { OrganizationPatientsPage } from './pages/organization/OrganizationPatientsPage';
import { OrganizationPatientRequestsPage } from './pages/organization/OrganizationPatientRequestsPage';
import { OrganizationAccessHistoryPage } from './pages/organization/OrganizationAccessHistoryPage';
import { OrganizationProfilePage } from './pages/organization/OrganizationProfilePage';

// Protected Patient Route Guard Wrapper
const PatientProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] text-[#787469] text-sm font-medium">
        Loading Nalathunai Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (user?.role === 'organization') {
    return <Navigate to="/organization/dashboard" replace />;
  }

  return children;
};

// Protected Doctor Route Guard Wrapper
const DoctorProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] text-[#787469] text-sm font-medium">
        Loading Nalathunai Doctor Workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?role=doctor" replace />;
  }

  if (user?.role !== 'doctor') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected Organization Route Guard Wrapper
const OrganizationProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] text-[#787469] text-sm font-medium">
        Loading Nalathunai Facility Node...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?role=organization" replace />;
  }

  if (user?.role !== 'organization') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Only Guard (redirects logged-in users away from auth routes)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    if (user?.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    if (user?.role === 'organization') {
      return <Navigate to="/organization/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Doctor Public Only Guard
const DoctorPublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;
  if (isAuthenticated && user?.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <DoctorRegistrationProvider>
          <Router>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Public Login Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/doctor/login"
                element={
                  <DoctorPublicRoute>
                    <LoginPage initialRole="doctor" />
                  </DoctorPublicRoute>
                }
              />

              {/* Patient Registration Flow Routes */}
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <AadhaarStep />
                  </PublicRoute>
                }
              />
              <Route
                path="/register/details"
                element={
                  <PublicRoute>
                    <DetailsStep />
                  </PublicRoute>
                }
              />
              <Route
                path="/register/email-verification"
                element={
                  <PublicRoute>
                    <EmailStep />
                  </PublicRoute>
                }
              />
              <Route
                path="/register/password"
                element={
                  <PublicRoute>
                    <PasswordStep />
                  </PublicRoute>
                }
              />
              <Route
                path="/register/success"
                element={
                  <PublicRoute>
                    <SuccessStep />
                  </PublicRoute>
                }
              />

              {/* Doctor Registration Flow Routes */}
              <Route
                path="/doctor/register"
                element={
                  <DoctorPublicRoute>
                    <DoctorAadhaarStep />
                  </DoctorPublicRoute>
                }
              />
              <Route
                path="/doctor/register/identity"
                element={
                  <DoctorPublicRoute>
                    <DoctorAadhaarStep />
                  </DoctorPublicRoute>
                }
              />
              <Route
                path="/doctor/register/medical-verification"
                element={
                  <DoctorPublicRoute>
                    <DoctorMedicalVerificationStep />
                  </DoctorPublicRoute>
                }
              />
              <Route
                path="/doctor/register/contact"
                element={
                  <DoctorPublicRoute>
                    <DoctorContactStep />
                  </DoctorPublicRoute>
                }
              />
              <Route
                path="/doctor/register/password"
                element={
                  <DoctorPublicRoute>
                    <DoctorPasswordStep />
                  </DoctorPublicRoute>
                }
              />
              <Route
                path="/doctor/register/success"
                element={
                  <DoctorPublicRoute>
                    <DoctorSuccessStep />
                  </DoctorPublicRoute>
                }
              />

              {/* Protected Patient Routes */}
              <Route
                element={
                  <PatientProtectedRoute>
                    <DashboardLayout />
                  </PatientProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="/request" element={<RecordRequestPage />} />
                <Route path="/consent" element={<ConsentPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Protected Doctor Routes */}
              <Route
                element={
                  <DoctorProtectedRoute>
                    <DoctorDashboardLayout />
                  </DoctorProtectedRoute>
                }
              >
                <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
                <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
                <Route path="/doctor/patients/:patientId" element={<DoctorPatientRecordPage />} />
                <Route path="/doctor/consent-requests" element={<DoctorConsentRequestsPage />} />
                <Route path="/doctor/access-history" element={<DoctorAccessHistoryPage />} />
                <Route path="/doctor/profile" element={<DoctorProfilePage />} />
              </Route>

              {/* Protected Organization Routes */}
              <Route
                element={
                  <OrganizationProtectedRoute>
                    <OrganizationDashboardLayout />
                  </OrganizationProtectedRoute>
                }
              >
                <Route path="/organization/dashboard" element={<OrganizationDashboardPage />} />
                <Route path="/organization/doctors" element={<OrganizationDoctorsPage />} />
                <Route path="/organization/doctors/:doctorId" element={<OrganizationDoctorDetailPage />} />
                <Route path="/organization/patients" element={<OrganizationPatientsPage />} />
                <Route path="/organization/patient-requests" element={<OrganizationPatientRequestsPage />} />
                <Route path="/organization/access-history" element={<OrganizationAccessHistoryPage />} />
                <Route path="/organization/profile" element={<OrganizationProfilePage />} />
              </Route>

              {/* Fallback wildcard route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </DoctorRegistrationProvider>
      </RegistrationProvider>
    </AuthProvider>
  );
}

export default App;
