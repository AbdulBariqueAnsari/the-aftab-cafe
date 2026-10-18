import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { getSocket } from '../../services/socket';
import { playOrderChime } from '../../services/sound';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Coffee,
  Table,
  Sliders,
  BarChart3,
  Boxes,
  Tag,
  Star,
  Users,
  Volume2,
  VolumeX,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  Radio,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout, isSuperAdmin, isManager, isCashier, isBarista, isServiceStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  // Setup Socket.IO admin connection & order sound alert
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    if (socket.connected) {
      setSocketConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Join admin room
    socket.emit('join:admin');

    const handleNewOrder = (order: any) => {
      if (soundEnabled) {
        playOrderChime();
      }
      setNewOrderAlert(`New Order #${order.orderNumber} placed for ${order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}!`);
      setTimeout(() => setNewOrderAlert(null), 8000);
    };

    socket.on('order:created', handleNewOrder);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('order:created', handleNewOrder);
    };
  }, [soundEnabled]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, access: true },
    { label: 'Live Orders', path: '/admin/orders', icon: UtensilsCrossed, access: true },
    { label: 'Menu & Items', path: '/admin/menu', icon: Coffee, access: isBarista || isManager },
    { label: 'Tables & Floor', path: '/admin/tables', icon: Table, access: isServiceStaff || isCashier },
    { label: 'Website Studio', path: '/admin/studio', icon: Sliders, access: isManager },
    { label: 'Sales Reports', path: '/admin/reports', icon: BarChart3, access: isManager || isCashier },
    { label: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes, access: isBarista || isManager },
    { label: 'Promotions & Codes', path: '/admin/promotions', icon: Tag, access: isManager },
    { label: 'Customer Reviews', path: '/admin/reviews', icon: Star, access: isManager },
    { label: 'Staff & Audit Logs', path: '/admin/staff', icon: Users, access: isSuperAdmin },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col md:flex-row">
      {/* Sound Alert Banner when new order arrives */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 bg-amber-500 text-stone-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white">
          <Volume2 className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">{newOrderAlert}</span>
          <button onClick={() => setNewOrderAlert(null)} className="p-1 hover:bg-amber-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-stone-950 border-r border-amber-950/40 flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <Link to="/" target="_blank" title="Open Public Website">
              <BrandLogo size="sm" light={true} />
            </Link>
            <div className="flex items-center gap-1.5" title={socketConnected ? 'Live Real-time Connected' : 'Connecting...'}>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[10px] text-stone-400 font-mono">LIVE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems
              .filter((item) => item.access)
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/50'
                        : 'text-stone-300 hover:text-amber-300 hover:bg-stone-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-stone-950' : 'text-amber-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Card & Controls */}
        <div className="p-4 border-t border-stone-800 space-y-3 bg-stone-950/60">
          {/* Sound alert toggle */}
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>Order Sound Alerts</span>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                  : 'border-stone-800 text-stone-500 hover:text-stone-300'
              }`}
              title={soundEnabled ? 'Order sound alert is ON' : 'Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* User profile */}
          <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-600/30 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-600/40">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-100 truncate">{user?.name || 'Staff'}</p>
                <p className="text-[10px] text-amber-500 font-mono tracking-wider">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="w-full py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 text-xs flex items-center justify-center gap-1.5 transition-colors border border-stone-800"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Cafe</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-950 border-b border-stone-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <BrandLogo size="sm" light={true} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-stone-900 text-stone-300"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-stone-900 text-stone-300"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-stone-950 border-b border-stone-800 p-4 space-y-2">
          {navItems
            .filter((i) => i.access)
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive(item.path) ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-amber-300">{user?.name} ({user?.role})</span>
            <button onClick={handleLogout} className="text-rose-400 font-bold">Logout</button>
          </div>
        </div>
      )}

      {/* Main Admin Content Viewport */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
