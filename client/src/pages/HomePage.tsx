import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { Product, Category, CustomerReview, GalleryItem } from '../types';
import { ProductCustomizationModal } from '../components/ProductCustomizationModal';
import {
  Coffee,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  Award,
  Flame,
  ShieldCheck,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const { setIsCartOpen } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.slice(0, 6)))
      .catch(() => {});

    // Fetch bestsellers
    fetch('/api/products?bestseller=true')
      .then((r) => r.json())
      .then((data) => setBestsellers(data.slice(0, 6)))
      .catch(() => {});

    // Fetch reviews
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => setReviews(data.slice(0, 3)))
      .catch(() => {});

    // Fetch gallery preview
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setGallery(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white">
        {/* Background Image with Dark Vignette Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings.heroImage}
            alt="THE AFTAB Cafe Interior & Coffee"
            className="w-full h-full object-cover scale-105 transform motion-safe:animate-pulse-subtle filter brightness-75 contrast-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/50 to-stone-950" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-md shadow-lg shadow-amber-950/50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Artisanal Tea House & Coffee Roasters</span>
          </div>

          {/* Master Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-amber-50 leading-[1.1] drop-shadow-xl">
            {settings.heroHeadline}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-amber-200/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow">
            {settings.heroSubtitle}
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-base shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/menu?orderType=DINE_IN"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-900/80 hover:bg-stone-800/90 border border-amber-600/40 text-amber-200 hover:text-white font-bold text-base backdrop-blur-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              <span>Dine-In Table Order</span>
            </Link>

            <Link
              to="/track"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-900/60 hover:bg-stone-800/80 border border-stone-700/60 text-stone-300 hover:text-white text-sm font-semibold transition-all"
            >
              Track Live Order
            </Link>
          </div>

          {/* Highlights Bar */}
          <div className="pt-8 border-t border-amber-900/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-amber-200/80 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-lg text-amber-300">100% Arabica</span>
              <span>Single-Origin Roasts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-lg text-amber-300">Assam Leaves</span>
              <span>Hand-harvested Estate Tea</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-lg text-amber-300">Smart Tables</span>
              <span>Direct Table Ordering</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-lg text-amber-300">Fresh Daily</span>
              <span>Artisan In-House Bakes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY QUICK ACCESS ================= */}
      <section className="py-12 bg-amber-50/60 dark:bg-stone-900/50 border-b border-amber-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-amber-100">
                Artisan Collections
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                From steaming Assam kulhad teas to cold velvet brews
              </p>
            </div>
            <Link
              to="/menu"
              className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/menu?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-stone-900 flex flex-col justify-end p-4 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1"
              >
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                <div className="relative z-10 text-white">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100 group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  {cat._count?.products !== undefined && (
                    <span className="text-[10px] text-stone-400">{cat._count.products} items</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROMOTIONAL OFFER BANNER ================= */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border border-amber-600/40 p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Inaugural Offer</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-amber-50">
                10% Off On Your Entire Order
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Apply coupon code <span className="font-mono font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">SUNSHINE10</span> during checkout on all orders above ₹100.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/menu"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Claim Offer Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BESTSELLERS SHOWCASE ================= */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-amber-100">
              Patron Favourites
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Hand-brewed cups and fresh pastries loved most by our guests every day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {bestsellers.map((product) => {
              const displayPrice = product.discountedPrice ?? product.basePrice;

              return (
                <div
                  key={product.id}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image container */}
                  <div className="relative h-56 w-full overflow-hidden bg-stone-800">
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

                    {/* Veg badge & prep time */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 text-xs font-semibold text-white">
                        <span className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {product.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-black uppercase tracking-wider shadow">
                        Bestseller
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{product.preparationTimeMinutes} mins</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {product.name}
                        </h3>
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
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-900 dark:text-amber-200 hover:text-stone-950 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Customize & Add</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-600/40 font-bold text-sm transition-all"
            >
              <span>Explore Complete 20+ Beverage & Snack Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= WHY THE AFTAB ================= */}
      <section className="py-16 bg-stone-100 dark:bg-stone-900/60 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-amber-100">
              Why Customers Love THE AFTAB
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              A harmony of tradition, modern craftsmanship, and seamless service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Single-Origin Leaves</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Directly sourced whole-leaf Assam and Darjeeling teas hand-steeped to extract brisk amber notes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Artisan Micro-Roasts</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Chikmagalur Arabica espresso beans roasted to a rich profile with chocolate and hazelnut nuances.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Instant Table Service</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Pick your table, customize your drink, and watch preparation updates live right from your phone.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Warm Hospitality</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Sunlit reading corners, soothing jazz melodies, and smiling baristas eager to brighten your morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS PREVIEW ================= */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-amber-100">Guest Reflections</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Hear from students, families, and coffee connoisseurs who visit THE AFTAB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic leading-relaxed">
                    "{rev.reviewText}"
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-900 dark:text-amber-200">{rev.customerName}</span>
                  <span className="text-[10px] text-stone-400">Verified Patron</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/reviews"
              className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Read all patron stories or submit your own</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= GALLERY PREVIEW ================= */}
      {gallery.length > 0 && (
        <section className="py-12 bg-stone-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">Cafe Moments</h2>
                <p className="text-xs sm:text-sm text-stone-400">Sneak a peek into our sunlit heritage interiors</p>
              </div>
              <Link to="/gallery" className="text-xs sm:text-sm font-bold text-amber-400 hover:underline">
                View Full Gallery →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((img) => (
                <div key={img.id} className="relative aspect-4/3 rounded-2xl overflow-hidden group">
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-xs font-medium text-amber-200">{img.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customization Modal */}
      <ProductCustomizationModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};
