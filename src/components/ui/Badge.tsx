import React from 'react';
import { StockStatus } from '@/src/types';

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ status, quantity, className = '' }) => {
  if (status === 'in_stock') {
    return (
      <span
        id="badge-in-stock"
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium leading-none bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>In Stock{quantity !== undefined ? ` (${quantity})` : ''}</span>
      </span>
    );
  }

  if (status === 'low_stock') {
    return (
      <span
        id="badge-low-stock"
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium leading-none bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Low Stock{quantity !== undefined ? ` (${quantity})` : ''}</span>
      </span>
    );
  }

  return (
    <span
      id="badge-out-of-stock"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium leading-none bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      <span>Out of Stock</span>
    </span>
  );
};
