import React from 'react';

function LoadingSpinner({ full, size = 'md', className = '' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  if (full) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className={`spinner ${sizeMap.lg}`} />
          <p className="text-gray-500 text-sm animate-pulse">Loading SmartShop AI...</p>
        </div>
      </div>
    );
  }

  return <div className={`spinner ${sizeMap[size]} ${className}`} />;
}

export default LoadingSpinner;
