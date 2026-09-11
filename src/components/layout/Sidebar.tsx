import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  Boxes,
  ShoppingCart,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';
import { NavigationTab } from '@/src/types';
import { useData } from '@/src/contexts/DataContext';
import { useAuth } from '@/src/contexts/AuthContext';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onNavigate?: (tab: NavigationTab) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { categories, products, unreadNotificationCount, lowStockCount, outOfStockCount, business } = useData();
  const { isAdmin, switchRole, openAdminLoginModal } = useAuth();

  const handleSelect = (tab: NavigationTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigate) onNavigate(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'items' as NavigationTab,
      label: 'Items & Categories',
      icon: Layers,
      badge: categories.length > 0 ? categories.length : null,
    },
    {
      id: 'products' as NavigationTab,
      label: 'Products Catalog',
      icon: Package,
      badge: products.length > 0 ? products.length : null,
    },
    {
      id: 'inventory' as NavigationTab,
      label: 'Inventory Control',
      icon: Boxes,
      badge: lowStockCount + outOfStockCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
          {lowStockCount + outOfStockCount}
        </span>
      ) : null,
    },
    {
      id: 'sales' as NavigationTab,
      label: 'Sales & Billing',
      icon: ShoppingCart,
      badge: null,
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
      badge: unreadNotificationCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
          {unreadNotificationCount}
        </span>
      ) : null,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Store Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 select-none ${
        mobileOpen
          ? 'translate-x-0 w-60 shadow-xl'
          : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
    >
      {/* Brand Header */}
      <div className="h-13 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate block leading-tight">
                Electra<span className="text-blue-600 dark:text-blue-400">Manager</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {business.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
        )}

        {onToggleCollapse && (
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleCollapse}
            className={`p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isCollapsed ? 'hidden' : ''
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-2.5 px-2 space-y-0.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Operations
          </div>
        )}

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">
                  {item.label}
                </span>
              )}

              {!isCollapsed && item.badge && (
                typeof item.badge === 'number' ? (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-semibold rounded ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  item.badge
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Quick Switch Section */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
        <button
          id="btn-sidebar-admin-switch"
          onClick={() => {
            if (isAdmin) {
              handleSelect('admin-dashboard');
            } else {
              openAdminLoginModal('admin-dashboard');
            }
          }}
          className={`w-full flex items-center gap-2 p-2 rounded-md border border-violet-200 dark:border-violet-900/50 bg-violet-50/60 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/40 text-xs font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isAdmin ? 'Switch to Admin Console' : 'Admin Console (Login Required)'}
        >
          {isAdmin ? (
            <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
          ) : (
            <div className="relative shrink-0">
              <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 absolute -bottom-1 -right-1" />
            </div>
          )}
          {!isCollapsed && (
            <div className="text-left flex-1 truncate">
              <div className="flex items-center justify-between">
                <span className="font-semibold block leading-tight">Admin Console</span>
                {!isAdmin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-200/70 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Login
                  </span>
                )}
              </div>
              <span className="text-[10px] text-violet-500 dark:text-violet-400">
                {isAdmin ? 'Superuser Mode' : 'Admin Login Required'}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Collapse Button when collapsed */}
      {isCollapsed && onToggleCollapse && (
        <div className="p-1.5 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            id="btn-expand-sidebar"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
};
