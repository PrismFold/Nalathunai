import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  SendHorizontal,
  History,
  Building2,
  X,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { Logo } from './Logo';

export const organizationNavItems = [
  { name: 'Dashboard',         path: '/organization/dashboard',        icon: LayoutDashboard },
  { name: 'Doctors',           path: '/organization/doctors',          icon: Users },
  { name: 'Patients',          path: '/organization/patients',         icon: UserCheck },
  { name: 'Record Requests',   path: '/organization/patient-requests', icon: SendHorizontal },
  { name: 'Access History',    path: '/organization/access-history',   icon: History },
  { name: 'Organization Profile', path: '/organization/profile',       icon: Building2 },
];

export const OrganizationSidebar = ({ isMobileOpen, onMobileClose }) => {
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
          <Building2 size={12} className="text-[#5D6454]" />
          <span className="text-[10px] font-semibold text-[#969185] uppercase tracking-widest font-mono">
            Hospital Administration
          </span>
        </div>
        {organizationNavItems.map((item) => {
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

      {/* ABDM Node & Governance Compliance footer */}
      <div className="px-4 pb-4 pt-3 border-t border-[#E5DDD0] space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#787469]">
          <Shield size={13} className="text-[#5D6454] shrink-0" strokeWidth={1.75} />
          <span className="font-medium text-[11px]">ABDM Tier-1 Node Active</span>
        </div>
        <div className="p-2 bg-[#F4EFE6] rounded-md border border-[#E5DDD0] text-[10px] text-[#787469] leading-tight flex items-start gap-1.5">
          <CheckCircle size={12} className="text-[#4E7737] shrink-0 mt-0.5" />
          <span>Patient-controlled consent architecture strictly enforced for all affiliated clinicians.</span>
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
