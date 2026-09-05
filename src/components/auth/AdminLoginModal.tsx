import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  UserPlus,
  LogIn,
  Building2,
  Mail,
  Phone,
  User,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { useAuth } from '@/src/contexts/AuthContext';

interface AdminLoginModalProps {
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess }) => {
  const { isAdminLoginModalOpen, closeAdminLoginModal, verifyAdminLogin, registerAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login State
  const [passcodeInput, setPasscodeInput] = useState('');
  const [adminIdentifier, setAdminIdentifier] = useState('+91 99999 88888');
  const [showPassword, setShowPassword] = useState(false);

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupHQ, setSignupHQ] = useState('Electra System HQ');
  const [signupPasscode, setSignupPasscode] = useState('');
  const [signupConfirmPasscode, setSignupConfirmPasscode] = useState('');
  const [securityKey, setSecurityKey] = useState('ELECTRA-ADMIN-2026');
  const [showSignupPasscode, setShowSignupPasscode] = useState(false);

  // Shared State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim()) {
      setErrorMsg('Please enter your administrator passcode');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await verifyAdminLogin(passcodeInput, adminIdentifier);
    setLoading(false);

    if (res.success) {
      setPasscodeInput('');
      setErrorMsg('');
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.message || 'Invalid administrator passcode. Access denied.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signupName.trim()) {
      setErrorMsg('Please enter administrator full name');
      return;
    }

    const cleanedMobile = signupMobile.replace(/\D/g, '');
    if (cleanedMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid official email address');
      return;
    }

    if (signupPasscode.trim().length < 4) {
      setErrorMsg('Administrator passcode must be at least 4 characters');
      return;
    }

    if (signupPasscode !== signupConfirmPasscode) {
      setErrorMsg('Passcodes do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    const res = await registerAdmin({
      name: signupName.trim(),
      mobile: signupMobile.trim(),
      email: signupEmail.trim(),
      passcode: signupPasscode.trim(),
      businessName: signupHQ.trim() || 'Electra System HQ',
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg('Administrator account registered successfully! Entering console...');
      setTimeout(() => {
        setSignupName('');
        setSignupMobile('');
        setSignupEmail('');
        setSignupPasscode('');
        setSignupConfirmPasscode('');
        setSuccessMsg('');
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMsg(res.message || 'Failed to register administrator.');
    }
  };

  const handleQuickFill = () => {
    setPasscodeInput('admin123');
    setAdminIdentifier('+91 99999 88888');
    setErrorMsg('');
  };

  const handleClose = () => {
    setPasscodeInput('');
    setErrorMsg('');
    setSuccessMsg('');
    closeAdminLoginModal();
  };

  return (
    <Modal
      isOpen={isAdminLoginModalOpen}
      onClose={handleClose}
      title={activeTab === 'login' ? 'Admin Console Authentication' : 'Register New Administrator'}
      subtitle={
        activeTab === 'login'
          ? 'Restricted to authorized system administrators only'
          : 'Create a root administrator account with full platform management rights'
      }
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Navigation Tabs between Login and Sign Up */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Admin Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admin Sign Up</span>
          </button>
        </div>

        {/* Security Info Banner */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60">
          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-violet-900 dark:text-violet-200">
              {activeTab === 'login' ? 'Protected Administrator Area' : 'Admin Account Provisioning'}
            </h4>
            <p className="text-[11px] text-violet-700 dark:text-violet-300 leading-snug mt-0.5">
              {activeTab === 'login'
                ? 'Multi-store platform management and global configurations require verified administrator credentials.'
                : 'Registered administrators receive complete system ownership, store oversight, analytics, and category controls.'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* Admin Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {/* Admin Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Administrator Mobile / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminIdentifier}
                  onChange={e => setAdminIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:border-violet-500 focus:outline-none"
                  placeholder="+91 99999 88888 or admin@electramanager.com"
                />
              </div>
            </div>

            {/* Admin Passcode */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Admin Passcode / PIN
                </label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Passcode (admin123)</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcodeInput}
                  onChange={e => {
                    setPasscodeInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter admin passcode"
                  className="w-full pl-3 pr-9 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs tracking-wider focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Accepted passcodes: registered passcode, <code className="text-violet-600 dark:text-violet-400 font-mono font-semibold">admin123</code>, <code className="text-violet-600 dark:text-violet-400 font-mono font-semibold">9999</code>, or <code className="text-violet-600 dark:text-violet-400 font-mono font-semibold">admin</code>
              </p>
            </div>

            {/* Quick Switch to Signup */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg('');
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium"
              >
                New system manager? <span className="underline font-semibold text-violet-600 dark:text-violet-400">Sign Up as Admin</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                id="btn-admin-login-submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Authenticate & Enter Console</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Admin Sign Up Form */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            {/* Admin Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="e.g. Sourav Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus-within:border-violet-500">
                <span className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border-r border-slate-200 dark:border-slate-700 flex items-center gap-1 shrink-0">
                  IND +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={signupMobile}
                  onChange={e => setSignupMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="99999 88888"
                  className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Admin Official Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  placeholder="sourav.admin@electraretail.in"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Headquarters / Organization */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                HQ / Organization Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signupHQ}
                  onChange={e => setSignupHQ(e.target.value)}
                  placeholder="Electra System HQ"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Passcode Fields */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create Passcode
                </label>
                <div className="relative">
                  <input
                    type={showSignupPasscode ? 'text' : 'password'}
                    required
                    value={signupPasscode}
                    onChange={e => setSignupPasscode(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full px-3 pr-8 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs tracking-wide focus:border-violet-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPasscode(!showSignupPasscode)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showSignupPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Passcode
                </label>
                <input
                  type={showSignupPasscode ? 'text' : 'password'}
                  required
                  value={signupConfirmPasscode}
                  onChange={e => setSignupConfirmPasscode(e.target.value)}
                  placeholder="Re-enter passcode"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs tracking-wide focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Security Authorization Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Master Security Key
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Pre-Authorized
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-violet-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={securityKey}
                  onChange={e => setSecurityKey(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Switch to Login */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium"
              >
                Already have admin credentials? <span className="underline font-semibold text-violet-600 dark:text-violet-400">Log In</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                id="btn-admin-signup-submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span>Registering Admin...</span>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register & Access Console</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
