import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  CheckCircle2,
  Shield,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  Calendar,
  Lock,
} from 'lucide-react';

export const DoctorProfilePage = () => {
  const { user } = useAuth();

  const doctorName = user?.name || 'Dr. Ananya Kumar';
  const regNumber = user?.registrationNumber || 'TN-MED-00123';
  const council = user?.council || 'Tamil Nadu Medical Council';
  const qualification = user?.qualification || 'MBBS, MD (General Medicine)';
  const specialty = user?.specialty || 'Internal Medicine & Chronic Disease Care';
  const hospital = user?.hospital || 'PSG Institute of Medical Sciences & Research';
  const email = user?.email || 'dr.ananya@example.com';
  const mobile = user?.mobile || '+91 98765 11223';
  const status = user?.status || 'Verified';
  const accountStatus = user?.accountStatus || 'Active';
  const aadhaarLastFour = user?.aadhaarLastFour || '8921';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="border-b border-[#E5DDD0] pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
          <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
            Practitioner Account
          </p>
        </div>
        <h1 className="text-3xl font-serif font-normal text-[#2F2D29] tracking-tight">
          Doctor Profile
        </h1>
        <p className="text-xs text-[#686358] mt-1">
          Your verified medical credentials and Nalathunai practitioner account status.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Practitioner Bio Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DDD0]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2F2D29] text-[#F7F3EA] flex items-center justify-center font-serif text-2xl font-medium shrink-0">
              {doctorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-semibold text-[#2F2D29]">
                  {doctorName}
                </h2>
                <span className="px-2.5 py-0.5 bg-[#EFF4EA] border border-[#C5D9B4] text-[#345124] rounded-full text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#4E7737]" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#686358] mt-0.5">{qualification}</p>
              <p className="text-xs text-[#5D6454] font-medium">{specialty}</p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-xs">
            <span className="text-[10px] uppercase font-mono text-[#8C877C] font-semibold">
              Account Status
            </span>
            <span className="px-2.5 py-0.5 bg-[#EFF4EA] text-[#345124] rounded border border-[#C5D9B4] font-semibold text-xs inline-block self-start sm:self-auto">
              {accountStatus}
            </span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase font-mono text-[#7D786D] tracking-wider">
            Medical Council Credentials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">Medical Registration Number</span>
              <span className="font-mono font-semibold text-sm text-[#2F2D29]">{regNumber}</span>
            </div>

            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">State Medical Council</span>
              <span className="font-medium text-[#2F2D29]">{council}</span>
            </div>

            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">Affiliated Healthcare Facility</span>
              <span className="font-medium text-[#2F2D29]">{hospital}</span>
            </div>

            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">Verification Status</span>
              <div className="flex items-center gap-1.5 text-[#345124] font-semibold">
                <CheckCircle2 size={13} className="text-[#4E7737]" />
                <span>Verified against State Medical Registry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Identity Grid */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold uppercase font-mono text-[#7D786D] tracking-wider">
            Contact &amp; Identity Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">Registered Email</span>
              <div className="flex items-center gap-1.5 font-medium text-[#2F2D29]">
                <Mail size={13} className="text-[#8C877C]" />
                <span>{email}</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">Registered Mobile</span>
              <div className="flex items-center gap-1.5 font-medium text-[#2F2D29]">
                <Phone size={13} className="text-[#8C877C]" />
                <span>{mobile}</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">Aadhaar Identity Proof</span>
              <div className="flex items-center gap-1.5 font-mono text-[#2F2D29]">
                <Shield size={13} className="text-[#5D6454]" />
                <span>•••• •••• {aadhaarLastFour} (Verified)</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-[#E5DDD0] rounded-xl space-y-1">
              <span className="text-[10px] text-[#8C877C] block">Role &amp; Permissions</span>
              <div className="flex items-center gap-1.5 font-mono text-[#5D6454] font-medium">
                <Lock size={13} />
                <span>Doctor (Consent-Restricted)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
