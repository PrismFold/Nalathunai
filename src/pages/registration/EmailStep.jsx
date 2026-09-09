import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useRegistration } from '../../context/RegistrationContext';
import { authService } from '../../services/authService';
import { RegistrationHeader } from '../../components/RegistrationHeader';
import { Button } from '../../components/Button';
import { Shield, ArrowRight, CheckCircle2, Mail } from 'lucide-react';

const maskEmail = (emailStr) => {
  if (!emailStr || !emailStr.includes('@')) return 's***@gmail.com';
  const [name, domain] = emailStr.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

export const EmailStep = () => {
  const navigate = useNavigate();
  const { regState, setEmailVerified } = useRegistration();

  // Guard: Step 2 Details must be completed
  if (!regState.detailsCompleted) {
    return <Navigate to="/register/details" replace />;
  }

  const userEmail = regState.personalDetails.email || 'ananya.ramesh@example.com';
  const maskedEmail = maskEmail(userEmail);

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('Verification code sent to your email.');
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    setError('');
    setInfoMessage('');
    setResending(true);
    try {
      await authService.sendEmailOTP(userEmail);
      setTimer(30);
      setInfoMessage(`New OTP sent to ${maskedEmail}.`);
    } catch (err) {
      setError(err.message || 'Failed to resend email OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Incorrect OTP. Please try again.');
      return;
    }
    setError('');
    setVerifying(true);

    try {
      await authService.verifyEmailOTP(userEmail, otp);
      setSuccessMessage('Email verified successfully.');
      setEmailVerified();

      setTimeout(() => {
        navigate('/register/password');
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
          currentStepId={3}
          title="Verify your email"
          subtitle="We've sent a verification code to your email address."
        />

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          {/* Masked email pill */}
          <div className="p-3 bg-[#F4EFE6] border border-[#E5DDD0] rounded-md text-xs flex items-center justify-between text-[#2F2D29]">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-[#5D6454] shrink-0" strokeWidth={1.75} />
              <span className="font-mono font-medium">{maskedEmail}</span>
            </div>
            <span className="text-[10px] text-[#4E7737] bg-[#EFF4EA] px-2 py-0.5 rounded border border-[#C5D9B4] font-semibold">
              Pending
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] text-xs rounded-md flex items-center gap-2">
              <Shield className="shrink-0 text-[#C94F45]" size={15} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {/* Info */}
          {infoMessage && !successMessage && !error && (
            <div className="p-2.5 bg-[#F4EFE6] text-[#7D786D] text-[11px] rounded-md text-center">
              {infoMessage} (Demo code: <span className="font-mono font-semibold text-[#2F2D29]">123456</span>)
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-[#4E7737]" size={15} strokeWidth={1.75} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2F2D29] mb-1.5">
                Enter 6-digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={verifying || !!successMessage}
                className={`${inputClass} tracking-widest text-center font-mono text-base`}
              />
            </div>

            {/* Resend OTP */}
            <div className="flex items-center justify-between text-xs text-[#7D786D] px-0.5">
              <span>Didn't receive code?</span>
              {timer > 0 ? (
                <span className="text-[#A0988A]">Resend in <strong className="font-mono text-[#2F2D29]">{timer}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#2F2D29] font-semibold hover:underline"
                >
                  {resending ? 'Sending…' : 'Resend OTP'}
                </button>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={otp.length < 6 || verifying || !!successMessage}
              icon={ArrowRight}
            >
              {verifying ? 'Verifying Email…' : 'Verify Email'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
