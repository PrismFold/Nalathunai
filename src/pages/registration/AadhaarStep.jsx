import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../../context/RegistrationContext';
import { authService } from '../../services/authService';
import { DUMMY_AADHAAR_REGISTRY } from '../../data/aadhaarDatabase';
import { RegistrationHeader } from '../../components/RegistrationHeader';
import { Button } from '../../components/Button';
import { Shield, ArrowRight, CheckCircle2, Smartphone, KeyRound, Info } from 'lucide-react';

export const AadhaarStep = () => {
  const navigate = useNavigate();
  const { regState, setAadhaarVerified } = useRegistration();

  const [aadhaarNumber, setAadhaarNumber] = useState(regState.aadhaarNumber || '');
  const [phoneNumber, setPhoneNumber] = useState(regState.phoneNumber || '');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verifiedProfile, setVerifiedProfile] = useState(null);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Format 12-digit Aadhaar: XXXX XXXX XXXX
  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarNumber(raw);
    setError('');
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(raw);
    setError('');
  };

  const formattedAadhaar = aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleSelectDummyAadhaar = (dummy) => {
    setAadhaarNumber(dummy.aadhaarNumber);
    setError('');
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (aadhaarNumber.length < 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter your 10-digit mobile number to receive SMS OTP.');
      return;
    }

    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await authService.sendAadhaarOTP(aadhaarNumber, phoneNumber);
      setOtpSent(true);
      setGeneratedOtp(res.otp);
      setVerifiedProfile(res.profile);
      setTimer(30);
      setCanResend(false);
      setInfoMessage(`SMS OTP dispatched to +91 ${phoneNumber}. One-time verification code: ${res.otp}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your phone.');
      return;
    }
    setError('');
    setVerifying(true);

    try {
      const res = await authService.verifyAadhaarOTP(phoneNumber, otp);
      setSuccessMessage('Identity verified successfully. Linking government e-KYC record...');
      setAadhaarVerified(aadhaarNumber, phoneNumber, res.profile || verifiedProfile);

      setTimeout(() => {
        navigate('/register/details');
      }, 600);
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please check the code sent to your phone.');
    } finally {
      setVerifying(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#DED2C0] rounded-md text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors';

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <RegistrationHeader
          currentStepId={1}
          title="Create your Nalathunai account"
          subtitle="Verify your identity with dummy Aadhaar & real phone SMS OTP."
        />

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          {/* Error notice */}
          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] text-xs rounded-md flex items-start gap-2">
              <Shield className="shrink-0 text-[#C94F45] mt-0.5" size={15} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {/* Dynamic OTP dispatch notice */}
          {infoMessage && !successMessage && (
            <div className="p-3.5 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-xs rounded-md space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <Smartphone className="shrink-0 text-[#4E7737]" size={15} strokeWidth={1.75} />
                <span>SMS Dispatched</span>
              </div>
              <p className="text-[11.5px] leading-relaxed font-mono font-medium">
                {infoMessage}
              </p>
            </div>
          )}

          {/* Success verified notice */}
          {successMessage && (
            <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-[#4E7737]" size={15} strokeWidth={1.75} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Dummy Aadhaar Reference Selector */}
          {!otpSent && (
            <div className="p-3 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-[#2F2D29]">
                <Info size={13} className="text-[#5D6454]" />
                <span>Verified Dummy Aadhaars (Click to Use):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {DUMMY_AADHAAR_REGISTRY.slice(0, 4).map((dummy) => (
                  <button
                    key={dummy.aadhaarNumber}
                    type="button"
                    onClick={() => handleSelectDummyAadhaar(dummy)}
                    className="text-left px-2.5 py-1.5 bg-white hover:bg-[#FAF7F2] border border-[#DED2C0] rounded-lg transition-colors text-[11px] font-mono text-[#2F2D29] flex flex-col"
                  >
                    <span className="font-semibold text-[#5D6454]">{dummy.formatted}</span>
                    <span className="text-[10px] text-[#787469] font-sans">{dummy.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step Form */}
          <div className="space-y-4">
            {/* Aadhaar Input */}
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Aadhaar Number (12 Digits)
              </label>
              <input
                type="text"
                placeholder="e.g. 5544 3322 1100"
                value={formattedAadhaar}
                onChange={handleAadhaarChange}
                disabled={otpSent}
                className={`${inputClass} tracking-wider font-mono`}
              />
            </div>

            {/* Real Mobile Number Input */}
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Your Mobile Phone Number (for SMS OTP)
              </label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 bg-[#F4EFE6] border border-[#DED2C0] rounded-md text-xs font-mono text-[#2F2D29]">
                  +91
                </span>
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={otpSent}
                  className={`${inputClass} tracking-wider font-mono`}
                />
                {!otpSent && (
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || aadhaarNumber.length < 12 || phoneNumber.length < 10}
                    size="md"
                    variant="primary"
                    className="shrink-0 whitespace-nowrap"
                  >
                    {loading ? 'Sending…' : 'Get OTP'}
                  </Button>
                )}
              </div>
            </div>

            {/* OTP Section (Visible when OTP sent) */}
            {otpSent && (
              <form onSubmit={handleVerifyOTP} className="space-y-4 pt-3 border-t border-[#E5DDD0]">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#2F2D29] flex items-center gap-1.5">
                      <KeyRound size={13} className="text-[#5D6454]" />
                      Enter 6-Digit SMS Verification Code
                    </label>
                    {generatedOtp && (
                      <span className="text-[10px] font-mono text-[#5D6454] bg-[#EBF0E6] px-2 py-0.5 rounded border border-[#CFDCB8]">
                        OTP: {generatedOtp}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={verifying || !!successMessage}
                    className={`${inputClass} tracking-widest text-center font-mono text-lg font-bold`}
                    autoFocus
                  />
                </div>

                {/* Resend OTP & Countdown */}
                {!successMessage && (
                  <div className="flex items-center justify-between text-xs text-[#7D786D] px-0.5">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="text-[#2F2D29] font-semibold hover:underline"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span>Resend OTP in <strong className="font-mono text-[#2F2D29]">{timer}s</strong></span>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={otp.length !== 6 || verifying || !!successMessage}
                  icon={ArrowRight}
                >
                  {verifying ? 'Verifying OTP…' : 'Verify & Continue'}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Existing Login link */}
        <p className="mt-5 text-center text-xs text-[#7D786D]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#2F2D29] font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
