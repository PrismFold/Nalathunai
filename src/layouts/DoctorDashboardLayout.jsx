import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DoctorHeader } from '../components/DoctorHeader';
import { DoctorSidebar } from '../components/DoctorSidebar';

export const DoctorDashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#2F2D29] flex flex-col antialiased">
      <DoctorHeader onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <DoctorSidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
