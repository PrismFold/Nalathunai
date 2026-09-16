import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import {
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  FileText,
  Shield,
  History,
  Bell,
  Check,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consentAction, setConsentAction] = useState(null); // 'allowed' | 'denied' | null

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#2F2D29] font-sans flex flex-col selection:bg-[#A7AA91]/30 selection:text-[#2F2D29]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[#F7F3EA]/90 backdrop-blur-md border-b border-[#E5DDD0]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo Left */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-7 h-7 rounded bg-[#2F2D29] text-[#F7F3EA] flex items-center justify-center">
              <ShieldCheck size={16} strokeWidth={2} />
            </div>
            <span className="font-serif font-semibold text-[#2F2D29] text-base tracking-wide">
              NALATHUNAI
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#787469]">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#2F2D29] transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#2F2D29] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-[#2F2D29] transition-colors"
            >
              About
            </button>
          </nav>

          {/* Action Right: Multi-Portal Quick Entry */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#D5CDBC] text-[#2F2D29] hover:bg-[#EAE3D5] transition-colors"
            >
              Doctor &amp; Hospital Portals
            </button>
            <button
              onClick={() => navigate('/login?role=doctor')}
              className="text-xs font-medium text-[#5D6454] hover:text-[#2F2D29] transition-colors"
            >
              Doctor Portal
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#2F2D29] text-[#F7F3EA] hover:bg-[#1f1e1b] transition-colors"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#787469] hover:text-[#2F2D29]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-b border-[#E5DDD0] px-6 py-4 space-y-3 text-xs font-medium text-[#686358]">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-1.5 hover:text-[#2F2D29]"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-1.5 hover:text-[#2F2D29]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-1.5 hover:text-[#2F2D29]"
            >
              About
            </button>
            <div className="pt-2 border-t border-[#E5DDD0] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login?role=doctor');
                }}
                className="text-xs font-medium text-[#5D6454] text-left"
              >
                Doctor Portal
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(isAuthenticated ? '/dashboard' : '/login');
                }}
                className="text-xs font-semibold text-[#2F2D29] text-left"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Hero Header Content */}
          <div className="max-w-3xl space-y-6">
            <div className="text-[11px] font-mono font-medium text-[#787469] tracking-widest uppercase">
              PATIENT-CONTROLLED HEALTH RECORDS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#2F2D29] leading-[1.12] tracking-tight">
              Your health. Your records.{' '}
              <span className="text-[#5D6454] font-normal italic">Your control.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#686358] leading-relaxed max-w-2xl font-light">
              Healthcare records shouldn't be scattered across hospitals, apps and paper files. Nalathunai brings them together and puts access back in the patient's hands.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                variant="primary"
              >
                Access Patient Portal
              </Button>
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-semibold text-[#0f5257] bg-[#E8F0EE] hover:bg-[#D5E6E3] px-3.5 py-2.5 rounded-lg border border-[#BCD9D4] flex items-center gap-1.5 transition-colors"
              >
                Doctor &amp; Hospital Sign In <ArrowRight size={14} />
              </button>
            </div>

            {/* Direct Portal Switcher Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="p-3.5 bg-[#FAF7F2] hover:bg-white border border-[#E5DDD0] hover:border-[#0f5257] rounded-xl text-left transition-all group shadow-xs"
              >
                <div className="text-xs font-bold text-[#2F2D29] group-hover:text-[#0f5257] flex items-center justify-between">
                  <span>Patient Portal</span>
                  <ArrowRight size={13} className="text-stone-400 group-hover:text-[#0f5257] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-[#787469] mt-1">
                  Consent records, manage digital health wallet &amp; OTP access
                </p>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="p-3.5 bg-[#FAF7F2] hover:bg-white border border-[#E5DDD0] hover:border-[#0f5257] rounded-xl text-left transition-all group shadow-xs"
              >
                <div className="text-xs font-bold text-[#2F2D29] group-hover:text-[#0f5257] flex items-center justify-between">
                  <span>Doctor Portal</span>
                  <ArrowRight size={13} className="text-stone-400 group-hover:text-[#0f5257] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-[#787469] mt-1">
                  Search patients, request file consent &amp; view clinical summaries
                </p>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="p-3.5 bg-[#FAF7F2] hover:bg-white border border-[#E5DDD0] hover:border-[#1e3a5f] rounded-xl text-left transition-all group shadow-xs"
              >
                <div className="text-xs font-bold text-[#2F2D29] group-hover:text-[#1e3a5f] flex items-center justify-between">
                  <span>Hospital / Org</span>
                  <ArrowRight size={13} className="text-stone-400 group-hover:text-[#1e3a5f] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-[#787469] mt-1">
                  Roster doctors, audit patient record governance &amp; partitions
                </p>
              </button>
            </div>
          </div>

          {/* Hero Visual: Health Record Timeline + Who Can Access */}
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(47,45,41,0.03)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Health Record Timeline */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
                  <span className="text-xs font-mono font-medium text-[#8C877C]">2026 ARCHIVE</span>
                  <span className="text-[11px] font-mono text-[#8C877C]">4 Verified Documents</span>
                </div>

                <div className="space-y-5 font-sans">
                  {/* Timeline Entry 1 */}
                  <div className="flex items-start gap-4 text-xs">
                    <div className="w-16 shrink-0 text-[#8C877C] font-mono text-[11px] pt-0.5">02 SEP</div>
                    <div className="flex-1 pb-4 border-b border-[#EFEAE0] space-y-0.5">
                      <div className="font-semibold text-[#2F2D29]">Blood Test (CBC & Lipid Profile)</div>
                      <div className="text-[#787469] text-[11px]">PSG Hospital · Dr. S. Malathi</div>
                    </div>
                  </div>

                  {/* Timeline Entry 2 */}
                  <div className="flex items-start gap-4 text-xs">
                    <div className="w-16 shrink-0 text-[#8C877C] font-mono text-[11px] pt-0.5">28 AUG</div>
                    <div className="flex-1 pb-4 border-b border-[#EFEAE0] space-y-0.5">
                      <div className="font-semibold text-[#2F2D29]">Prescription — Cardiology</div>
                      <div className="text-[#787469] text-[11px]">City Hospital · Dr. Ramesh K</div>
                    </div>
                  </div>

                  {/* Timeline Entry 3 */}
                  <div className="flex items-start gap-4 text-xs">
                    <div className="w-16 shrink-0 text-[#8C877C] font-mono text-[11px] pt-0.5">20 AUG</div>
                    <div className="flex-1 pb-4 border-b border-[#EFEAE0] space-y-0.5">
                      <div className="font-semibold text-[#2F2D29]">Consultation Summary</div>
                      <div className="text-[#787469] text-[11px]">ABC Clinic · Dr. Arun V</div>
                    </div>
                  </div>

                  {/* Timeline Entry 4 */}
                  <div className="flex items-start gap-4 text-xs">
                    <div className="w-16 shrink-0 text-[#8C877C] font-mono text-[11px] pt-0.5">12 AUG</div>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-semibold text-[#2F2D29]">Diagnostic MRI Scan Report</div>
                      <div className="text-[#787469] text-[11px]">XYZ Hospital · Radiology Dept</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Access Indicator Sidebar */}
              <div className="lg:col-span-5 bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl p-5 space-y-4">
                <div className="text-[11px] font-mono font-medium text-[#787469] uppercase tracking-wider border-b border-[#E5DDD0] pb-2.5">
                  WHO CAN ACCESS YOUR RECORDS?
                </div>

                <div className="space-y-3 text-xs">
                  {/* Access Item 1 */}
                  <div className="flex items-center justify-between p-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2F2D29]" />
                      <span className="font-semibold text-[#2F2D29]">You (Patient)</span>
                    </div>
                    <span className="text-[10px] text-[#8C877C] font-mono">Owner</span>
                  </div>

                  {/* Access Item 2 */}
                  <div className="flex items-center justify-between p-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#425938]" />
                      <div>
                        <div className="font-semibold text-[#2F2D29]">Dr. Arun</div>
                        <div className="text-[10px] text-[#787469]">Cardiology · 30 days</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#425938] bg-[#EBF0E6] px-2 py-0.5 rounded-md border border-[#CFDCB8]">
                      Active
                    </span>
                  </div>

                  {/* Access Item 3 */}
                  <div className="flex items-center justify-between p-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#865F1D]" />
                      <div>
                        <div className="font-semibold text-[#2F2D29]">ABC Hospital</div>
                        <div className="text-[10px] text-[#787469]">General OPD</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#865F1D] bg-[#FBF1E2] px-2 py-0.5 rounded-md border border-[#EAD7B0]">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#8C877C] flex items-center justify-between border-t border-[#E5DDD0]">
                  <span>All access is logged</span>
                  <span className="text-[#5D6454] font-medium font-mono text-[10px]">ABHA Compliant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Micro Detail: 3 Trust Statements */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 py-4 border-y border-[#E5DDD0] text-xs text-[#686358] font-mono">
            <span>PATIENT OWNED</span>
            <span className="hidden sm:inline text-[#DED2C0]">·</span>
            <span>CONSENT BASED</span>
            <span className="hidden sm:inline text-[#DED2C0]">·</span>
            <span>ACCESS YOU CONTROL</span>
          </div>
        </div>
      </section>

      {/* Problem Section: Editorial Split */}
      <section id="about" className="py-20 bg-[#FAF7F2] border-b border-[#E5DDD0]">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Large Statement */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-[11px] font-mono font-medium text-[#787469] tracking-widest uppercase">
                THE PROBLEM
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#2F2D29] leading-snug tracking-tight">
                "Your medical history exists in more places than you do."
              </h2>
            </div>

            {/* Right: Fragmented List Connected by Thin Lines */}
            <div className="lg:col-span-7 space-y-4 border-l border-[#E5DDD0] pl-6 sm:pl-8">
              {[
                { source: 'Hospital A', target: 'Consultation Records' },
                { source: 'Hospital B', target: 'Lab Test Reports' },
                { source: 'Diagnostic Centre', target: 'Imaging & MRI Scans' },
                { source: 'Pharmacy', target: 'Prescription History' },
                { source: 'Personal files', target: 'Old Physical Reports' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2.5 border-b border-[#EFEAE0]">
                  <span className="font-semibold text-[#2F2D29]">{item.source}</span>
                  <span className="text-[#A7AA91] font-mono">→</span>
                  <span className="text-[#686358] font-medium">{item.target}</span>
                </div>
              ))}

              <div className="pt-6">
                <p className="text-sm font-serif italic text-[#5D6454]">
                  Nalathunai brings them together under your sovereign consent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution: Simplified Record Timeline */}
      <section className="py-20 px-6 bg-[#F7F3EA]">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight leading-snug">
              One health history.<br />
              One place.<br />
              <span className="text-[#5D6454] font-normal italic">Your decision.</span>
            </h2>
          </div>

          {/* Timeline Process Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', label: 'Record received', desc: 'Hospitals and diagnostic labs send records directly into your locker.' },
              { num: '02', label: 'Record organized', desc: 'Automated categorisation by date, provider, and document type.' },
              { num: '03', label: 'Patient reviews', desc: 'View your health summary and pending provider requests.' },
              { num: '04', label: 'Patient decides access', desc: 'Grant or deny specific records to doctors for fixed durations.' },
            ].map((step) => (
              <div key={step.num} className="border border-[#E5DDD0] bg-[#FAF7F2] rounded-xl p-5 space-y-3 shadow-[0_1px_3px_rgba(47,45,41,0.02)]">
                <span className="text-xs font-mono font-semibold text-[#5D6454]">{step.num}</span>
                <div className="font-semibold text-[#2F2D29] text-sm">{step.label}</div>
                <p className="text-xs text-[#787469] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consent Core Differentiator Section */}
      <section className="py-20 px-6 bg-[#FAF7F2] border-y border-[#E5DDD0]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="text-[11px] font-mono font-medium text-[#787469] tracking-widest uppercase">
              CORE CONCEPT
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight">
              Access is not assumed.<br />
              <span className="text-[#5D6454] font-normal italic">It is given.</span>
            </h2>
          </div>

          {/* Minimal Consent Interface UI */}
          <div className="max-w-md bg-[#F4EFE6] border border-[#E5DDD0] rounded-2xl p-6 space-y-5 shadow-[0_1px_4px_rgba(47,45,41,0.03)]">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <div>
                <div className="font-semibold text-[#2F2D29] text-sm">ABC Hospital</div>
                <div className="text-[11px] text-[#787469]">Dr. Rajesh V · Cardiology OPD</div>
              </div>
              <span className="text-[10px] font-semibold text-[#865F1D] bg-[#FBF1E2] border border-[#EAD7B0] px-2.5 py-0.5 rounded-md">
                Access Request
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#686358] font-sans">
              <div className="flex justify-between py-1 border-b border-[#EFEAE0]">
                <span className="text-[#8C877C]">Requested:</span>
                <span className="font-medium text-[#2F2D29]">Medical records</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFEAE0]">
                <span className="text-[#8C877C]">Duration:</span>
                <span className="font-medium text-[#2F2D29]">30 days</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8C877C]">Scope:</span>
                <span className="font-medium text-[#2F2D29]">Consultations, Lab reports</span>
              </div>
            </div>

            {/* Action buttons preview */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConsentAction('denied')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                  consentAction === 'denied'
                    ? 'bg-[#F7EBE8] border-[#EEC4BD] text-[#933D33]'
                    : 'bg-[#FAF7F2] border-[#DED2C0] text-[#4B4A3F] hover:bg-[#EFEAE0]'
                }`}
              >
                {consentAction === 'denied' ? 'Access Denied' : 'Deny'}
              </button>

              <button
                onClick={() => setConsentAction('allowed')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  consentAction === 'allowed'
                    ? 'bg-[#425938] text-white'
                    : 'bg-[#2F2D29] hover:bg-[#1E1D1A] text-[#F7F3EA]'
                }`}
              >
                {consentAction === 'allowed' ? 'Access Granted' : 'Allow access'}
              </button>
            </div>

            {consentAction && (
              <div className="text-[11px] text-[#787469] text-center flex items-center justify-center gap-1 font-mono">
                <Check size={13} className="text-[#425938]" />
                <span>Demo action executed. Patient control enforced.</span>
              </div>
            )}
          </div>

          <p className="text-sm text-[#686358] max-w-lg leading-relaxed font-light">
            You decide who gets access, what they can see, and for how long. Permissions can be updated or revoked instantly at any time.
          </p>
        </div>
      </section>

      {/* How It Works: Numbered Editorial Layout */}
      <section id="how-it-works" className="py-20 px-6 bg-[#F7F3EA]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-[11px] font-mono font-medium text-[#787469] tracking-widest uppercase">
            HOW IT WORKS
          </div>

          <div className="space-y-8">
            {[
              {
                num: '01',
                title: 'BRING TOGETHER',
                desc: 'Your healthcare records are organized in one place from multiple clinics, hospitals, and laboratories.',
              },
              {
                num: '02',
                title: 'REVIEW',
                desc: 'See what records are available and review exactly who is requesting access to your history.',
              },
              {
                num: '03',
                title: 'DECIDE',
                desc: 'Approve, deny, or revoke access whenever you choose with complete transparency.',
              },
            ].map((item) => (
              <div key={item.num} className="pt-6 border-t border-[#E5DDD0] grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                <div className="md:col-span-2 text-2xl font-mono font-light text-[#A7AA91]">
                  {item.num}
                </div>
                <div className="md:col-span-4 text-base font-serif font-semibold text-[#2F2D29] tracking-tight">
                  {item.title}
                </div>
                <div className="md:col-span-6 text-xs text-[#686358] leading-relaxed">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features: 2x2 Grid Layout */}
      <section id="features" className="py-20 px-6 bg-[#FAF7F2] border-t border-[#E5DDD0]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-[11px] font-mono font-medium text-[#787469] tracking-widest uppercase">
            PLATFORM FEATURES
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-[#E5DDD0] rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#E5DDD0] bg-[#FAF7F2]">
            {/* Feature 1 */}
            <div className="p-8 space-y-3">
              <FileText size={18} className="text-[#5D6454]" strokeWidth={1.75} />
              <div className="font-serif font-semibold text-[#2F2D29] text-base">Unified Records</div>
              <p className="text-xs text-[#787469] leading-relaxed">
                Your health history in one place — prescriptions, lab test reports, scans, and doctor notes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 space-y-3">
              <Shield size={18} className="text-[#5D6454]" strokeWidth={1.75} />
              <div className="font-serif font-semibold text-[#2F2D29] text-base">Consent Management</div>
              <p className="text-xs text-[#787469] leading-relaxed">
                Control access to your information with strict time boundaries and granular record selection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 space-y-3 border-t border-[#E5DDD0]">
              <History size={18} className="text-[#5D6454]" strokeWidth={1.75} />
              <div className="font-serif font-semibold text-[#2F2D29] text-base">Activity History</div>
              <p className="text-xs text-[#787469] leading-relaxed">
                See how your records are being accessed with a transparent, unalterable activity audit log.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 space-y-3 border-t border-[#E5DDD0]">
              <Bell size={18} className="text-[#5D6454]" strokeWidth={1.75} />
              <div className="font-serif font-semibold text-[#2F2D29] text-base">Notifications</div>
              <p className="text-xs text-[#787469] leading-relaxed">
                Know immediately when a healthcare provider or hospital requests access to your records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-[#F7F3EA] border-t border-[#E5DDD0]">
        <div className="max-w-5xl mx-auto border border-[#E5DDD0] bg-[#FAF7F2] rounded-2xl p-10 sm:p-16 text-center space-y-6 shadow-[0_1px_4px_rgba(47,45,41,0.03)]">
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight leading-tight">
            Your health records.<br />
            <span className="text-[#5D6454] font-normal italic">Your decision.</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#787469] max-w-md mx-auto leading-relaxed">
            Nalathunai gives patients a simpler way to manage and share their healthcare history.
          </p>

          <div>
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              variant="primary"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-[#F7F3EA] border-t border-[#E5DDD0] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-serif font-semibold text-[#2F2D29] text-sm tracking-wide">
              NALATHUNAI
            </div>
            <div className="text-[11px] text-[#8C877C]">
              Patient-controlled health records platform.
            </div>
          </div>

          <nav className="flex items-center gap-6 text-xs text-[#787469] font-medium">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#2F2D29] transition-colors">
              How it works
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#2F2D29] transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-[#2F2D29] transition-colors">
              About
            </button>
            <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')} className="text-[#2F2D29] font-semibold hover:underline">
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};
