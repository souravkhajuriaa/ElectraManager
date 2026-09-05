import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Smartphone, KeyRound, Sparkles, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserLoginModal } from '@/src/components/auth/UserLoginModal';
import { AdminLoginModal } from '@/src/components/auth/AdminLoginModal';

export const AuthView: React.FC = () => {
  const {
    sendOTP,
    verifyOTP,
    demoLogin,
    otpSent,
    pendingMobile,
    resendSeconds,
    resetAuthFlow,
    isUserLoginModalOpen,
    openUserLoginModal,
    closeUserLoginModal,
    openAdminLoginModal,
  } = useAuth();
  const [mobileInput, setMobileInput] = useState('9876543210');
  const [userNameInput, setUserNameInput] = useState('Rahul Sharma');
  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await sendOTP(mobileInput);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Error sending OTP');
    } else {
      setOtpInput('123456'); // pre-fill demo OTP for delightful UX
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await verifyOTP(otpInput, userNameInput);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Invalid OTP code');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Electra<span className="text-blue-500">Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indian Electronics Retail & Inventory Management Platform
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Section Header Container */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            USER LOGIN
          </div>
        </div>

        {!otpSent ? (
          /* Step 1: Mobile Number Input */
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Name
              </label>
              <input
                type="text"
                required
                value={userNameInput}
                onChange={e => setUserNameInput(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-800/80 focus-within:border-blue-500">
                <span className="px-3 py-2.5 bg-slate-800 text-slate-400 text-xs font-medium border-r border-slate-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 select-none">
                  IND +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileInput}
                  onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                A 6-digit OTP verification code will be sent via SMS
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Input */
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs flex items-center justify-between">
              <div>
                <span>OTP sent to </span>
                <span className="font-semibold text-white">+91 {pendingMobile}</span>
              </div>
              <button
                type="button"
                onClick={resetAuthFlow}
                className="text-blue-400 hover:underline text-[11px]"
              >
                Change
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Enter 6-Digit OTP
                </label>
                <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Demo Code: 123456
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center tracking-[0.5em] text-xl font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify & Enter Store'}</span>
            </button>

            <div className="text-center">
              {resendSeconds > 0 ? (
                <span className="text-xs text-slate-500">
                  Resend OTP in {resendSeconds}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOTP({ preventDefault: () => {} } as any)}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Resend OTP Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* User Registration and Admin Access */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            New Registration & Admin Login
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => openUserLoginModal()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-500/50 hover:border-blue-400 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 text-xs font-semibold text-blue-100 hover:text-white shadow-md shadow-blue-950/50 hover:shadow-blue-600/20 transition-all group"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>New User</span>
            </button>
            <button
              type="button"
              onClick={() => openAdminLoginModal('admin-dashboard')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-violet-500/50 hover:border-violet-400 bg-gradient-to-r from-violet-950/60 to-purple-950/60 hover:from-violet-900/80 hover:to-purple-900/80 text-xs font-semibold text-violet-200 hover:text-white shadow-md shadow-violet-950/50 hover:shadow-violet-600/20 transition-all group"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Multi-User Login & Profile Selection Modal */}
        <UserLoginModal
          isOpen={isUserLoginModalOpen}
          onClose={closeUserLoginModal}
        />

        {/* Admin Console Authentication Modal */}
        <AdminLoginModal />
      </div>
    </div>
  );
};
