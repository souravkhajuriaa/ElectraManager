import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  AlertOctagon,
  IndianRupee,
  Search,
  Plus,
  Minus,
  ArrowUpDown,
  Filter,
  Package,
  Bot,
} from 'lucide-react';
import { useData } from '@/src/contexts/DataContext';
import { useAIChat } from '@/src/contexts/ChatContext';
import { Product, NavigationTab } from '@/src/types';
import { StockBadge } from '@/src/components/ui/Badge';
import { Modal } from '@/src/components/ui/Modal';
import { formatINR, formatCompactINR, getStockStatus } from '@/src/lib/utils/currency';

interface InventoryViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onNavigate,
  onOpenAddProduct,
}) => {
  const {
    products,
    categories,
    updateStock,
    totalStockUnits,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue,
  } = useData();
  const { openChatWithPrompt } = useAIChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');

  // Modal for detailed stock adjustment
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState<'add' | 'remove' | 'set'>('add');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Stock audit update');

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;

    const status = getStockStatus(p.stockQuantity, p.minStockLevel);
    const matchesStatus =
      filterStockStatus === 'all' ||
      (filterStockStatus === 'in_stock' && status === 'in_stock') ||
      (filterStockStatus === 'low_stock' && status === 'low_stock') ||
      (filterStockStatus === 'out_of_stock' && status === 'out_of_stock');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdjust = (p: Product, mode: 'add' | 'remove' | 'set' = 'add') => {
    setSelectedProduct(p);
    setAdjustMode(mode);
    setAdjustQuantity(mode === 'set' ? p.stockQuantity : 5);
    setAdjustReason('Regular inventory review');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    updateStock(selectedProduct.id, adjustQuantity, adjustMode, adjustReason);
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Total Units on Shelf
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
            {totalStockUnits}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Across {products.length} electronics SKUs
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Low Stock Warnings
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold font-display text-amber-600 dark:text-amber-400 tabular-nums">
            {lowStockCount}
          </div>
          <p className="text-[10px] text-amber-600/80 mt-0.5">
            Below reorder threshold
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Out of Stock (Depleted)
            </span>
            <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold font-display text-rose-600 dark:text-rose-400 tabular-nums">
            {outOfStockCount}
          </div>
          <p className="text-[10px] text-rose-500 mt-0.5">
            Immediate PO required
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Stock Valuation
            </span>
            <div className="w-6 h-6 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tabular-nums">
            {formatCompactINR(totalInventoryValue)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Estimated gross retail value
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-2 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, product or brand..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:border-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="flex-1 sm:flex-none h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStockStatus}
            onChange={e => setFilterStockStatus(e.target.value)}
            className="flex-1 sm:flex-none h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low Stock Alerts</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <button
            type="button"
            onClick={() => openChatWithPrompt('Which items are low in stock, out of stock, or marked as damaged or returned in audit logs?')}
            className="h-8 px-2.5 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
            title="Audit stock and damaged items with ElectraBot AI"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">AI Stock Audit</span>
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">SKU / Model</th>
                <th className="py-2.5 px-3">Stock Status</th>
                <th className="py-2.5 px-3 text-center">Quick Adjust</th>
                <th className="py-2.5 px-3">Min Alert</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3">Total Value</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredProducts.map(product => {
                const status = getStockStatus(product.stockQuantity, product.minStockLevel);
                const category = categories.find(c => c.id === product.categoryId);
                const totalItemVal = product.sellingPrice * product.stockQuantity;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      status === 'out_of_stock' ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400 m-2" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {product.brand} • {category?.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3 font-mono text-[10px] text-slate-500">
                      <div>{product.sku}</div>
                      <div className="text-[9px] text-slate-400">{product.modelNumber || '-'}</div>
                    </td>

                    <td className="py-2 px-3">
                      <StockBadge status={status} quantity={product.stockQuantity} />
                    </td>

                    {/* Inline Quick Stepper (+ / -) */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md w-fit mx-auto">
                        <button
                          type="button"
                          onClick={() => updateStock(product.id, 1, 'remove', 'Quick shelf decrement')}
                          disabled={product.stockQuantity <= 0}
                          className="w-5 h-5 rounded bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 transition-colors"
                          title="Decrement stock (-1)"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-slate-900 dark:text-white text-xs tabular-nums">
                          {product.stockQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateStock(product.id, 1, 'add', 'Quick shelf restock')}
                          className="w-5 h-5 rounded bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          title="Increment stock (+1)"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2 px-3 font-mono text-slate-500 text-xs tabular-nums">
                      {product.minStockLevel} units
                    </td>

                    <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-white text-xs tabular-nums">
                      {formatINR(product.sellingPrice)}
                    </td>

                    <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs tabular-nums">
                      {formatINR(totalItemVal)}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleOpenAdjust(product)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Stock Adjustment Modal */}
      {selectedProduct && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Inventory Audit: ${selectedProduct.name}`}
          subtitle={`Current stock: ${selectedProduct.stockQuantity} units (SKU: ${selectedProduct.sku})`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveAdjust} className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setAdjustMode('add')}
                className={`py-1.5 px-2 rounded-md text-xs font-bold border transition-colors ${
                  adjustMode === 'add'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                + Inflow
              </button>
              <button
                type="button"
                onClick={() => setAdjustMode('remove')}
                className={`py-1.5 px-2 rounded-md text-xs font-bold border transition-colors ${
                  adjustMode === 'remove'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                - Outflow
              </button>
              <button
                type="button"
                onClick={() => setAdjustMode('set')}
                className={`py-1.5 px-2 rounded-md text-xs font-bold border transition-colors ${
                  adjustMode === 'set'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                = Override
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                required
                value={adjustQuantity}
                onChange={e => setAdjustQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full h-9 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center text-base focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Resulting Stock:{' '}
                <span className="font-bold text-blue-600 font-mono">
                  {adjustMode === 'add'
                    ? selectedProduct.stockQuantity + adjustQuantity
                    : adjustMode === 'remove'
                    ? Math.max(0, selectedProduct.stockQuantity - adjustQuantity)
                    : adjustQuantity}{' '}
                  units
                </span>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Inward Reference
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="e.g. Received new lot from distributor, damaged in storage, return..."
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
              >
                Confirm Update
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
