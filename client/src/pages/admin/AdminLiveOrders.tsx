import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getSocket } from '../../services/socket';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Printer,
  ChevronRight,
  X,
  ChefHat,
  BellRing,
  RotateCcw,
  Sparkles,
  Receipt,
} from 'lucide-react';

export const AdminLiveOrders: React.FC = () => {
  const { user, token, isBarista, isServiceStaff, isManager, isCashier } = useAuth();
  const { settings } = useSettings();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();
    socket.emit('join:admin');

    const handleNewOrder = (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    };

    const handleUpdatedOrder = (updatedOrder: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      if (activeOrderModal?.id === updatedOrder.id) {
        setActiveOrderModal(updatedOrder);
      }
    };

    socket.on('order:created', handleNewOrder);
    socket.on('order:updated', handleUpdatedOrder);

    // Auto-polling fallback every 5 seconds
    const interval = setInterval(fetchOrders, 5000);

    return () => {
      socket.off('order:created', handleNewOrder);
      socket.off('order:updated', handleUpdatedOrder);
      clearInterval(interval);
    };
  }, [token, activeOrderModal?.id]);

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus, cancellationReason?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, cancellationReason }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update order status');
      } else {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (activeOrderModal?.id === updated.id) {
          setActiveOrderModal(updated);
        }
      }
    } catch (err) {
      alert('Error updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'ACTIVE') {
      if (['COMPLETED', 'CANCELLED'].includes(o.status)) return false;
    } else if (selectedStatus !== 'ALL') {
      if (o.status !== selectedStatus) return false;
    }

    if (selectedOrderType !== 'ALL' && o.orderType !== selectedOrderType) {
      return false;
    }

    if (tableFilter && o.tableNumber?.toUpperCase() !== tableFilter.toUpperCase()) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      if (!matchNum && !matchName) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-amber-500" />
            <span>Live Order Management</span>
          </h1>
          <p className="text-xs text-stone-400">
            Real-time kitchen order tickets, table service status, and quick progress pipeline.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-stone-950 p-4 rounded-3xl border border-stone-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order # or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Table filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Table # (e.g. T1)"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="w-28 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white uppercase placeholder-stone-500 focus:outline-none"
            />

            {/* Order type */}
            <select
              value={selectedOrderType}
              onChange={(e) => setSelectedOrderType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="DINE_IN">🍽️ Dine-in</option>
              <option value="TAKEAWAY">🛍️ Takeaway</option>
            </select>
          </div>
        </div>

        {/* Status Pipeline Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-stone-800/80">
          {[
            { id: 'ACTIVE', label: '🔥 Active Queue' },
            { id: 'ALL', label: 'All Orders' },
            { id: 'ORDER_RECEIVED', label: 'Received' },
            { id: 'ORDER_ACCEPTED', label: 'Accepted' },
            { id: 'PREPARING', label: 'Preparing' },
            { id: 'READY_TO_SERVE', label: 'Ready to Serve' },
            { id: 'SERVED', label: 'Served' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-stone-950 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-stone-950 rounded-3xl border border-stone-800">
          <UtensilsCrossed className="w-10 h-10 text-stone-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-300">No Orders in this View</h3>
          <p className="text-xs text-stone-500">Incoming customer orders will appear here automatically in real time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'COMPLETED';
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className={`rounded-3xl bg-stone-950 border transition-all flex flex-col justify-between shadow-md ${
                  order.status === 'ORDER_RECEIVED'
                    ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                    : order.status === 'PREPARING'
                    ? 'border-blue-500/60'
                    : order.status === 'READY_TO_SERVE'
                    ? 'border-emerald-500/80 bg-emerald-950/10'
                    : 'border-stone-800'
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-stone-800/80 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-400">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-amber-100 mt-0.5">
                      {order.customerName}
                    </h3>
                  </div>

                  {/* Table Badge */}
                  <div className="text-right">
                    {order.orderType === 'DINE_IN' && order.tableNumber ? (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 text-xs font-black uppercase shadow">
                        Table {order.tableNumber}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-stone-800 text-stone-300 text-[10px] font-bold uppercase">
                        🛍️ Takeaway
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 flex-1 space-y-2 text-xs">
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-stone-200">
                            {item.quantity} × {item.productName}
                          </span>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="text-[10px] text-amber-400/90 flex flex-wrap gap-1">
                              {item.customizations.map((c, i) => (
                                <span key={i} className="bg-stone-900 px-1.5 py-0.2 rounded border border-stone-800">
                                  {c.optionName}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.notes && <p className="text-[10px] text-stone-400 italic">"{item.notes}"</p>}
                        </div>
                        <span className="text-stone-400 font-mono">
                          {settings.currencySymbol}
                          {item.subtotal.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-300">
                      <strong>Special:</strong> {order.specialInstructions}
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-400">Total:</span>
                    <span className="text-amber-400 font-mono text-sm">
                      {settings.currencySymbol}
                      {order.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Actions Bar */}
                <div className="p-3 bg-stone-900/60 border-t border-stone-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-400">Status:</span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === 'READY_TO_SERVE'
                          ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                          : order.status === 'PREPARING'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Quick Action Progression Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {order.status === 'ORDER_RECEIVED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ORDER_ACCEPTED')}
                        disabled={isUpdating}
                        className="col-span-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-colors cursor-pointer"
                      >
                        ✓ Accept Order
                      </button>
                    )}

                    {order.status === 'ORDER_ACCEPTED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        disabled={isUpdating}
                        className="col-span-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer"
                      >
                        ☕ Start Preparing
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY_TO_SERVE')}
                        disabled={isUpdating}
                        className="col-span-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                      >
                        🔔 Mark Ready to Serve
                      </button>
                    )}

                    {order.status === 'READY_TO_SERVE' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'SERVED')}
                        disabled={isUpdating}
                        className="col-span-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors cursor-pointer"
                      >
                        🍽️ Mark as Served
                      </button>
                    )}

                    {order.status === 'SERVED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        disabled={isUpdating}
                        className="col-span-2 py-2 px-3 rounded-xl bg-stone-700 hover:bg-emerald-600 text-white font-bold transition-colors cursor-pointer"
                      >
                        ✓ Complete Order
                      </button>
                    )}

                    {/* View Details / Print KOT */}
                    <button
                      onClick={() => setActiveOrderModal(order)}
                      className="py-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Receipt & KOT
                    </button>

                    {/* Cancel action if not completed */}
                    {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                      <button
                        onClick={() => {
                          const reason = prompt('Please enter reason for cancellation:');
                          if (reason !== null) {
                            updateOrderStatus(order.id, 'CANCELLED', reason || 'Customer requested');
                          }
                        }}
                        className="py-1.5 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal with KOT & Customer Invoice Printing */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif font-bold text-amber-100">
                  Order Ticket: {activeOrderModal.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Ticket Area */}
            <div className="p-6 overflow-y-auto space-y-4 printable-area text-stone-100 text-xs">
              {/* Cafe Header on Ticket */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-700">
                <h2 className="font-serif text-xl font-bold tracking-widest text-amber-300">
                  {settings.cafeName}
                </h2>
                <p className="text-[10px] text-stone-400">{settings.address}</p>
                <p className="text-[10px] text-stone-400">Tel: {settings.phone}</p>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-dashed border-stone-700">
                <div>
                  <span className="text-stone-400 block">Ticket #:</span>
                  <span className="font-mono font-bold text-white">{activeOrderModal.orderNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block">Date & Time:</span>
                  <span>{new Date(activeOrderModal.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Customer:</span>
                  <span className="font-bold text-white">{activeOrderModal.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block">Service:</span>
                  <span className="font-bold text-amber-400">
                    {activeOrderModal.orderType === 'DINE_IN'
                      ? `Table ${activeOrderModal.tableNumber || 'N/A'}`
                      : 'Takeaway'}
                  </span>
                </div>
              </div>

              {/* Items List on Ticket */}
              <div className="space-y-2 pb-3 border-b border-dashed border-stone-700">
                <div className="flex justify-between font-bold text-[11px] text-stone-400">
                  <span>ITEM</span>
                  <span>QTY</span>
                  <span>AMT</span>
                </div>
                {activeOrderModal.items.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between font-medium text-stone-200">
                      <span className="flex-1">{item.productName}</span>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <span className="font-mono">
                        {settings.currencySymbol}
                        {item.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {item.customizations && item.customizations.length > 0 && (
                      <div className="text-[10px] text-amber-400 pl-2">
                        {item.customizations.map((c, i) => (
                          <div key={i}>
                            • {c.groupName}: {c.optionName} {c.priceModifier > 0 && `(+₹${c.priceModifier})`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals on Ticket */}
              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal:</span>
                  <span>
                    {settings.currencySymbol}
                    {activeOrderModal.subtotal.toFixed(2)}
                  </span>
                </div>
                {activeOrderModal.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>
                      -{settings.currencySymbol}
                      {activeOrderModal.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {activeOrderModal.taxAmount > 0 && (
                  <div className="flex justify-between text-stone-400">
                    <span>GST ({settings.taxRatePercent}%):</span>
                    <span>
                      {settings.currencySymbol}
                      {activeOrderModal.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-amber-400 pt-2 border-t border-stone-800">
                  <span>GRAND TOTAL:</span>
                  <span>
                    {settings.currencySymbol}
                    {activeOrderModal.grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400 text-[10px] pt-1">
                  <span>Payment Method:</span>
                  <span>{activeOrderModal.paymentMethod}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-stone-500 pt-4">
                Thank you for visiting {settings.cafeName}!
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Kitchen KOT / Receipt</span>
              </button>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
