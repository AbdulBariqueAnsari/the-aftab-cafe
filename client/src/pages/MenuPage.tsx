import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ProductCustomizationModal } from '../components/ProductCustomizationModal';
import { Search, Filter, Sparkles, Clock, ArrowUpDown, Coffee, UtensilsCrossed } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const selectedCategory = searchParams.get('category') || 'ALL';
  const [searchTerm, setSearchTerm] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'RECOMMENDED' | 'PRICE_LOW' | 'PRICE_HIGH'>('RECOMMENDED');

  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([catsData, prodsData]) => {
        setCategories(catsData);
        setProducts(prodsData);
      })
      .catch((err) => console.error('Menu load error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCategoryChange = (slug: string) => {
    if (slug === 'ALL') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    // Category filter
    if (selectedCategory !== 'ALL' && p.category?.slug !== selectedCategory) {
      return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchDesc = p.description.toLowerCase().includes(term);
      if (!matchName && !matchDesc) return false;
    }

    // Veg filter
    if (vegOnly && !p.isVeg) {
      return false;
    }

    // Bestseller filter
    if (bestsellerOnly && !p.isBestseller) {
      return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountedPrice ?? a.basePrice;
    const priceB = b.discountedPrice ?? b.basePrice;

    if (sortBy === 'PRICE_LOW') {
      return priceA - priceB;
    } else if (sortBy === 'PRICE_HIGH') {
      return priceB - priceA;
    } else {
      // Recommended: bestsellers and display order first
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.displayOrder - b.displayOrder;
    }
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Coffee className="w-3.5 h-3.5" />
            <span>Handcrafted Cafe Menu</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-950 dark:text-amber-50">
            Every Sip, A Little Sunshine
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Explore single-estate leaf teas, artisan espresso roasts, iced coolers, and gourmet bakery specialities.
          </p>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teas, coffees, snacks, desserts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border-none text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-white"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  vegOnly
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Veg Only</span>
              </button>

              <button
                type="button"
                onClick={() => setBestsellerOnly(!bestsellerOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  bestsellerOnly
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bestsellers</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-stone-800">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-stone-100 dark:bg-stone-800 border-none rounded-xl text-xs font-semibold py-2 px-2.5 text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
                >
                  <option value="RECOMMENDED">Recommended</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar border-t border-stone-100 dark:border-stone-800/80">
            <button
              onClick={() => handleCategoryChange('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              All Categories ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-stone-400 text-base">No items matched your search or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setVegOnly(false);
                setBestsellerOnly(false);
                handleCategoryChange('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 text-stone-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedProducts.map((product) => {
              const displayPrice = product.discountedPrice ?? product.basePrice;

              return (
                <div
                  key={product.id}
                  className={`rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group ${
                    !product.isAvailable ? 'opacity-70 grayscale-30' : ''
                  }`}
                >
                  {/* Image container */}
                  <div className="relative h-52 w-full overflow-hidden bg-stone-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 text-xs font-semibold text-white">
                        <span className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {product.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      {product.isBestseller && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow">
                          Bestseller
                        </span>
                      )}
                      {product.isNew && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                          New
                        </span>
                      )}
                    </div>

                    {/* Prep time */}
                    <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{product.preparationTimeMinutes} mins</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            {product.category?.name}
                          </span>
                          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-base text-amber-700 dark:text-amber-400">
                            {settings.currencySymbol}
                            {displayPrice.toFixed(0)}
                          </span>
                          {product.discountedPrice && (
                            <span className="block text-[10px] text-stone-400 line-through">
                              {settings.currencySymbol}
                              {product.basePrice.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    {product.isAvailable ? (
                      <button
                        onClick={() => setCustomizingProduct(product)}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-900 dark:text-amber-200 hover:text-stone-950 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Customize & Add</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-500 font-bold text-xs uppercase tracking-wider text-center">
                        Sold Out Today
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customization Modal */}
      <ProductCustomizationModal
        product={customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
};
