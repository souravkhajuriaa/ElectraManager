import React, { useState } from 'react';
import { Plus, Search, Layers, Edit2, Trash2, ArrowRight, Package } from 'lucide-react';
import { useData } from '@/src/contexts/DataContext';
import { Category, NavigationTab } from '@/src/types';
import { CategoryIcon } from '@/src/components/ui/CategoryIcon';
import { Modal } from '@/src/components/ui/Modal';
import { formatCompactINR } from '@/src/lib/utils/currency';

interface ItemsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ItemsView: React.FC<ItemsViewProps> = ({ onNavigate }) => {
  const { categories, products, addCategory, updateCategory, deleteCategory, setSelectedCategoryId } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Package');
  const [color, setColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const AVAILABLE_ICONS = [
    'Laptop', 'Tv', 'Snowflake', 'Fan', 'Smartphone', 'Lightbulb',
    'Wind', 'WashingMachine', 'Headphones', 'Ear', 'Package', 'Layers',
    'Cpu', 'Tablet', 'Watch', 'Flame', 'Volume2', 'Speaker', 'Zap'
  ];

  const COLOR_OPTIONS = [
    '#3B82F6', '#8B5CF6', '#06B6D4', '#0D9488', '#10B981',
    '#6366F1', '#F59E0B', '#0284C7', '#7C3AED', '#F43F5E', '#EC4899', '#64748B'
  ];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Laptop');
    setColor('#3B82F6');
    setDescription('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color || '#3B82F6');
    setDescription(cat.description || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      const res = deleteCategory(cat.id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a category name');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        icon,
        color,
        description: description.trim(),
      });
    } else {
      addCategory({
        name: name.trim(),
        icon,
        color,
        description: description.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Electronics Categories & Items
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organized classifications for smart appliances, computing, and personal audio
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none w-48 sm:w-60 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Add Category Button */}
          <button
            id="btn-add-category"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map(category => {
          const categoryProducts = products.filter(p => p.categoryId === category.id);
          const categoryStockUnits = categoryProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
          const categoryValuation = categoryProducts.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0);

          return (
            <div
              key={category.id}
              onClick={() => {
                setSelectedCategoryId(category.id);
                onNavigate('products');
              }}
              className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              {/* Category Top Row: Icon and Actions */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  >
                    <CategoryIcon name={category.icon} className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => handleOpenEdit(e, category)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDelete(e, category)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {category.description || 'Electronic consumer items, components and accessories.'}
                </p>
              </div>

              {/* Category Bottom Metrics */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Catalog Stock</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {categoryProducts.length} items ({categoryStockUnits} units)
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Valuation</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCompactINR(categoryValuation)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No categories found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or add a new category.</p>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        subtitle="Define category name, brand accent color and visual icon"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-800">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Smart Home & IoT"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short summary of appliances or products in this category..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Category Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {AVAILABLE_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    icon === i
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={i}
                >
                  <CategoryIcon name={i} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-slate-900 dark:border-white shadow-md' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
