import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  className?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  status,
  className,
  fallback
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4'
  };

  const statusColors = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-gray-500'
  };

  const displayFallback = fallback || (alt ? alt[0]?.toUpperCase() : '?');

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn(
        'rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white overflow-hidden',
        sizes[size]
      )}>
        {src ? (
          <img 
            src={src} 
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          displayFallback
        )}
      </div>
      
      {status && (
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-gray-800',
          statusSizes[size],
          statusColors[status]
        )} />
      )}
    </div>
  );
};