import React, { useState } from 'react';
import {
  Store,
  FileSpreadsheet,
  RotateCcw,
  Download,
  Shield,
  Save,
  Check,
  Smartphone,
  MapPin,
  Mail,
  Receipt,
  UserCheck,
  Lock,
  LogOut,
  ShieldCheck,
  Database,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { NavigationTab } from '@/src/types';

interface SettingsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const {
    business,
    updateBusiness,
    resetToDemoData,
    products,
    sales,
    categories,
    cloudSyncStatus,
    syncWithCloud,
  } = useData();
  const { user, role, switchRole, logout } = useAuth();

  const [name, setName] = useState(business.name);
  const [phone, setPhone] = useState(business.phone);
  const [email, setEmail] = useState(business.email);
  const [address, setAddress] = useState(business.address);
  const [gstNumber, setGstNumber] = useState(business.gstNumber || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gstNumber: gstNumber.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      business,
      categories,
      products,
      sales,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `electramanager-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore the default sample electronics catalog? Any newly created items or custom sales will be reset.')) {
      resetToDemoData();
      alert('Demo data restored successfully!');
    }
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <div>
        <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
          System & Business Settings
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Configure electronic store invoice headers, tax details, roles, and backup archives
        </p>
      </div>

      {/* Store Identity & Invoicing Details */}
      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                Store Profile & Tax Invoice Details
              </h3>
              <p className="text-[10px] text-slate-500">
                Printed on consumer retail tax invoices & customer receipts
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveStore} className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store / Company Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
                placeholder="29ABCDE1234F1Z5"
                className="w-full h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Showroom Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 h-7 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Role Management Card */}
      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
              <span>Active Session & Account</span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Private Account
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">
              Logged in as <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span> ({user?.mobile || '+91 98765 43210'}) • Account switching restricted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
            title="Each user has their own private account. Direct account switching between users is disabled."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Isolated Account</span>
          </div>

          <button
            onClick={() => switchRole('admin')}
            className={`h-7 px-3 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title={role === 'admin' ? 'Active Admin Mode' : 'Admin Login Required to switch to Admin Mode'}
          >
            {role !== 'admin' && <Lock className="w-3 h-3 text-slate-400" />}
            <span>Admin Mode</span>
          </button>
          <button
            onClick={() => switchRole('user')}
            className={`h-7 px-3 rounded-md text-xs font-bold transition-all ${
              role === 'user'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Staff User Mode
          </button>

          <button
            type="button"
            onClick={logout}
            className="h-7 px-2.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-all flex items-center gap-1.5"
            title="Log out to allow another user to sign in to their own personal account"
          >
            <LogOut className="w-3 h-3" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Cloud Database & Backend Persistence (Firestore) */}
      <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                <span>Cloud Database & Backend</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Google Cloud Firestore • Permanent real-time persistence for titles, images, stock, & transactions
              </p>
            </div>
          </div>

          <button
            onClick={() => syncWithCloud()}
            className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Cloud DB'}</span>
          </button>
        </div>

        <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">Active Database:</span>
            <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">Google Cloud Firestore (Enterprise)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">Permanent Persistence:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Enabled (Products, Titles, Images, Sales)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">Sync Mode:</span>
            <span>Real-time bidirectional synchronization across tabs & devices</span>
          </div>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display">
              Data Management & Backup
            </h3>
            <p className="text-[10px] text-slate-500">
              Download complete local JSON archive or restore initial electronics catalog
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Export System Archive
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Download all products, sales history, inventory records, and categories into a single JSON file.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="mt-3 flex items-center justify-center gap-1.5 h-7 px-3 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Download className="w-3 h-3" />
              <span>Download Backup (JSON)</span>
            </button>
          </div>

          <div className="p-2.5 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">
                Restore Demo Data
              </h4>
              <p className="text-[10px] text-rose-700/80 dark:text-rose-400 mt-0.5">
                Reset your store back to the seeded 8 electronics categories and 10 flagship products with fresh transaction histories.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="mt-3 flex items-center justify-center gap-1.5 h-7 px-3 rounded-md border border-rose-300 dark:border-rose-800 bg-white dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
