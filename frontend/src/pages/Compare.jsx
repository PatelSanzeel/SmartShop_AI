import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Trophy, X, GitCompare, TrendingDown, TrendingUp,
  Minus, Sparkles, ChevronDown, Star, Truck, CheckCircle, XCircle
} from 'lucide-react';
import { useCompareStore } from '../store';
import { compareAPI } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import toast from 'react-hot-toast';

const CRITERIA = ['Price', 'Quality', 'Availability', 'Shipping', 'Reviews', 'Brand'];

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();
  const [selectedCriteria, setSelectedCriteria] = useState(['Price', 'Quality', 'Reviews']);
  const [result, setResult] = useState(null);

  const comparison = useMutation({
    mutationFn: () => compareAPI.compare(compareList.map(p => p._id), selectedCriteria),
    onSuccess: (res) => setResult(res.data.data),
    onError: () => toast.error('Comparison failed, please try again'),
  });

  const toggleCriteria = (c) => setSelectedCriteria(prev =>
    prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
  );

  const winnerProduct = result?.products?.find(p => p._id === result?.winner);

  const renderTrend = (pred) => {
    if (!pred) return <Minus size={14} className="text-gray-400" />;
    if (pred.trend === 'falling') return <TrendingDown size={14} className="text-green-600" />;
    if (pred.trend === 'rising') return <TrendingUp size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <BarChart3 size={26} className="text-blue-600" /> Product Comparison
        </h1>
        <p className="section-subtitle">Compare up to 4 products side-by-side with AI analysis</p>
      </div>

      {compareList.length === 0 ? (
        <div className="text-center py-20 card-padded max-w-lg mx-auto">
          <GitCompare size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products to compare</h3>
          <p className="text-gray-500 text-sm mb-6">Add products to compare from the Products page. You can compare up to 4 items.</p>
          <a href="/products" className="btn-primary text-sm">Browse Products</a>
        </div>
      ) : (
        <>
          {/* Products in compare */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {compareList.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`card p-4 relative ${result?.winner === product._id ? 'border-2 border-green-500' : ''}`}
              >
                {result?.winner === product._id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    <Trophy size={11} /> Best Pick
                  </div>
                )}
                <button
                  onClick={() => removeFromCompare(product._id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
                <img
                  src={product.thumbnail || `https://picsum.photos/seed/${product._id}/150/120`}
                  alt={product.name}
                  className="w-full aspect-video object-cover rounded-lg mb-3"
                />
                <p className="text-xs text-blue-600 font-semibold">{product.brand}</p>
                <p className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</p>
                <p className="text-lg font-bold text-gray-900">${product.lowestPrice?.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <StarRating rating={product.averageRating} size={11} />
                  <span className="text-xs text-gray-500">{product.averageRating?.toFixed(1)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Criteria selector */}
          <div className="card-padded mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Comparison Criteria:</p>
            <div className="flex flex-wrap gap-2">
              {CRITERIA.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                    ${selectedCriteria.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => comparison.mutate()}
              disabled={compareList.length < 2 || comparison.isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {comparison.isLoading ? (
                <><LoadingSpinner size="sm" /> Analyzing with AI...</>
              ) : (
                <><Sparkles size={16} /> Compare with AI</>
              )}
            </button>
            <button onClick={clearCompare} className="btn-secondary text-sm text-red-500 hover:text-red-600">
              <X size={14} /> Clear All
            </button>
          </div>

          {/* Comparison table */}
          {compareList.length >= 2 && (
            <div className="card overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 w-32">Attribute</th>
                      {compareList.map(p => (
                        <th key={p._id} className="px-4 py-3 text-center font-semibold text-gray-900 min-w-[150px]">
                          <div className="line-clamp-1">{p.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Lowest Price', render: p => `$${p.lowestPrice?.toFixed(2)}`, highlight: (vals) => vals.indexOf(Math.min(...vals.map(v => parseFloat(v.replace('$', ''))))) },
                      { label: 'Rating', render: p => (
                        <div className="flex items-center justify-center gap-1">
                          <StarRating rating={p.averageRating} size={11} />
                          <span>{p.averageRating?.toFixed(1)}</span>
                        </div>
                      )},
                      { label: 'Reviews', render: p => p.totalReviews?.toLocaleString() },
                      { label: 'Stores', render: p => `${p.stores?.length || 0} stores` },
                      { label: 'In Stock', render: p => p.stores?.some(s => s.inStock)
                        ? <CheckCircle size={16} className="text-green-500 mx-auto" />
                        : <XCircle size={16} className="text-red-400 mx-auto" /> },
                      { label: 'Price Trend', render: p => (
                        <div className="flex items-center justify-center gap-1">
                          {renderTrend(p.pricePrediction)}
                          <span className="capitalize text-xs">{p.pricePrediction?.trend || 'stable'}</span>
                        </div>
                      )},
                      { label: 'Price Drop?', render: p => p.pricePrediction?.willDrop
                        ? <span className="badge-green mx-auto">↓ {p.pricePrediction.predictedDropPercent}%</span>
                        : <span className="text-gray-400 text-xs">—</span> },
                      { label: 'Free Shipping', render: p => p.stores?.some(s => s.shippingCost === 0)
                        ? <CheckCircle size={16} className="text-green-500 mx-auto" />
                        : <XCircle size={16} className="text-red-400 mx-auto" /> },
                    ].map(({ label, render }) => (
                      <tr key={label} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-600 bg-gray-50/60">{label}</td>
                        {compareList.map(p => (
                          <td key={p._id} className="px-4 py-3 text-center text-gray-900">{render(p)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Analysis result */}
          <AnimatePresence>
            {result?.aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="ibm-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">IBM Granite AI Analysis</p>
                    <p className="text-xs text-gray-500">Powered by granite-13b-chat-v2</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result.aiAnalysis}
                </div>
                {winnerProduct && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <Trophy size={20} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">Recommended Winner</p>
                      <p className="text-green-700 font-bold">{winnerProduct.name}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-2xl font-extrabold text-green-700">${winnerProduct.lowestPrice?.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
