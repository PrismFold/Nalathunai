import React from 'react';
import { Logo } from './Logo';

export const doctorStepsList = [
  { id: 1, key: 'identity', label: '01 Identity', path: '/doctor/register/identity' },
  { id: 2, key: 'medical', label: '02 Medical Registration', path: '/doctor/register/medical-verification' },
  { id: 3, key: 'contact', label: '03 Contact', path: '/doctor/register/contact' },
  { id: 4, key: 'password', label: '04 Password', path: '/doctor/register/password' },
];

export const DoctorRegistrationHeader = ({ currentStepId, title, subtitle }) => {
  return (
    <div className="text-center mb-6">
      {/* Brand Logo */}
      <div className="flex justify-center mb-5">
        <Logo size="large" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEE8DC] border border-[#DED2C0] rounded-full text-[11px] font-mono text-[#5D6454] font-medium mb-4">
        <span>Practitioner Onboarding</span>
      </div>

      {/* Minimal Stepper: 01 Identity → 02 Medical Registration → 03 Contact → 04 Password */}
      <div className="flex items-center justify-center gap-1 text-xs mb-7 text-stone-400 flex-wrap">
        {doctorStepsList.map((step, idx) => {
          const isActive = step.id === currentStepId;
          const isCompleted = step.id < currentStepId;

          return (
            <React.Fragment key={step.id}>
              <span
                className={`transition-colors font-medium px-1 ${
                  isActive
                    ? 'text-[#2F2D29] font-semibold'
                    : isCompleted
                    ? 'text-[#7D786D] font-medium'
                    : 'text-[#C5BDB0]'
                }`}
              >
                {step.label}
              </span>
              {idx < doctorStepsList.length - 1 && (
                <span className="text-[#DED2C0] mx-0.5">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Title & Subtitle */}
      {title && (
        <h1 className="text-2xl font-serif font-medium text-[#2F2D29] tracking-tight mb-1.5">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-xs text-[#7D786D] max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
