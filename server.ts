import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context summary string
    let storeContextPrompt = '';
    if (context) {
      const {
        business,
        stats,
        products = [],
        recentSales = [],
        activityLogs = [],
        categories = [],
      } = context;

      storeContextPrompt = `
=== ELECTRAMANAGER STORE DATABASE CONTEXT ===
Store Name: ${business?.name || 'ElectraManager Electronics'}
Address: ${business?.address || 'N/A'}, Phone: ${business?.phone || 'N/A'}, GSTIN: ${business?.gstNumber || 'N/A'}

FINANCIAL & INVENTORY METRICS:
- Total Store Revenue: ₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
- Total Estimated Profit: ₹${Number(stats?.totalProfit || 0).toLocaleString('en-IN')}
- Total Gross Inventory Valuation: ₹${Number(stats?.totalInventoryValue || 0).toLocaleString('en-IN')}
- Total Stock Units on Hand: ${stats?.totalStockUnits || 0} units
- Active Product Catalog: ${stats?.totalProductsCount || products.length} items
- Total Completed Sales: ${stats?.totalSalesCount || recentSales.length} orders
- Low Stock Items Count (< threshold): ${stats?.lowStockCount || 0}
- Out of Stock Items Count (0 stock): ${stats?.outOfStockCount || 0}

PRODUCT CATALOG (${products.length} items):
${products
  .map(
    (p: any) =>
      `- ID: ${p.id} | Name: "${p.name}" | Brand: ${p.brand} | Model: ${p.modelNumber || 'N/A'} | SKU: ${p.sku} | Category: ${p.categoryName || p.categoryId} | Purchase: ₹${p.purchasePrice} | Selling: ₹${p.sellingPrice} | Current Stock: ${p.stockQuantity} units (Min Level: ${p.minStockLevel}) | Status: ${p.status} ${p.stockQuantity === 0 ? '[OUT OF STOCK]' : p.stockQuantity <= p.minStockLevel ? '[LOW STOCK]' : '[IN STOCK]'}`
  )
  .join('\n')}

RECENT BILLED CUSTOMERS & SALES RECORDS (${recentSales.length} transactions):
${recentSales
  .map(
    (s: any) =>
      `- Bill ID: ${s.id} | Customer: "${s.customerName || 'Walk-in'}" | Phone: ${s.customerPhone || 'N/A'} | Product: "${s.productName}" (ID: ${s.productId}) | Qty: ${s.quantity} | Unit Price: ₹${s.unitPrice} | Total Bill: ₹${s.totalAmount} | Profit: ₹${s.profit} | Payment/Notes: "${s.notes || 'UPI / Cash'}" | Date: ${s.saleDate}`
  )
  .join('\n')}

INVENTORY ADJUSTMENTS & AUDIT LOGS (including Damaged/Returns/Overrides):
${activityLogs
  .slice(0, 30)
  .map(
    (l: any) =>
      `- Log ID: ${l.id} | By: ${l.userName} | Action: ${l.action} | Target: ${l.entityType} (${l.entityId || ''}) | Details: "${l.details}" | Time: ${l.createdAt}`
  )
  .join('\n')}

CATEGORIES:
${categories.map((c: any) => `- ${c.name} (ID: ${c.id})`).join(', ')}
=================================================
`;
    }

    const systemInstruction = `You are **ElectraBot**, the elite AI Store Assistant & Data Analyst for **ElectraManager** (an electronics retail inventory, POS & store management platform).

You possess direct live access to the store's database provided in the context above, including:
1. **Stock Levels & Specifications**: Stock counts, minimum reorder thresholds, out-of-stock items, models, brands, SKUs, purchase prices, selling prices, and profit margins.
2. **Billed Customers & Invoices**: Search by customer name, phone number, invoice date, purchased products, payment modes, and billing details.
3. **Financial Calculations**: Calculate total revenue, gross profit, profit margins, average order value, top-selling items by revenue or volume.
4. **Damaged, Defective & Adjusted Items**: Identify stock deductions or adjustments where the reason/details mention damaged, defective, broken, transit damage, write-off, or return.
5. **Recent Payment & Billing Records**: Retrieve recent bills, recent customers, transaction timestamps, and payment notes.

### Interactive Tags for UI rendering:
Whenever relevant, embed these interactive tags in your response so the user gets rich interactive UI elements:
- When recommending or discussing a specific product: include \`[PRODUCT_CARD:prod_id]\` on its own line or inline (replace \`prod_id\` with actual product ID like \`prod_1\`).
- When showing a customer bill or sale record: include \`[SALE_CARD:sale_id]\` on its own line (replace \`sale_id\` with actual sale ID like \`sale_1\`).
- When showing key metrics: include \`[METRIC_TILE:Label:₹Value:Subtext]\` (e.g. \`[METRIC_TILE:Total Revenue:₹1,45,000:Lifetime gross sales]\`).
- When referencing a navigation tab: include \`[NAV_BUTTON:tab_name:Button Label]\` where tab_name can be 'products', 'inventory', 'sales', 'analytics', 'dashboard'.

### Response Style:
- Professional, clear, concise, and structured.
- Use Indian Rupee (₹) and Indian number formatting (e.g., ₹1,20,000).
- If the user asks in Hindi or Hinglish, answer in polite, clear Hinglish or Hindi. If in English, answer in English.
- Always provide exact calculations based on the live context data.
- If an item or customer is not found, state clearly what was searched and suggest alternatives from the catalog.`;

    if (!ai) {
      // Fallback deterministic AI engine if GEMINI_API_KEY is not set
      const fallbackReply = generateFallbackResponse(message, context);
      return res.json({ reply: fallbackReply, model: 'local-copilot-engine' });
    }

    // Prepare contents with conversation history
    const contents: any[] = [];
    if (storeContextPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `Current store database state:\n${storeContextPrompt}` }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I have loaded the live store database snapshot and am ready to answer any questions about stocks, customer bills, revenues, item specs, damaged goods, and payment records.' }],
      });
    }

    // Add prior conversation turns (up to last 6 messages)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        if (h.role === 'user' || h.role === 'model') {
          contents.push({
            role: h.role,
            parts: [{ text: h.content || '' }],
          });
        }
      }
    }

    // Add latest user query
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const replyText = response.text || 'I could not generate a response. Please try again.';
    res.json({ reply: replyText, model: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    // Even if Gemini fails (e.g., network or quota), run the fallback engine so the user never gets an error
    const fallbackReply = generateFallbackResponse(req.body.message || '', req.body.context);
    res.json({
      reply: fallbackReply,
      model: 'local-fallback',
      notice: 'Served via ElectraManager intelligent offline data engine',
    });
  }
});

// Intelligent fallback response generator
function generateFallbackResponse(query: string, context: any): string {
  const q = (query || '').toLowerCase();
  const products: any[] = context?.products || [];
  const sales: any[] = context?.recentSales || [];
  const logs: any[] = context?.activityLogs || [];
  const stats = context?.stats || {};

  // 1. Revenue & Profit calculation
  if (
    q.includes('revenue') ||
    q.includes('profit') ||
    q.includes('total sale') ||
    q.includes('earning') ||
    q.includes('kamai') ||
    q.includes('turnover')
  ) {
    const totalRev = Number(stats.totalRevenue || sales.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0));
    const totalProf = Number(stats.totalProfit || sales.reduce((acc: number, s: any) => acc + (s.profit || 0), 0));
    const margin = totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : '0';

    return `### 📊 Store Financial Summary
[METRIC_TILE:Total Revenue:₹${totalRev.toLocaleString('en-IN')}:Total gross sales recorded]
[METRIC_TILE:Gross Profit:₹${totalProf.toLocaleString('en-IN')}:Overall store earnings]
[METRIC_TILE:Profit Margin:${margin}%:Average margin across sales]

- **Total Transactions Billed:** ${sales.length} orders
- **Average Order Value:** ₹${sales.length > 0 ? Math.round(totalRev / sales.length).toLocaleString('en-IN') : 0}
- **Current Gross Inventory Valuation:** ₹${Number(stats.totalInventoryValue || 0).toLocaleString('en-IN')}

[NAV_BUTTON:analytics:View Full Analytics] [NAV_BUTTON:sales:View Sales Invoices]`;
  }

  // 2. Damaged / Defective items
  if (
    q.includes('damage') ||
    q.includes('defective') ||
    q.includes('nuksan') ||
    q.includes('broken') ||
    q.includes('spoil') ||
    q.includes('write-off')
  ) {
    const damagedLogs = logs.filter((l: any) => {
      const d = (l.details || '').toLowerCase();
      const a = (l.action || '').toLowerCase();
      return (
        d.includes('damage') ||
        d.includes('defect') ||
        d.includes('break') ||
        d.includes('broken') ||
        d.includes('return') ||
        a.includes('damage') ||
        a.includes('defect')
      );
    });

    if (damagedLogs.length > 0) {
      let text = `### ⚠️ Damaged & Adjusted Items Records\nFound **${damagedLogs.length}** relevant log entries in the inventory audit history:\n\n`;
      damagedLogs.slice(0, 5).forEach((log: any, idx: number) => {
        text += `${idx + 1}. **${log.action}**\n   - Details: *${log.details}*\n   - Timestamp: ${new Date(log.createdAt).toLocaleString()}\n   - Logged by: ${log.userName || 'Staff'}\n\n`;
      });
      text += `[NAV_BUTTON:inventory:Open Inventory Audit]`;
      return text;
    } else {
      return `### ℹ️ Damaged Items Status\nNo items are currently flagged as damaged or defective in the recent activity log. All recent inventory audits show standard shelf adjustments and sales.\n\nTo audit or write-off any damaged inventory, use the Stock Adjustment modal in the Inventory tab.\n\n[NAV_BUTTON:inventory:Go to Inventory]`;
    }
  }

  // 3. Customer search / Billed customer names / Payment records
  if (
    q.includes('customer') ||
    q.includes('bill') ||
    q.includes('invoice') ||
    q.includes('payment') ||
    q.includes('purchased') ||
    q.includes('buyer') ||
    q.includes('rahul') ||
    q.includes('sharma') ||
    q.includes('singh') ||
    q.includes('patel')
  ) {
    // Check if user is searching for a specific name
    const matchingSales = sales.filter((s: any) => {
      const name = (s.customerName || '').toLowerCase();
      const phone = (s.customerPhone || '').toLowerCase();
      const prod = (s.productName || '').toLowerCase();
      const notes = (s.notes || '').toLowerCase();
      return (
        q.split(' ').some((word: string) => word.length > 2 && (name.includes(word) || phone.includes(word) || prod.includes(word) || notes.includes(word)))
      );
    });

    const listToShow = matchingSales.length > 0 ? matchingSales : sales.slice(0, 5);

    let text = `### 🧾 Customer Billing & Payment Records\n`;
    if (matchingSales.length > 0) {
      text += `Found **${matchingSales.length}** matching customer invoice(s):\n\n`;
    } else {
      text += `Showing the **${listToShow.length} most recent billed customer records**:\n\n`;
    }

    listToShow.forEach((sale: any) => {
      text += `- **Customer:** ${sale.customerName || 'Walk-in Customer'} ${sale.customerPhone ? `(${sale.customerPhone})` : ''}\n  - **Item:** ${sale.productName} (Qty: ${sale.quantity})\n  - **Amount:** ₹${Number(sale.totalAmount).toLocaleString('en-IN')} (Unit: ₹${sale.unitPrice})\n  - **Payment Mode:** ${sale.notes || 'UPI / Cash'}\n  - **Date:** ${new Date(sale.saleDate).toLocaleDateString()}\n  [SALE_CARD:${sale.id}]\n\n`;
    });

    text += `[NAV_BUTTON:sales:View All Sales Records]`;
    return text;
  }

  // 4. Low stock / Out of stock
  if (
    q.includes('low stock') ||
    q.includes('out of stock') ||
    q.includes('khatam') ||
    q.includes('kam stock') ||
    q.includes('depleted') ||
    q.includes('reorder')
  ) {
    const outOfStock = products.filter((p: any) => p.stockQuantity === 0);
    const lowStock = products.filter((p: any) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel);

    let text = `### ⚠️ Inventory Alerts (Low & Out of Stock)\n\n`;
    text += `[METRIC_TILE:Out of Stock:${outOfStock.length} items:Immediate purchase order needed]\n`;
    text += `[METRIC_TILE:Low Stock:${lowStock.length} items:Below minimum reorder threshold]\n\n`;

    if (outOfStock.length > 0) {
      text += `#### 🔴 Out of Stock (${outOfStock.length} items):\n`;
      outOfStock.slice(0, 5).forEach((p: any) => {
        text += `- **${p.name}** (${p.brand}) — Stock: **0 units** (Min: ${p.minStockLevel}) [PRODUCT_CARD:${p.id}]\n`;
      });
      text += `\n`;
    }

    if (lowStock.length > 0) {
      text += `#### 🟡 Low Stock (${lowStock.length} items):\n`;
      lowStock.slice(0, 5).forEach((p: any) => {
        text += `- **${p.name}** (${p.brand}) — Stock: **${p.stockQuantity} units left** (Min: ${p.minStockLevel}) [PRODUCT_CARD:${p.id}]\n`;
      });
      text += `\n`;
    }

    text += `[NAV_BUTTON:inventory:Manage Stock in Inventory]`;
    return text;
  }

  // 5. Product Specs or Specific item search
  const foundProducts = products.filter((p: any) => {
    const name = p.name.toLowerCase();
    const brand = p.brand.toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const model = (p.modelNumber || '').toLowerCase();
    return q.split(' ').some((w: string) => w.length > 2 && (name.includes(w) || brand.includes(w) || sku.includes(w) || model.includes(w)));
  });

  if (foundProducts.length > 0) {
    let text = `### 🔍 Item Specifications & Stock Details\nFound **${foundProducts.length}** matching product(s):\n\n`;
    foundProducts.slice(0, 3).forEach((p: any) => {
      const margin = p.sellingPrice - p.purchasePrice;
      const marginPct = p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(1) : '0';

      text += `#### 📱 **${p.name}** (${p.brand})\n`;
      text += `- **Model Number:** ${p.modelNumber || 'N/A'}\n`;
      text += `- **SKU Code:** \`${p.sku}\`\n`;
      text += `- **Current Stock:** **${p.stockQuantity} units** ${p.stockQuantity <= p.minStockLevel ? '(⚠️ Low Stock)' : '(✅ In Stock)'}\n`;
      text += `- **Selling Price:** ₹${p.sellingPrice.toLocaleString('en-IN')}\n`;
      text += `- **Purchase Price:** ₹${p.purchasePrice.toLocaleString('en-IN')}\n`;
      text += `- **Unit Profit Margin:** ₹${margin.toLocaleString('en-IN')} (${marginPct}%)\n`;
      text += `- **Status:** ${p.status.toUpperCase()}\n`;
      text += `[PRODUCT_CARD:${p.id}]\n\n`;
    });
    return text;
  }

  // General fallback overview
  return `### 👋 Hello! I am ElectraBot, your Store Assistant.
I can instantly answer queries about your store data:

- 📊 **Financials:** "Calculate total revenue and profit", "What is our average order value?"
- 📦 **Stock & Specifications:** "How much stock for Sony TV?", "Show specifications for iPhone", "Which items are out of stock?"
- 🧾 **Billed Customers & Invoices:** "Show recent bills", "Who bought Samsung Fridge?", "Find bill for Rahul"
- ⚠️ **Damaged Items:** "Show damaged or returned inventory logs"
- 📈 **Inventory Valuation:** "What is the total value of our inventory?"

Try asking any of the above or click on one of the quick prompt chips!`;
}

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
