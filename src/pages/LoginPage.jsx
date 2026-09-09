import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Shield, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regAbha, setRegAbha] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister && !regName) {
        setError('Please provide your full name.');
        return;
      }
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoFill = async () => {
    try {
      await login('9876543210', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed.');
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 placeholder-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5257]/30 focus:border-[#0f5257] transition-colors';

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center py-12 px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-3">
          <Logo size="large" />
        </div>
        <p className="text-sm text-stone-400 font-medium">Your health records. Your control.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-stone-100">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                !isRegister
                  ? 'text-[#0f5257] border-b-2 border-[#0f5257]'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { navigate('/register'); }}
              className="flex-1 py-3.5 text-sm font-medium transition-colors text-stone-400 hover:text-stone-600"
            >
              Register
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Error */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
                <Shield className="shrink-0 text-rose-400" size={15} strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Ramesh"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                      ABHA ID{' '}
                      <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="91-4829-1029-4720"
                      value={regAbha}
                      onChange={(e) => setRegAbha(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Mobile or Email</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3 text-stone-300" strokeWidth={1.75} />
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-stone-300" strokeWidth={1.75} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={loading}
                icon={ArrowRight}
                className="mt-1"
              >
                {loading ? 'Authenticating…' : isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* Demo login */}
            <div className="border-t border-stone-100 pt-4">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold text-center mb-3">
                Prototype demo
              </p>
              <button
                onClick={handleDemoFill}
                className="w-full py-2.5 px-4 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded border border-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 size={14} className="text-[#0f5257]" strokeWidth={1.75} />
                Demo Login as Ananya Ramesh
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1">
          <Shield size={12} className="text-[#0f5257]" strokeWidth={1.75} />
          Protected by patient consent architecture · SNS Workbench API ready
        </p>
      </div>
    </div>
  );
};
