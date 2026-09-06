import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Smartphone,
  KeyRound,
  UserPlus,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserLoginModal } from '@/src/components/auth/UserLoginModal';
import { AdminLoginModal } from '@/src/components/auth/AdminLoginModal';

export const AuthView: React.FC = () => {
  const {
    sendOTP,
    verifyOTP,
    otpSent,
    pendingMobile,
    resendSeconds,
    resetAuthFlow,
    isUserLoginModalOpen,
    openUserLoginModal,
    closeUserLoginModal,
    openAdminLoginModal,
  } = useAuth();

  // Clean empty state — no dummy names or phone numbers!
  const [mobileInput, setMobileInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await sendOTP(mobileInput);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Error sending OTP. Please check your mobile number.');
    } else {
      setOtpInput(''); // Clean empty OTP field
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await verifyOTP(otpInput, userNameInput, rememberMe);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Electra<span className="text-blue-500">Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            An Electronics Retail & Inventory Management Platform
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-medium mt-3">
            <Lock className="w-3 h-3 text-blue-400" />
            <span>Employee & Owner Access</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* User Login Form */}
        {!otpSent ? (
          /* Step 1: Mobile Number & Name Input */
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="input-login-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                User / Employee Name
              </label>
              <input
                id="input-login-name"
                type="text"
                required
                value={userNameInput}
                onChange={e => setUserNameInput(e.target.value)}
                placeholder="Enter user / employee name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/90 text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-slate-500 transition-all duration-150 shadow-inner"
              />
            </div>

            <div>
              <label htmlFor="input-login-mobile" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-700/90 bg-slate-800/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-150 shadow-inner">
                <span className="px-3.5 py-2.5 bg-slate-800 text-slate-400 text-xs font-semibold tracking-wider border-r border-slate-700/90 flex items-center gap-1 whitespace-nowrap shrink-0 select-none">
                  +91
                </span>
                <input
                  id="input-login-mobile"
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileInput}
                  onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500 font-mono tracking-wide"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                A 6-digit verification code will be sent to your mobile number
              </p>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition-colors">
                <input
                  id="checkbox-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span>Remember on this device</span>
              </label>
            </div>

            <button
              id="btn-send-otp"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending Verification Code...' : 'Get Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Input */
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs flex items-center justify-between">
              <div>
                <span>Code sent to </span>
                <span className="font-semibold text-white">+91 {pendingMobile}</span>
              </div>
              <button
                id="btn-change-mobile"
                type="button"
                onClick={resetAuthFlow}
                className="text-blue-400 hover:underline text-[11px] cursor-pointer"
              >
                Change Number
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-login-otp" className="text-xs font-semibold text-slate-300">
                  Enter Verification Code
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  6-digit code
                </span>
              </div>
              <input
                id="input-login-otp"
                type="text"
                required
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-center tracking-[0.3em] text-lg font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-500 transition-all duration-150"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition-colors">
                <input
                  id="checkbox-remember-me-otp"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span>Remember on this device</span>
              </label>
            </div>

            <button
              id="btn-verify-otp"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify & Enter Store'}</span>
            </button>

            <div className="text-center">
              {resendSeconds > 0 ? (
                <span className="text-xs text-slate-500">
                  Resend code in {resendSeconds}s
                </span>
              ) : (
                <button
                  id="btn-resend-otp"
                  type="button"
                  onClick={() => handleSendOTP({ preventDefault: () => {} } as any)}
                  className="text-xs text-blue-400 hover:underline cursor-pointer"
                >
                  Resend Verification Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* Professional Navigation Actions: New User and Admin (Owner) Portal */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Role Options
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-open-new-user-modal"
              type="button"
              onClick={() => openUserLoginModal()}
              title="Register a new Employee / Store User"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-500/40 hover:border-blue-400 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 hover:from-blue-800/70 hover:to-indigo-800/70 text-xs font-semibold text-blue-100 hover:text-white shadow-md shadow-blue-950/50 transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>New User</span>
            </button>
            <button
              id="btn-open-admin-login-modal"
              type="button"
              onClick={() => openAdminLoginModal('admin-dashboard')}
              title="Store Owner & Administrator Access"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-violet-500/40 hover:border-violet-400 bg-gradient-to-r from-violet-950/50 to-purple-950/50 hover:from-violet-900/70 hover:to-purple-900/70 text-xs font-semibold text-violet-200 hover:text-white shadow-md shadow-violet-950/50 transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>Admin (Owner)</span>
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
