import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompareStore } from '../store';
import { GitCompare, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
          <GitCompare size={18} />
          <span>Compare ({compareList.length}/4)</span>
        </div>

        <div className="flex-1 flex items-center gap-3 overflow-x-auto py-1">
          {compareList.map(product => (
            <div key={product._id} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5 flex-shrink-0">
              <img
                src={product.thumbnail || `https://picsum.photos/seed/${product._id}/40/40`}
                alt={product.name}
                className="w-8 h-8 rounded object-cover"
              />
              <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">{product.name}</span>
              <span className="text-sm font-bold text-blue-700">${product.lowestPrice?.toFixed(2)}</span>
              <button
                onClick={() => removeFromCompare(product._id)}
                className="text-gray-400 hover:text-red-500 ml-1 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={clearCompare} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            Clear
          </button>
          <button
            onClick={() => navigate('/compare')}
            disabled={compareList.length < 2}
            className="btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare Now <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
