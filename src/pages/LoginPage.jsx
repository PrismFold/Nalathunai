import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import {
  Shield,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Building2,
  User,
} from 'lucide-react';

export const LoginPage = ({ initialRole }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromQuery = queryParams.get('role');

  const [activeRole, setActiveRole] = useState(
    initialRole || roleFromQuery || 'patient'
  ); // 'patient' | 'doctor' | 'organization'

  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regAbha, setRegAbha] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeRole === 'doctor') {
      setIdentifier('TN-MED-00123');
      setPassword('password123');
    } else if (activeRole === 'organization') {
      setIdentifier('HOSP-PSG-01');
      setPassword('password123');
    } else {
      setIdentifier('9876543210');
      setPassword('password123');
    }
    setError('');
  }, [activeRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (activeRole === 'organization') {
        await login(identifier, password, 'organization');
        navigate('/organization/dashboard');
        return;
      }

      if (activeRole === 'doctor') {
        await login(identifier, password, 'doctor');
        navigate('/doctor/dashboard');
        return;
      }

      // Patient flow
      if (isRegister && !regName) {
        setError('Please provide your full name.');
        return;
      }
      await login(identifier, password, 'patient');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoPatientFill = async () => {
    try {
      await login('9876543210', 'password123', 'patient');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo patient login failed.');
    }
  };

  const handleDemoDoctorFill = async () => {
    try {
      await login('TN-MED-00123', 'password123', 'doctor');
      navigate('/doctor/dashboard');
    } catch (err) {
      setError('Demo doctor login failed: ' + err.message);
    }
  };

  const handleDemoOrgFill = async (orgIdentifier = 'HOSP-PSG-01') => {
    try {
      await login(orgIdentifier, 'password123', 'organization');
      navigate('/organization/dashboard');
    } catch (err) {
      setError('Demo organization login failed: ' + err.message);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 placeholder-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5257]/30 focus:border-[#0f5257] transition-colors';

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center py-12 px-4">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-3">
          <Logo size="large" />
        </div>
        <p className="text-sm text-stone-400 font-medium">Your health records. Your control.</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="w-full max-w-sm mb-3">
        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-1 flex text-xs">
          <button
            type="button"
            onClick={() => setActiveRole('patient')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'patient'
                ? 'bg-[#2F2D29] text-[#F7F3EA] shadow-xs'
                : 'text-[#686358] hover:text-[#2F2D29]'
            }`}
          >
            <User size={13} />
            <span>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('doctor')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'doctor'
                ? 'bg-[#2F2D29] text-[#F7F3EA] shadow-xs'
                : 'text-[#686358] hover:text-[#2F2D29]'
            }`}
          >
            <Stethoscope size={13} />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('organization')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'organization'
                ? 'bg-[#2F2D29] text-[#F7F3EA] shadow-xs'
                : 'text-[#686358] hover:text-[#2F2D29]'
            }`}
          >
            <Building2 size={13} />
            <span>Organization</span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-stone-100">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                !isRegister
                  ? 'text-[#0f5257] border-b-2 border-[#0f5257]'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {activeRole === 'doctor' ? 'Doctor Login' : activeRole === 'organization' ? 'Facility Login' : 'Login'}
            </button>
            {activeRole !== 'organization' && (
              <button
                type="button"
                onClick={() => {
                  if (activeRole === 'doctor') {
                    navigate('/doctor/register');
                  } else {
                    navigate('/register');
                  }
                }}
                className="flex-1 py-3.5 text-sm font-medium transition-colors text-stone-400 hover:text-stone-600"
              >
                Register
              </button>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Error */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
                <Shield className="shrink-0 text-rose-400" size={15} strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            {/* Organization Notice */}
            {activeRole === 'organization' && (
              <div className="p-3 bg-[#F4EFE6] border border-[#E5DDD0] text-[#787469] text-xs rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#2F2D29]">
                  <Building2 size={14} className="text-[#5D6454]" />
                  <span>Healthcare Facility Node Login</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Hospital administration & clinical records federation gateway. Use your Node ID (e.g. HOSP-PSG-01) to sign in.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && activeRole === 'patient' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Ramesh"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      ABHA ID{' '}
                      <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="91-4829-1029-4720"
                      value={regAbha}
                      onChange={(e) => setRegAbha(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  {activeRole === 'doctor'
                    ? 'Medical Reg No. or Email / Mobile'
                    : activeRole === 'organization'
                    ? 'Facility Node ID / Admin Email'
                    : 'Mobile or Email'}
                </label>
                <div className="relative">
                  {activeRole === 'doctor' ? (
                    <Stethoscope size={15} className="absolute left-3 top-3 text-stone-300" strokeWidth={1.75} />
                  ) : activeRole === 'organization' ? (
                    <Building2 size={15} className="absolute left-3 top-3 text-stone-300" strokeWidth={1.75} />
                  ) : (
                    <Phone size={15} className="absolute left-3 top-3 text-stone-300" strokeWidth={1.75} />
                  )}
                  <input
                    type="text"
                    required
                    placeholder={
                      activeRole === 'doctor'
                        ? 'e.g. TN-MED-00123'
                        : activeRole === 'organization'
                        ? 'e.g. HOSP-PSG-01'
                        : '+91 98765 43210'
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-stone-300" strokeWidth={1.75} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={loading}
                icon={ArrowRight}
                className="mt-1"
              >
                {loading
                  ? 'Authenticating…'
                  : isRegister
                  ? 'Create Account'
                  : activeRole === 'doctor'
                  ? 'Sign In as Doctor'
                  : activeRole === 'organization'
                  ? 'Sign In as Facility'
                  : 'Sign In'}
              </Button>
            </form>

            {/* Demo Quick Logins */}
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold text-center mb-2">
                Prototype Quick Demo
              </p>
              {activeRole === 'doctor' ? (
                <button
                  type="button"
                  onClick={handleDemoDoctorFill}
                  className="w-full py-2.5 px-4 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={14} className="text-[#0f5257]" strokeWidth={1.75} />
                  Demo Login as Dr. Ananya Kumar
                </button>
              ) : activeRole === 'organization' ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemoOrgFill('HOSP-PSG-01')}
                    className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 size={14} className="text-[#0f5257]" strokeWidth={1.75} />
                    Demo Login as PSG Hospitals (H002)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoOrgFill('HOSP-KMCH-01')}
                    className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Building2 size={14} className="text-[#5D6454]" strokeWidth={1.75} />
                    Demo Login as KMCH (H001)
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDemoPatientFill}
                  className="w-full py-2.5 px-4 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={14} className="text-[#0f5257]" strokeWidth={1.75} />
                  Demo Login as Ananya Ramesh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1">
          <Shield size={12} className="text-[#0f5257]" strokeWidth={1.75} />
          Protected by patient consent architecture · SNS Workbench API ready
        </p>
      </div>
    </div>
  );
};
