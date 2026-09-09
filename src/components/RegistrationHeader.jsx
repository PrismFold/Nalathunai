import React from 'react';
import { Logo } from './Logo';

export const stepsList = [
  { id: 1, key: 'identity', label: '01 Identity', path: '/register' },
  { id: 2, key: 'details', label: '02 Details', path: '/register/details' },
  { id: 3, key: 'email', label: '03 Email', path: '/register/email-verification' },
  { id: 4, key: 'password', label: '04 Password', path: '/register/password' },
];

export const RegistrationHeader = ({ currentStepId, title, subtitle }) => {
  return (
    <div className="text-center mb-6">
      {/* Brand Logo */}
      <div className="flex justify-center mb-6">
        <Logo size="large" />
      </div>

      {/* Minimal Stepper */}
      <div className="flex items-center justify-center gap-1 text-xs mb-8 text-stone-400">
        {stepsList.map((step, idx) => {
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
              {idx < stepsList.length - 1 && (
                <span className="text-[#DED2C0] mx-0.5">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Header Title & Subtitle */}
      {title && (
        <h1 className="text-2xl font-serif font-medium text-[#2F2D29] tracking-tight mb-1.5">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-xs text-[#7D786D] max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
