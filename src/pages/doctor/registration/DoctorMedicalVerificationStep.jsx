import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDoctorRegistration } from '../../../context/DoctorRegistrationContext';
import { doctorVerificationService } from '../../../services/doctorVerificationService';
import { DoctorRegistrationHeader } from '../../../components/DoctorRegistrationHeader';
import { Button } from '../../../components/Button';
import { CheckCircle2, XCircle, ArrowRight, Shield, Stethoscope, RefreshCw } from 'lucide-react';

export const DoctorMedicalVerificationStep = () => {
  const navigate = useNavigate();
  const { docRegState, setMedicalVerified } = useDoctorRegistration();

  const [doctorName, setDoctorName] = useState(docRegState.doctorName || 'Dr. Ananya Kumar');
  const [registrationNumber, setRegistrationNumber] = useState(
    docRegState.registrationNumber || 'TN-MED-00123'
  );
  const [loading, setLoading] = useState(false);
  const [statusState, setStatusState] = useState(null); // null | 'loading' | 'verified' | 'failed'
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Guard: Step 1 Aadhaar must be verified
  if (!docRegState.aadhaarVerified) {
    return <Navigate to="/doctor/register/identity" replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusState('loading');
    setLoading(true);

    try {
      const result = await doctorVerificationService.verifyRegistration(
        doctorName,
        registrationNumber
      );

      if (result.verified) {
        setStatusState('verified');
        setVerificationResult(result.data);
        setMedicalVerified(result.data);
      } else {
        setStatusState('failed');
        setErrorMessage(result.message || 'Registration details could not be verified');
        setVerificationResult(null);
      }
    } catch (err) {
      setStatusState('failed');
      setErrorMessage(err.message || 'Verification agent service error.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (statusState === 'verified') {
      navigate('/doctor/register/contact');
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#DED2C0] rounded-md text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors';

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <DoctorRegistrationHeader
          currentStepId={2}
          title="Medical Registration Verification"
          subtitle="The verification agent checks your credentials against the State Medical Registry."
        />

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-6 space-y-5">
          {/* Agent Architecture Note */}
          <div className="p-3 bg-[#F4EFE6] border border-[#E5DDD0] rounded-lg text-[11px] text-[#787469] flex items-start gap-2">
            <Shield size={14} className="text-[#5D6454] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#2F2D29]">Agent Lookup Security Rule: </span>
              The verification agent strictly queries and matches dummy medical council records. It does not control authorization, user tokens, or patient record consent.
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Doctor Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ananya Kumar"
                value={doctorName}
                onChange={(e) => {
                  setDoctorName(e.target.value);
                  setStatusState(null);
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Medical Registration Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TN-MED-00123"
                value={registrationNumber}
                onChange={(e) => {
                  setRegistrationNumber(e.target.value);
                  setStatusState(null);
                }}
                className={`${inputClass} font-mono uppercase`}
              />
              <p className="text-[11px] text-[#7D786D] mt-1.5 flex items-center gap-1">
                <span>Demo valid sample:</span>
                <span className="font-mono font-medium text-[#2F2D29]">TN-MED-00123</span>
                <span className="text-[#A0988A]">(Dr. Ananya Kumar)</span>
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              variant="primary"
              disabled={loading || !doctorName || !registrationNumber}
              icon={loading ? RefreshCw : Stethoscope}
            >
              {loading ? 'Checking Medical Registry…' : 'Verify Medical Registration'}
            </Button>
          </form>

          {/* Verification Agent Status State */}
          {statusState === 'loading' && (
            <div className="p-4 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl flex items-center gap-3 text-xs text-[#686358]">
              <RefreshCw size={16} className="animate-spin text-[#5D6454] shrink-0" />
              <div>
                <span className="font-semibold text-[#2F2D29]">Querying State Medical Registry…</span>
                <p className="text-[11px] text-[#787469]">Verifying practitioner registration and license status.</p>
              </div>
            </div>
          )}

          {statusState === 'verified' && verificationResult && (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-[#EFF4EA] border border-[#C5D9B4] rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#345124] font-semibold text-sm">
                  <CheckCircle2 size={18} className="text-[#4E7737] shrink-0" strokeWidth={2} />
                  <span>✓ Medical registration verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D3E4C6] text-[11px]">
                  <div>
                    <span className="text-[#728562] block">Council</span>
                    <span className="font-medium text-[#2F2D29]">{verificationResult.council}</span>
                  </div>
                  <div>
                    <span className="text-[#728562] block">Specialty</span>
                    <span className="font-medium text-[#2F2D29]">{verificationResult.specialty}</span>
                  </div>
                  <div>
                    <span className="text-[#728562] block">Qualification</span>
                    <span className="font-medium text-[#2F2D29]">{verificationResult.qualification}</span>
                  </div>
                  <div>
                    <span className="text-[#728562] block">Hospital</span>
                    <span className="font-medium text-[#2F2D29]">{verificationResult.hospitalAffiliation}</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleContinue}
                fullWidth
                size="lg"
                icon={ArrowRight}
              >
                Continue to Contact Verification
              </Button>
            </div>
          )}

          {statusState === 'failed' && (
            <div className="p-4 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <XCircle size={18} className="text-[#C94F45] shrink-0" strokeWidth={2} />
                <span>✕ Registration details could not be verified</span>
              </div>
              <p className="text-[11px] text-[#9A2D23] leading-relaxed">
                {errorMessage || 'The details entered do not match any practitioner in the dummy medical registry.'}
              </p>
              <div className="pt-2 border-t border-[#F7D1CC] text-[11px] text-[#787469]">
                <span>Tip: Try testing with </span>
                <strong className="text-[#2F2D29]">Dr. Ananya Kumar</strong>
                <span> and </span>
                <strong className="font-mono text-[#2F2D29]">TN-MED-00123</strong>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
