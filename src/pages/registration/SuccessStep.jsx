import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useRegistration } from '../../context/RegistrationContext';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const SuccessStep = () => {
  const navigate = useNavigate();
  const { regState, resetRegistration } = useRegistration();

  // Guard: Step 4 Account creation must be complete
  if (!regState.accountCreated) {
    return <Navigate to="/login" replace />;
  }

  const handleGoToLogin = () => {
    resetRegistration();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-full max-w-sm">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-8 space-y-5">
          {/* Muted Sage Checkmark Icon */}
          <div className="w-16 h-16 bg-[#EFF4EA] border border-[#C5D9B4] rounded-full flex items-center justify-center mx-auto text-[#4E7737]">
            <CheckCircle2 size={32} strokeWidth={2} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-serif font-medium text-[#2F2D29] tracking-tight">
              Your account is ready
            </h1>
            <p className="text-xs text-[#7D786D] leading-relaxed max-w-xs mx-auto">
              Your Nalathunai account has been created successfully. You can now sign in with your email and password.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleGoToLogin}
              fullWidth
              size="lg"
              icon={ArrowRight}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
