import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Check,
  Copy,
  Droplet,
  Lock,
  Smartphone,
  History,
  Shield,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Ananya Ramesh',
    mobile: user?.mobile || '+91 98765 43210',
    email: user?.email || 'ananya.ramesh@example.com',
    emergencyContact: user?.emergencyContact || 'Ramesh Kumar (Father) — +91 98765 00000',
    address: user?.address || '42, Race Course Road, Coimbatore, Tamil Nadu — 641018',
  });
  const [copied, setCopied] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const copyAbha = () => {
    navigator.clipboard.writeText(user?.abhaId || '91-4829-1029-4720');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    'w-full px-3.5 py-2 bg-[#F4EFE6] border border-[#DED2C0] rounded-lg text-xs text-[#2F2D29] focus:bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#A7AA91]/40 focus:border-[#5D6454] transition-colors';

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Page Header */}
      <div className="border-b border-[#E5DDD0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5D6454]" />
            <p className="text-[11px] uppercase tracking-widest text-[#787469] font-mono font-medium">
              Identity &amp; Credentials
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2F2D29] tracking-tight">Patient Profile &amp; Security</h1>
          <p className="text-xs text-[#686358] mt-1 font-light">
            Manage your patient identity, contact information, and security trust settings.
          </p>
        </div>
        {!isEditing ? (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)} icon={Edit2}>
            Edit Profile
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={handleSave} icon={Check}>
            Save
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ABHA Identity Card */}
        <div className="space-y-5">
          {/* Deep Charcoal Editorial Health Card */}
          <div className="bg-[#2F2D29] text-[#F7F3EA] rounded-2xl p-6 space-y-4 shadow-[0_4px_20px_rgba(47,45,41,0.12)] border border-[#2F2D29]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-medium tracking-widest text-[#A7AA91]">ABHA Health ID</span>
              <ShieldCheck size={16} className="text-[#A7AA91]" strokeWidth={1.75} />
            </div>

            <div>
              <p className="text-[11px] text-[#A7AA91] font-light mb-0.5">Patient Name</p>
              <p className="text-xl font-serif font-normal text-[#F7F3EA] tracking-wide">{user?.name || 'Ananya Ramesh'}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3.5 space-y-1 border border-white/10">
              <p className="text-[9px] uppercase font-mono tracking-widest text-[#A7AA91]">ABHA Number</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-sm tracking-wider text-[#F7F3EA]">{user?.abhaId || '91-4829-1029-4720'}</span>
                <button
                  onClick={copyAbha}
                  title="Copy ABHA ID"
                  className="p-1 hover:bg-white/10 rounded transition-colors text-[#A7AA91] hover:text-[#F7F3EA]"
                >
                  <Copy size={13} strokeWidth={1.75} />
                </button>
              </div>
              {copied && <span className="text-[10px] text-[#CFDCB8] font-mono">Copied to clipboard</span>}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs">
              <div>
                <p className="text-[#A7AA91] text-[9px] uppercase font-mono">Date of Birth</p>
                <p className="font-medium mt-0.5 text-[#F7F3EA]">{user?.dob || '14 May 1994'}</p>
              </div>
              <div>
                <p className="text-[#A7AA91] text-[9px] uppercase font-mono">Blood Group</p>
                <p className="font-medium mt-0.5 text-[#EEC4BD] flex items-center gap-1">
                  <Droplet size={12} strokeWidth={1.75} />
                  {user?.bloodGroup || 'O+'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Trust Sidebar Summary */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-serif font-semibold text-[#2F2D29] flex items-center gap-1.5 border-b border-[#EAE3D5] pb-2">
              <Shield size={14} className="text-[#5D6454]" />
              Security Guarantees
            </h3>
            <ul className="space-y-2 text-[11px] text-[#686358] font-light">
              <li className="flex items-start gap-1.5">
                <span className="text-[#5D6454] font-bold">✓</span>
                <span>Your records are protected with client encryption.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#5D6454] font-bold">✓</span>
                <span>Access is based strictly on your consent.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#5D6454] font-bold">✓</span>
                <span>You can revoke access at any time.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#5D6454] font-bold">✓</span>
                <span>Every access is recorded in immutable audit logs.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Personal Info & Security Section (Right 2 Columns) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-serif font-semibold text-[#2F2D29] mb-4 pb-3 border-b border-[#EAE3D5]">
              Personal Information
            </h2>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4B4A3F] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4B4A3F] mb-1.5">Mobile</label>
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4B4A3F] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4B4A3F] mb-1.5">Emergency Contact</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4B4A3F] mb-1.5">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" variant="primary" type="submit" icon={Check}>Save Changes</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Full Name', value: user?.name || 'Ananya Ramesh', icon: User },
                  { label: 'Gender / DOB', value: `${user?.gender || 'Female'} · ${user?.dob || '14 May 1994'}`, icon: null },
                  { label: 'Mobile', value: user?.mobile || '+91 98765 43210', icon: Phone },
                  { label: 'Email', value: user?.email || 'ananya.ramesh@example.com', icon: Mail },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
                    <span className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold block mb-1">{label}</span>
                    <span className="font-semibold text-[#2F2D29] flex items-center gap-1.5">
                      {Icon && <Icon size={12} className="text-[#5D6454] shrink-0" strokeWidth={1.75} />}
                      {value}
                    </span>
                  </div>
                ))}
                <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4] sm:col-span-2">
                  <span className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold block mb-1">Emergency Contact</span>
                  <span className="font-semibold text-[#933D33]">
                    {user?.emergencyContact || 'Ramesh Kumar (Father) — +91 98765 00000'}
                  </span>
                </div>
                <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4] sm:col-span-2">
                  <span className="text-[10px] text-[#8C877C] font-mono uppercase font-semibold block mb-1">Address</span>
                  <span className="font-semibold text-[#2F2D29] flex items-start gap-1.5">
                    <MapPin size={12} className="text-[#5D6454] mt-0.5 shrink-0" strokeWidth={1.75} />
                    {user?.address || '42, Race Course Road, Coimbatore, Tamil Nadu — 641018'}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Security & Authentication Settings */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-serif font-semibold text-[#2F2D29] border-b border-[#EAE3D5] pb-3 flex items-center gap-2">
              <Lock size={15} className="text-[#5D6454]" />
              Security &amp; Verification
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-[#5D6454]" />
                  <div>
                    <div className="font-medium text-[#2F2D29]">Two-Factor Authentication</div>
                    <div className="text-[11px] text-[#787469] font-light">Aadhaar OTP + Email Verification enabled</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#425938] bg-[#EBF0E6] px-2.5 py-0.5 rounded-md border border-[#CFDCB8]">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-[#5D6454]" />
                  <div>
                    <div className="font-medium text-[#2F2D29]">Account Password</div>
                    <div className="text-[11px] text-[#787469] font-light">Last changed 14 days ago</div>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => alert('Password change request simulated.')}>
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8E1D4]">
                <div className="flex items-center gap-3">
                  <History size={16} className="text-[#5D6454]" />
                  <div>
                    <div className="font-medium text-[#2F2D29]">Current Login Session</div>
                    <div className="text-[11px] text-[#787469] font-light">Windows Web Browser · Active session</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#8C877C]">IP: 182.72.xx.xx</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
