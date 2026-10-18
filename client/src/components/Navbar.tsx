import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { ShoppingBag, Menu, X, Coffee, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount, subtotal, setIsCartOpen, selectedTableNumber } = useCart();
  const { settings } = useSettings();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Track Order', path: '/track' },
    { label: 'About Us', path: '/about' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Location', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-amber-900/30 text-amber-50 transition-colors shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="focus:outline-none">
          <BrandLogo size="md" light={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
                isActive(link.path)
                  ? 'bg-amber-600/30 text-amber-300 font-semibold'
                  : 'text-stone-300 hover:text-amber-200 hover:bg-stone-800/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons: Table Badge, Cart Button, Admin link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Table indicator if user scanned or selected table */}
          {selectedTableNumber && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/40 rounded-full text-xs text-amber-300 font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Table {selectedTableNumber}</span>
            </div>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-stone-950" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-stone-900 text-amber-400 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-500">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">
              {itemCount === 0 ? 'Cart' : `${settings.currencySymbol}${subtotal.toFixed(0)}`}
            </span>
          </button>

          {/* Admin Portal Shortcut */}
          <Link
            to="/admin"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-700 hover:border-amber-600/50 text-xs text-stone-400 hover:text-amber-300 transition-colors"
            title="Cafe Staff & Admin Portal"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Staff</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-950 border-b border-amber-900/40 px-4 pt-2 pb-6 space-y-2">
          {selectedTableNumber && (
            <div className="p-2 mb-2 bg-amber-900/30 rounded-lg text-amber-300 text-xs flex items-center justify-between">
              <span>Ordering for Table</span>
              <span className="font-bold bg-amber-600/40 px-2 py-0.5 rounded">Table {selectedTableNumber}</span>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-amber-600/20 text-amber-300 font-bold'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-amber-400 hover:underline"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Owner & Staff Dashboard</span>
            </Link>
            <span>{settings.openingHours}</span>
          </div>
        </div>
      )}
    </header>
  );
};
