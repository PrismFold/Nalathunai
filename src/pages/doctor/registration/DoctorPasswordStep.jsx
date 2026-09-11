import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDoctorRegistration } from '../../../context/DoctorRegistrationContext';
import { doctorAuthService } from '../../../services/doctorAuthService';
import { DoctorRegistrationHeader } from '../../../components/DoctorRegistrationHeader';
import { Button } from '../../../components/Button';
import { Shield, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight, AlertCircle } from 'lucide-react';

export const DoctorPasswordStep = () => {
  const navigate = useNavigate();
  const { docRegState, setDoctorAccountCreated } = useDoctorRegistration();

  const [password, setPassword] = useState('Password@123');
  const [confirmPassword, setConfirmPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: Step 3 Contact must be verified
  if (!docRegState.contactVerified) {
    return <Navigate to="/doctor/register/contact" replace />;
  }

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  const isFormValid = hasMinLength && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      if (!passwordsMatch) {
        setError('Passwords do not match. Please re-enter.');
      } else {
        setError('Please ensure your password satisfies all security requirements.');
      }
      return;
    }

    setLoading(true);

    try {
      await doctorAuthService.createDoctorAccount({
        doctorName: docRegState.doctorName,
        registrationNumber: docRegState.registrationNumber,
        council: docRegState.council,
        qualification: docRegState.qualification,
        specialty: docRegState.specialty,
        hospital: docRegState.hospitalAffiliation,
        contact: docRegState.contact,
        aadhaarNumber: docRegState.aadhaarNumber,
        password: password,
      });

      setDoctorAccountCreated();
      navigate('/doctor/register/success');
    } catch (err) {
      setError(err.message || 'Failed to create doctor account.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#DED2C0] rounded-md text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors';

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <DoctorRegistrationHeader
          currentStepId={4}
          title="Set Doctor Password"
          subtitle="Create a secure password for your Nalathunai practitioner account."
        />

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="shrink-0 text-[#C94F45]" size={15} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#A0988A] hover:text-[#2F2D29]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-[#A0988A] hover:text-[#2F2D29]"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Security checklist */}
            <div className="p-3 bg-[#F4EFE6] border border-[#E5DDD0] rounded-md text-xs space-y-1.5">
              <div className="text-[11px] font-semibold text-[#7D786D] uppercase tracking-wider mb-1">
                Password Security Requirements
              </div>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  hasMinLength ? 'text-emerald-700 font-medium' : 'text-stone-400'
                }`}
              >
                {hasMinLength ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-stone-300 shrink-0" />
                )}
                <span>At least 8 characters</span>
              </div>

              <div
                className={`flex items-center gap-2 transition-colors ${
                  hasNumber ? 'text-emerald-700 font-medium' : 'text-stone-400'
                }`}
              >
                {hasNumber ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-stone-300 shrink-0" />
                )}
                <span>Contains a number</span>
              </div>

              <div
                className={`flex items-center gap-2 transition-colors ${
                  hasSpecial ? 'text-emerald-700 font-medium' : 'text-stone-400'
                }`}
              >
                {hasSpecial ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-stone-300 shrink-0" />
                )}
                <span>Contains a special character</span>
              </div>

              {confirmPassword && (
                <div
                  className={`flex items-center gap-2 pt-1 border-t border-stone-200/60 transition-colors ${
                    passwordsMatch ? 'text-emerald-700 font-medium' : 'text-rose-600'
                  }`}
                >
                  {passwordsMatch ? (
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-rose-400 shrink-0" />
                  )}
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!isFormValid || loading}
              icon={ArrowRight}
              className="mt-2"
            >
              {loading ? 'Creating Doctor Account…' : 'Create Doctor Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
