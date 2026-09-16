import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDoctorRegistration } from '../../../context/DoctorRegistrationContext';
import { Logo } from '../../../components/Logo';
import { Button } from '../../../components/Button';
import { CheckCircle2, ArrowRight, Stethoscope } from 'lucide-react';

export const DoctorSuccessStep = () => {
  const navigate = useNavigate();
  const { docRegState, resetDoctorRegistration } = useDoctorRegistration();

  // Guard: Step 4 Account creation must be complete
  if (!docRegState.accountCreated) {
    return <Navigate to="/login?role=doctor" replace />;
  }

  const handleGoToLogin = () => {
    resetDoctorRegistration();
    navigate('/login?role=doctor');
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-7">
          <Logo size="large" />
        </div>

        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl shadow-sm overflow-hidden p-8 space-y-5">
          <div className="w-16 h-16 bg-[#EFF4EA] border border-[#C5D9B4] rounded-full flex items-center justify-center mx-auto text-[#4E7737]">
            <CheckCircle2 size={32} strokeWidth={2} />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#EEE8DC] border border-[#DED2C0] rounded-full text-[10px] font-mono text-[#5D6454] font-medium mb-1">
              <Stethoscope size={11} />
              <span>Practitioner Account Created</span>
            </div>
            <h1 className="text-2xl font-serif font-medium text-[#2F2D29] tracking-tight">
              Doctor Account Ready
            </h1>
            <p className="text-xs text-[#7D786D] leading-relaxed max-w-xs mx-auto">
              Your Nalathunai practitioner account has been verified and created. You can now sign in to access your doctor workspace.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleGoToLogin}
              fullWidth
              size="lg"
              icon={ArrowRight}
            >
              Sign In to Doctor Portal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
