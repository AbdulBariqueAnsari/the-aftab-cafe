import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Coffee, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <BrandLogo size="lg" light={true} className="justify-center" />

        <div className="relative py-8">
          <span className="font-serif text-8xl sm:text-9xl font-black text-amber-500/20 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coffee className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
            Cup Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Looks like this page took a detour or got spilled. Let's guide you back to our freshly brewed menu.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Cafe</span>
          </Link>

          <Link
            to="/menu"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-600/50 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
