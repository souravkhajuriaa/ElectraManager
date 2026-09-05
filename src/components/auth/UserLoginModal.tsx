import React, { useState } from 'react';
import {
  UserPlus,
  Store,
  Phone,
  Mail,
  MapPin,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { useAuth } from '@/src/contexts/AuthContext';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STORE_CATEGORIES = [
  'Multi-Brand Electronics Store',
  'Smartphones & Mobile Accessories',
  'Home Appliances & Televisions',
  'Laptops & IT Peripherals',
  'Audio, Wearables & Gadgets',
  'Electronics Service & Retail',
];

export const UserLoginModal: React.FC<UserLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { registerUser } = useAuth();

  // Form state for New User Registration
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState(STORE_CATEGORIES[0]);
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }

    const cleanedMobile = mobile.replace(/\D/g, '');
    if (cleanedMobile.length < 10) {
      setFormError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!storeName.trim()) {
      setFormError('Please enter your store or business name');
      return;
    }

    setLoading(true);

    const res = await registerUser({
      name: name.trim(),
      mobile: mobile.trim(),
      businessName: storeName.trim(),
      email: email.trim(),
      storeCategory: category,
      address: city.trim(),
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg('Store account created successfully! Entering dashboard...');
      setTimeout(() => {
        setName('');
        setMobile('');
        setStoreName('');
        setCity('');
        setEmail('');
        setSuccessMsg('');
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setFormError(res.message || 'Failed to complete registration');
    }
  };

  const handleResetAndClose = () => {
    setFormError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="New User Registration"
      subtitle="Register your retail electronics store to start billing, inventory tracking, and GST reporting."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Onboarding Highlights Banner */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
              Welcome to Electra Retail Network
            </h4>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-snug mt-0.5">
              Set up your store in under a minute. Includes POS billing, barcode scanner, GST tax calculations, and IMEI/serial tracking.
            </p>
          </div>
        </div>

        {formError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500">
              <span className="px-2.5 py-2 bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium border-r border-slate-300 dark:border-slate-700 flex items-center gap-1 shrink-0 select-none">
                IND +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Used for account verification and receiving daily sales summaries
            </p>
          </div>

          {/* Store / Business Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store / Business Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="e.g. Sharma Electronics & Mobile Hub"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Store Category & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store Type
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {STORE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="text-slate-900 dark:text-white bg-white dark:bg-slate-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City/Location
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Nehru Place, Delhi"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Email <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="store@electraretail.in"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              id="btn-user-register-submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span>Registering...</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register & Create Store</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Compliant with Indian GST rules. Instant invoice generation, inventory sync, and customer receipts included.
          </span>
        </div>
      </div>
    </Modal>
  );
};
