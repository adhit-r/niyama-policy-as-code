import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'primary',
  className,
  text
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'border-niyama-black border-t-niyama-accent',
    secondary: 'border-niyama-gray-300 border-t-niyama-black',
    accent: 'border-niyama-white border-t-niyama-accent',
    white: 'border-niyama-gray-300 border-t-niyama-white',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className="text-sm text-niyama-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};



