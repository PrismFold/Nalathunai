import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { WebhookStatusBadge } from './WebhookStatusBadge';
import { Logo } from './Logo';

export const Header = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#FAF7F2] border-b border-[#E5DDD0] sticky top-0 z-30">
      <div className="px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
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

        {/* Right: Webhook Badge, Notifications, Patient, Logout */}
        <div className="flex items-center gap-4">
          <WebhookStatusBadge compact={false} />

          <div className="h-5 w-px bg-[#E5DDD0] hidden sm:block" />

          <NotificationDropdown />

          <div className="h-5 w-px bg-[#E5DDD0] hidden sm:block" />

          {/* Patient identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2F2D29] text-[#F7F3EA] font-semibold text-xs flex items-center justify-center shrink-0 tracking-wide">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('') : <User size={14} />}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-[#2F2D29] leading-tight">{user?.name || 'Patient'}</span>
              <span className="text-[10px] text-[#8C877C] font-mono">ABHA: {user?.abhaId || '—'}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            aria-label="Logout"
            title="Log out"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#686358] hover:text-[#933D33] hover:bg-[#F7EBE8] rounded-lg transition-colors"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

