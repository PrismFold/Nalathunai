import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useRegistration } from '../../context/RegistrationContext';
import { authService } from '../../services/authService';
import { RegistrationHeader } from '../../components/RegistrationHeader';
import { Button } from '../../components/Button';
import { Shield, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const DetailsStep = () => {
  const navigate = useNavigate();
  const { regState, setPersonalDetails } = useRegistration();

  const demo = regState.verifiedDemographics || {};

  const [fullName, setFullName] = useState(regState.personalDetails?.fullName || demo.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(regState.personalDetails?.dateOfBirth || demo.dateOfBirth || '');
  const [bloodGroup, setBloodGroup] = useState(regState.personalDetails?.bloodGroup || demo.bloodGroup || 'O+');
  const [email, setEmail] = useState(regState.personalDetails?.email || demo.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: Step 1 Aadhaar must be verified
  if (!regState.aadhaarVerified) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!dateOfBirth) {
      setError('Please enter your date of birth.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.savePersonalDetails({
        fullName: fullName.trim(),
        dateOfBirth,
        bloodGroup,
        email: email.trim(),
      });

      setPersonalDetails({
        fullName: fullName.trim(),
        dateOfBirth,
        bloodGroup,
        email: email.trim(),
        abhaId: demo.abhaId,
        city: demo.city,
        primaryHospital: demo.primaryHospital,
      });

      navigate('/register/email-verification');
    } catch (err) {
      setError(err.message || 'Validation failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#DED2C0] rounded-md text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors';

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <RegistrationHeader
          currentStepId={2}
          title="Personal Details & Health Identity"
          subtitle="Confirm your verified e-KYC profile to complete your account."
        />

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          {/* Verified e-KYC Badge */}
          <div className="p-3 bg-[#EBF0E6] border border-[#CFDCB8] rounded-xl flex items-center justify-between text-xs text-[#425938]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#425938]" />
              <span className="font-semibold">Aadhaar e-KYC Verified</span>
            </div>
            {demo.abhaId && (
              <span className="font-mono text-[10px] bg-white/70 px-2 py-0.5 rounded border border-[#CFDCB8]">
                {demo.abhaId}
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] text-xs rounded-md flex items-center gap-2">
              <Shield className="shrink-0 text-[#C94F45]" size={15} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Full Name (as on Aadhaar)
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Date of Birth & Blood Group Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className={inputClass}
                >
                  {bloodGroupOptions.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
              icon={ArrowRight}
              className="mt-2"
            >
              {loading ? 'Saving details…' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
