import React, { useState } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  Receipt,
  Search,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  Download,
  IndianRupee,
  Bot,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '@/src/contexts/DataContext';
import { useAIChat } from '@/src/contexts/ChatContext';
import { Product, Sale, NavigationTab } from '@/src/types';
import { Modal } from '@/src/components/ui/Modal';
import { formatINR, formatDateTime, formatCompactINR } from '@/src/lib/utils/currency';

interface SalesViewProps {
  onNavigate: (tab: NavigationTab) => void;
  preselectedProduct?: Product | null;
}

export const SalesView: React.FC<SalesViewProps> = ({
  onNavigate,
  preselectedProduct,
}) => {
  const { products, sales, recordSale, business } = useData();
  const { openChatWithPrompt } = useAIChat();

  // Sale form states
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.id || (products.find(p => p.stockQuantity > 0)?.id || '')
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(
    preselectedProduct ? preselectedProduct.sellingPrice : 0
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('UPI / QR Payment');
  const [saleSuccessMessage, setSaleSuccessMessage] = useState('');
  const [saleError, setSaleError] = useState('');

  // Invoice / Receipt modal
  const [viewReceiptSale, setViewReceiptSale] = useState<Sale | null>(null);

  // Search in sales table
  const [searchQuery, setSearchQuery] = useState('');

  // Selected product reference
  const currentProduct = products.find(p => p.id === selectedProductId);

  // Update unitPrice if product selection changes
  React.useEffect(() => {
    if (currentProduct) {
      setUnitPrice(currentProduct.sellingPrice);
      setQuantity(1);
    }
  }, [selectedProductId]);

  const totalAmount = unitPrice * quantity;
  const estimatedProfit = currentProduct
    ? (unitPrice - currentProduct.purchasePrice) * quantity
    : 0;

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError('');
    setSaleSuccessMessage('');

    if (!currentProduct) {
      setSaleError('Please select a valid product to sell');
      return;
    }

    if (quantity <= 0) {
      setSaleError('Quantity must be at least 1');
      return;
    }

    if (currentProduct.stockQuantity < quantity) {
      setSaleError(`Insufficient stock! Only ${currentProduct.stockQuantity} units available.`);
      return;
    }

    const res = recordSale({
      productId: currentProduct.id,
      quantity,
      unitPrice,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      notes,
    });

    if (!res.success) {
      setSaleError(res.error || 'Failed to record sale');
    } else {
      // Trigger festive confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        /* ignore */
      }

      setSaleSuccessMessage(
        `Sale recorded successfully! ${quantity}x "${currentProduct.name}" sold for ₹${totalAmount.toLocaleString('en-IN')}.`
      );
      setCustomerName('');
      setCustomerPhone('');
      setQuantity(1);
      setTimeout(() => setSaleSuccessMessage(''), 5000);
    }
  };

  // Metrics
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
  const totalUnitsSold = sales.reduce((acc, s) => acc + s.quantity, 0);

  // Filtered sales
  const filteredSales = sales.filter(s =>
    s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sales Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Sales Orders</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white">
            {totalSalesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Transactions processed</p>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Gross Revenue</span>
            <IndianRupee className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white">
            {formatCompactINR(totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">₹ INR Collected</p>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Realized Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {formatCompactINR(totalProfit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Above dealer cost</p>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Units Dispatched</span>
            <ShoppingCart className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white">
            {totalUnitsSold}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Consumer appliances</p>
        </div>
      </div>

      {/* Record a Sale Panel */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Quick Billing & Record Sale
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select product, specify sold quantity, and immediately deduct live inventory
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            Instant Shelf Sync
          </span>
        </div>

        {saleSuccessMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{saleSuccessMessage}</span>
          </div>
        )}

        {saleError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{saleError}</span>
          </div>
        )}

        <form onSubmit={handleRecordSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Selector */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Product *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                    {p.name} — {p.stockQuantity > 0 ? `(${p.stockQuantity} in stock)` : '(OUT OF STOCK)'}
                  </option>
                ))}
              </select>

              {currentProduct && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                  <span>SKU: {currentProduct.sku}</span>
                  <span className={currentProduct.stockQuantity > 0 ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                    Available: {currentProduct.stockQuantity} units
                  </span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Sold *
              </label>
              <input
                type="number"
                min={1}
                max={currentProduct?.stockQuantity || 1}
                required
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Selling Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={unitPrice}
                onChange={e => setUnitPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Mobile
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="+91 98450 11223"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Payment Mode / Notes */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode & Remarks
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. GPay / PhonePe / Card swipe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Order Summary Bar */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">
                  Total Bill Amount
                </span>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-display">
                  {formatINR(totalAmount)}
                </span>
              </div>
              <div className="border-l border-blue-200 dark:border-blue-800/80 pl-4">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">
                  Transaction Profit
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatINR(estimatedProfit)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!currentProduct || currentProduct.stockQuantity <= 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Sale & Deduct Stock</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sales History Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Transaction History
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of past receipts, customer purchases, and profits
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product, customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => openChatWithPrompt('Show recent customer billing details, customer names, and payment records.')}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
              title="Search customer bills with ElectraBot AI"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">AI Bill Query</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Total Bill</th>
                <th className="py-3 px-4">Profit</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {formatDateTime(sale.saleDate)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {sale.productName}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{sale.customerName || 'Walk-in'}</p>
                    {sale.customerPhone && <p className="text-[10px] text-slate-400 font-mono">{sale.customerPhone}</p>}
                  </td>
                  <td className="py-3 px-4 text-center font-bold font-mono">
                    {sale.quantity}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {formatINR(sale.unitPrice)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatINR(sale.totalAmount)}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +{formatINR(sale.profit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setViewReceiptSale(sale)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retail Invoice / Receipt Modal */}
      {viewReceiptSale && (
        <Modal
          isOpen={!!viewReceiptSale}
          onClose={() => setViewReceiptSale(null)}
          title="Retail Tax Invoice"
          subtitle={`Invoice Ref #${viewReceiptSale.id.slice(-6).toUpperCase()}`}
          maxWidth="md"
        >
          <div className="space-y-4 font-mono text-xs">
            {/* Business Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase font-sans">
                {business.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                {business.address}
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                Phone: {business.phone} • GSTIN: {business.gstNumber || '29ABCDE1234F1Z5'}
              </p>
            </div>

            {/* Customer & Timestamp */}
            <div className="flex justify-between text-[11px] text-slate-500">
              <div>
                <span>Customer: </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {viewReceiptSale.customerName}
                </span>
                {viewReceiptSale.customerPhone && <div>Ph: {viewReceiptSale.customerPhone}</div>}
              </div>
              <div className="text-right">
                <div>Date: {new Date(viewReceiptSale.saleDate).toLocaleDateString('en-IN')}</div>
                <div>Time: {new Date(viewReceiptSale.saleDate).toLocaleTimeString('en-IN')}</div>
              </div>
            </div>

            {/* Line items */}
            <div className="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-2 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                <span>Description</span>
                <span>Total</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-sans">
                <span className="truncate max-w-[200px]">{viewReceiptSale.productName}</span>
                <span className="font-mono font-bold">{formatINR(viewReceiptSale.totalAmount)}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {viewReceiptSale.quantity} units @ {formatINR(viewReceiptSale.unitPrice)} each
              </div>
            </div>

            {/* Total summary */}
            <div className="space-y-1 text-right">
              <div className="flex justify-between text-slate-500">
                <span>Payment Mode</span>
                <span>{viewReceiptSale.notes || 'UPI / Cash'}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-1">
                <span>Total Amount Paid</span>
                <span className="text-blue-600 dark:text-blue-400">{formatINR(viewReceiptSale.totalAmount)}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400 font-sans">
              Thank you for your business! Goods once sold can be serviced under manufacturer warranty.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setViewReceiptSale(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
