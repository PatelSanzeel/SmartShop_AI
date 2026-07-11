import React from 'react';
import { Star } from 'lucide-react';

function StarRating({ rating = 0, max = 5, size = 14, showValue = false }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="text-gray-200"
                fill="currentColor"
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : '100%' }}
                >
                  <Star size={size} className="text-yellow-400" fill="currentColor" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 ml-1">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}

export default StarRating;
