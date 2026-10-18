import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  BarChart3,
  Download,
  Calendar,
  Printer,
  TrendingUp,
  CreditCard,
  Table,
  Coffee,
  CheckCircle,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { token } = useAuth();
  const { settings } = useSettings();

  const [range, setRange] = useState('today');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/analytics?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Fetch report error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [range, token]);

  const handleExportCsv = () => {
    window.open('/api/reports/export-csv', '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <span>Sales & Revenue Reports</span>
          </h1>
          <p className="text-xs text-stone-400">
            Financial breakdown distinguishing gross sales, discounts, taxes, and table earnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'today', label: 'Today' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'last7', label: 'Last 7 Days' },
          { id: 'last30', label: 'Last 30 Days' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              range === tab.id
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Financial Summary KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-stone-950 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
            <span className="text-xs text-stone-400">Gross Sales</span>
            <div className="text-2xl font-black text-white font-mono">
              {settings.currencySymbol}
              {report?.grossSales?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-stone-500">{report?.totalOrders || 0} Total Orders</p>
          </div>

          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
            <span className="text-xs text-stone-400">Total Discounts Given</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              -{settings.currencySymbol}
              {report?.totalDiscounts?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-stone-500">Promotions & Coupons</p>
          </div>

          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
            <span className="text-xs text-stone-400">GST Collected ({settings.taxRatePercent}%)</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {settings.currencySymbol}
              {report?.totalTaxes?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-stone-500">State / Central GST</p>
          </div>

          <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-1">
            <span className="text-xs text-stone-400">Net Cafe Revenue</span>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {settings.currencySymbol}
              {report?.netRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-stone-500">
              {report?.validOrdersCount || 0} Successful Orders
            </p>
          </div>
        </div>
      )}

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-200">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-base">Payment Methods</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {report?.paymentBreakdown &&
              Object.entries(report.paymentBreakdown).map(([pm, data]: any) => (
                <div key={pm} className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-200 block">{pm.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-stone-500">{data.count} transactions</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {settings.currencySymbol}
                    {data.total.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-200">
            <Coffee className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-base">Category Sales</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {report?.categoryBreakdown &&
              Object.entries(report.categoryBreakdown).map(([cat, data]: any) => (
                <div key={cat} className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-200 block">{cat}</span>
                    <span className="text-[11px] text-stone-500">{data.count} items served</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {settings.currencySymbol}
                    {data.total.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Table-Wise Breakdown */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-200">
            <Table className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-base">Table Earnings</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {report?.tableBreakdown &&
              Object.entries(report.tableBreakdown).map(([tb, data]: any) => (
                <div key={tb} className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-200 block">Table {tb}</span>
                    <span className="text-[11px] text-stone-500">{data.count} orders</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {settings.currencySymbol}
                    {data.total.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
