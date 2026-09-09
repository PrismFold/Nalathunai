import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderHeart,
  ShieldCheck,
  FilePlus2,
  History,
  Bell,
  User,
  X,
  Lock,
} from 'lucide-react';
import { Logo } from './Logo';

export const navItems = [
  { name: 'Dashboard',        path: '/dashboard',     icon: LayoutDashboard },
  { name: 'My Records',       path: '/records',       icon: FolderHeart },
  { name: 'Request Records',  path: '/request',       icon: FilePlus2 },
  { name: 'Access & Consent', path: '/consent',       icon: ShieldCheck },
  { name: 'Activity',         path: '/activity',      icon: History },
  { name: 'Notifications',    path: '/notifications', icon: Bell },
  { name: 'Profile',          path: '/profile',       icon: User },
];

export const Sidebar = ({ isMobileOpen, onMobileClose }) => {
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
        <div className="text-[10px] font-semibold text-[#969185] uppercase tracking-widest px-3 mb-2 font-mono">
          Patient Portal
        </div>
        {navItems.map((item) => {
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
      <div className="px-4 pb-4 pt-3 border-t border-[#E5DDD0]">
        <div className="flex items-center gap-2 text-xs text-[#787469]">
          <Lock size={13} className="text-[#5D6454] shrink-0" strokeWidth={1.75} />
          <span className="font-medium text-[11px]">End-to-end encrypted</span>
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

