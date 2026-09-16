import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import {
  Shield,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  UserPlus,
  Stethoscope,
  Building2,
  User,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Smartphone
} from 'lucide-react';

export const LoginPage = () => {
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'hospital'
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'

  // Step 1 & 2 for OTP flow
  const [otpStep, setOtpStep] = useState(1); // 1 = Enter Gmail/Phone, 2 = Enter OTP
  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState('auto'); // 'auto' | 'email' | 'sms'
  const [otpCode, setOtpCode] = useState('');
  const [dispatchedInfo, setDispatchedInfo] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Password flow state
  const [password, setPassword] = useState('');

  // Status & loading
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { login, requestLoginOtp, verifyLoginOtp, loading } = useAuth();
  const navigate = useNavigate();

  // Handle countdown for resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Auto-detect channel based on input
  useEffect(() => {
    if (channel === 'auto' || !channel) {
      if (identifier.includes('@')) {
        setChannel('email');
      } else if (identifier.replace(/\D/g, '').length >= 6) {
        setChannel('sms');
      }
    }
  }, [identifier, channel]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccessMsg('');
    setOtpStep(1);
    setOtpCode('');
    setDispatchedInfo(null);
  };

  const handleFillDemo = (demoIdent, demoPass, preferredCh = 'auto') => {
    setIdentifier(demoIdent);
    setPassword(demoPass);
    if (demoIdent.includes('@')) {
      setChannel('email');
    } else {
      setChannel('sms');
    }
    setError('');
  };

  // Step 1: Request OTP for Gmail or Phone
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setError('Please enter your Gmail account or 10-digit phone number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const selectedChannel = channel === 'auto' ? (identifier.includes('@') ? 'email' : 'sms') : channel;
      const res = await requestLoginOtp(identifier, selectedChannel, role);
      setDispatchedInfo(res);
      setOtpStep(2);
      setResendTimer(30);
      setSuccessMsg(`Verification code dispatched to ${res.target}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your details.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      const loggedUser = await verifyLoginOtp(identifier, otpCode, role);
      routeUser(loggedUser);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
    }
  };

  // Classic password login submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your credentials and password.');
      return;
    }
    try {
      const loggedUser = await login(identifier, password, role);
      routeUser(loggedUser);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials or register an account.');
    }
  };

  const routeUser = (loggedUser) => {
    if (loggedUser.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else if (loggedUser.role === 'hospital') {
      navigate('/organization/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5257]/30 focus:border-[#0f5257] transition-all';

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center py-10 px-4">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-2">
          <Logo size="large" />
        </div>
        <p className="text-xs text-stone-500 font-medium tracking-wide">
          Unified Healthcare Access &amp; Consent Management Platform
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Role Selector Segmented Bar */}
          <div className="p-3 bg-stone-50/80 border-b border-stone-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2 px-1 text-center">
              Select Your Portal
            </div>
            <div className="grid grid-cols-3 gap-1 bg-stone-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleChange('patient')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  role === 'patient'
                    ? 'bg-white text-[#0f5257] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <User size={14} strokeWidth={2} />
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('doctor')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  role === 'doctor'
                    ? 'bg-white text-[#0f5257] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Stethoscope size={14} strokeWidth={2} />
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('hospital')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  role === 'hospital'
                    ? 'bg-white text-[#0f5257] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 size={14} strokeWidth={2} />
                Hospital
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Header info based on selected role */}
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <div>
                <h2 className="text-base font-semibold text-stone-800">
                  {role === 'patient' && 'Patient Sign In'}
                  {role === 'doctor' && 'Doctor Portal Login'}
                  {role === 'hospital' && 'Hospital / Organization Portal'}
                </h2>
                <p className="text-xs text-stone-500">
                  {role === 'patient' && 'Authorize via Gmail / Phone OTP or password'}
                  {role === 'doctor' && 'Search patient records & request clinical consent'}
                  {role === 'hospital' && 'Manage affiliated doctors and patient record governance'}
                </p>
              </div>
            </div>

            {/* Auth Mode Switch: OTP vs Password */}
            <div className="flex border-b border-stone-200 gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => { setAuthMode('otp'); setError(''); }}
                className={`pb-2 transition-colors relative flex items-center gap-1.5 ${
                  authMode === 'otp'
                    ? 'text-[#0f5257] font-semibold border-b-2 border-[#0f5257]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sparkles size={13} className="text-[#0f5257]" />
                Gmail / Phone OTP Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('password'); setError(''); }}
                className={`pb-2 transition-colors relative flex items-center gap-1.5 ${
                  authMode === 'password'
                    ? 'text-[#0f5257] font-semibold border-b-2 border-[#0f5257]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Lock size={13} />
                Password Sign In
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
                <Shield className="shrink-0 text-rose-400" size={15} strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && !error && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="shrink-0 text-emerald-500" size={15} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ========================================================== */}
            {/* OTP LOGIN WORKFLOW */}
            {/* ========================================================== */}
            {authMode === 'otp' && (
              <div className="space-y-4">
                {otpStep === 1 ? (
                  // Step 1: Identifier & Channel Authorization
                  <form onSubmit={handleRequestOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {role === 'patient' && 'Gmail Account or Mobile Phone Number'}
                        {role === 'doctor' && 'Doctor Gmail / Official Email or Phone'}
                        {role === 'hospital' && 'Hospital Official Email or Contact Phone'}
                      </label>
                      <div className="relative">
                        {identifier.includes('@') ? (
                          <Mail size={15} className="absolute left-3.5 top-3 text-[#0f5257]" strokeWidth={1.75} />
                        ) : (
                          <Phone size={15} className="absolute left-3.5 top-3 text-stone-400" strokeWidth={1.75} />
                        )}
                        <input
                          type="text"
                          required
                          placeholder={
                            role === 'patient'
                              ? 'e.g. jeremiahgriffinpaul111@gmail.com or 8015143178'
                              : role === 'doctor'
                              ? 'e.g. dr.vikram@gangahospital.com or 9876543210'
                              : 'e.g. admin@gangahospital.com or 04222485000'
                          }
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className={`${inputClass} pl-10 font-mono`}
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Any valid Gmail address or 10-digit mobile number is instantly authorized.
                      </p>
                    </div>

                    {/* Channel Selection Toggle */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                        Verification Channel
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setChannel('email')}
                          className={`py-2 px-3 text-xs rounded-lg border flex items-center justify-center gap-2 transition-all ${
                            channel === 'email'
                              ? 'bg-[#0f5257]/10 border-[#0f5257] text-[#0f5257] font-semibold'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <Mail size={14} />
                          Gmail / Email OTP
                        </button>
                        <button
                          type="button"
                          onClick={() => setChannel('sms')}
                          className={`py-2 px-3 text-xs rounded-lg border flex items-center justify-center gap-2 transition-all ${
                            channel === 'sms'
                              ? 'bg-[#0f5257]/10 border-[#0f5257] text-[#0f5257] font-semibold'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <Smartphone size={14} />
                          Phone SMS OTP
                        </button>
                      </div>
                    </div>

                    {/* Quick Demo Credentials */}
                    <div className="bg-[#fcfbf9] border border-stone-200 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <KeyRound size={11} /> Quick Fill Demo Accounts
                        </span>
                      </div>
                      {role === 'patient' && (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => handleFillDemo('jeremiahgriffinpaul111@gmail.com', 'Password@123', 'email')}
                            className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                          >
                            <span><strong>Jeremiah (Gmail):</strong> jeremiahgriffinpaul111@gmail.com</span>
                            <span className="text-[10px] text-[#0f5257] font-semibold">Gmail OTP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFillDemo('8015143178', 'Password@123', 'sms')}
                            className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                          >
                            <span><strong>Jeremiah (Mobile):</strong> 8015143178</span>
                            <span className="text-[10px] text-stone-600 font-semibold">SMS OTP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFillDemo('ananya.ramesh@example.com', 'Password@123', 'email')}
                            className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                          >
                            <span><strong>Ananya Ramesh:</strong> ananya.ramesh@example.com</span>
                            <span className="text-[10px] text-stone-400 font-mono">Fill</span>
                          </button>
                        </div>
                      )}
                      {role === 'doctor' && (
                        <button
                          type="button"
                          onClick={() => handleFillDemo('dr.vikram@gangahospital.com', 'Doctor@123', 'email')}
                          className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                        >
                          <span><strong>Dr. Vikram Seth:</strong> dr.vikram@gangahospital.com</span>
                          <span className="text-[10px] text-[#0f5257] font-semibold">Gmail OTP</span>
                        </button>
                      )}
                      {role === 'hospital' && (
                        <button
                          type="button"
                          onClick={() => handleFillDemo('admin@gangahospital.com', 'Password@123', 'email')}
                          className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                        >
                          <span><strong>Ganga Hospital Admin:</strong> admin@gangahospital.com</span>
                          <span className="text-[10px] text-[#0f5257] font-semibold">Gmail OTP</span>
                        </button>
                      )}
                    </div>

                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={isSendingOtp}
                      icon={ArrowRight}
                      className="mt-1"
                    >
                      {isSendingOtp ? 'Authorizing & Sending OTP…' : 'Authorize & Send 6-Digit OTP'}
                    </Button>
                  </form>
                ) : (
                  // Step 2: Enter 6-digit OTP
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Dispatched OTP Notification Card */}
                    <div className="p-3.5 bg-[#f3f9f9] border border-[#a2d1d1] rounded-xl text-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f5257]">
                          {dispatchedInfo?.channel === 'email' ? <Mail size={14} /> : <Smartphone size={14} />}
                          <span>OTP Sent via {dispatchedInfo?.channel === 'email' ? 'Gmail' : 'Phone SMS'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpStep(1)}
                          className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                        >
                          <ArrowLeft size={11} /> Change
                        </button>
                      </div>
                      <div className="text-xs text-stone-600">
                        Recipient: <strong className="font-mono text-stone-900">{dispatchedInfo?.target || identifier}</strong>
                      </div>
                      {/* Interactive Code Pill */}
                      {dispatchedInfo?.otp && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setOtpCode(dispatchedInfo.otp)}
                            className="w-full py-2 px-3 bg-white border border-[#0f5257]/30 hover:border-[#0f5257] rounded-lg text-center transition-all group"
                          >
                            <span className="text-[11px] text-stone-500 block mb-0.5">Dispatched Verification Code:</span>
                            <span className="text-base font-bold font-mono tracking-widest text-[#0f5257] group-hover:underline">
                              {dispatchedInfo.otp}
                            </span>
                            <span className="text-[10px] text-[#0f5257] block mt-0.5 font-medium">Click to auto-fill</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-center">
                        Enter 6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full py-3 px-4 text-center text-xl font-bold font-mono tracking-[0.4em] bg-stone-50 border-2 border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#0f5257] text-[#0f5257] transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-stone-300"
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={loading || otpCode.length !== 6}
                      icon={ArrowRight}
                    >
                      {loading ? 'Verifying OTP & Authorizing…' : 'Verify OTP & Sign In'}
                    </Button>

                    <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                      <button
                        type="button"
                        onClick={() => setOtpStep(1)}
                        className="hover:text-stone-900 flex items-center gap-1"
                      >
                        <ArrowLeft size={13} /> Back to Gmail / Phone
                      </button>

                      {resendTimer > 0 ? (
                        <span className="text-stone-400 font-mono">Resend OTP in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRequestOtp()}
                          disabled={isSendingOtp}
                          className="text-[#0f5257] font-semibold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                          Resend Code
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* CLASSIC PASSWORD LOGIN */}
            {/* ========================================================== */}
            {authMode === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {role === 'patient' && 'Mobile Number or Registered Email'}
                    {role === 'doctor' && 'Medical Council Reg No. or Doctor Email'}
                    {role === 'hospital' && 'License Number or Official Email'}
                  </label>
                  <div className="relative">
                    {role === 'patient' && <Phone size={15} className="absolute left-3.5 top-3 text-stone-400" strokeWidth={1.75} />}
                    {role === 'doctor' && <Stethoscope size={15} className="absolute left-3.5 top-3 text-stone-400" strokeWidth={1.75} />}
                    {role === 'hospital' && <Building2 size={15} className="absolute left-3.5 top-3 text-stone-400" strokeWidth={1.75} />}
                    <input
                      type="text"
                      required
                      placeholder="Enter registered mobile or email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className={`${inputClass} pl-10`}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-stone-400" strokeWidth={1.75} />
                    <input
                      type="password"
                      required
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Demo Quick Fills */}
                <div className="bg-[#fcfbf9] border border-stone-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                      <KeyRound size={11} /> Quick Demo Credentials
                    </span>
                  </div>
                  {role === 'patient' && (
                    <button
                      type="button"
                      onClick={() => handleFillDemo('ananya.ramesh@example.com', 'Password@123')}
                      className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                    >
                      <span><strong>Ananya Ramesh:</strong> ananya.ramesh@example.com</span>
                      <span className="text-[10px] text-stone-400 font-mono">Fill</span>
                    </button>
                  )}
                  {role === 'doctor' && (
                    <button
                      type="button"
                      onClick={() => handleFillDemo('dr.vikram@gangahospital.com', 'Doctor@123')}
                      className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                    >
                      <span><strong>Dr. Vikram Seth:</strong> dr.vikram@gangahospital.com</span>
                      <span className="text-[10px] text-stone-400 font-mono">Fill</span>
                    </button>
                  )}
                  {role === 'hospital' && (
                    <button
                      type="button"
                      onClick={() => handleFillDemo('admin@gangahospital.com', 'Password@123')}
                      className="w-full text-left px-2.5 py-1.5 rounded bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between transition-colors"
                    >
                      <span><strong>Ganga Hospital:</strong> admin@gangahospital.com</span>
                      <span className="text-[10px] text-stone-400 font-mono">Fill</span>
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={loading}
                  icon={ArrowRight}
                  className="mt-1"
                >
                  {loading ? 'Verifying Credentials…' : `Sign In with Password`}
                </Button>
              </form>
            )}

            {/* Registration redirect helper */}
            <div className="border-t border-stone-100 pt-4">
              <p className="text-xs text-stone-500 text-center mb-2.5">
                {role === 'patient' && "Don't have a verified patient account yet?"}
                {role === 'doctor' && "Are you a certified medical practitioner?"}
                {role === 'hospital' && "Need to register your medical facility or hospital?"}
              </p>
              
              {role === 'patient' && (
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="w-full py-2.5 px-4 bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2F2D29] rounded-lg border border-[#DED2C0] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus size={14} className="text-[#5D6454]" strokeWidth={2} />
                  Register as Patient with Aadhaar &amp; OTP
                </button>
              )}

              {role === 'doctor' && (
                <button
                  type="button"
                  onClick={() => navigate('/register/doctor')}
                  className="w-full py-2.5 px-4 bg-[#e8f3f3] hover:bg-[#d8ecec] text-[#0f5257] rounded-lg border border-[#b2dada] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Stethoscope size={14} strokeWidth={2} />
                  Register as Doctor (MCI / NMC Verification)
                </button>
              )}

              {role === 'hospital' && (
                <button
                  type="button"
                  onClick={() => navigate('/register/organization')}
                  className="w-full py-2.5 px-4 bg-[#eef2f6] hover:bg-[#e1e8f0] text-[#1e3a5f] rounded-lg border border-[#c9d7e7] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Building2 size={14} strokeWidth={2} />
                  Register Hospital / Healthcare Organization
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <Shield size={13} className="text-[#0f5257]" strokeWidth={2} />
          End-to-End Encrypted Patient Consent &amp; Hospital Governance Architecture
        </p>
      </div>
    </div>
  );
};
