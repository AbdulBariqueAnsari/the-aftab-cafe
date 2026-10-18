import React, { useState, useEffect } from 'react';
import { Coupon, CustomerReview } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  Tag,
  Plus,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles,
  RotateCcw,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminPromotions: React.FC = () => {
  const { token, isManager } = useAuth();
  const { settings } = useSettings();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [activeTab, setActiveTab] = useState<'COUPONS' | 'REVIEWS'>('COUPONS');
  const [isLoading, setIsLoading] = useState(true);

  // Add Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('100');
  const [maxDiscount, setMaxDiscount] = useState('50');

  const fetchData = async () => {
    try {
      const [coupRes, revsRes] = await Promise.all([
        fetch('/api/coupons', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/reviews/admin', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const coupData = await coupRes.json();
      const revsData = await revsRes.json();
      setCoupons(coupData);
      setReviews(revsData);
    } catch (err) {
      console.error('Fetch promotions error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Toggle coupon
  const toggleCoupon = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/coupons/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
        );
      }
    } catch (err) {
      console.error('Toggle coupon error:', err);
    }
  };

  // Delete coupon
  const deleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  // Create coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrderAmount) || 0,
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        }),
      });

      if (res.ok) {
        setIsCouponModalOpen(false);
        setCode('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create coupon');
      }
    } catch (err) {
      alert('Error creating coupon');
    }
  };

  // Moderate review
  const toggleReviewApproval = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/reviews/admin/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved: !current }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !current } : r))
        );
      }
    } catch (err) {
      console.error('Moderate review error:', err);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const res = await fetch(`/api/reviews/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-amber-500" />
            <span>Promotions & Review Moderation</span>
          </h1>
          <p className="text-xs text-stone-400">
            Create promotional coupon codes and moderate public guest testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'COUPONS' && isManager && (
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('COUPONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'COUPONS'
              ? 'bg-amber-600 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          Coupons & Promo Codes ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('REVIEWS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'REVIEWS'
              ? 'bg-amber-600 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          Guest Reviews Moderation ({reviews.length})
        </button>
      </div>

      {/* Tab: Coupons */}
      {activeTab === 'COUPONS' && (
        <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-3">Discount</th>
                <th className="py-3.5 px-3">Min Order</th>
                <th className="py-3.5 px-3">Max Cap</th>
                <th className="py-3.5 px-3">Redeemed</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-stone-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300 text-sm">
                    {c.code}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {settings.currencySymbol}
                    {c.minOrderAmount}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {c.maxDiscount ? `${settings.currencySymbol}${c.maxDiscount}` : 'None'}
                  </td>
                  <td className="py-3 px-3 font-mono">{c.timesUsed} times</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => toggleCoupon(c.id, c.isActive)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                        c.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => deleteCoupon(c.id, c.code)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-900/40 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Reviews Moderation */}
      {activeTab === 'REVIEWS' && (
        <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-lg divide-y divide-stone-800">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-amber-100 text-xs">{r.customerName}</span>
                  <span className="text-[10px] text-stone-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-stone-300 italic leading-relaxed">"{r.reviewText}"</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleReviewApproval(r.id, r.isApproved)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    r.isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {r.isApproved ? 'Approved / Visible' : 'Hidden'}
                </button>

                <button
                  onClick={() => deleteReview(r.id)}
                  className="p-1.5 rounded-xl bg-stone-900 hover:bg-rose-900/40 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-100">Create Promo Code</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUNSHINE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white uppercase focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">% Percentage</option>
                    <option value="FIXED">₹ Flat Off</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Value *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-stone-900 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
