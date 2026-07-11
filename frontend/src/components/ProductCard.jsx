import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, BarChart3, TrendingDown, Star, ExternalLink, GitCompare } from 'lucide-react';
import { useCompareStore, useAuthStore } from '../store';
import { usersAPI } from '../api';
import StarRating from './ui/StarRating';
import toast from 'react-hot-toast';

export default function ProductCard({ product, className = '' }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const { isAuthenticated } = useAuthStore();
  const inCompare = isInCompare(product._id);

  const lowestStore = product.stores?.reduce((min, s) =>
    s.inStock && s.price < (min?.price ?? Infinity) ? s : min, null
  );

  const handleCompare = (e) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product._id);
      toast('Removed from compare', { icon: '➖' });
    } else {
      addToCompare(product);
      toast.success('Added to compare!');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to save products');
      return;
    }
    try {
      const { data } = await usersAPI.saveProduct(product._id);
      toast.success(data.saved ? 'Product saved!' : 'Removed from saved');
    } catch {
      toast.error('Could not save product');
    }
  };

  const discountBadge = lowestStore?.discount > 0 && (
    <span className="badge-red absolute top-3 left-3 z-10">-{lowestStore.discount}%</span>
  );

  const dropBadge = product.pricePrediction?.willDrop && (
    <span className="badge-green absolute top-3 right-3 z-10 flex items-center gap-1">
      <TrendingDown size={10} /> Drop Soon
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`card overflow-hidden group ${className}`}
    >
      <Link to={`/products/${product._id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={product.thumbnail || `https://picsum.photos/seed/${product._id}/400/300`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discountBadge}
          {dropBadge}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product.averageRating} size={13} />
            <span className="text-xs text-gray-500">({product.totalReviews?.toLocaleString() || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-gray-900">${product.lowestPrice?.toFixed(2)}</span>
              {lowestStore?.originalPrice > product.lowestPrice && (
                <span className="text-xs text-gray-400 line-through ml-2">${lowestStore.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-0.5">
              {product.stores?.length || 1} store{(product.stores?.length || 1) !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Stores preview */}
          {lowestStore && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ExternalLink size={11} />
              <span>Best at <strong className="text-gray-700">{lowestStore.store}</strong></span>
              {lowestStore.shippingCost === 0 && (
                <span className="badge-green !text-[10px] ml-1">Free Ship</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleCompare}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200
            ${inCompare ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
        >
          <GitCompare size={13} />
          {inCompare ? 'In Compare' : 'Compare'}
        </button>
        <button
          onClick={handleSave}
          className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:border-yellow-400 hover:text-yellow-500 transition-all duration-200"
          title="Save product"
        >
          <Star size={14} />
        </button>
      </div>
    </motion.div>
  );
}
