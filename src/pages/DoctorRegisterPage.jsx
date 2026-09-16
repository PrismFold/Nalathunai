import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalDoctorService } from '../services/hospitalDoctorService';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import {
  Stethoscope,
  Building2,
  Mail,
  Phone,
  Lock,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const SPECIALIZATIONS = [
  'Cardiology',
  'Internal Medicine',
  'Interventional Cardiology',
  'Endocrinology & Diabetology',
  'Orthopedics & Spine Surgery',
  'Neurology & Neurosurgery',
  'Pediatrics',
  'Pulmonology & Critical Care',
  'General Surgery',
  'Oncology',
  'Pathology & Diagnostics',
  'Dermatology',
];

export const DoctorRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    specialization: 'Cardiology',
    hospitalId: '',
    hospitalName: '',
    qualification: 'MBBS, MD',
    experienceYears: '8',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    hospitalDoctorService.getAllHospitals().then((list) => {
      setHospitals(list);
      if (list.length > 0) {
        setFormData((prev) => ({
          ...prev,
          hospitalId: list[0].id,
          hospitalName: list[0].name,
        }));
      }
    });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'hospitalId') {
        const found = hospitals.find((h) => h.id === value);
        if (found) updated.hospitalName = found.name;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.regNumber.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all mandatory fields.');
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
      const newDoctor = await hospitalDoctorService.registerDoctor({
        name: formData.name,
        regNumber: formData.regNumber,
        specialization: formData.specialization,
        hospitalId: formData.hospitalId,
        hospitalName: formData.hospitalName,
        qualification: formData.qualification,
        experienceYears: Number(formData.experienceYears) || 5,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setSuccess(true);
      // Automatically log doctor in
      await login(newDoctor.email, formData.password, 'doctor');
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5257]/30 focus:border-[#0f5257] transition-colors';

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl">
        
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
          <div className="p-6 bg-gradient-to-r from-[#0f5257]/10 via-[#0f5257]/5 to-transparent border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0f5257] text-white flex items-center justify-center shadow-sm">
                <Stethoscope size={20} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-900">Doctor Registration Portal</h1>
                <p className="text-xs text-stone-500">
                  Join Nalathunai certified healthcare practitioner network
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
                <h3 className="text-base font-bold text-stone-900">Practitioner Account Created!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Medical Council registration verified. Redirecting directly to your Doctor Workspace...
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Doctor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Vikram Seth"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Medical Council Reg Number */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Medical Council Reg No. (MCI / NMC) *
                    </label>
                    <div className="relative">
                      <Award size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. NMC-TN-2015-8491"
                        value={formData.regNumber}
                        onChange={(e) => handleChange('regNumber', e.target.value)}
                        className={`${inputClass} pl-10 uppercase`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Specialization */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Primary Specialization *
                    </label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      className={inputClass}
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hospital Affiliation */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Affiliated Hospital / Organization *
                    </label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <select
                        value={formData.hospitalId}
                        onChange={(e) => handleChange('hospitalId', e.target.value)}
                        className={`${inputClass} pl-10`}
                      >
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Qualifications */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Degree / Qualifications
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MBBS, MD, DM (Cardiology)"
                      value={formData.qualification}
                      onChange={(e) => handleChange('qualification', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Clinical Experience */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Years of Clinical Experience
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="8"
                      value={formData.experienceYears}
                      onChange={(e) => handleChange('experienceYears', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Official Email */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Doctor Official Email *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="doctor@hospital.org"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Mobile Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Contact Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98421 11220"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-stone-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
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
                    {loading ? 'Registering Practitioner…' : 'Complete Doctor Registration'}
                  </Button>
                </div>
              </form>
            )}

            <div className="border-t border-stone-100 pt-3 text-center">
              <p className="text-xs text-stone-500">
                Already registered as a certified practitioner?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-[#0f5257] hover:underline"
                >
                  Sign In to Doctor Portal
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <p className="mt-4 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} className="text-[#0f5257]" />
          Medical Council Verification &amp; ABDM Healthcare Professionals Registry Standard
        </p>
      </div>
    </div>
  );
};
