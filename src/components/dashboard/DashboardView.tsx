import React from 'react';
import {
  Package,
  Layers,
  Boxes,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useData } from '@/src/contexts/DataContext';
import { NavigationTab } from '@/src/types';
import { formatINR, formatCompactINR, formatRelativeTime } from '@/src/lib/utils/currency';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddProduct?: () => void;
  onOpenRecordSale?: () => void;
  onRecordSaleForProduct?: (product: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddProduct,
  onOpenRecordSale,
  onRecordSaleForProduct,
}) => {
  const {
    products,
    categories,
    sales,
    totalInventoryValue,
    totalStockUnits,
    lowStockCount,
    outOfStockCount,
    totalSalesAmount,
    totalEstimatedProfit,
    activityLogs,
  } = useData();

  const handleRecordSale = () => {
    if (onOpenRecordSale) onOpenRecordSale();
    else onNavigate('sales');
  };

  const handleAddProduct = () => {
    if (onOpenAddProduct) onOpenAddProduct();
    else onNavigate('products');
  };

  // 1. Prepare Sales & Profit Trend chart data (past 7 dates)
  const salesByDate: Record<string, { date: string; revenue: number; profit: number }> = {};
  sales.forEach(sale => {
    const d = new Date(sale.saleDate);
    const dateLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!salesByDate[dateLabel]) {
      salesByDate[dateLabel] = { date: dateLabel, revenue: 0, profit: 0 };
    }
    salesByDate[dateLabel].revenue += sale.totalAmount;
    salesByDate[dateLabel].profit += sale.profit;
  });

  const salesTrendData = Object.values(salesByDate).length > 0
    ? Object.values(salesByDate)
    : [
        { date: '28 Aug', revenue: 45490, profit: 7490 },
        { date: '31 Aug', revenue: 5996, profit: 2196 },
        { date: '01 Sep', revenue: 21998, profit: 5598 },
        { date: '02 Sep', revenue: 57990, profit: 10990 },
        { date: '03 Sep', revenue: 129998, profit: 15998 },
        { date: '04 Sep', revenue: 62990, profit: 10990 },
      ];

  // 2. Prepare Category breakdown for Donut Chart
  const categoryCountMap: Record<string, number> = {};
  products.forEach(p => {
    const cat = categories.find(c => c.id === p.categoryId);
    const catName = cat ? cat.name.split('&')[0].trim() : 'Other';
    categoryCountMap[catName] = (categoryCountMap[catName] || 0) + 1;
  });

  const categoryDonutData = Object.entries(categoryCountMap).map(([name, count]) => ({
    name,
    value: count,
  }));

  const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#F43F5E'];

  // 3. Top selling products
  const productSalesMap: Record<string, { name: string; fullName: string; revenue: number; units: number }> = {};
  sales.forEach(s => {
    if (!productSalesMap[s.productName]) {
      const baseName = s.productName.split('(')[0].trim();
      const cleanName = baseName.length > 18 ? baseName.slice(0, 17) + '…' : baseName;
      productSalesMap[s.productName] = {
        name: cleanName,
        fullName: s.productName,
        revenue: 0,
        units: 0,
      };
    }
    productSalesMap[s.productName].revenue += s.totalAmount;
    productSalesMap[s.productName].units += s.quantity;
  });

  const topProductsData = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900 dark:bg-slate-950 rounded-lg p-3 sm:p-3.5 text-white border border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold mb-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Electronics Retail Operating System</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-display tracking-tight leading-tight">
            Inventory & Sales Dashboard
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xl leading-tight">
            Real-time valuation, sales velocity, and low-inventory reorder alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-dash-record-sale"
            onClick={handleRecordSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Record Sale</span>
          </button>
          <button
            id="btn-dash-add-product"
            onClick={handleAddProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner if any low/out-of-stock items */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-tight">
                Inventory Attention Needed
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight mt-0.5">
                {outOfStockCount > 0 && <span className="font-bold">{outOfStockCount} item(s) out of stock. </span>}
                {lowStockCount > 0 && <span>{lowStockCount} item(s) reached minimum threshold.</span>}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold shrink-0 transition-colors"
          >
            Review Inventory
          </button>
        </div>
      )}

      {/* 8 KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Products
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
              {products.length}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Active Catalog
            </span>
          </div>
        </div>

        {/* Categories */}
        <div
          onClick={() => onNavigate('items')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Categories
            </span>
            <div className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
              {categories.length}
            </span>
            <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
              Taxonomy
            </span>
          </div>
        </div>

        {/* Total Stock Units */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Stock Units
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
              {totalStockUnits}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Units on Shelf
            </span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Low Stock
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-lg sm:text-xl font-bold font-display tabular-nums ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {lowStockCount}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              Reorder soon
            </span>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-lg sm:text-xl font-bold font-display tabular-nums ${outOfStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {outOfStockCount}
            </span>
            <span className="text-[10px] text-rose-500 font-medium">
              Zero Units
            </span>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Inventory Value
            </span>
            <div className="w-6 h-6 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white tabular-nums font-mono">
              {formatCompactINR(totalInventoryValue)}
            </span>
          </div>
        </div>

        {/* Total Sales */}
        <div
          onClick={() => onNavigate('sales')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white tabular-nums font-mono">
              {formatCompactINR(totalSalesAmount)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              {sales.length}
            </span>
          </div>
        </div>

        {/* Estimated Profit */}
        <div
          onClick={() => onNavigate('analytics')}
          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Estimated Profit
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold font-display text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
              {formatCompactINR(totalEstimatedProfit)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Net
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Sales & Profit Revenue Area Chart */}
        <div className="lg:col-span-2 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                Sales Revenue & Profit Performance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Daily transaction volume and net retail earnings (INR)
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-48 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px', padding: '6px 10px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                Catalog by Category
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Product distribution ratio
              </p>
            </div>
            <button
              onClick={() => onNavigate('items')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Items <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-44 w-full flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryDonutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Products`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px', padding: '6px 10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            {categoryDonutData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] truncate">
                <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate text-slate-600 dark:text-slate-400">{item.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Products + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Top 5 Selling Products */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                Top Revenue Drivers
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Products generating highest revenue
              </p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Sales Log
            </button>
          </div>

          {topProductsData.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No sales logged yet. Use "Record Sale" to add sales.
            </div>
          ) : (
            <div className="h-48 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 6, right: 14, left: 10, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    width={115}
                    tickLine={false}
                    interval={0}
                    tick={(props: any) => {
                      const { x, y, payload } = props;
                      const text = String(payload?.value || '');
                      return (
                        <text
                          x={x - 6}
                          y={y}
                          dy={3.5}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize={10}
                          className="font-medium select-none"
                        >
                          {text}
                        </text>
                      );
                    }}
                  />
                  <Tooltip
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(_, items: any[]) => items?.[0]?.payload?.fullName || ''}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', color: '#fff', fontSize: '11px', padding: '6px 10px' }}
                  />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Activity Log */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                Store Operations Audit Feed
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live chronological updates across products and sales
              </p>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Live
            </span>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-48 pr-0.5">
            {activityLogs.slice(0, 6).map((log, index) => (
              <div key={`${log.id}-${index}`} className="flex items-start gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 dark:text-slate-200 font-medium truncate text-[11px]">
                    {log.details}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.2">
                    by {log.userName} • {formatRelativeTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
