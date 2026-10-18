import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', light = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG: Golden Rising Sun + Coffee / Tea Cup */}
      <div className={`relative flex items-center justify-center rounded-xl p-1.5 shadow-sm transition-transform hover:scale-105 ${light ? 'bg-amber-100/20' : 'bg-gradient-to-br from-amber-600 to-amber-800'}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSizes[size]} text-amber-300 drop-shadow`}
        >
          {/* Sun Rays */}
          <path d="M24 4V8" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 10L13 13" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 10L35 13" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M4 24H8" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 24H44" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Rising Sun Half Circle */}
          <circle cx="24" cy="24" r="10" fill="url(#sunGradient)" opacity="0.9" />

          {/* Steaming Coffee / Tea Cup */}
          <path
            d="M14 26C14 33 18 38 24 38C30 38 34 33 34 26H14Z"
            fill="#FFFBEB"
            stroke="#92400E"
            strokeWidth="2"
          />
          {/* Cup Handle */}
          <path
            d="M34 28C36.5 28 38 29.5 38 32C38 34.5 36.5 36 34 36"
            stroke="#FFFBEB"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Saucer */}
          <path
            d="M10 41C16 43 32 43 38 41"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Rising Steam Swirls */}
          <path
            d="M20 22C19 19 21 17 20 14"
            stroke="#FEF3C7"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M26 22C27 19 25 17 26 14"
            stroke="#FEF3C7"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="sunGradient" x1="14" y1="14" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col text-left leading-none">
        <span
          className={`font-serif font-black tracking-widest ${textSizes[size]} ${
            light ? 'text-amber-100' : 'text-stone-900 dark:text-amber-50'
          }`}
          style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
        >
          THE AFTAB
        </span>
        <span
          className={`tracking-[0.25em] font-medium uppercase mt-0.5 ${subTextSizes[size]} ${
            light ? 'text-amber-300/90' : 'text-amber-700 dark:text-amber-400'
          }`}
        >
          Artisan Cafe & Tea
        </span>
      </div>
    </div>
  );
};
