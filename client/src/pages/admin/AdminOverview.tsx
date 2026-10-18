import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Table,
  Coffee,
  Sparkles,
  ArrowRight,
  Flame,
  AlertTriangle,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { user, token } = useAuth();
  const { settings } = useSettings();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Stats fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950 p-6 rounded-3xl border border-amber-900/40">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Live Operations Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-50">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Real-time cafe operations, kitchen queues, and live revenue tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open Order Board</span>
          </Link>

          <Link
            to="/admin/tables"
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 text-xs font-semibold flex items-center gap-2"
          >
            <Table className="w-4 h-4" />
            <span>Floor Plan</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Today's Sales</span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {settings.currencySymbol}
              {stats?.todaySales?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-stone-500">
              Avg Order Value: {settings.currencySymbol}
              {stats?.averageOrderValue?.toFixed(0) || '0'}
            </p>
          </div>

          {/* Today's Orders */}
          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Total Orders Today</span>
              <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats?.todayOrdersCount || 0}</div>
            <p className="text-[11px] text-stone-500">
              {stats?.completedOrdersCount || 0} Completed / Served
            </p>
          </div>

          {/* Active Kitchen Queue */}
          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Kitchen Queue</span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {(stats?.pendingOrdersCount || 0) + (stats?.preparingOrdersCount || 0)}
            </div>
            <p className="text-[11px] text-stone-500">
              {stats?.pendingOrdersCount || 0} New, {stats?.preparingOrdersCount || 0} Brewing
            </p>
          </div>

          {/* Table Occupancy */}
          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Table Occupancy</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Table className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {stats?.occupancyRate || 0}%
            </div>
            <p className="text-[11px] text-stone-500">
              {stats?.occupiedTables || 0} of {stats?.totalTables || 8} tables occupied
            </p>
          </div>
        </div>
      )}

      {/* Hourly Trend & Bestsellers Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Peak Hours Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-amber-100">Today's Peak Ordering Hours</h3>
              <p className="text-xs text-stone-400">Hourly volume of orders placed throughout the day</p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
              8:00 AM – 11:00 PM
            </span>
          </div>

          {/* Bar representation */}
          <div className="h-48 flex items-end gap-1.5 pt-6 pb-2 border-b border-stone-800">
            {stats?.hourlyCounts &&
              stats.hourlyCounts.slice(8, 23).map((count: number, idx: number) => {
                const hour = idx + 8;
                const max = Math.max(1, ...stats.hourlyCounts);
                const heightPercent = (count / max) * 100;

                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-[10px] px-1.5 py-0.5 rounded text-amber-300 font-bold whitespace-nowrap z-10 pointer-events-none">
                      {count} orders
                    </div>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-amber-700 to-amber-500 group-hover:from-amber-600 group-hover:to-amber-400 transition-all"
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    />
                    <span className="text-[9px] text-stone-500 font-mono">
                      {hour > 12 ? `${hour - 12}p` : `${hour}a`}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-base text-amber-100">Top Selling Items</h3>
              <Link to="/admin/menu" className="text-xs text-amber-400 hover:underline">
                Manage Menu
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                stats.topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-800/60 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-stone-200">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-400">{p.quantity} sold</span>
                      <span className="block text-[10px] text-stone-500">
                        {settings.currencySymbol}
                        {p.revenue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 py-6 text-center">No orders recorded today yet.</p>
              )}
            </div>
          </div>

          <Link
            to="/admin/reports"
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-4"
          >
            <span>View Detailed Sales Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
