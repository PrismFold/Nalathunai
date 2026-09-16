import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PatientChatbot } from '../components/PatientChatbot';

export const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);

  // Smooth scroll to top when switching pages
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#2F2D29] flex flex-col antialiased">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        <main ref={mainRef} className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto">
          <div key={location.pathname} className="max-w-5xl mx-auto w-full pb-12 page-view-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Interactive AI Medical & Platform Chatbot */}
      <PatientChatbot />
    </div>
  );
};

