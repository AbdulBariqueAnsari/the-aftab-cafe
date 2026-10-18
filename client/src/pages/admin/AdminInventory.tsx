import React, { useState, useEffect } from 'react';
import { InventoryIngredient } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  Boxes,
  Plus,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { token, isManager } = useAuth();
  const { settings } = useSettings();

  const [ingredients, setIngredients] = useState<InventoryIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [selectedIngredient, setSelectedIngredient] = useState<InventoryIngredient | null>(null);
  const [adjustType, setAdjustType] = useState('PURCHASE');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Add Ingredient Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState('3');
  const [supplier, setSupplier] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIngredients(data);
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !adjustQty) return;

    setIsSubmittingAdjust(true);
    try {
      const res = await fetch(`/api/inventory/${selectedIngredient.id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movementType: adjustType,
          quantity: parseFloat(adjustQty),
          notes: adjustNotes.trim() || null,
        }),
      });

      if (res.ok) {
        setSelectedIngredient(null);
        setAdjustQty('');
        setAdjustNotes('');
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to adjust stock');
      }
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unit) return;

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          unit: unit.trim(),
          currentStock: parseFloat(currentStock) || 0,
          minStockAlert: parseFloat(minStockAlert) || 5,
          supplier: supplier.trim() || null,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setSupplier('');
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add ingredient');
      }
    } catch (err) {
      alert('Error adding ingredient');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-amber-500" />
            <span>Raw Ingredients & Stock Management</span>
          </h1>
          <p className="text-xs text-stone-400">
            Track tea leaves, coffee bean reserves, milk stocks, and receive low-inventory thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInventory}
            className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {isManager && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>
          )}
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Ingredient Name</th>
                <th className="py-3.5 px-3">Current Stock</th>
                <th className="py-3.5 px-3">Alert Threshold</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Supplier</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {ingredients.map((ing) => (
                <tr key={ing.id} className="hover:bg-stone-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-amber-100">{ing.name}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white text-sm">
                    {ing.currentStock.toFixed(1)} {ing.unit}
                  </td>
                  <td className="py-3.5 px-3 text-stone-400">
                    {ing.minStockAlert.toFixed(1)} {ing.unit}
                  </td>
                  <td className="py-3.5 px-3">
                    {ing.isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Adequate
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-stone-400">{ing.supplier || 'Direct Purchase'}</td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedIngredient(ing)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Update Inventory
                </span>
                <h3 className="font-serif font-bold text-lg text-white">
                  {selectedIngredient.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIngredient(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-900 rounded-xl text-xs flex justify-between">
              <span className="text-stone-400">Current Stock:</span>
              <span className="font-bold text-amber-400">
                {selectedIngredient.currentStock} {selectedIngredient.unit}
              </span>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Adjustment Reason</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                >
                  <option value="PURCHASE">🛒 New Purchase Received (Add)</option>
                  <option value="WASTAGE">⚠️ Wastage / Spoilage (Deduct)</option>
                  <option value="USAGE">☕ Kitchen Daily Usage (Deduct)</option>
                  <option value="ADJUSTMENT">📋 Physical Count Reconciliation</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">
                  Quantity ({selectedIngredient.unit}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 5.0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Notes / Invoice #</label>
                <input
                  type="text"
                  placeholder="Optional supplier bill or reason"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIngredient(null)}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold"
                >
                  {isSubmittingAdjust ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-100">Add Raw Ingredient</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmiri Saffron or Oat Milk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="grams">grams</option>
                    <option value="ml">ml</option>
                    <option value="packets">packets</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Low-Stock Alert Level</label>
                <input
                  type="number"
                  step="0.1"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Supplier (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Kerala Spice Merchants"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
