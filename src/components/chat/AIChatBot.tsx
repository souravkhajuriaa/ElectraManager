import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  Package,
  Receipt,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Mic,
  MicOff,
  ShoppingCart,
  IndianRupee,
  Layers,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { useAIChat } from '@/src/contexts/ChatContext';
import { useData } from '@/src/contexts/DataContext';
import { sendChatMessage, ChatMessage } from '@/src/lib/services/aiChatService';
import { formatINR, formatCompactINR } from '@/src/lib/utils/currency';
import { NavigationTab, Product, Sale } from '@/src/types';

interface AIChatBotProps {
  onNavigate?: (tab: NavigationTab) => void;
  onRecordSaleForProduct?: (product: Product) => void;
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'Revenue & Profit',
    prompt: 'Calculate the total revenue, gross profit, and store earnings so far.',
  },
  {
    icon: AlertTriangle,
    label: 'Low & Out of Stock',
    prompt: 'Which products are currently low in stock or completely out of stock?',
  },
  {
    icon: Receipt,
    label: 'Billed Customers',
    prompt: 'Show me the recent billed customer names, invoice amounts, and payment records.',
  },
  {
    icon: Package,
    label: 'Item Specifications',
    prompt: 'Show specifications, selling price, and stock for our top electronics products.',
  },
  {
    icon: Layers,
    label: 'Damaged & Defective',
    prompt: 'Are there any items marked as damaged, defective, or returned in the audit logs?',
  },
];

export const AIChatBot: React.FC<AIChatBotProps> = ({
  onNavigate,
  onRecordSaleForProduct,
}) => {
  const {
    isOpen,
    setIsOpen,
    closeChat,
    toggleChat,
    queuedPrompt,
    clearQueuedPrompt,
  } = useAIChat();

  const {
    business,
    products,
    sales,
    categories,
    activityLogs,
    totalRevenue,
    totalEstimatedProfit,
    totalInventoryValue,
    totalStockUnits,
    lowStockCount,
    outOfStockCount,
  } = useData();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'model',
        content: `### 👋 Namaste! I am ElectraBot
Your AI Store Copilot. I have real-time access to your store database:

- 📊 **Financials:** Calculate total revenue, gross profit & margins
- 📦 **Stocks & Specs:** Check stock quantities, models, SKUs & reorder levels
- 🧾 **Billed Customers:** Search invoices, customer names & payment records
- ⚠️ **Audit & Damaged Goods:** Track defective items & inventory adjustments

How can I assist your retail operations today?`,
        timestamp: new Date().toISOString(),
        modelUsed: 'gemini-3.8-flash',
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Handle queued prompt triggered externally (e.g. from a button)
  useEffect(() => {
    if (queuedPrompt && isOpen) {
      handleSend(queuedPrompt);
      clearQueuedPrompt();
    }
  }, [queuedPrompt, isOpen]);

  // Speech Recognition support
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputPrompt(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const message = (textToSend || inputPrompt).trim();
    if (!message || isLoading) return;

    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Prepare context snapshot
    const contextData = {
      business,
      products,
      sales,
      categories,
      activityLogs,
      stats: {
        totalRevenue,
        totalProfit: totalEstimatedProfit,
        totalInventoryValue,
        totalStockUnits,
        lowStockCount,
        outOfStockCount,
        totalProductsCount: products.length,
        totalSalesCount: sales.length,
      },
    };

    // Prepare history
    const history = messages
      .filter(m => m.id !== 'welcome-1')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await sendChatMessage(message, history, contextData);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toISOString(),
        modelUsed: response.model,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Failed to get bot reply:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: `### ⚠️ Connection Notice\nCould not reach the server right now. Here is a quick summary from local store state:\n\n- **Total Revenue:** ₹${totalRevenue.toLocaleString('en-IN')}\n- **Low Stock Items:** ${lowStockCount}\n- **Total Orders:** ${sales.length}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear current chat conversation history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          content: 'Chat history cleared. How can I assist you with ElectraManager data?',
          timestamp: new Date().toISOString(),
          modelUsed: 'gemini-3.8-flash',
        },
      ]);
    }
  };

  /**
   * Parse custom tags like:
   * [PRODUCT_CARD:prod_1]
   * [SALE_CARD:sale_1]
   * [METRIC_TILE:Total Revenue:₹1,50,000:Gross sales]
   * [NAV_BUTTON:inventory:Open Inventory]
   */
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // 1. Metric tile tag [METRIC_TILE:Label:Value:Subtext]
          const metricMatch = trimmed.match(/\[METRIC_TILE:([^:]+):([^:]+):?([^\]]*)\]/i);
          if (metricMatch) {
            const [, label, value, subtext] = metricMatch;
            return (
              <div
                key={`metric-${idx}`}
                className="my-1.5 p-2.5 rounded-lg bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {value}
                  </p>
                  {subtext && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {subtext}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            );
          }

          // 2. Product card tag [PRODUCT_CARD:prod_id]
          const productMatch = trimmed.match(/\[PRODUCT_CARD:([a-zA-Z0-9_-]+)\]/i);
          if (productMatch) {
            const prodId = productMatch[1];
            const product = products.find(p => p.id === prodId);
            if (!product) return null;

            return (
              <div
                key={`prod-${idx}`}
                className="my-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>{product.brand}</span>
                      <span>•</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatINR(product.sellingPrice)}
                      </span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          product.stockQuantity === 0
                            ? 'text-rose-500'
                            : product.stockQuantity <= product.minStockLevel
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {product.stockQuantity} in stock
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 justify-end">
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('products');
                        closeChat();
                      }}
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Package className="w-3 h-3" /> View Product
                    </button>
                  )}
                  {onRecordSaleForProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        onRecordSaleForProduct(product);
                        closeChat();
                      }}
                      className="px-2.5 py-1 rounded text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Sell (+ Bill)
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // 3. Sale card tag [SALE_CARD:sale_id]
          const saleMatch = trimmed.match(/\[SALE_CARD:([a-zA-Z0-9_-]+)\]/i);
          if (saleMatch) {
            const saleId = saleMatch[1];
            const sale = sales.find(s => s.id === saleId);
            if (!sale) return null;

            return (
              <div
                key={`sale-${idx}`}
                className="my-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {sale.customerName || 'Walk-in Customer'}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatINR(sale.totalAmount)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>Item: <strong>{sale.productName}</strong></span>
                  <span>Qty: <strong>{sale.quantity}</strong></span>
                  <span>Date: {new Date(sale.saleDate).toLocaleDateString()}</span>
                  <span>Pay: {sale.notes || 'UPI / Cash'}</span>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('sales');
                      closeChat();
                    }}
                    className="mt-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Open in Sales & Invoicing <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          }

          // 4. Navigation button [NAV_BUTTON:tab:Label]
          const navMatch = trimmed.match(/\[NAV_BUTTON:([a-zA-Z0-9_-]+):([^\]]+)\]/i);
          if (navMatch) {
            const [, tab, label] = navMatch;
            return (
              <div key={`nav-${idx}`} className="my-1.5 inline-block mr-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate(tab as NavigationTab);
                    closeChat();
                  }}
                  className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                >
                  {label} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          }

          // 5. Headings
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1 flex items-center gap-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h5 key={idx} className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1.5 mb-0.5">
                {line.replace('#### ', '')}
              </h5>
            );
          }

          // 6. Bullet lists
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
                <span className="text-indigo-500 font-bold">•</span>
                <span className="flex-1">{formatInlineMarkdown(line.slice(2))}</span>
              </div>
            );
          }

          // Regular paragraph
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          return <p key={idx}>{formatInlineMarkdown(line)}</p>;
        })}
      </div>
    );
  };

  /**
   * Helper to format inline markdown like **bold**, `code`, etc.
   */
  const formatInlineMarkdown = (text: string) => {
    // Replace **text** with strong
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[10px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 flex items-center gap-2">
          {/* Subtle Prompt Bubble on Hover/Pulse */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Store AI Copilot</span>
          </div>

          <button
            id="btn-electrabot-launcher"
            onClick={toggleChat}
            className="group relative flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none"
            aria-label="Ask ElectraBot AI Assistant"
            title="Ask ElectraBot about stocks, bills, revenue & damaged items"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
          </button>
        </div>
      )}

      {/* Chat Window / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 shadow-2xl flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden ${
            isExpanded
              ? 'inset-2 sm:inset-4 lg:inset-6 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[580px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display tracking-wide">
                  ElectraBot AI
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1 rounded-md text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md text-indigo-100 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Expand full screen'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={closeChat}
                className="p-1 rounded-md text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Prompts:
            </span>
            {QUICK_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(item.prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Icon className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      renderMessageContent(msg.content)
                    )}

                    {/* Metadata & Copy action */}
                    <div
                      className={`flex items-center justify-between gap-2 mt-1.5 pt-1 text-[9px] ${
                        isUser
                          ? 'text-indigo-200'
                          : 'text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {msg.modelUsed && ` • ${msg.modelUsed}`}
                      </span>

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                    <span className="text-[11px] text-slate-500 ml-1.5 font-medium">
                      ElectraBot is querying store database & analyzing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              {/* Voice recognition button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-lg border transition-colors ${
                  isListening
                    ? 'bg-rose-50 border-rose-500 text-rose-600 animate-pulse dark:bg-rose-950/40'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice search (Hindi/English)'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                placeholder="Ask about stocks, customer bills, revenue, damaged items..."
                className="flex-1 h-9.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="h-9.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Supports Hindi & English</span>
              <span>Real-time connected to Firestore</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
