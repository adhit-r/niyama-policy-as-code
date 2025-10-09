import React from 'react';

interface NiyamaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full' | 'text';
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
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl', 
    xl: 'text-5xl'
  };

  // Neo-Brutalist Icon - Abstract "N" with geometric shapes
  const NiyamaIcon = () => (
    <div className={`${sizeClasses[size]} bg-orange-500 border-2 border-black shadow-brutal flex items-center justify-center relative ${className}`}>
      {/* Abstract "N" made of geometric shapes */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left vertical bar */}
        <div className="absolute left-1 top-1 bottom-1 w-1 bg-black"></div>
        {/* Right vertical bar */}
        <div className="absolute right-1 top-1 bottom-1 w-1 bg-black"></div>
        {/* Diagonal connecting bar */}
        <div className="absolute w-0.5 h-full bg-black transform rotate-45 origin-center"></div>
        {/* Small accent square */}
        <div className="absolute top-1 right-1 w-1 h-1 bg-white border border-black"></div>
      </div>
    </div>
  );

  // Neo-Brutalist Text Logo
  const NiyamaText = () => (
    <span className={`font-display font-black ${textSizeClasses[size]} text-black tracking-tight ${className}`}>
      NIYAMA
    </span>
  );

  // Full Logo with Icon + Text
  const FullLogo = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <NiyamaIcon />
      <div className="flex flex-col">
        <span className={`font-display font-black ${textSizeClasses[size]} text-black tracking-tight leading-none`}>
          NIYAMA
        </span>
        <span className="font-sans text-xs text-gray-700 tracking-wide uppercase">
          Policy as Code
        </span>
      </div>
    </div>
  );

  switch (variant) {
    case 'icon':
      return <NiyamaIcon />;
    case 'text':
      return <NiyamaText />;
    case 'full':
    default:
      return <FullLogo />;
  }
};

// Alternative geometric logo variations
export const NiyamaLogoAlt: React.FC<NiyamaLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16', 
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} bg-white border-2 border-black shadow-brutal flex items-center justify-center relative ${className}`}>
      {/* Geometric "N" with Neo-Brutalist style */}
      <div className="relative w-full h-full p-1">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-orange-500 m-1"></div>
        {/* "N" cutout pattern */}
        <div className="relative w-full h-full bg-white">
          {/* Left bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
          {/* Right bar */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-black"></div>
          {/* Diagonal */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-black transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Minimalist version for favicons
export const NiyamaFavicon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-8 h-8 bg-orange-500 border-2 border-black shadow-brutal flex items-center justify-center ${className}`}>
    <div className="w-4 h-4 bg-black transform rotate-45"></div>
    <div className="absolute w-1 h-4 bg-white"></div>
  </div>
);