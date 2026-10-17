import { Product, Sale, Category, Business, ActivityLog } from '@/src/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isStreaming?: boolean;
}

export interface StoreContextData {
  business: Business;
  products: Product[];
  sales: Sale[];
  categories: Category[];
  activityLogs: ActivityLog[];
  stats: {
    totalRevenue: number;
    totalProfit: number;
    totalInventoryValue: number;
    totalStockUnits: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalProductsCount: number;
    totalSalesCount: number;
  };
}

/**
 * Send user query and store snapshot to server-side Gemini 3.8 Flash endpoint
 */
export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'model'; content: string }[],
  context: StoreContextData
): Promise<{ reply: string; model: string }> {
  try {
    const payload = {
      message,
      history,
      context: {
        business: {
          name: context.business.name,
          phone: context.business.phone,
          email: context.business.email,
          gstNumber: context.business.gstNumber,
          address: context.business.address,
        },
        stats: context.stats,
        products: context.products.map(p => {
          const category = context.categories.find(c => c.id === p.categoryId);
          return {
            id: p.id,
            name: p.name,
            brand: p.brand,
            modelNumber: p.modelNumber,
            sku: p.sku,
            categoryName: category?.name || p.categoryId,
            purchasePrice: p.purchasePrice,
            sellingPrice: p.sellingPrice,
            stockQuantity: p.stockQuantity,
            minStockLevel: p.minStockLevel,
            status: p.status,
            isLowStock: p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel,
            isOutOfStock: p.stockQuantity === 0,
          };
        }),
        recentSales: context.sales.slice(0, 50).map(s => ({
          id: s.id,
          productId: s.productId,
          productName: s.productName,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          totalAmount: s.totalAmount,
          profit: s.profit,
          customerName: s.customerName,
          customerPhone: s.customerPhone,
          notes: s.notes,
          saleDate: s.saleDate,
        })),
        activityLogs: context.activityLogs.slice(0, 30).map(l => ({
          id: l.id,
          userName: l.userName,
          action: l.action,
          entityType: l.entityType,
          entityId: l.entityId,
          details: l.details,
          createdAt: l.createdAt,
        })),
        categories: context.categories.map(c => ({ id: c.id, name: c.name })),
      },
    };

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || 'No response generated.',
      model: data.model || 'gemini-3.8-flash',
    };
  } catch (err: any) {
    console.warn('Backend API request failed, falling back to local store analyzer:', err);
    // Offline / client fallback
    const localReply = clientFallbackAnalysis(message, context);
    return {
      reply: localReply,
      model: 'local-store-copilot',
    };
  }
}

/**
 * Robust client-side fallback query responder in case server is temporarily unreachable
 */
function clientFallbackAnalysis(query: string, context: StoreContextData): string {
  const q = query.toLowerCase();
  const { products, sales, activityLogs, stats } = context;

  if (
    q.includes('revenue') ||
    q.includes('profit') ||
    q.includes('earning') ||
    q.includes('total sale') ||
    q.includes('kamai')
  ) {
    const margin = stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : '0';
    return `### 📊 Realtime Financial Calculations\n[METRIC_TILE:Total Revenue:₹${stats.totalRevenue.toLocaleString('en-IN')}:Total gross sales recorded]\n[METRIC_TILE:Total Profit:₹${stats.totalProfit.toLocaleString('en-IN')}:Gross store earnings]\n[METRIC_TILE:Profit Margin:${margin}%:Operating gross margin]\n\n- **Total Billed Invoices:** ${sales.length} orders\n- **Inventory Valuation:** ₹${stats.totalInventoryValue.toLocaleString('en-IN')}\n\n[NAV_BUTTON:analytics:View Full Financial Analytics]`;
  }

  if (
    q.includes('damage') ||
    q.includes('defective') ||
    q.includes('nuksan') ||
    q.includes('broken') ||
    q.includes('spoil')
  ) {
    const damaged = activityLogs.filter(l => {
      const text = `${l.details} ${l.action}`.toLowerCase();
      return text.includes('damage') || text.includes('defect') || text.includes('broken') || text.includes('return');
    });

    if (damaged.length > 0) {
      let msg = `### ⚠️ Damaged & Defective Items Found (${damaged.length} logs)\n\n`;
      damaged.slice(0, 5).forEach((d, idx) => {
        msg += `${idx + 1}. **${d.action}**\n   - Reason/Details: *${d.details}*\n   - Timestamp: ${new Date(d.createdAt).toLocaleString()}\n\n`;
      });
      msg += `[NAV_BUTTON:inventory:Check Inventory Audit]`;
      return msg;
    }
    return `### ℹ️ Damaged Items Status\nNo items are currently marked as damaged or defective in the recent inventory activity logs.\n\n[NAV_BUTTON:inventory:Open Inventory]`;
  }

  if (
    q.includes('customer') ||
    q.includes('bill') ||
    q.includes('invoice') ||
    q.includes('payment') ||
    q.includes('purchased') ||
    q.includes('rahul') ||
    q.includes('sharma') ||
    q.includes('singh')
  ) {
    const matches = sales.filter(s => {
      const target = `${s.customerName} ${s.customerPhone} ${s.productName} ${s.notes}`.toLowerCase();
      return q.split(' ').some(w => w.length > 2 && target.includes(w));
    });

    const displayList = matches.length > 0 ? matches : sales.slice(0, 4);
    let msg = `### 🧾 Customer Billing & Payment Records\n`;
    if (matches.length > 0) {
      msg += `Found **${matches.length}** invoices matching your query:\n\n`;
    } else {
      msg += `Showing the **${displayList.length} most recent billed customer records**:\n\n`;
    }

    displayList.forEach(sale => {
      msg += `- **Customer:** ${sale.customerName || 'Walk-in'} ${sale.customerPhone ? `(${sale.customerPhone})` : ''}\n  - **Item:** ${sale.productName} (Qty: ${sale.quantity})\n  - **Total Amount:** ₹${sale.totalAmount.toLocaleString('en-IN')}\n  - **Payment Mode:** ${sale.notes || 'UPI / Cash'}\n  - **Date:** ${new Date(sale.saleDate).toLocaleDateString()}\n  [SALE_CARD:${sale.id}]\n\n`;
    });
    msg += `[NAV_BUTTON:sales:View All Invoices]`;
    return msg;
  }

  if (
    q.includes('low stock') ||
    q.includes('out of stock') ||
    q.includes('khatam') ||
    q.includes('kam stock') ||
    q.includes('reorder')
  ) {
    const outStock = products.filter(p => p.stockQuantity === 0);
    const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel);

    let msg = `### ⚠️ Inventory Alerts (Low & Out of Stock)\n[METRIC_TILE:Out of Stock:${outStock.length} items:Immediate PO required]\n[METRIC_TILE:Low Stock:${lowStock.length} items:Below reorder limit]\n\n`;
    if (outStock.length > 0) {
      msg += `#### 🔴 Out of Stock:\n` + outStock.slice(0, 5).map(p => `- **${p.name}** (${p.brand}) [PRODUCT_CARD:${p.id}]`).join('\n') + '\n\n';
    }
    if (lowStock.length > 0) {
      msg += `#### 🟡 Low Stock:\n` + lowStock.slice(0, 5).map(p => `- **${p.name}** (${p.brand}): **${p.stockQuantity} units left** (Min: ${p.minStockLevel}) [PRODUCT_CARD:${p.id}]`).join('\n') + '\n\n';
    }
    msg += `[NAV_BUTTON:inventory:Manage Inventory]`;
    return msg;
  }

  // Matching product
  const found = products.filter(p => {
    const text = `${p.name} ${p.brand} ${p.modelNumber} ${p.sku}`.toLowerCase();
    return q.split(' ').some(w => w.length > 2 && text.includes(w));
  });

  if (found.length > 0) {
    let msg = `### 🔍 Item Specifications & Stock Details\nFound **${found.length}** item(s):\n\n`;
    found.slice(0, 3).forEach(p => {
      const margin = p.sellingPrice - p.purchasePrice;
      const marginPct = p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(1) : '0';
      msg += `#### 📱 **${p.name}** (${p.brand})\n`;
      msg += `- **Model Number:** ${p.modelNumber || 'N/A'}\n`;
      msg += `- **SKU:** \`${p.sku}\`\n`;
      msg += `- **Current Stock:** **${p.stockQuantity} units** ${p.stockQuantity <= p.minStockLevel ? '(⚠️ Low Stock)' : '(✅ In Stock)'}\n`;
      msg += `- **Selling Price:** ₹${p.sellingPrice.toLocaleString('en-IN')}\n`;
      msg += `- **Purchase Price:** ₹${p.purchasePrice.toLocaleString('en-IN')}\n`;
      msg += `- **Profit Margin:** ₹${margin.toLocaleString('en-IN')} (${marginPct}%)\n`;
      msg += `[PRODUCT_CARD:${p.id}]\n\n`;
    });
    return msg;
  }

  return `### 👋 ElectraBot Ready
Ask me anything about:
- **Revenue & Profit:** "Calculate total revenue and profit"
- **Customer Bills:** "Find customer bills", "Recent payment records"
- **Stock & Specs:** "Show low stock items", "Model specifications for TV"
- **Damaged Items:** "Which items are damaged or returned?"`;
}
