import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  ShoppingCart,
  CheckCheck,
  Trash2,
  Package,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useData } from '@/src/contexts/DataContext';
import { NotificationType, NavigationTab } from '@/src/types';
import { formatRelativeTime } from '@/src/lib/utils/currency';

interface NotificationsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    clearAllNotifications,
    unreadNotificationCount,
  } = useData();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'low_stock') return n.type === 'low_stock';
    if (filterType === 'out_of_stock') return n.type === 'out_of_stock';
    if (filterType === 'sale') return n.type === 'sale';
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'out_of_stock':
        return <AlertOctagon className="w-5 h-5 text-rose-500" />;
      case 'sale':
        return <ShoppingCart className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-blue-600" />
            Alerts & System Notifications
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time low stock triggers, stock-out emergencies, and completed sale alerts
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadNotificationCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadNotificationCount})` },
          { id: 'low_stock', label: 'Low Stock' },
          { id: 'out_of_stock', label: 'Out of Stock' },
          { id: 'sale', label: 'Sales' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              You are completely caught up! Automatic triggers will show here as stock changes.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif, index) => (
            <div
              key={`${notif.id}-${index}`}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-2.5 rounded-lg border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                !notif.isRead
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-xs">
                  {getNotificationIcon(notif.type)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
              </div>

              {(notif.type === 'low_stock' || notif.type === 'out_of_stock') && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                    onNavigate('inventory');
                  }}
                  className="h-6 px-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Restock</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
