import React, { useState, useEffect } from 'react';
import { Product, SelectedOptionSnapshot, CustomizationOption } from '../types';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { X, Check, Clock, Plus, Minus, Sparkles, AlertCircle } from 'lucide-react';

interface ProductCustomizationModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, CustomizationOption[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize default options
  useEffect(() => {
    if (!product) return;

    setQuantity(1);
    setSpecialInstructions('');
    setErrorMsg(null);

    const initialMap: Record<string, CustomizationOption[]> = {};
    if (product.customizationGroups) {
      for (const group of product.customizationGroups) {
        const defaultOpts = group.options.filter((o) => o.isDefault && o.isAvailable);
        if (defaultOpts.length > 0) {
          initialMap[group.id] = group.type === 'SINGLE' ? [defaultOpts[0]] : defaultOpts;
        } else if (group.type === 'SINGLE' && group.options.length > 0 && group.required) {
          // Select first available option if required
          const firstAvailable = group.options.find((o) => o.isAvailable);
          if (firstAvailable) {
            initialMap[group.id] = [firstAvailable];
          }
        } else {
          initialMap[group.id] = [];
        }
      }
    }
    setSelectedOptionsMap(initialMap);
  }, [product]);

  if (!product) return null;

  const basePrice = product.discountedPrice ?? product.basePrice;

  // Calculate current unit price with modifiers
  let optionsPrice = 0;
  Object.values(selectedOptionsMap).forEach((opts) => {
    opts.forEach((o) => {
      optionsPrice += o.priceModifier;
    });
  });

  const unitPrice = basePrice + optionsPrice;
  const totalPrice = unitPrice * quantity;

  const handleOptionSelect = (groupId: string, groupType: 'SINGLE' | 'MULTIPLE', option: CustomizationOption, maxSelections: number = 1) => {
    setErrorMsg(null);
    setSelectedOptionsMap((prev) => {
      const current = prev[groupId] || [];

      if (groupType === 'SINGLE') {
        return { ...prev, [groupId]: [option] };
      } else {
        // MULTIPLE
        const exists = current.some((o) => o.id === option.id);
        if (exists) {
          return { ...prev, [groupId]: current.filter((o) => o.id !== option.id) };
        } else {
          if (current.length >= maxSelections) {
            setErrorMsg(`You can select at most ${maxSelections} options for this group.`);
            return prev;
          }
          return { ...prev, [groupId]: [...current, option] };
        }
      }
    });
  };

  const handleAddToCart = () => {
    // Validate required groups
    if (product.customizationGroups) {
      for (const group of product.customizationGroups) {
        const selected = selectedOptionsMap[group.id] || [];
        if (group.required && selected.length === 0) {
          setErrorMsg(`Please select an option for "${group.name}".`);
          return;
        }
      }
    }

    // Flatten selected options into snapshots
    const snapshots: SelectedOptionSnapshot[] = [];
    if (product.customizationGroups) {
      for (const group of product.customizationGroups) {
        const selected = selectedOptionsMap[group.id] || [];
        for (const opt of selected) {
          snapshots.push({
            groupName: group.name,
            optionId: opt.id,
            optionName: opt.name,
            priceModifier: opt.priceModifier,
          });
        }
      }
    }

    addToCart(product, quantity, snapshots, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-900/20 overflow-hidden">
        {/* Header with Image preview */}
        <div className="relative h-48 sm:h-56 w-full bg-stone-900 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-md cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {product.isVeg ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Veg
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Non-Veg
              </span>
            )}

            {product.isBestseller && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                Bestseller
              </span>
            )}
          </div>

          {/* Product Title in Hero */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-serif text-2xl font-bold drop-shadow-md text-amber-100">{product.name}</h3>
            <div className="flex items-center gap-3 text-xs text-amber-200/90 mt-1">
              <span className="font-medium">{product.category?.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {product.preparationTimeMinutes} mins prep
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Customization Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-stone-200">
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{product.description}</p>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customization Groups */}
          {product.customizationGroups && product.customizationGroups.length > 0 && (
            <div className="space-y-6 pt-2 border-t border-stone-200 dark:border-stone-800">
              {product.customizationGroups.map((group) => {
                const selected = selectedOptionsMap[group.id] || [];

                return (
                  <div key={group.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-stone-900 dark:text-amber-100 text-sm">{group.name}</h4>
                        {group.required ? (
                          <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">Optional</span>
                        )}
                      </div>
                      {group.type === 'MULTIPLE' && (
                        <span className="text-xs text-stone-400">Max {group.maxSelections}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.options.map((option) => {
                        const isChosen = selected.some((o) => o.id === option.id);

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              handleOptionSelect(group.id, group.type as any, option, group.maxSelections)
                            }
                            className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                              isChosen
                                ? 'border-amber-600 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold shadow-sm'
                                : 'border-stone-200 dark:border-stone-800 hover:border-amber-400/50 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-${
                                  group.type === 'SINGLE' ? 'full' : 'md'
                                } border flex items-center justify-center transition-colors ${
                                  isChosen
                                    ? 'border-amber-600 bg-amber-600 text-white'
                                    : 'border-stone-400 dark:border-stone-600'
                                }`}
                              >
                                {isChosen && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{option.name}</span>
                            </div>
                            {option.priceModifier > 0 && (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                +{settings.currencySymbol}
                                {option.priceModifier}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-stone-800">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Special Barista / Kitchen Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Extra hot, separate sugar, light ice..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add to Cart button */}
        <div className="p-4 sm:p-6 bg-stone-50 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden bg-white dark:bg-stone-900 shadow-sm">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-stone-900 dark:text-white text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-sm sm:text-base shadow-lg shadow-amber-900/20 flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Add to Order</span>
            <span className="bg-stone-950/20 px-3 py-1 rounded-lg">
              {settings.currencySymbol}
              {totalPrice.toFixed(0)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
