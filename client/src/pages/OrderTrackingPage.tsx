import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { useSettings } from '../context/SettingsContext';
import { getSocket } from '../services/socket';
import {
  CheckCircle2,
  Clock,
  Coffee,
  ChefHat,
  BellRing,
  Sparkles,
  Search,
  Printer,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'ORDER_RECEIVED', label: 'Order Received', desc: 'Sent to cafe kitchen' },
  { status: 'ORDER_ACCEPTED', label: 'Order Accepted', desc: 'Barista confirmed receipt' },
  { status: 'PREPARING', label: 'Brewing & Preparing', desc: 'Crafting your beverage' },
  { status: 'READY_TO_SERVE', label: 'Ready to Serve', desc: 'Plated and ready' },
  { status: 'SERVED', label: 'Delivered to Table', desc: 'Served at your table' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Enjoy your coffee & tea!' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [searchCode, setSearchCode] = useState(paramOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch order data
  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/orders/${num.trim()}`);
      if (!res.ok) {
        throw new Error('Order not found. Please verify the order number.');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch order status.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) {
      setSearchCode(paramOrderNumber);
      fetchOrder(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!order?.orderNumber) return;

    const socket = getSocket();
    socket.emit('join:order', order.orderNumber);

    const handleOrderUpdate = (updatedOrder: Order) => {
      if (updatedOrder.orderNumber === order.orderNumber) {
        setOrder(updatedOrder);
      }
    };

    socket.on('order:updated', handleOrderUpdate);

    // Fallback polling every 6 seconds
    const interval = setInterval(() => {
      fetch(`/api/orders/${order.orderNumber}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.orderNumber) setOrder(data);
        })
        .catch(() => {});
    }, 6000);

    return () => {
      socket.emit('leave:order', order.orderNumber);
      socket.off('order:updated', handleOrderUpdate);
      clearInterval(interval);
    };
  }, [order?.orderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/track/${searchCode.trim()}`);
    }
  };

  const getStepIndex = (currentStatus: OrderStatus) => {
    if (currentStatus === 'CANCELLED') return -1;
    return STATUS_STEPS.findIndex((s) => s.status === currentStatus);
  };

  const currentStepIndex = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Search header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-amber-50">
            Live Order Status
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Track preparation progress in real-time from our kitchen to your table.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-3 flex gap-2">
            <input
              type="text"
              placeholder="Enter Order Number (e.g. AFT-20261018-XXXX)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-xs sm:text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading && (
          <div className="p-12 text-center text-stone-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Fetching live order status...</p>
          </div>
        )}

        {/* Live Order Tracker Card */}
        {order && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden space-y-6">
            {/* Status Header */}
            <div className="p-6 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-amber-100">{order.customerName}</h2>
                <div className="flex items-center gap-2 text-xs text-amber-300 mt-1">
                  <span>{order.orderType === 'DINE_IN' ? '🍽️ Dine-in Service' : '🛍️ Takeaway'}</span>
                  {order.tableNumber && (
                    <>
                      <span>•</span>
                      <span className="font-bold bg-amber-600/40 px-2 py-0.5 rounded">
                        Table {order.tableNumber}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="sm:text-right">
                {order.status === 'CANCELLED' ? (
                  <span className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider inline-block">
                    Cancelled
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow inline-block">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-[11px] text-amber-200/80">Updates live automatically</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stepper Visualization */}
            {order.status === 'CANCELLED' ? (
              <div className="p-6 bg-rose-500/10 border-y border-rose-500/20 text-center space-y-1">
                <p className="font-semibold text-rose-500 text-sm">This order was cancelled</p>
                {order.cancellationReason && (
                  <p className="text-xs text-stone-400 italic">Reason: {order.cancellationReason}</p>
                )}
              </div>
            ) : (
              <div className="px-6 py-4">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-stone-200 dark:bg-stone-800 -z-0">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-700"
                      style={{
                        width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step.status} className="flex flex-col items-center text-center space-y-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                              isCurrent
                                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/30 scale-110'
                                : isCompleted
                                ? 'bg-amber-700 text-amber-100'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-300 dark:border-stone-700'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div>
                            <span
                              className={`block text-xs font-bold ${
                                isCurrent
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : isCompleted
                                  ? 'text-stone-900 dark:text-amber-100'
                                  : 'text-stone-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="hidden sm:block text-[10px] text-stone-400 leading-tight">
                              {step.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items Breakdown */}
            <div className="p-6 border-t border-stone-200 dark:border-stone-800 space-y-4">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Ordered Items</h3>
              <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-bold text-sm text-stone-800 dark:text-stone-200">
                          {item.quantity} × {item.productName}
                        </span>
                      </div>

                      {item.customizations && item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                          {item.customizations.map((c, i) => (
                            <span key={i} className="bg-amber-500/10 px-2 py-0.5 rounded">
                              {c.groupName}: {c.optionName} {c.priceModifier > 0 && `(+₹${c.priceModifier})`}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.notes && <p className="text-xs text-stone-400 italic">"{item.notes}"</p>}
                    </div>

                    <span className="font-bold text-sm text-stone-900 dark:text-amber-300">
                      {settings.currencySymbol}
                      {item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Totals */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {settings.currencySymbol}
                    {order.subtotal.toFixed(2)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>
                      -{settings.currencySymbol}
                      {order.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax (GST)</span>
                    <span>
                      {settings.currencySymbol}
                      {order.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-base font-bold text-stone-900 dark:text-amber-100">
                  <span className="font-serif">Grand Total</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">
                    {settings.currencySymbol}
                    {order.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 bg-stone-100 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-500 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Need assistance? Staff is available at the counter or calling table service.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <Link
                  to="/menu"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Order More Items</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
