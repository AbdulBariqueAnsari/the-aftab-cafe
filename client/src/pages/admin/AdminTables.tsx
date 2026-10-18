import React, { useState, useEffect } from 'react';
import { CafeTable } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getSocket } from '../../services/socket';
import {
  Table,
  Plus,
  QrCode,
  CheckCircle,
  Receipt,
  Users,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const AdminTables: React.FC = () => {
  const { token, isManager, isCashier } = useAuth();
  const { settings } = useSettings();

  const [tables, setTables] = useState<CafeTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTableForQr, setSelectedTableForQr] = useState<CafeTable | null>(null);

  // Add Table Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  const [tableNotes, setTableNotes] = useState('');

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error('Fetch tables error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    const socket = getSocket();
    const handleTableUpdate = () => fetchTables();
    socket.on('table:updated', handleTableUpdate);

    return () => {
      socket.off('table:updated', handleTableUpdate);
    };
  }, [token]);

  // Settle bill & clear table
  const handleSettleBill = async (table: CafeTable) => {
    if (!window.confirm(`Settle bill of ₹${table.currentBillTotal?.toFixed(2)} and reset Table ${table.number} to Available?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tables/admin/${table.id}/settle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchTables();
      }
    } catch (err) {
      alert('Failed to settle table bill');
    }
  };

  // Change status
  const handleChangeStatus = async (tableId: string, status: string) => {
    try {
      const res = await fetch(`/api/tables/admin/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchTables();
      }
    } catch (err) {
      console.error('Change status error:', err);
    }
  };

  // Add Table
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim() || !tableName.trim()) return;

    try {
      const res = await fetch('/api/tables/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: tableNumber.trim(),
          name: tableName.trim(),
          capacity: parseInt(tableCapacity) || 2,
          notes: tableNotes.trim() || null,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setTableNumber('');
        setTableName('');
        setTableCapacity('4');
        setTableNotes('');
        fetchTables();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add table');
      }
    } catch (err) {
      alert('Error creating table');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <Table className="w-6 h-6 text-amber-500" />
            <span>Table Floor Management & QR Codes</span>
          </h1>
          <p className="text-xs text-stone-400">
            Real-time table occupancy, active running bills, and printable QR codes for contactless dining.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTables}
            className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Floor</span>
          </button>

          {isManager && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Table</span>
            </button>
          )}
        </div>
      </div>

      {/* Tables Floor Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-stone-950 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isOccupied = table.status === 'OCCUPIED';
            const isAvailable = table.status === 'AVAILABLE';
            const hasBill = (table.currentBillTotal || 0) > 0;

            return (
              <div
                key={table.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-md ${
                  isOccupied
                    ? 'bg-amber-950/20 border-amber-600/60 ring-1 ring-amber-500/20'
                    : isAvailable
                    ? 'bg-stone-950 border-stone-800 hover:border-emerald-500/40'
                    : 'bg-stone-950/50 border-stone-800 opacity-70'
                }`}
              >
                {/* Table Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-black text-amber-400">
                        {table.number}
                      </span>
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-stone-500" />
                        {table.capacity} seats
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-amber-100">{table.name}</h3>
                  </div>

                  {/* QR Code Action */}
                  <button
                    onClick={() => setSelectedTableForQr(table)}
                    className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800 transition-colors cursor-pointer"
                    title="View Table QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                {/* Status & Active Orders Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Status:</span>
                    <select
                      value={table.status}
                      onChange={(e) => handleChangeStatus(table.id, e.target.value)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold focus:outline-none cursor-pointer ${
                        table.status === 'AVAILABLE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : table.status === 'OCCUPIED'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="OUT_OF_SERVICE">Maintenance</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">
                      {table.activeOrdersCount || 0} Active Orders
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {settings.currencySymbol}
                      {(table.currentBillTotal || 0).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Settle Bill Button */}
                {hasBill && isCashier && (
                  <button
                    onClick={() => handleSettleBill(table)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Settle Table Bill</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal for Table */}
      {selectedTableForQr && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-stone-950 rounded-3xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl printable-area">
            <div className="flex justify-between items-center no-print">
              <span className="text-xs uppercase font-black tracking-widest text-amber-700">
                Contactless Table QR
              </span>
              <button
                onClick={() => setSelectedTableForQr(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-amber-900">
                {settings.cafeName}
              </h2>
              <div className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-sm tracking-widest uppercase mt-1">
                Table {selectedTableForQr.number}
              </div>
              <p className="text-xs text-stone-500">{selectedTableForQr.name}</p>
            </div>

            {/* Generated QR Code Graphic */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `${window.location.origin}/?table=${selectedTableForQr.number}`
                )}`}
                alt={`Table ${selectedTableForQr.number} QR Code`}
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="space-y-1 text-xs text-stone-600">
              <p className="font-bold">Scan to browse menu & place order</p>
              <p className="text-[11px] text-stone-400">
                Your orders will be delivered directly to Table {selectedTableForQr.number}.
              </p>
            </div>

            <div className="pt-2 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Print Table Tent Card
              </button>
              <button
                onClick={() => setSelectedTableForQr(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-100">Add New Table</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Table Number (e.g. T9) *</label>
                <input
                  type="text"
                  required
                  placeholder="T9"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Table Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garden Arch 3"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableCapacity}
                  onChange={(e) => setTableCapacity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near window / power socket"
                  value={tableNotes}
                  onChange={(e) => setTableNotes(e.target.value)}
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
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
