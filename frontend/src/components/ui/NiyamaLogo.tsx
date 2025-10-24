import React from 'react';

interface NiyamaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'icon' | 'full' | 'text' | 'compact';
  className?: string;
}

export const NiyamaLogo: React.FC<NiyamaLogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl', 
    xl: 'text-4xl',
    '2xl': 'text-6xl'
  };

  const subtextSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl'
  };

  // Neo-Brutalist Icon - Shield with bold borders and shadows
  const NiyamaIcon = () => (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-4 border-black shadow-brutal-lg flex items-center justify-center relative overflow-hidden ${className}`}>
      {/* Shield outline */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Main shield shape */}
        <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-white drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 2L4 6V11C4 16 8 20.5 12 22C16 20.5 20 16 20 11V6L12 2Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.2)"
          />
          <path 
            d="M9 12L11 14L15 10" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white"></div>
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white"></div>
      </div>
    </div>
  );

  // Elegant Text Logo
  const NiyamaText = () => (
    <div className={`flex flex-col ${className}`}>
      <span className={`font-serif font-bold ${textSizeClasses[size]} bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight leading-none`}>
        Niyama
      </span>
      {size !== 'sm' && (
        <span className={`font-sans ${subtextSizeClasses[size]} text-slate-500 tracking-widest uppercase font-light mt-1.5`}>
          Policy as Code
        </span>
      )}
    </div>
  );

  // Full Elegant Logo with proper layout
  const FullLogo = () => (
    <div className={`flex items-center space-x-4 ${className}`}>
      <NiyamaIcon />
      <div className="flex flex-col">
        <span className={`font-serif font-bold ${textSizeClasses[size]} bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight leading-none`}>
          Niyama
        </span>
        <span className={`font-sans ${subtextSizeClasses[size]} text-slate-500 tracking-widest uppercase font-light mt-1.5`}>
          Policy as Code
        </span>
      </div>
    </div>
  );

  // Compact version for headers/navigation
  const CompactLogo = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-2 border-black shadow-brutal flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white drop-shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 2L4 6V11C4 16 8 20.5 12 22C16 20.5 20 16 20 11V6L12 2Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.2)"
          />
          <path 
            d="M9 12L11 14L15 10" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="font-serif font-bold text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
        Niyama
      </span>
    </div>
  );

  switch (variant) {
    case 'icon':
      return <NiyamaIcon />;
    case 'text':
      return <NiyamaText />;
    case 'compact':
      return <CompactLogo />;
    case 'full':
    default:
      return <FullLogo />;
  }
};

// Hero Logo - Large format for landing pages
export const NiyamaHeroLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-col items-center space-y-8 ${className}`}>
    {/* Large icon */}
    <div className="w-40 h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-4 border-black shadow-brutal-xl flex items-center justify-center relative overflow-hidden group">
      <svg viewBox="0 0 24 24" className="w-24 h-24 text-white drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 2L4 6V11C4 16 8 20.5 12 22C16 20.5 20 16 20 11V6L12 2Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.2)"
        />
        <path 
          d="M9 12L11 14L15 10" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-white"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-white"></div>
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    </div>
    
    {/* Large text */}
    <div className="text-center space-y-3">
      <h1 className="font-serif font-bold text-7xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight leading-none">
        Niyama
      </h1>
      <p className="font-sans text-xl text-slate-500 tracking-widest uppercase font-light">
        Policy as Code Platform
      </p>
      <div className="flex items-center justify-center space-x-3 mt-6">
        <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 border border-black shadow-sm"></div>
        <span className="font-sans text-sm text-slate-400 tracking-wide font-light">
          Enterprise Security & Compliance
        </span>
        <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 border border-black shadow-sm"></div>
      </div>
    </div>
  </div>
);

// Monogram - Single letter for tight spaces
export const NiyamaMonogram: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-2 border-black shadow-brutal flex items-center justify-center ${className}`}>
      <span className="font-serif font-bold text-white drop-shadow">N</span>
    </div>
  );
};

// Watermark - Subtle version for backgrounds
export const NiyamaWatermark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`opacity-5 ${className}`}>
    <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-2 border-black shadow-brutal flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 2L4 6V11C4 16 8 20.5 12 22C16 20.5 20 16 20 11V6L12 2Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.2)"
        />
        <path 
          d="M9 12L11 14L15 10" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
);

// Favicon optimized for 16x16, 32x32
export const NiyamaFavicon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-2 border-black shadow-brutal flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white drop-shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2L4 6V11C4 16 8 20.5 12 22C16 20.5 20 16 20 11V6L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.2)"
      />
      <path 
        d="M9 12L11 14L15 10" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Loading Logo - Animated version
export const NiyamaLoadingLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-2 border-black shadow-brutal flex items-center justify-center animate-pulse ${className}`}>
    <svg viewBox="0 0 24 24" className="w-10 h-10 text-white drop-shadow animate-pulse" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2L4 6V11C4 16 8 20.5 12 22C16 20.5 20 16 20 11V6L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.2)"
      />
      <path 
        d="M9 12L11 14L15 10" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  </div>
);