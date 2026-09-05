import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  IndianRupee,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useData } from '@/src/contexts/DataContext';
import { NavigationTab } from '@/src/types';
import { formatINR, formatCompactINR } from '@/src/lib/utils/currency';

interface AnalyticsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate }) => {
  const { products, categories, sales, totalInventoryValue, totalSalesAmount, totalEstimatedProfit } = useData();

  // 1. Group sales by category
  const salesByCategoryMap: Record<string, { name: string; revenue: number; profit: number }> = {};
  sales.forEach(s => {
    const cat = categories.find(c => c.id === s.categoryId);
    const catName = cat ? cat.name.split('&')[0].trim() : 'General';
    if (!salesByCategoryMap[catName]) {
      salesByCategoryMap[catName] = { name: catName, revenue: 0, profit: 0 };
    }
    salesByCategoryMap[catName].revenue += s.totalAmount;
    salesByCategoryMap[catName].profit += s.profit;
  });

  const categoryRevenueData = Object.values(salesByCategoryMap);

  // 2. High margin products
  const productMargins = products.map(p => {
    const margin = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) : 0;
    return {
      ...p,
      margin,
      profit: p.sellingPrice - p.purchasePrice,
    };
  }).sort((a, b) => b.margin - a.margin);

  // 3. Overall store profit margin
  const storeMarginPct = totalSalesAmount > 0 ? Math.round((totalEstimatedProfit / totalSalesAmount) * 100) : 0;

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Revenue Realized</span>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white">
            {formatINR(totalSalesAmount)}
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            Across {sales.length} fulfilled retail transactions
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Net Business Profit</span>
          <div className="mt-2 text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {formatINR(totalEstimatedProfit)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            Overall Profit Margin: {storeMarginPct}%
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Shelf Inventory Capital</span>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white">
            {formatINR(totalInventoryValue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Current stock assets ready for sale
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue vs Profit Bar Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-1">
            Revenue & Profit by Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Comparison of top electronics categories in ₹ INR
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highest Margin SKUs */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-1">
              Top Profit Margin Electronics
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              SKUs that yield the highest percentage margins
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {productMargins.slice(0, 5).map(p => (
                <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                  <div className="min-w-0 max-w-[200px]">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Cost: {formatINR(p.purchasePrice)} • Sell: {formatINR(p.sellingPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      +{p.margin}%
                    </span>
                    <p className="text-[10px] text-slate-500">
                      +{formatINR(p.profit)} / unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Audio & Accessories typically lead high-margin categories</span>
            <button
              onClick={() => onNavigate('products')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Manage Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
