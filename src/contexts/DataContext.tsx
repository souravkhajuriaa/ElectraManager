import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Category, Sale, Notification, ActivityLog, Business } from '@/src/types';
import { INITIAL_CATEGORIES } from '@/src/lib/constants/categories';
import {
  SAMPLE_PRODUCTS,
  SAMPLE_SALES,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_ACTIVITY_LOGS,
  SAMPLE_BUSINESS,
} from '@/src/lib/data/sampleData';
import {
  applyCustomImagesToProducts,
  getMasterProducts,
  saveCustomProductImage,
  saveMasterProducts,
} from '@/src/lib/utils/imageStorage';
import { useAuth } from './AuthContext';

interface DataContextType {
  categories: Category[];
  products: Product[];
  sales: Sale[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  business: Business;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'businessId'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Inventory actions
  updateStock: (productId: string, quantity: number, mode: 'add' | 'remove' | 'set', reason?: string) => void;
  // Sales actions
  recordSale: (data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }) => { success: boolean; sale?: Sale; error?: string };
  // Category actions
  addCategory: (cat: Omit<Category, 'id' | 'businessId'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; error?: string };
  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  // Business actions
  updateBusiness: (updates: Partial<Business>) => void;
  // Reset
  resetToDemoData: () => void;
  // Computed helpers
  unreadNotificationCount: number;
  totalInventoryValue: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSalesAmount: number;
  totalEstimatedProfit: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

let uniqueIdCounter = 0;
export const createUniqueId = (prefix: string): string => {
  uniqueIdCounter = (uniqueIdCounter + 1) % 1000000;
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now()}-${uniqueIdCounter}-${randomPart}`;
};

function deduplicateAndSanitize<T extends { id: string }>(items: T[], prefix: string): T[] {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    let itemId = item.id;
    if (!itemId || seenIds.has(itemId)) {
      itemId = createUniqueId(prefix);
    }
    seenIds.add(itemId);
    result.push({ ...item, id: itemId });
  }
  return result;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Helper to load scoped user data from localStorage
  const loadUserData = <T,>(prefix: string, userId: string, fallback: T, sanitizePrefix?: string): T => {
    if (typeof window === 'undefined') return fallback;
    const userKey = `electra_${prefix}_${userId}`;
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (sanitizePrefix && Array.isArray(parsed)) {
          return deduplicateAndSanitize(parsed, sanitizePrefix) as unknown as T;
        }
        return parsed;
      } catch { /* ignore */ }
    }
    // Backward compatibility: If usr-1, check legacy global key
    if (userId === 'usr-1') {
      const legacy = localStorage.getItem(`electra_${prefix}`);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (sanitizePrefix && Array.isArray(parsed)) {
            return deduplicateAndSanitize(parsed, sanitizePrefix) as unknown as T;
          }
          return parsed;
        } catch { /* ignore */ }
      }
    }
    return fallback;
  };

  const activeUid = user?.id || 'usr-1';

  // Initialize state with user-specific localStorage or defaults
  const [categories, setCategories] = useState<Category[]>(() => {
    return loadUserData('categories', activeUid, INITIAL_CATEGORIES, 'cat');
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const raw = loadUserData('products', activeUid, getMasterProducts(SAMPLE_PRODUCTS), 'prod');
    return applyCustomImagesToProducts(raw);
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    return loadUserData('sales', activeUid, SAMPLE_SALES, 'sale');
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return loadUserData('notifications', activeUid, SAMPLE_NOTIFICATIONS, 'notif');
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    return loadUserData('activity_logs', activeUid, SAMPLE_ACTIVITY_LOGS, 'act');
  });

  const [business, setBusiness] = useState<Business>(() => {
    const defaultBiz: Business = {
      ...SAMPLE_BUSINESS,
      id: `biz-${activeUid}`,
      name: user?.businessName || (user?.name ? `${user.name}'s Electronics Hub` : SAMPLE_BUSINESS.name),
      ownerId: activeUid,
    };
    return loadUserData('business', activeUid, defaultBiz);
  });

  // Track the currently active user to re-hydrate state when switching users
  const lastActiveUserIdRef = React.useRef<string>(activeUid);

  useEffect(() => {
    if (!user) return;
    const currentId = user.id;
    if (lastActiveUserIdRef.current !== currentId) {
      lastActiveUserIdRef.current = currentId;

      const loadedCats = loadUserData('categories', currentId, INITIAL_CATEGORIES, 'cat');
      const fallbackProds = getMasterProducts(SAMPLE_PRODUCTS);
      const loadedProds = applyCustomImagesToProducts(
        loadUserData('products', currentId, fallbackProds, 'prod')
      );
      const loadedSales = loadUserData('sales', currentId, SAMPLE_SALES, 'sale');
      const loadedNotifs = loadUserData('notifications', currentId, SAMPLE_NOTIFICATIONS, 'notif');
      const loadedLogs = loadUserData('activity_logs', currentId, SAMPLE_ACTIVITY_LOGS, 'act');
      const defaultBiz: Business = {
        ...SAMPLE_BUSINESS,
        id: `biz-${currentId}`,
        name: user.businessName || `${user.name}'s Electronics Hub`,
        ownerId: currentId,
      };
      const loadedBiz = loadUserData('business', currentId, defaultBiz);

      setCategories(loadedCats);
      setProducts(loadedProds);
      setSales(loadedSales);
      setNotifications(loadedNotifs);
      setActivityLogs(loadedLogs);
      setBusiness(loadedBiz);
      setSelectedCategoryId(null);
    }
  }, [user]);

  // Sync to user-specific localStorage whenever state changes
  useEffect(() => {
    const uid = user?.id || 'usr-1';
    try {
      localStorage.setItem(`electra_categories_${uid}`, JSON.stringify(categories));
      if (uid === 'usr-1') localStorage.setItem('electra_categories', JSON.stringify(categories));
    } catch { /* ignore */ }
  }, [categories, user?.id]);

  useEffect(() => {
    const uid = user?.id || 'usr-1';
    try {
      localStorage.setItem(`electra_products_${uid}`, JSON.stringify(products));
      if (uid === 'usr-1') localStorage.setItem('electra_products', JSON.stringify(products));
      saveMasterProducts(products);
    } catch { /* ignore */ }
  }, [products, user?.id]);

  useEffect(() => {
    const uid = user?.id || 'usr-1';
    localStorage.setItem(`electra_sales_${uid}`, JSON.stringify(sales));
    if (uid === 'usr-1') localStorage.setItem('electra_sales', JSON.stringify(sales));
  }, [sales, user?.id]);

  useEffect(() => {
    const uid = user?.id || 'usr-1';
    localStorage.setItem(`electra_notifications_${uid}`, JSON.stringify(notifications));
    if (uid === 'usr-1') localStorage.setItem('electra_notifications', JSON.stringify(notifications));
  }, [notifications, user?.id]);

  useEffect(() => {
    const uid = user?.id || 'usr-1';
    localStorage.setItem(`electra_activity_logs_${uid}`, JSON.stringify(activityLogs));
    if (uid === 'usr-1') localStorage.setItem('electra_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs, user?.id]);

  useEffect(() => {
    const uid = user?.id || 'usr-1';
    localStorage.setItem(`electra_business_${uid}`, JSON.stringify(business));
    if (uid === 'usr-1') localStorage.setItem('electra_business', JSON.stringify(business));
  }, [business, user?.id]);

  // Helper to log activities
  const logActivity = (
    action: string,
    entityType: ActivityLog['entityType'],
    details: string,
    entityId?: string
  ) => {
    const newLog: ActivityLog = {
      id: createUniqueId('act'),
      userId: user?.id || 'usr-1',
      userName: user?.name || 'Rahul Sharma',
      businessId: business.id,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
  };

  // Helper to check stock alert
  const checkStockNotification = (product: Product, updatedStock: number) => {
    if (updatedStock <= 0) {
      const outNotif: Notification = {
        id: createUniqueId('notif'),
        businessId: business.id,
        title: 'Out of Stock Alert',
        message: `${product.name} is now out of stock (0 units remaining).`,
        type: 'out_of_stock',
        isRead: false,
        createdAt: new Date().toISOString(),
        productId: product.id,
      };
      setNotifications(prev => [outNotif, ...prev.filter(n => n.id !== outNotif.id)]);
    } else if (updatedStock <= product.minStockLevel) {
      const lowNotif: Notification = {
        id: createUniqueId('notif'),
        businessId: business.id,
        title: 'Low Stock Warning',
        message: `${product.name} has only ${updatedStock} units left (Min threshold: ${product.minStockLevel}).`,
        type: 'low_stock',
        isRead: false,
        createdAt: new Date().toISOString(),
        productId: product.id,
      };
      setNotifications(prev => [lowNotif, ...prev.filter(n => n.id !== lowNotif.id)]);
    }
  };

  // Add Product
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'businessId'>): Product => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: createUniqueId('prod'),
      businessId: business.id,
      createdAt: now,
      updatedAt: now,
    };
    if (newProduct.imageUrl) {
      saveCustomProductImage(newProduct.id, newProduct.sku, newProduct.name, newProduct.imageUrl);
    }
    setProducts(prev => {
      const next = [newProduct, ...prev.filter(p => p.id !== newProduct.id)];
      saveMasterProducts(next);
      return next;
    });
    logActivity('PRODUCT_CREATE', 'product', `Added product "${newProduct.name}" (SKU: ${newProduct.sku})`, newProduct.id);

    // If initial stock is low or zero, trigger notification
    checkStockNotification(newProduct, newProduct.stockQuantity);

    return newProduct;
  };

  // Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    const now = new Date().toISOString();
    const updated: Product = {
      ...target,
      ...updates,
      updatedAt: now,
    };

    if (updated.imageUrl) {
      saveCustomProductImage(updated.id, updated.sku, updated.name, updated.imageUrl);
    }

    setProducts(prev => {
      const next = prev.map(p => (p.id === id ? updated : p));
      saveMasterProducts(next);
      return next;
    });

    if (updates.stockQuantity !== undefined && updates.stockQuantity !== target.stockQuantity) {
      checkStockNotification(updated, updates.stockQuantity);
    }
    logActivity('PRODUCT_UPDATE', 'product', `Updated details for product "${target.name}"`, id);
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      saveMasterProducts(next);
      return next;
    });
    if (target) {
      logActivity('PRODUCT_DELETE', 'product', `Deleted product "${target.name}"`, id);
    }
  };

  // Update Stock
  const updateStock = (productId: string, quantity: number, mode: 'add' | 'remove' | 'set', reason?: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    let newQty = target.stockQuantity;
    if (mode === 'add') newQty += quantity;
    else if (mode === 'remove') newQty = Math.max(0, newQty - quantity);
    else if (mode === 'set') newQty = Math.max(0, quantity);

    const oldQty = target.stockQuantity;
    const now = new Date().toISOString();
    const updated = {
      ...target,
      stockQuantity: newQty,
      updatedAt: now,
    };

    setProducts(prev => prev.map(p => (p.id === productId ? updated : p)));

    checkStockNotification(updated, newQty);
    const reasonText = reason ? ` (Reason: ${reason})` : '';
    logActivity(
      'STOCK_UPDATE',
      'inventory',
      `Adjusted stock for ${target.name}: ${oldQty} -> ${newQty}${reasonText}`,
      productId
    );
  };

  // Record Sale
  const recordSale = (data: {
    productId: string;
    quantity: number;
    unitPrice: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }) => {
    const product = products.find(p => p.id === data.productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    if (product.stockQuantity < data.quantity) {
      return {
        success: false,
        error: `Insufficient stock! Only ${product.stockQuantity} units available.`,
      };
    }

    const totalAmount = data.unitPrice * data.quantity;
    const profit = (data.unitPrice - product.purchasePrice) * data.quantity;
    const newStock = product.stockQuantity - data.quantity;

    const newSale: Sale = {
      id: createUniqueId('sale'),
      businessId: business.id,
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      purchasePrice: product.purchasePrice,
      totalAmount,
      profit,
      customerName: data.customerName || 'Walk-in Customer',
      customerPhone: data.customerPhone,
      notes: data.notes,
      saleDate: new Date().toISOString(),
    };

    // Deduct stock
    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, stockQuantity: newStock, updatedAt: new Date().toISOString() } : p))
    );

    // Check notifications
    checkStockNotification(product, newStock);

    // Add sale
    setSales(prev => [newSale, ...prev.filter(s => s.id !== newSale.id)]);

    // Create sale notification
    const saleNotif: Notification = {
      id: createUniqueId('notif'),
      businessId: business.id,
      title: 'Sale Recorded',
      message: `${newSale.customerName} bought ${data.quantity}x ${product.name} for ₹${totalAmount.toLocaleString('en-IN')}.`,
      type: 'sale',
      isRead: false,
      createdAt: new Date().toISOString(),
      productId: product.id,
    };
    setNotifications(prev => [saleNotif, ...prev.filter(n => n.id !== saleNotif.id)]);

    logActivity(
      'RECORD_SALE',
      'sale',
      `Recorded sale of ${data.quantity}x "${product.name}" for ₹${totalAmount.toLocaleString('en-IN')}`,
      newSale.id
    );

    return { success: true, sale: newSale };
  };

  // Add Category
  const addCategory = (cat: Omit<Category, 'id' | 'businessId'>): Category => {
    const newCat: Category = {
      ...cat,
      id: createUniqueId('cat'),
      businessId: business.id,
    };
    setCategories(prev => [...prev.filter(c => c.id !== newCat.id), newCat]);
    logActivity('CATEGORY_CREATE', 'category', `Created item category "${newCat.name}"`, newCat.id);
    return newCat;
  };

  // Update Category
  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    logActivity('CATEGORY_UPDATE', 'category', `Updated category`, id);
  };

  // Delete Category
  const deleteCategory = (id: string) => {
    const linkedProducts = products.filter(p => p.categoryId === id);
    if (linkedProducts.length > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${linkedProducts.length} products are linked to it. Reassign or delete them first.`,
      };
    }
    const cat = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    if (cat) {
      logActivity('CATEGORY_DELETE', 'category', `Deleted category "${cat.name}"`, id);
    }
    return { success: true };
  };

  // Notification methods
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Business
  const updateBusiness = (updates: Partial<Business>) => {
    setBusiness(prev => ({ ...prev, ...updates }));
    logActivity('SETTINGS_UPDATE', 'settings', 'Updated business profile and store settings');
  };

  // Reset demo
  const resetToDemoData = () => {
    setCategories(INITIAL_CATEGORIES);
    setProducts(SAMPLE_PRODUCTS);
    setSales(SAMPLE_SALES);
    setNotifications(SAMPLE_NOTIFICATIONS);
    setActivityLogs(SAMPLE_ACTIVITY_LOGS);
    setBusiness(SAMPLE_BUSINESS);
    localStorage.clear();
  };

  // Aggregated analytics
  const unreadNotificationCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const totalInventoryValue = useMemo(
    () => products.reduce((acc, p) => acc + p.sellingPrice * p.stockQuantity, 0),
    [products]
  );

  const totalStockUnits = useMemo(
    () => products.reduce((acc, p) => acc + p.stockQuantity, 0),
    [products]
  );

  const lowStockCount = useMemo(
    () => products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length,
    [products]
  );

  const outOfStockCount = useMemo(
    () => products.filter(p => p.stockQuantity === 0).length,
    [products]
  );

  const totalSalesAmount = useMemo(
    () => sales.reduce((acc, s) => acc + s.totalAmount, 0),
    [sales]
  );

  const totalEstimatedProfit = useMemo(
    () => sales.reduce((acc, s) => acc + s.profit, 0),
    [sales]
  );

  return (
    <DataContext.Provider
      value={{
        categories,
        products,
        sales,
        notifications,
        activityLogs,
        business,
        selectedCategoryId,
        setSelectedCategoryId,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        recordSale,
        addCategory,
        updateCategory,
        deleteCategory,
        markNotificationAsRead,
        markAllNotificationsRead,
        clearAllNotifications,
        updateBusiness,
        resetToDemoData,
        unreadNotificationCount,
        totalInventoryValue,
        totalStockUnits,
        lowStockCount,
        outOfStockCount,
        totalSalesAmount,
        totalEstimatedProfit,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
