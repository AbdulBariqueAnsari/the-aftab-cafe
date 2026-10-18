import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { X, ZoomIn, Camera } from 'lucide-react';

const CATEGORIES = ['All', 'Cafe Interior', 'Coffee and Tea', 'Food and Snacks', 'Events', 'Customer Moments'];

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('Gallery load error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedCat === 'All') return true;
    return item.category === selectedCat;
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            <span>Visual Vignettes</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-950 dark:text-amber-50">
            Life at THE AFTAB
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Moments of laughter, rising steam, acoustic evenings, and sun-drenched archways.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-amber-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-4/3 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-stone-400">
            <p>No gallery moments found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveImage(item)}
                className="group relative rounded-3xl overflow-hidden aspect-4/3 bg-stone-900 shadow-md hover:shadow-xl cursor-pointer border border-stone-200 dark:border-stone-800"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {item.category}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-amber-100">{item.title}</h3>
                  {item.caption && <p className="text-[11px] text-stone-300 line-clamp-1">{item.caption}</p>}
                </div>

                <div className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {activeImage && (
          <div
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative flex-1 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-6 bg-stone-900 border-t border-stone-800 space-y-1 text-white">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {activeImage.category}
                </span>
                <h3 className="font-serif text-xl font-bold text-amber-100">{activeImage.title}</h3>
                {activeImage.caption && <p className="text-xs text-stone-300">{activeImage.caption}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
