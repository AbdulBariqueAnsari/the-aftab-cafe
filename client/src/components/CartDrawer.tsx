import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { CafeTable } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  UtensilsCrossed,
  PackageCheck,
  AlertCircle,
  CreditCard,
  Banknote,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
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
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { settings } = useSettings();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('PAY_AT_COUNTER');

  const [tables, setTables] = useState<CafeTable[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch available tables
  useEffect(() => {
    if (isCartOpen && orderType === 'DINE_IN') {
      setIsLoadingTables(true);
      fetch('/api/tables')
        .then((res) => res.json())
        .then((data) => {
          setTables(data);
          // If no table is currently selected, default to first available
          if (!selectedTableId && data.length > 0) {
            const firstAvail = data.find((t: any) => t.status === 'AVAILABLE') || data[0];
            setSelectedTable(firstAvail.id, firstAvail.number);
          }
        })
        .catch((err) => console.error('Failed to fetch tables:', err))
        .finally(() => setIsLoadingTables(false));
    }
  }, [isCartOpen, orderType]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const res = await applyCoupon(couponCodeInput);
    if (!res.success) {
      setCouponError(res.error || 'Failed to apply coupon');
    } else {
      setCouponSuccess(`Coupon applied! Saved ${settings.currencySymbol}${discountAmount}`);
      setCouponCodeInput('');
    }
  };

  const handlePlaceOrder = async () => {
    setOrderError(null);

    if (!customerName.trim()) {
      setOrderError('Please enter your name.');
      return;
    }

    if (settings.requireCustomerPhone && !customerPhone.trim()) {
      setOrderError('Please enter your phone number.');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTableId) {
      setOrderError('Please select a table for Dine-in.');
      return;
    }

    if (items.length === 0) {
      setOrderError('Cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build order payload
      const payload = {
        orderType,
        tableId: orderType === 'DINE_IN' ? selectedTableId : null,
        customerName: customerName.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : null,
        specialInstructions: specialInstructions.trim() || null,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          selectedOptionIds: i.selectedOptions.map((o) => o.optionId),
          notes: i.notes || null,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D97706', '#F59E0B', '#FBBF24', '#78350F'],
        });
      } catch {}

      // Clear cart and redirect to order tracking
      clearCart();
      setIsCartOpen(false);
      navigate(`/track/${data.orderNumber}`);
    } catch (err: any) {
      setOrderError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-amber-900/30 text-stone-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif text-lg font-bold text-amber-100">Your Cafe Order</h2>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4 text-stone-400">
                <div className="w-16 h-16 rounded-full bg-stone-800/80 mx-auto flex items-center justify-center text-amber-500">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-stone-200">Your cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our handcrafted Assam teas, single-origin coffees, and warm croissants.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/menu');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-stone-800/70 border border-stone-700/60 flex items-start gap-3 relative group"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-medium text-amber-100 text-sm truncate">{item.product.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Customization Badges */}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 my-1">
                            {item.selectedOptions.map((opt, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-stone-900/90 text-amber-300/80 px-1.5 py-0.5 rounded border border-amber-900/40"
                              >
                                {opt.optionName} {opt.priceModifier > 0 && `(+₹${opt.priceModifier})`}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-stone-400 italic">"{item.notes}"</p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-700/40">
                          <span className="font-bold text-amber-400 text-sm">
                            {settings.currencySymbol}
                            {(item.unitPrice * item.quantity).toFixed(0)}
                          </span>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-stone-600 rounded-lg overflow-hidden bg-stone-900">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2 py-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-amber-100">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-2 py-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Type Toggle: Dine-In vs Takeaway */}
                <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('DINE_IN')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderType === 'DINE_IN'
                          ? 'bg-amber-600 text-stone-950 shadow-md'
                          : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Dine-In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('TAKEAWAY')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderType === 'TAKEAWAY'
                          ? 'bg-amber-600 text-stone-950 shadow-md'
                          : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Takeaway</span>
                    </button>
                  </div>

                  {/* Table Selection for Dine-In */}
                  {orderType === 'DINE_IN' && (
                    <div className="space-y-2 pt-2 border-t border-stone-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-stone-300 font-medium">Select Cafe Table:</label>
                        {selectedTableNumber && (
                          <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                            Selected: Table {selectedTableNumber}
                          </span>
                        )}
                      </div>

                      {isLoadingTables ? (
                        <p className="text-xs text-stone-500">Loading tables...</p>
                      ) : (
                        <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1">
                          {tables.map((t) => {
                            const isChosen = selectedTableId === t.id;
                            const isOccupied = t.status === 'OCCUPIED';

                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setSelectedTable(t.id, t.number)}
                                className={`p-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                                  isChosen
                                    ? 'bg-amber-500 text-stone-950 border-amber-400 ring-2 ring-amber-400/50'
                                    : isOccupied
                                    ? 'bg-stone-900 border-amber-900/40 text-amber-500/80'
                                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-amber-500/60'
                                }`}
                              >
                                <div>{t.number}</div>
                                <div className="text-[9px] opacity-75">{t.capacity}p</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Customer Information
                  </label>
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder={settings.requireCustomerPhone ? 'Mobile Number (Required) *' : 'Mobile Number (Optional for SMS receipt)'}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Optional table or delivery notes..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Promo Coupon</span>
                  </label>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-amber-300">{appliedCoupon.code}</span>
                        <span className="text-stone-400">
                          (-{settings.currencySymbol}
                          {appliedCoupon.discountAmount})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-stone-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. SUNSHINE10"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}
                </div>

                {/* Payment Method Selector */}
                <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAY_AT_COUNTER')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'PAY_AT_COUNTER'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-200 font-semibold'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <span>Pay at Counter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAY_AT_TABLE')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'PAY_AT_TABLE'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-200 font-semibold'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-400" />
                      <span>Cash at Table</span>
                    </button>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>Online Gateway: Disabled (Settlement directly at cafe).</span>
                  </div>
                </div>

                {/* Transparent Financial Calculation Breakdown */}
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal</span>
                    <span>
                      {settings.currencySymbol}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Coupon Discount</span>
                      <span>
                        -{settings.currencySymbol}
                        {discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {settings.taxRatePercent > 0 && (
                    <div className="flex justify-between text-stone-400">
                      <span>GST ({settings.taxRatePercent}%)</span>
                      <span>
                        {settings.currencySymbol}
                        {taxAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {settings.serviceChargePercent > 0 && (
                    <div className="flex justify-between text-stone-400">
                      <span>Service Charge ({settings.serviceChargePercent}%)</span>
                      <span>
                        {settings.currencySymbol}
                        {serviceCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-sm font-bold text-amber-100">
                    <span className="font-serif">Grand Total</span>
                    <span className="text-base text-amber-400 font-black">
                      {settings.currencySymbol}
                      {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/90 shrink-0">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-950 flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
                <div className="flex items-center gap-2">
                  <span className="bg-stone-950/20 px-2.5 py-0.5 rounded-lg text-xs">
                    {settings.currencySymbol}
                    {grandTotal.toFixed(0)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
