import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Search,
  CheckCheck,
  Package,
  Boxes,
  Layers,
  Menu,
  Check,
  ChevronDown,
  User,
  Users,
  Lock,
} from 'lucide-react';
import { NavigationTab, Product } from '@/src/types';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useData } from '@/src/contexts/DataContext';
import { formatRelativeTime } from '@/src/lib/utils/currency';

interface NavbarProps {
  currentTab?: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onNavigate?: (tab: NavigationTab) => void;
  onOpenMobileMenu?: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab = 'dashboard',
  onSelectTab,
  onNavigate,
  onOpenMobileMenu,
  onSelectProduct,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, switchRole, logout, openAdminLoginModal } = useAuth();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsRead,
    products,
  } = useData();

  const handleSelectTab = (tab: NavigationTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigate) onNavigate(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick search matching products
  const matchingProducts = searchQuery.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const tabTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Live inventory metrics & retail sales tracking' },
    items: { title: 'Items & Categories', subtitle: 'Classify consumer electronics & appliances' },
    products: { title: 'Products Catalog', subtitle: 'Manage stock prices, SKUs and product details' },
    inventory: { title: 'Inventory Control', subtitle: 'Monitor stock levels, reorder limits & valuations' },
    sales: { title: 'Sales & Invoicing', subtitle: 'Record new retail sales and view transaction history' },
    analytics: { title: 'Financial Analytics', subtitle: 'Profit margins, revenue breakdown and trends' },
    notifications: { title: 'Alerts & Notifications', subtitle: 'Critical low-stock, out-of-stock and sales updates' },
    settings: { title: 'Store Settings', subtitle: 'Configure store details, tax/GST, and system preferences' },
    'admin-dashboard': { title: 'Admin', subtitle: 'Multi-store platform management & metrics' },
    'admin-businesses': { title: 'Stores & Retailers', subtitle: 'Manage connected electronics businesses' },
    'admin-users': { title: 'User Accounts', subtitle: 'Control staff and manager access permissions' },
    'admin-categories': { title: 'System Default Categories', subtitle: 'Global categories templates for electronics' },
    'admin-activity': { title: 'Global Audit Logs', subtitle: 'Track all administrative and retail actions' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'ElectraManager', subtitle: 'Electronics Retail' };

  return (
    <header
      id="app-navbar"
      className="h-13 px-3 sm:px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 shrink-0"
    >
      {/* Left: Mobile hamburger + Title */}
      <div className="flex items-center gap-2.5">
        <button
          id="btn-mobile-nav-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display tracking-tight leading-tight flex items-center gap-1.5">
            {currentInfo.title}
            {isAdmin && currentTab.startsWith('admin-') && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                ADMIN
              </span>
            )}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 leading-none">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Global Search, Notifications, Theme, User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Global Search Bar */}
        <div ref={searchRef} className="relative hidden sm:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-44 lg:w-56 h-8 pl-8 pr-2.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full mt-1.5 right-0 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Products ({matchingProducts.length})
              </div>
              {matchingProducts.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No products found for "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {matchingProducts.map(prod => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        handleSelectTab('products');
                        if (onSelectProduct) onSelectProduct(prod);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate leading-tight">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{prod.brand}</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums font-mono">
                            ₹{prod.sellingPrice.toLocaleString('en-IN')}
                          </span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown Button */}
        <div ref={notifRef} className="relative">
          <button
            id="btn-navbar-notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h4>
                  {unreadNotificationCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif, index) => (
                    <div
                      key={`${notif.id}-${index}`}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.type === 'low_stock' || notif.type === 'out_of_stock') {
                          handleSelectTab('inventory');
                        } else if (notif.type === 'sale') {
                          handleSelectTab('sales');
                        }
                        setIsNotifOpen(false);
                      }}
                      className={`p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    handleSelectTab('notifications');
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          id="btn-navbar-theme-toggle"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
          }}
          className="group relative p-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 ease-in-out group-hover:-rotate-12 group-hover:scale-110 pointer-events-none" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 ease-in-out group-hover:rotate-45 group-hover:scale-110 pointer-events-none" />
          )}
        </button>

        {/* Profile Avatar / Role Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            id="btn-navbar-profile"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs select-none ring-1 ring-white/20 dark:ring-slate-700/50">
              {user?.name ? (
                <span>
                  {user.name
                    .replace(/[\(\)]/g, '')
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(part => part[0])
                    .join('')
                    .toUpperCase()}
                </span>
              ) : (
                <User className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block max-w-[110px] leading-tight">
                {user?.name || 'Store User'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize block leading-tight">
                {user?.role === 'admin' ? 'Owner (Admin)' : 'Employee (User)'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-1.5 z-50">
              <div className="px-2 py-1.5 border-b border-slate-200 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.mobile}
                </p>
              </div>

              {/* Fast Role Switcher */}
              <div className="py-0.5">
                <div className="px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                  Switch Role
                </div>
                <button
                  onClick={() => {
                    switchRole('user');
                    handleSelectTab('dashboard');
                    setIsProfileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    user?.role === 'user'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Employee (User)</span>
                  {user?.role === 'user' && <Check className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => {
                    if (user?.role === 'admin') {
                      handleSelectTab('admin-dashboard');
                    } else {
                      openAdminLoginModal('admin-dashboard');
                    }
                    setIsProfileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    user?.role === 'admin'
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Owner (Admin)</span>
                  {user?.role === 'admin' ? (
                    <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  )}
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    handleSelectTab('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Store Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded-md text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
