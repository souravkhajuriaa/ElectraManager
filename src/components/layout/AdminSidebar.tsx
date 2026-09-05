import React from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  Layers,
  ScrollText,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { NavigationTab } from '@/src/types';
import { useAuth } from '@/src/contexts/AuthContext';

interface AdminSidebarProps {
  currentTab: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onNavigate?: (tab: NavigationTab) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { switchRole } = useAuth();

  const handleSelect = (tab: NavigationTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigate) onNavigate(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const adminNavItems = [
    {
      id: 'admin-dashboard' as NavigationTab,
      label: 'Admin Overview',
      icon: ShieldAlert,
    },
    {
      id: 'admin-businesses' as NavigationTab,
      label: 'Retailers & Stores',
      icon: Building2,
    },
    {
      id: 'admin-users' as NavigationTab,
      label: 'Platform Users',
      icon: Users,
    },
    {
      id: 'admin-categories' as NavigationTab,
      label: 'System Categories',
      icon: Layers,
    },
    {
      id: 'admin-activity' as NavigationTab,
      label: 'Global Audit Logs',
      icon: ScrollText,
    },
  ];

  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-200 select-none ${
        mobileOpen
          ? 'translate-x-0 w-60 shadow-xl'
          : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
    >
      {/* Admin Brand Header */}
      <div className="h-13 flex items-center justify-between px-3.5 border-b border-slate-800 bg-slate-950/60 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-bold text-xs tracking-wider text-white truncate block uppercase">
                ADMIN CONSOLE
              </span>
              <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wider leading-tight">
                Multi-Tenant Root
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}

        {onToggleCollapse && (
          <button
            id="btn-toggle-admin-sidebar"
            onClick={onToggleCollapse}
            className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              isCollapsed ? 'hidden' : ''
            }`}
            title="Collapse"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Admin Nav List */}
      <div className="flex-1 py-2.5 px-2 space-y-0.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Superadmin
          </div>
        )}

        {adminNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors group ${
                isActive
                  ? 'bg-violet-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-400'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Return to Retailer Store App */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/40 shrink-0">
        <button
          id="btn-return-to-store"
          onClick={() => {
            switchRole('user');
            handleSelect('dashboard');
          }}
          className={`w-full flex items-center gap-2 p-2 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Return to Retail Store"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400 shrink-0" />
          {!isCollapsed && (
            <div className="text-left flex-1 truncate">
              <span className="font-semibold block leading-tight">Return to Store</span>
              <span className="text-[10px] text-slate-400 leading-tight">User Mode</span>
            </div>
          )}
        </button>
      </div>

      {isCollapsed && onToggleCollapse && (
        <div className="p-1.5 border-t border-slate-800 text-center">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto"
            title="Expand"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
};
