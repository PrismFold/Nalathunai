import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  History,
  User,
  X,
  Lock,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Logo } from './Logo';

export const doctorNavItems = [
  { name: 'Dashboard',         path: '/doctor/dashboard',        icon: LayoutDashboard },
  { name: 'Find Patient',      path: '/doctor/patients',         icon: Search },
  { name: 'Consent Requests',  path: '/doctor/consent-requests', icon: ShieldCheck },
  { name: 'Access History',    path: '/doctor/access-history',   icon: History },
  { name: 'Profile',           path: '/doctor/profile',          icon: User },
];

export const DoctorSidebar = ({ isMobileOpen, onMobileClose }) => {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs tracking-wide transition-all duration-150 ${
      isActive
        ? 'bg-[#EEE8DC] text-[#2F2D29] font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
        : 'text-[#6B665C] hover:bg-[#F4EFE6] hover:text-[#2F2D29] font-normal'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-[#E5DDD0] flex items-center justify-between">
        <Logo size="medium" />
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-[#787469] hover:text-[#2F2D29] hover:bg-[#EFEAE0] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="flex items-center gap-1.5 px-3 mb-2">
          <Stethoscope size={12} className="text-[#5D6454]" />
          <span className="text-[10px] font-semibold text-[#969185] uppercase tracking-widest font-mono">
            Doctor Portal
          </span>
        </div>
        {doctorNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={linkClasses}
            >
              <Icon size={16} className="shrink-0 text-[#787469]" strokeWidth={1.75} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Security note footer */}
      <div className="px-4 pb-4 pt-3 border-t border-[#E5DDD0] space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#787469]">
          <Lock size={13} className="text-[#5D6454] shrink-0" strokeWidth={1.75} />
          <span className="font-medium text-[11px]">Consent-governed access</span>
        </div>
        <div className="p-2 bg-[#F4EFE6] rounded-md border border-[#E5DDD0] text-[10px] text-[#787469] leading-tight">
          Strict consent verification enforced for all patient medical record views.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[#E5DDD0] bg-[#FAF7F2] min-h-[calc(100vh-61px)] shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#2F2D29]/40 backdrop-blur-xs"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#FAF7F2] shadow-xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
