import React from 'react';
import { Shield } from 'lucide-react';

export const Logo = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-6 h-6 rounded bg-[#2F2D29] text-[#F7F3EA] flex items-center justify-center shrink-0">
        <Shield size={13} strokeWidth={1.75} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-[#2F2D29] tracking-widest uppercase text-xs">
          NALATHUNAI
        </span>
        <span className="text-[9px] uppercase font-mono tracking-widest text-[#A7AA91]">
          PATIENT
        </span>
      </div>
    </div>
  );
};
