import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const DoctorHeader = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const doctorName = user?.name || 'Dr. Ananya Kumar';
  const regNumber = user?.registrationNumber || 'TN-MED-00123';

  return (
    <header className="bg-[#FAF7F2] border-b border-[#E5DDD0] sticky top-0 z-30">
      <div className="px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-lg text-[#5A574E] hover:bg-[#EFEAE0] transition-colors"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <Logo size="small" />
            <span className="font-serif font-semibold text-[#2F2D29] text-base tracking-tight">Nalathunai</span>
          </div>
        </div>

        {/* Right: Doctor identity, Verified status, Logout */}
        <div className="flex items-center gap-4">
          {/* Medical Registration Verified Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-full text-xs">
            <CheckCircle2 size={13} className="text-[#4E7737] shrink-0" strokeWidth={2} />
            <span className="font-mono text-[11px] font-semibold">{regNumber}</span>
            <span className="text-[10px] text-[#4E7737] uppercase font-semibold">Verified</span>
          </div>

          <div className="h-5 w-px bg-[#E5DDD0] hidden sm:block" />

          {/* Doctor Profile Area */}
          <div
            onClick={() => navigate('/doctor/profile')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#3F4337] text-[#F7F3EA] font-semibold text-xs flex items-center justify-center shrink-0 tracking-wide">
              {doctorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#2F2D29] leading-tight">{doctorName}</span>
              <span className="text-[10px] text-[#8C877C] font-mono">{user?.specialty || 'General Practitioner'}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Logout"
            title="Log out"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#686358] hover:text-[#933D33] hover:bg-[#F7EBE8] rounded-lg transition-colors ml-1"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
