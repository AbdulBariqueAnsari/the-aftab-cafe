import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, SelectedOptionSnapshot } from '../types';
import { useSettings } from './SettingsContext';

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  discountType: string;
  discountValue: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  grandTotal: number;
  appliedCoupon: AppliedCoupon | null;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  selectedTableId: string | null;
  selectedTableNumber: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY') => void;
  setSelectedTable: (tableId: string | null, tableNumber: string | null) => void;
  addToCart: (product: Product, quantity: number, selectedOptions: SelectedOptionSnapshot[], notes?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('the_aftab_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('the_aftab_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('the_aftab_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('the_aftab_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('the_aftab_coupon');
    }
  }, [appliedCoupon]);

  // Check URL query param for table (e.g. ?table=T1 or ?tableId=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table');
      if (urlTable) {
        setSelectedTableNumber(urlTable.toUpperCase());
        // Fetch tables to find matching ID
        fetch('/api/tables')
          .then((res) => res.json())
          .then((tables) => {
            const matched = tables.find((t: any) => t.number.toUpperCase() === urlTable.toUpperCase());
            if (matched) {
              setSelectedTableId(matched.id);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const setSelectedTable = (tableId: string | null, tableNumber: string | null) => {
    setSelectedTableId(tableId);
    setSelectedTableNumber(tableNumber);
  };

  const addToCart = (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOptionSnapshot[],
    notes?: string
  ) => {
    // Generate unique ID based on product ID and sorted option IDs
    const optionKey = selectedOptions
      .map((o) => o.optionId)
      .sort()
      .join('-');
    const cartItemId = `${product.id}-${optionKey}-${(notes || '').trim()}`;

    const basePrice = product.discountedPrice ?? product.basePrice;
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.priceModifier, 0);
    const unitPrice = basePrice + optionsPrice;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            quantity,
            selectedOptions,
            unitPrice,
            notes,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100) / 100;

  // Recalculate or validate discount
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = settings?.taxRatePercent || 0;
  const serviceRate = settings?.serviceChargePercent || 0;

  const taxAmount = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;
  const serviceCharge = Math.round(((taxableAmount * serviceRate) / 100) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + taxAmount + serviceCharge) * 100) / 100;

  const applyCoupon = async (code: string) => {
    if (!code || !code.trim()) {
      return { success: false, error: 'Please enter a coupon code.' };
    }

    try {
      const res = await fetch('/api/orders/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid coupon code.' };
      }

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        taxAmount,
        serviceCharge,
        grandTotal,
        appliedCoupon,
        orderType,
        selectedTableId,
        selectedTableNumber,
        isCartOpen,
        setIsCartOpen,
        setOrderType,
        setSelectedTable,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
