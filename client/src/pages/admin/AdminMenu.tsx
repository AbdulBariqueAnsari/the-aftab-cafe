import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  Coffee,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Upload,
  Clock,
  Layers,
} from 'lucide-react';

export const AdminMenu: React.FC = () => {
  const { token, isManager } = useAuth();
  const { settings } = useSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBasePrice, setFormBasePrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formPrepTime, setFormPrepTime] = useState('8');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formIsRecommended, setFormIsRecommended] = useState(true);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchMenuData = async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();
      setCategories(catsData);
      setProducts(prodsData);
      if (catsData.length > 0 && !formCategory) {
        setFormCategory(catsData[0].id);
      }
    } catch (err) {
      console.error('Menu fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, [token]);

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBasePrice('');
    setFormDiscountPrice('');
    setFormDescription('');
    setFormImage('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80');
    setFormPrepTime('8');
    setFormIsVeg(true);
    setFormIsBestseller(false);
    setFormIsNew(false);
    setFormIsRecommended(true);
    setFormIsAvailable(true);
    if (categories.length > 0) setFormCategory(categories[0].id);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.categoryId);
    setFormBasePrice(prod.basePrice.toString());
    setFormDiscountPrice(prod.discountedPrice ? prod.discountedPrice.toString() : '');
    setFormDescription(prod.description);
    setFormImage(prod.image);
    setFormPrepTime(prod.preparationTimeMinutes.toString());
    setFormIsVeg(prod.isVeg);
    setFormIsBestseller(prod.isBestseller);
    setFormIsNew(prod.isNew);
    setFormIsRecommended(prod.isRecommended);
    setFormIsAvailable(prod.isAvailable);
    setIsProductModalOpen(true);
  };

  // Toggle Availability (Sold Out vs Available)
  const toggleAvailability = async (productId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !current }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isAvailable: !current } : p))
        );
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBasePrice || !formCategory) {
      alert('Name, category, and price are required.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload = {
        name: formName.trim(),
        categoryId: formCategory,
        basePrice: parseFloat(formBasePrice),
        discountedPrice: formDiscountPrice ? parseFloat(formDiscountPrice) : null,
        description: formDescription.trim(),
        image: formImage.trim(),
        preparationTimeMinutes: parseInt(formPrepTime) || 8,
        isVeg: formIsVeg,
        isBestseller: formIsBestseller,
        isNew: formIsNew,
        isRecommended: formIsRecommended,
        isAvailable: formIsAvailable,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        fetchMenuData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
        }),
      });

      if (res.ok) {
        setIsCatModalOpen(false);
        setNewCatName('');
        setNewCatDesc('');
        fetchMenuData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create category');
      }
    } catch (err) {
      alert('Error creating category');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <Coffee className="w-6 h-6 text-amber-500" />
            <span>Menu & Beverage Management</span>
          </h1>
          <p className="text-xs text-stone-400">
            Control items, update prices, toggle Sold Out status, and manage categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isManager && (
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Add Category</span>
            </button>
          )}

          {isManager && (
            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories & Search Filter */}
      <div className="bg-stone-950 p-4 rounded-3xl border border-stone-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-stone-800">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            All Items ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Price</th>
                <th className="py-3.5 px-3">Diet</th>
                <th className="py-3.5 px-3">Availability</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filteredProducts.map((p) => {
                const displayPrice = p.discountedPrice ?? p.basePrice;

                return (
                  <tr key={p.id} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-800"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-amber-100 text-sm">{p.name}</span>
                            {p.isBestseller && (
                              <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                Bestseller
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="bg-stone-900 px-2 py-1 rounded-lg text-stone-300 border border-stone-800">
                        {p.category?.name || 'Beverage'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-amber-400 text-sm font-mono">
                        {settings.currencySymbol}
                        {displayPrice.toFixed(2)}
                      </span>
                      {p.discountedPrice && (
                        <span className="block text-[10px] text-stone-500 line-through">
                          {settings.currencySymbol}
                          {p.basePrice.toFixed(0)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] ${p.isVeg ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${p.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {p.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleAvailability(p.id, p.isAvailable)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          p.isAvailable
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span>{p.isAvailable ? 'Available' : 'Sold Out'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isManager && (
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isManager && (
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-900/40 text-stone-400 hover:text-rose-400 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900">
              <h3 className="font-serif font-bold text-amber-100">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Tea or Cappuccino"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="100"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional discount"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Beverage tasting notes and ingredients..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none resize-none"
                />
              </div>

              {/* Badges Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVeg}
                    onChange={(e) => setFormIsVeg(e.target.checked)}
                    className="rounded border-stone-700 text-amber-600 focus:ring-0"
                  />
                  <span>Vegetarian item</span>
                </label>

                <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBestseller}
                    onChange={(e) => setFormIsBestseller(e.target.checked)}
                    className="rounded border-stone-700 text-amber-600 focus:ring-0"
                  />
                  <span>Mark Bestseller</span>
                </label>

                <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsNew}
                    onChange={(e) => setFormIsNew(e.target.checked)}
                    className="rounded border-stone-700 text-amber-600 focus:ring-0"
                  />
                  <span>Mark New Arrival</span>
                </label>

                <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="rounded border-stone-700 text-amber-600 focus:ring-0"
                  />
                  <span>Currently Available</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold uppercase tracking-wider shadow transition-all cursor-pointer"
                >
                  {isSavingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-100">Add Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Drinks"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Refreshing botanical infusions"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-stone-900 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
