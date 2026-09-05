import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ScrollText,
  TrendingUp,
  Activity,
  CheckCircle2,
  Store,
  MapPin,
  Phone,
  Search,
  ArrowUpRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Database,
  Lock,
} from 'lucide-react';
import { NavigationTab, Business, UserProfile, ActivityLog } from '@/src/types';
import { formatINR } from '@/src/lib/utils/currency';
import { useAuth } from '@/src/contexts/AuthContext';
import { useData } from '@/src/contexts/DataContext';
import { SAMPLE_ACTIVITY_LOGS } from '@/src/lib/data/sampleData';

interface AdminDashboardViewProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

interface RetailStoreInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  owner: string;
  phone: string;
  gstNumber: string;
  activeSkus: number;
  monthlyRevenue: number;
  status: 'active' | 'pending' | 'review';
}

const SAMPLE_STORES: RetailStoreInfo[] = [
  {
    id: 'biz-default',
    name: 'Electra Retail & Tech Hub (HQ)',
    city: 'Bengaluru',
    state: 'Karnataka',
    owner: 'Rahul Sharma',
    phone: '+91 98765 43210',
    gstNumber: '29ABCDE1234F1Z5',
    activeSkus: 18,
    monthlyRevenue: 284500,
    status: 'active',
  },
  {
    id: 'biz-2',
    name: 'Croma Partner Electronics',
    city: 'Mumbai',
    state: 'Maharashtra',
    owner: 'Karan Mehra',
    phone: '+91 98123 45678',
    gstNumber: '27AABCT9876Q1Z2',
    activeSkus: 42,
    monthlyRevenue: 642000,
    status: 'active',
  },
  {
    id: 'biz-3',
    name: 'Vijay Sales Franchise Connaught',
    city: 'New Delhi',
    state: 'Delhi',
    owner: 'Pooja Verma',
    phone: '+91 98234 56789',
    gstNumber: '07AAACR1234P1Z8',
    activeSkus: 35,
    monthlyRevenue: 512000,
    status: 'active',
  },
  {
    id: 'biz-4',
    name: 'Apex Digital & Computing Hub',
    city: 'Hyderabad',
    state: 'Telangana',
    owner: 'Suresh Reddy',
    phone: '+91 98345 67890',
    gstNumber: '36AAACE4321L1Z0',
    activeSkus: 29,
    monthlyRevenue: 388000,
    status: 'active',
  },
  {
    id: 'biz-5',
    name: 'Shree Balaji Electronics',
    city: 'Ahmedabad',
    state: 'Gujarat',
    owner: 'Bhavin Patel',
    phone: '+91 98456 78901',
    gstNumber: '24AAACP5678M1Z3',
    activeSkus: 14,
    monthlyRevenue: 195000,
    status: 'active',
  },
];

const PLATFORM_USERS = [
  {
    id: 'u-1',
    name: 'Sourav',
    role: 'Platform Super Admin',
    email: 'admin@electramanager.com',
    mobile: '+91 99999 88888',
    store: 'Platform System HQ',
    status: 'Active',
  },
  {
    id: 'u-2',
    name: 'Rahul Sharma',
    role: 'Store Owner / Manager',
    email: 'rahul.sharma@electraretail.in',
    mobile: '+91 98765 43210',
    store: 'Electra Retail & Tech Hub (HQ)',
    status: 'Active',
  },
  {
    id: 'u-3',
    name: 'Karan Mehra',
    role: 'Store Owner',
    email: 'karan@cromapartner.in',
    mobile: '+91 98123 45678',
    store: 'Croma Partner Electronics (Mumbai)',
    status: 'Active',
  },
  {
    id: 'u-4',
    name: 'Pooja Verma',
    role: 'Store Manager',
    email: 'pooja.v@delhielectronics.com',
    mobile: '+91 98234 56789',
    store: 'Vijay Sales Franchise Connaught',
    status: 'Active',
  },
  {
    id: 'u-5',
    name: 'Anil Gupta',
    role: 'Inventory Specialist',
    email: 'anil@electraretail.in',
    mobile: '+91 98990 12345',
    store: 'Electra Retail & Tech Hub (HQ)',
    status: 'Active',
  },
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentTab,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { categories, products, activityLogs } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const totalPlatformGmv = SAMPLE_STORES.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const totalStores = SAMPLE_STORES.length;
  const totalSkus = SAMPLE_STORES.reduce((sum, s) => sum + s.activeSkus, 0);

  const filteredStores = SAMPLE_STORES.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-900/90 to-slate-900 border border-violet-800/80 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-display leading-tight">
                Admin Console
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified: {user?.name || 'Sourav'}
              </span>
            </div>
            <p className="text-xs text-violet-200 mt-0.5">
              Multi-store platform management, retailer oversight & global security controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span>Store View</span>
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {(currentTab === 'admin-dashboard' || !currentTab.startsWith('admin-')) && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Active Retailers</span>
                <Building2 className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {totalStores}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> All systems normal
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Monthly Platform GMV</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {formatINR(totalPlatformGmv)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Across 5 Indian cities
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Total Catalog SKUs</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {totalSkus}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Active consumer tech items
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Platform Users</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {PLATFORM_USERS.length}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Owners, managers & staff
              </p>
            </div>
          </div>

          {/* Connected Retail Stores Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Connected Retail Stores & Partners
                </h3>
                <p className="text-xs text-slate-500">
                  Electronics businesses actively managed on the multi-tenant system
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stores, city, owner..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-2">Store Name</th>
                    <th className="pb-2">Location</th>
                    <th className="pb-2">Owner / Contact</th>
                    <th className="pb-2">GSTIN</th>
                    <th className="pb-2 text-right">Active SKUs</th>
                    <th className="pb-2 text-right">Monthly Revenue</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStores.map(store => (
                    <tr key={store.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                          <span>{store.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {store.city}, {store.state}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{store.owner}</p>
                          <p className="text-[10px] text-slate-400">{store.phone}</p>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-slate-500">
                        {store.gstNumber}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-700 dark:text-slate-200">
                        {store.activeSkus}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatINR(store.monthlyRevenue)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stores & Retailers Tab */}
      {currentTab === 'admin-businesses' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Registered Electronics Retailers
              </h3>
              <p className="text-xs text-slate-500">
                Full list of stores connected to the ElectraManager cloud platform
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_STORES.map(store => (
              <div
                key={store.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {store.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                    {store.city}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Owner: {store.owner} • {store.phone}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">GSTIN: {store.gstNumber}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatINR(store.monthlyRevenue)} / mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Users Tab */}
      {currentTab === 'admin-users' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Platform User Directory
            </h3>
            <p className="text-xs text-slate-500">
              User credentials and authorization roles across stores
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Assigned Role</th>
                  <th className="pb-2">Contact Details</th>
                  <th className="pb-2">Business Store</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PLATFORM_USERS.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role.includes('Admin')
                          ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      <div>
                        <span>{u.mobile}</span>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {u.store}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Audit Logs Tab */}
      {currentTab === 'admin-activity' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Platform Audit & Security Logs
            </h3>
            <p className="text-xs text-slate-500">
              Immutable timeline of system events, inventory modifications, and user authentications
            </p>
          </div>

          <div className="space-y-2">
            {SAMPLE_ACTIVITY_LOGS.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {log.action}
                    </span>
                    <p className="text-[11px] text-slate-500">{log.details}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
