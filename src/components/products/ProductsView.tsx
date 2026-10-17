import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  Edit2,
  Trash2,
  ShoppingCart,
  Boxes,
  Package,
  TrendingUp,
  Tag,
  Sparkles,
  Check,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Bot,
} from 'lucide-react';
import { useData } from '@/src/contexts/DataContext';
import { useAIChat } from '@/src/contexts/ChatContext';
import { Product, StockStatus, NavigationTab } from '@/src/types';
import { StockBadge } from '@/src/components/ui/Badge';
import { Modal } from '@/src/components/ui/Modal';
import { formatINR, calculateProfit, calculateMargin, getStockStatus } from '@/src/lib/utils/currency';
import { compressImageFile } from '@/src/lib/utils/imageStorage';

interface ProductsViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onRecordSaleForProduct: (product: Product) => void;
  initialProductIdToOpen?: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onNavigate,
  onRecordSaleForProduct,
}) => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    selectedCategoryId,
    setSelectedCategoryId,
    updateStock,
  } = useData();
  const { openChatWithPrompt } = useAIChat();

  // Filters & layout
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>(selectedCategoryId || 'all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(1);
  const [stockReason, setStockReason] = useState<string>('Restock inventory batch');

  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockLevel, setMinStockLevel] = useState<number>(4);
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'discontinued'>('active');
  const [formError, setFormError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadNotice, setImageUploadNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample curated electronics image presets for easy selection
  const IMAGE_PRESETS = [
    { label: 'Laptop', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80' },
    { label: 'MacBook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Smart TV', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80' },
    { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80' },
    { label: 'Air Conditioner', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80' },
    { label: 'Refrigerator', url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80' },
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
    { label: 'TWS Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80' },
  ];

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      setImageUploadNotice('Optimizing image for fast offline storage...');
      const optimizedDataUrl = await compressImageFile(file, 640, 480, 0.82);
      setImageUrl(optimizedDataUrl);
      setImageUploadNotice('Image saved & optimized (~35KB)');
      setTimeout(() => setImageUploadNotice(''), 3500);
    } catch (err) {
      console.error('Failed to process image file', err);
      setImageUploadNotice('Failed to process image file. Please choose another.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Auto SKU generator helper
  const handleAutoGenerateSku = () => {
    const brandPrefix = (brand || 'EL').slice(0, 3).toUpperCase();
    const catPrefix = (categories.find(c => c.id === categoryId)?.name || 'GEN').slice(0, 3).toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setSku(`EL-${catPrefix}-${brandPrefix}-${randomSuffix}`);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategoryId(filterCategory !== 'all' ? filterCategory : (categories[0]?.id || ''));
    setModelNumber('');
    setDescription('');
    setSku(`EL-PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchasePrice(5000);
    setSellingPrice(6500);
    setStockQuantity(10);
    setMinStockLevel(4);
    setImageUrl(IMAGE_PRESETS[0].url);
    setStatus('active');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategoryId(p.categoryId);
    setModelNumber(p.modelNumber);
    setDescription(p.description);
    setSku(p.sku);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setStockQuantity(p.stockQuantity);
    setMinStockLevel(p.minStockLevel);
    setImageUrl(p.imageUrl || '');
    setStatus(p.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = (p: Product) => {
    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
      deleteProduct(p.id);
    }
  };

  const handleOpenStockAdjust = (p: Product) => {
    setStockAdjustProduct(p);
    setStockDelta(1);
    setStockReason('Supplier shipment arrival');
    setIsStockAdjustOpen(true);
  };

  const handleSaveStockAdjust = (mode: 'add' | 'remove') => {
    if (!stockAdjustProduct) return;
    updateStock(stockAdjustProduct.id, stockDelta, mode, stockReason);
    setIsStockAdjustOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a product name');
      return;
    }
    if (sellingPrice <= 0) {
      setFormError('Selling price must be greater than 0');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        brand: brand.trim(),
        categoryId,
        modelNumber: modelNumber.trim(),
        description: description.trim(),
        sku: sku.trim(),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
        minStockLevel: Number(minStockLevel),
        imageUrl,
        status,
      });
    } else {
      addProduct({
        name: name.trim(),
        brand: brand.trim(),
        categoryId,
        modelNumber: modelNumber.trim(),
        description: description.trim(),
        sku: sku.trim(),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
        minStockLevel: Number(minStockLevel),
        imageUrl,
        status,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search
        const matchesQuery =
          searchQuery === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.modelNumber.toLowerCase().includes(searchQuery.toLowerCase());

        // Category
        const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;

        // Stock Status
        const status = getStockStatus(p.stockQuantity, p.minStockLevel);
        const matchesStock =
          filterStockStatus === 'all' ||
          (filterStockStatus === 'in_stock' && status === 'in_stock') ||
          (filterStockStatus === 'low_stock' && status === 'low_stock') ||
          (filterStockStatus === 'out_of_stock' && status === 'out_of_stock');

        return matchesQuery && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'stock-asc') return a.stockQuantity - b.stockQuantity;
        if (sortBy === 'stock-desc') return b.stockQuantity - a.stockQuantity;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchQuery, filterCategory, filterStockStatus, sortBy]);

  // Live profit calculation inside form
  const liveProfit = calculateProfit(purchasePrice, sellingPrice);
  const liveMargin = calculateMargin(purchasePrice, sellingPrice);

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white leading-tight">
            Products Catalog & Inventory
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            {filteredProducts.length} items found across electronics catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Specs Search */}
          <button
            type="button"
            onClick={() => openChatWithPrompt('Show me the item specifications, model numbers, selling prices, and stock counts of our electronics.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold shadow-2xs transition-all active:scale-98 shrink-0"
            title="Ask AI for product specifications and stock details"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">AI Specs Finder</span>
          </button>

          {/* Add Product Button */}
          <button
            id="btn-add-product"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-98 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, brand, SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:border-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={filterCategory}
              onChange={e => {
                setFilterCategory(e.target.value);
                setSelectedCategoryId(e.target.value === 'all' ? null : e.target.value);
              }}
              className="w-full h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:border-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock status filter */}
          <div>
            <select
              value={filterStockStatus}
              onChange={e => setFilterStockStatus(e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:border-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock Only</option>
              <option value="low_stock">Low Stock Warning</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:border-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
            >
              <option value="date-desc">Newest Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter chips active */}
        {(filterCategory !== 'all' || filterStockStatus !== 'all' || searchQuery) && (
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-400">Active:</span>
            {filterCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                Category: {categories.find(c => c.id === filterCategory)?.name}
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setSelectedCategoryId(null);
                  }}
                  className="hover:text-blue-900 font-bold ml-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {filterStockStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                Status: {filterStockStatus.replace('_', ' ')}
                <button onClick={() => setFilterStockStatus('all')} className="hover:text-slate-900 font-bold ml-0.5">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setFilterCategory('all');
                setSelectedCategoryId(null);
                setFilterStockStatus('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline ml-auto font-medium"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Product Content: Grid or List */}
      {filteredProducts.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">No products found</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
            Try adjusting your search criteria or click "Add Product" to add items to your catalog.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredProducts.map(product => {
            const status = getStockStatus(product.stockQuantity, product.minStockLevel);
            const profit = calculateProfit(product.purchasePrice, product.sellingPrice);
            const margin = calculateMargin(product.purchasePrice, product.sellingPrice);
            const category = categories.find(c => c.id === product.categoryId);

            return (
              <div
                key={product.id}
                className="group rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative aspect-16/9 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}

                  {/* Stock Badge Overlay */}
                  <div className="absolute top-2 left-2">
                    <StockBadge status={status} quantity={product.stockQuantity} />
                  </div>

                  {/* Margin chip */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.2 rounded bg-slate-900/85 backdrop-blur-xs text-emerald-400 text-[9px] font-bold border border-slate-700/60 font-mono">
                    +{margin}%
                  </div>

                  {/* Quick Change Image on hover */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenEdit(product);
                    }}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-md bg-slate-900/85 hover:bg-blue-600 text-white shadow-xs backdrop-blur-xs text-[10px] flex items-center gap-1 font-medium border border-slate-700/60 cursor-pointer"
                    title="Change Product Image"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Change Image</span>
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {product.brand}
                      </span>
                      <span className="font-mono text-[9px] truncate max-w-[110px]">
                        {product.sku}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {product.modelNumber ? `Model: ${product.modelNumber} • ` : ''}{category?.name}
                    </p>
                  </div>

                  {/* Pricing & Profit Matrix */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline justify-between mb-1">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Retail</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                          {formatINR(product.sellingPrice)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Profit</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                          +{formatINR(profit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                      <span>Available:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                        {product.stockQuantity} units
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-2 pt-2 flex items-center gap-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onRecordSaleForProduct(product)}
                      disabled={product.stockQuantity <= 0}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.2 px-2.5 rounded-md text-xs font-semibold transition-all ${
                        product.stockQuantity > 0
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Sell</span>
                    </button>

                    <button
                      onClick={() => handleOpenStockAdjust(product)}
                      className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Adjust Stock (±)"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Cost Price</th>
                  <th className="py-2.5 px-3">Selling Price</th>
                  <th className="py-2.5 px-3">Profit / Margin</th>
                  <th className="py-2.5 px-3">Stock Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredProducts.map(product => {
                  const status = getStockStatus(product.stockQuantity, product.minStockLevel);
                  const profit = calculateProfit(product.purchasePrice, product.sellingPrice);
                  const margin = calculateMargin(product.purchasePrice, product.sellingPrice);
                  const category = categories.find(c => c.id === product.categoryId);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80';
                                }}
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400 m-2" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {product.brand} • SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 px-3 font-medium text-[11px] text-slate-600 dark:text-slate-400">
                        {category?.name || 'Unassigned'}
                      </td>

                      <td className="py-2 px-3 font-mono text-xs tabular-nums">
                        {formatINR(product.purchasePrice)}
                      </td>

                      <td className="py-2 px-3 font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                        {formatINR(product.sellingPrice)}
                      </td>

                      <td className="py-2 px-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs tabular-nums">
                          +{formatINR(profit)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({margin}%)
                        </span>
                      </td>

                      <td className="py-2 px-3">
                        <StockBadge status={status} quantity={product.stockQuantity} />
                      </td>

                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onRecordSaleForProduct(product)}
                            disabled={product.stockQuantity <= 0}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-40"
                            title="Quick Sell"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenStockAdjust(product)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Adjust Stock"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Electronics Product'}
        subtitle="Specify pricing, inventory thresholds, specifications and SKU"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {formError && (
            <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-800">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Title / Model Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sony Bravia 55' 4K Ultra HD Smart Google TV"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Sony, Apple, Samsung, LG"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Number */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={e => setModelNumber(e.target.value)}
                placeholder="e.g. KD-55X74L"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* SKU with Auto-generate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  SKU / Stock ID *
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSku}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Auto Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. EL-TV-SONY-001"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Pricing Card Section with Live Margin Intelligence */}
            <div className="sm:col-span-2 p-2.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  Pricing & Realized Profit
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  Margin: {liveMargin}% ({liveProfit >= 0 ? '+' : ''}{formatINR(liveProfit)} / unit)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Purchase / Dealer Cost (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Selling / Retail Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={sellingPrice}
                    onChange={e => setSellingPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Units & Low Stock Alert */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stock Quantity (Units on shelf) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stockQuantity}
                onChange={e => setStockQuantity(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Stock Alert Level (Threshold) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={minStockLevel}
                onChange={e => setMinStockLevel(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Product Image Manager */}
            <div className="sm:col-span-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Product Image & Display Photo
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Clear Image
                  </button>
                )}
              </div>

              {/* Preview & Upload Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2.5">
                {/* Live Thumbnail Preview */}
                <div className="relative w-24 h-18 sm:w-28 sm:h-20 shrink-0 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-xs">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 text-center p-1">
                      <ImageIcon className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px]">No image</span>
                    </div>
                  )}
                  {imageUrl && (
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[8px] text-white text-center py-0.5 font-mono truncate px-0.5">
                      Preview
                    </div>
                  )}
                </div>

                {/* Upload & Instructions */}
                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingImage ? 'Optimizing photo...' : 'Upload Image from Device'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const matchedCat = categories.find(c => c.id === categoryId)?.name.toLowerCase() || '';
                        let preset = IMAGE_PRESETS[0];
                        if (matchedCat.includes('tv')) preset = IMAGE_PRESETS[2];
                        else if (matchedCat.includes('phone') || matchedCat.includes('mobile')) preset = IMAGE_PRESETS[3];
                        else if (matchedCat.includes('ac') || matchedCat.includes('condition')) preset = IMAGE_PRESETS[4];
                        else if (matchedCat.includes('fridge') || matchedCat.includes('refriger')) preset = IMAGE_PRESETS[5];
                        else if (matchedCat.includes('audio') || matchedCat.includes('headphone')) preset = IMAGE_PRESETS[6];
                        setImageUrl(preset.url);
                      }}
                      className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      Auto-Match Category
                    </button>
                  </div>

                  {imageUploadNotice && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {imageUploadNotice}
                    </p>
                  )}

                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Supports JPG, PNG, WEBP (automatically optimized & stored permanently in your local database).
                  </p>
                </div>
              </div>

              {/* URL or Base64 Input */}
              <div className="space-y-1 mb-2">
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Or paste Web Image URL:
                </span>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or data:image/..."
                  className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              {/* Quick Select Presets */}
              <div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Quick Electronics Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {IMAGE_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                        imageUrl === preset.url
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Specifications / Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Key technical specifications, warranty details, inclusions..."
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
            >
              {editingProduct ? 'Update Product' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      {stockAdjustProduct && (
        <Modal
          isOpen={isStockAdjustOpen}
          onClose={() => setIsStockAdjustOpen(false)}
          title={`Adjust Stock: ${stockAdjustProduct.name}`}
          subtitle={`Current stock: ${stockAdjustProduct.stockQuantity} units`}
          maxWidth="md"
        >
          <div className="space-y-3">
            <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between border border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Available Units</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                  {stockAdjustProduct.stockQuantity}
                </span>
              </div>
              <StockBadge
                status={getStockStatus(stockAdjustProduct.stockQuantity, stockAdjustProduct.minStockLevel)}
                quantity={stockAdjustProduct.stockQuantity}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity to Adjust
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStockDelta(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-base font-bold flex items-center justify-center hover:bg-slate-200"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={stockDelta}
                  onChange={e => setStockDelta(Math.max(1, Number(e.target.value)))}
                  className="flex-1 py-1 px-2.5 text-center text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setStockDelta(prev => prev + 1)}
                  className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-base font-bold flex items-center justify-center hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Note for Audit Log
              </label>
              <input
                type="text"
                value={stockReason}
                onChange={e => setStockReason(e.target.value)}
                placeholder="e.g. New supplier batch, damaged box, return..."
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSaveStockAdjust('remove')}
                disabled={stockAdjustProduct.stockQuantity < stockDelta}
                className="py-1.5 px-3 rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 disabled:opacity-40"
              >
                - Deduct ({stockDelta})
              </button>
              <button
                type="button"
                onClick={() => handleSaveStockAdjust('add')}
                className="py-1.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
              >
                + Add Stock (+{stockDelta})
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
