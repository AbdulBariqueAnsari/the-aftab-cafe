import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useSettings } from '../context/SettingsContext';
import { MapPin, Phone, Mail, Clock, Heart, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-amber-900/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <BrandLogo size="lg" light={true} />
            <p className="text-stone-400 text-sm leading-relaxed">
              {settings.tagline} A celebration of single-origin Assam leaves, artisan Chikmagalur espresso roasts, and warm contemporary hospitality.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                aria-label="Instagram"
              >
                📸
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                aria-label="Facebook"
              >
                📘
              </a>
              <a
                href={settings.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                aria-label="Twitter"
              >
                🐦
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-amber-200 font-serif font-bold text-lg mb-4 tracking-wide">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-amber-400 transition-colors">Artisan Menu</Link>
              </li>
              <li>
                <Link to="/menu?orderType=DINE_IN" className="hover:text-amber-400 transition-colors">Dine-in Table Ordering</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-400 transition-colors">Track Live Order</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-amber-400 transition-colors">Cafe Gallery</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-amber-400 transition-colors">Customer Testimonials</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">Our Brewing Philosophy</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-amber-200 font-serif font-bold text-lg mb-4 tracking-wide">Visit Us</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{settings.openingHours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-amber-400 transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-amber-400 transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Policies & Staff */}
          <div>
            <h4 className="text-amber-200 font-serif font-bold text-lg mb-4 tracking-wide">Information</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-amber-400 transition-colors">Refund & Cancellation</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">Find on Google Maps</Link>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-amber-900/40 rounded-lg text-xs text-amber-400 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin & Staff Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} {settings.cafeName}. All rights reserved. Crafted with passion.</p>
          <div className="flex items-center gap-1">
            <span>Freshly Brewed in India</span>
            <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
