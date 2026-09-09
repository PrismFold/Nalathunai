import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../../context/RegistrationContext';
import { authService } from '../../services/authService';
import { RegistrationHeader } from '../../components/RegistrationHeader';
import { Button } from '../../components/Button';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AadhaarStep = () => {
  const navigate = useNavigate();
  const { regState, setAadhaarVerified } = useRegistration();

  const [aadhaarNumber, setAadhaarNumber] = useState(regState.aadhaarNumber || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

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

  // Format 12-digit Aadhaar nicely: XXXX XXXX XXXX
  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarNumber(raw);
    setError('');
  };

  const formattedAadhaar = aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (aadhaarNumber.length < 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      await authService.sendAadhaarOTP(aadhaarNumber);
      setOtpSent(true);
      setTimer(30);
      setCanResend(false);
      setInfoMessage('OTP sent successfully.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Incorrect OTP. Please try again.');
      return;
    }
    setError('');
    setVerifying(true);

    try {
      await authService.verifyAadhaarOTP(aadhaarNumber, otp);
      setSuccessMessage('Identity verified successfully.');
      setAadhaarVerified(aadhaarNumber);

      setTimeout(() => {
        navigate('/register/details');
      }, 600);
    } catch (err) {
      setError('Incorrect OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#DED2C0] rounded-md text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors';

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <RegistrationHeader
          currentStepId={1}
          title="Create your Nalathunai account"
          subtitle="Verify your identity to securely create your health record account."
        />

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          {/* Subtle error */}
          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] text-xs rounded-md flex items-center gap-2">
              <Shield className="shrink-0 text-[#C94F45]" size={15} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {/* Info message (OTP sent) */}
          {infoMessage && !successMessage && (
            <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-[#4E7737]" size={15} strokeWidth={1.75} />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Success verified message */}
          {successMessage && (
            <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-[#4E7737]" size={15} strokeWidth={1.75} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Step Form */}
          <div className="space-y-4">
            {/* Aadhaar Input */}
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Aadhaar Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={formattedAadhaar}
                  onChange={handleAadhaarChange}
                  disabled={otpSent}
                  className={`${inputClass} tracking-wider font-mono`}
                />
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || aadhaarNumber.length < 12 || otpSent}
                  size="md"
                  variant="primary"
                  className="shrink-0 whitespace-nowrap"
                >
                  {loading ? 'Sending…' : 'Send OTP'}
                </Button>
              </div>
            </div>

            {/* OTP Section (Visible always, disabled until Send OTP clicked) */}
            <form onSubmit={handleVerifyOTP} className="space-y-4 pt-2 border-t border-[#E5DDD0]">
              <div>
                <label className="block text-xs font-semibold text-[#2F2D29] mb-1">
                  Enter the OTP sent to your registered mobile number
                </label>
                <p className="text-[11px] text-[#7D786D] mb-2">
                  (For MVP demo, use code <span className="font-mono text-[#2F2D29] font-medium">123456</span>)
                </p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={!otpSent || verifying || !!successMessage}
                  className={`${inputClass} tracking-widest text-center font-mono text-base ${
                    !otpSent ? 'opacity-60 cursor-not-allowed bg-[#F4EFE6]' : ''
                  }`}
                />
              </div>

              {/* Resend OTP & Countdown */}
              {otpSent && !successMessage && (
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
                disabled={!otpSent || otp.length < 6 || verifying || !!successMessage}
                icon={ArrowRight}
              >
                {verifying ? 'Verifying OTP…' : 'Verify OTP'}
              </Button>
            </form>
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
