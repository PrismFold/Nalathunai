import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RegistrationProvider } from './context/RegistrationContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AadhaarStep } from './pages/registration/AadhaarStep';
import { DetailsStep } from './pages/registration/DetailsStep';
import { EmailStep } from './pages/registration/EmailStep';
import { PasswordStep } from './pages/registration/PasswordStep';
import { SuccessStep } from './pages/registration/SuccessStep';
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { RecordRequestPage } from './pages/RecordRequestPage';
import { ConsentPage } from './pages/ConsentPage';
import { ActivityPage } from './pages/ActivityPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Guard Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-medium">
        Loading Nalathunai Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Only Guard (redirects logged-in users away from /login)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <Router>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Login Route */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Registration Flow Routes */}
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

            {/* Protected Patient Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
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

            {/* Fallback wildcard route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </RegistrationProvider>
    </AuthProvider>
  );
}

export default App;
