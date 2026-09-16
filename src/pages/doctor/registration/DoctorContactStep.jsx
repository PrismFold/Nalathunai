import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDoctorRegistration } from '../../../context/DoctorRegistrationContext';
import { doctorAuthService } from '../../../services/doctorAuthService';
import { DoctorRegistrationHeader } from '../../../components/DoctorRegistrationHeader';
import { Button } from '../../../components/Button';
import { Mail, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const DoctorContactStep = () => {
  const navigate = useNavigate();
  const { docRegState, setContactVerified } = useDoctorRegistration();

  const [contact, setContact] = useState(docRegState.contact || 'dr.ananya@example.com');
  const [contactType, setContactType] = useState(docRegState.contactType || 'email');
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

  // Guard: Step 2 Medical registration must be verified
  if (!docRegState.medicalVerified) {
    return <Navigate to="/doctor/register/medical-verification" replace />;
  }

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!contact.trim()) {
      setError('Please enter your email address or mobile number.');
      return;
    }
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      await doctorAuthService.sendContactOTP(contact);
      setOtpSent(true);
      setTimer(30);
      setCanResend(false);
      setInfoMessage(`Verification OTP sent to ${contact}.`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setError('');
    setVerifying(true);

    try {
      await doctorAuthService.verifyContactOTP(contact, otp);
      setSuccessMessage('Contact verified successfully.');
      setContactVerified(contact, contactType);

      setTimeout(() => {
        navigate('/doctor/register/password');
      }, 600);
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#DED2C0] rounded-md text-sm text-[#2F2D29] placeholder-[#A0988A] focus:outline-none focus:ring-2 focus:ring-[#5D6454]/25 focus:border-[#5D6454] transition-colors';

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <DoctorRegistrationHeader
          currentStepId={3}
          title="Contact Verification"
          subtitle="Verify your official contact email or mobile number for clinical alerts."
        />

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FDF2F0] border border-[#F3C4BE] text-[#9A2D23] text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="shrink-0 text-[#C94F45]" size={15} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && !successMessage && (
            <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-[#4E7737]" size={15} strokeWidth={1.75} />
              <span>{infoMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-[#4E7737]" size={15} strokeWidth={1.75} />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#2F2D29]">
                  Email or Mobile Number
                </label>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setContactType('email')}
                    className={`font-medium ${
                      contactType === 'email' ? 'text-[#2F2D29] underline' : 'text-[#8C877C]'
                    }`}
                  >
                    Email
                  </button>
                  <span className="text-[#DED2C0]">|</span>
                  <button
                    type="button"
                    onClick={() => setContactType('mobile')}
                    className={`font-medium ${
                      contactType === 'mobile' ? 'text-[#2F2D29] underline' : 'text-[#8C877C]'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  {contactType === 'email' ? (
                    <Mail size={15} className="absolute left-3 top-3 text-[#A0988A]" />
                  ) : (
                    <Phone size={15} className="absolute left-3 top-3 text-[#A0988A]" />
                  )}
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    placeholder={contactType === 'email' ? 'doctor@example.com' : '+91 98765 11223'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    disabled={otpSent}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || !contact.trim() || otpSent}
                  size="md"
                  variant="primary"
                  className="shrink-0 whitespace-nowrap"
                >
                  {loading ? 'Sending…' : 'Send OTP'}
                </Button>
              </div>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4 pt-2 border-t border-[#E5DDD0]">
              <div>
                <label className="block text-xs font-semibold text-[#2F2D29] mb-1">
                  Enter 6-digit OTP
                </label>
                <p className="text-[11px] text-[#7D786D] mb-2">
                  (For prototype demo, use code <span className="font-mono text-[#2F2D29] font-medium">123456</span>)
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
                {verifying ? 'Verifying…' : 'Verify & Set Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
