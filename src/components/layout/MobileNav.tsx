import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingCart,
  MoreHorizontal,
  Boxes,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { NavigationTab } from '@/src/types';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';

interface MobileNavProps {
  currentTab: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onNavigate?: (tab: NavigationTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab, onNavigate }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { unreadNotificationCount, lowStockCount, outOfStockCount } = useData();
  const { isAdmin, openAdminLoginModal } = useAuth();

  const handleTabClick = (tabId: NavigationTab) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  const mainTabs = [
    { id: 'dashboard' as NavigationTab, label: 'Home', icon: LayoutDashboard },
    { id: 'items' as NavigationTab, label: 'Items', icon: Layers },
    { id: 'products' as NavigationTab, label: 'Products', icon: Package },
    { id: 'sales' as NavigationTab, label: 'Sales', icon: ShoppingCart },
  ];

  const moreItems = [
    {
      id: 'inventory' as NavigationTab,
      label: 'Inventory Control',
      icon: Boxes,
      badge: lowStockCount + outOfStockCount > 0 ? `${lowStockCount + outOfStockCount} Alerts` : null,
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Financial Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'notifications' as NavigationTab,
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? `${unreadNotificationCount} New` : null,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Store Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Bottom Floating Bar for Mobile */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-1 z-40 pb-[env(safe-area-inset-bottom)] shadow-lg"
      >
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-nav-${tab.id}`}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-150 active:scale-90 cursor-pointer select-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        <button
          id="btn-mobile-more"
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-150 active:scale-90 cursor-pointer select-none ${
            isMoreOpen || ['inventory', 'analytics', 'notifications', 'settings', 'admin-dashboard'].includes(currentTab)
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          {['inventory', 'analytics', 'notifications', 'settings', 'admin-dashboard'].includes(currentTab) && (
            <span className="absolute top-0 inset-x-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
          <div className="relative p-1">
            <MoreHorizontal className="w-4 h-4 stroke-2" />
            {(unreadNotificationCount > 0 || lowStockCount + outOfStockCount > 0) && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white dark:ring-slate-900" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-none tracking-tight">More</span>
        </button>
      </nav>

      {/* More Modal / Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="flex-1"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="bg-white dark:bg-slate-900 rounded-t-xl p-3.5 border-t border-slate-200 dark:border-slate-800 shadow-xl space-y-2.5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-900 dark:text-white font-display">
                Additional Modules
              </span>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      handleTabClick(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-left border transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{item.label}</p>
                      {item.badge && (
                        <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                          {item.badge}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Admin Switcher on mobile */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isAdmin) {
                    handleTabClick('admin-dashboard');
                  } else {
                    openAdminLoginModal('admin-dashboard');
                  }
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
