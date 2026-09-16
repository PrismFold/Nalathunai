import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalDoctorService } from '../services/hospitalDoctorService';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import {
  Building2,
  Award,
  MapPin,
  Mail,
  Phone,
  Lock,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Database,
} from 'lucide-react';

const FACILITY_TYPES = [
  'Multispecialty Hospital',
  'Tertiary Care & Super Specialty',
  'Teaching & Research Hospital',
  'Cardiology & Surgical Center',
  'Orthopedic Specialty Hospital',
  'Diagnostic & Pathology Network',
  'Community Healthcare Center',
];

const SUPABASE_PARTITIONS = [
  { table: 'ganga_hospital', label: 'Ganga Hospital Partition Table' },
  { table: 'kmch_hospital', label: 'KMCH Hospital Partition Table' },
  { table: 'kongunad_hospital', label: 'Kongunad Hospital Partition Table' },
  { table: 'psg_hospital', label: 'PSG Hospital Partition Table' },
  { table: 'sri_ramakrishna_hospital', label: 'Sri Ramakrishna Hospital Partition Table' },
];

export const HospitalRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    licenseNo: '',
    hospitalType: 'Multispecialty Hospital',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '',
    bedCount: '350',
    accreditation: 'NABH Certified',
    supabaseTable: 'ganga_hospital',
    adminName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.licenseNo.trim() || !formData.email.trim() || !formData.adminName.trim() || !formData.password) {
      setError('Please fill in all required organization details.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const newHospital = await hospitalDoctorService.registerHospital({
        name: formData.name,
        licenseNo: formData.licenseNo,
        hospitalType: formData.hospitalType,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        bedCount: formData.bedCount,
        accreditation: formData.accreditation,
        supabaseTable: formData.supabaseTable,
        adminName: formData.adminName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setSuccess(true);
      await login(newHospital.email, formData.password, 'hospital');
      setTimeout(() => {
        navigate('/organization/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Hospital registration failed. Please review your credentials.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors';

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        
        {/* Navigation back */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
          <Logo size="small" />
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#1e3a5f]/10 via-[#1e3a5f]/5 to-transparent border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center shadow-sm">
                <Building2 size={20} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-900">Hospital &amp; Healthcare Organization Onboarding</h1>
                <p className="text-xs text-stone-500">
                  Register your medical institution, partition tables, and doctor governance network
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-stone-900">Hospital Organization Registered!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Facility license verified. Connecting to your organization command center and doctor roster...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                    <ShieldCheck className="shrink-0 text-rose-400" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Institution Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Hospital / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kovai Care Medical Center"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      NABH / State License Number *
                    </label>
                    <div className="relative">
                      <Award size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. NABH-TN-CBE-189"
                        value={formData.licenseNo}
                        onChange={(e) => handleChange('licenseNo', e.target.value)}
                        className={`${inputClass} pl-10 uppercase`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Facility Classification *
                    </label>
                    <select
                      value={formData.hospitalType}
                      onChange={(e) => handleChange('hospitalType', e.target.value)}
                      className={inputClass}
                    >
                      {FACILITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Accreditation Status
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NABH & NABL Accredited"
                      value={formData.accreditation}
                      onChange={(e) => handleChange('accreditation', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Location & Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      City / District *
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="Coimbatore"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tamil Nadu"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Bed Capacity
                    </label>
                    <input
                      type="number"
                      placeholder="400"
                      value={formData.bedCount}
                      onChange={(e) => handleChange('bedCount', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Physical Campus Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Avinashi Road, Peelamedu, Coimbatore - 641004"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Supabase Partition Table Selection */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database size={14} className="text-[#0f5257]" />
                    <span className="text-xs font-semibold text-stone-800">
                      Supabase Backend Partition Table Assignment
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mb-2">
                    Routes this hospital's patient records and diagnostic files to its isolated PostgreSQL table.
                  </p>
                  <select
                    value={formData.supabaseTable}
                    onChange={(e) => handleChange('supabaseTable', e.target.value)}
                    className={inputClass}
                  >
                    {SUPABASE_PARTITIONS.map((p) => (
                      <option key={p.table} value={p.table}>
                        {p.label} (`public.{p.table}`)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Administrator & Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Administrative Head / Medical Director *
                    </label>
                    <div className="relative">
                      <UserCheck size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Nalla G Palaniswami"
                        value={formData.adminName}
                        onChange={(e) => handleChange('adminName', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Official Hospital Email *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="admin@hospital.org"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Official Phone *
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 422 4323800"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min. 6 chars"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="password"
                        required
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={loading}
                    icon={ArrowRight}
                  >
                    {loading ? 'Onboarding Medical Facility…' : 'Register Hospital / Organization'}
                  </Button>
                </div>
              </form>
            )}

            <div className="border-t border-stone-100 pt-3 text-center">
              <p className="text-xs text-stone-500">
                Already registered hospital administrator?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-[#1e3a5f] hover:underline"
                >
                  Sign In to Hospital Portal
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Security standard */}
        <p className="mt-4 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} className="text-[#1e3a5f]" />
          NABH / ABDM Health Facility Registry (HFR) Architecture &amp; RLS Isolation
        </p>
      </div>
    </div>
  );
};
