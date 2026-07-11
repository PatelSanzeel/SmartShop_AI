import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ExternalLink, TrendingDown, TrendingUp, Minus, Shield, ShieldAlert,
  ChevronDown, ChevronUp, Sparkles, Tag, Truck, PackageCheck, GitCompare, Star
} from 'lucide-react';
import { productsAPI, pricesAPI, reviewsAPI, aiAPI } from '../api';
import { useCompareStore, useAuthStore } from '../store';
import StarRating from '../components/ui/StarRating';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const inCompare = isInCompare(id);

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id).then(r => r.data.data),
  });

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsAPI.getByProduct(id).then(r => r.data.data),
    enabled: activeTab === 'reviews',
  });

  const { data: predictionData, mutate: fetchPrediction, isLoading: predLoading } = useMutation({
    mutationFn: () => aiAPI.pricePrediction(id),
  });

  const submitReview = useMutation({
    mutationFn: (data) => reviewsAPI.addReview(id, data),
    onSuccess: () => {
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, text: '' });
    },
    onError: () => toast.error('Failed to submit review'),
  });

  if (isLoading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
  if (!productData) return <div className="text-center py-32 text-gray-500">Product not found</div>;

  const product = productData;
  const sortedStores = [...(product.stores || [])].sort((a, b) => a.price - b.price);
  const lowestStore = sortedStores[0];
  const specs = product.specifications ? Object.entries(product.specifications) : [];
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, 6);

  const trendIcon = product.pricePrediction?.trend === 'falling'
    ? <TrendingDown size={16} className="text-green-600" />
    : product.pricePrediction?.trend === 'rising'
    ? <TrendingUp size={16} className="text-red-500" />
    : <Minus size={16} className="text-gray-400" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-blue-600">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Image + Quick info ── */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card overflow-hidden">
            <img
              src={product.thumbnail || `https://picsum.photos/seed/${product._id}/600/450`}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>

          {/* AI Summary */}
          {product.aiSummary && (
            <div className="ibm-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">AI Summary</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{product.aiSummary}</p>
            </div>
          )}

          {/* Price prediction */}
          <div className="card-padded">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900">Price Prediction</h3>
              {trendIcon}
            </div>
            {product.pricePrediction?.willDrop ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-green-800 font-semibold text-sm">
                  🔻 Expected to drop ~{product.pricePrediction.predictedDropPercent}%
                </p>
                {product.pricePrediction.predictedDropDate && (
                  <p className="text-green-600 text-xs mt-1">
                    Around {new Date(product.pricePrediction.predictedDropDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  Confidence: {Math.round(product.pricePrediction.confidence * 100)}%
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Price is currently stable. Good time to buy.</p>
            )}
            <button
              onClick={() => fetchPrediction()}
              disabled={predLoading}
              className="mt-3 w-full btn-secondary text-xs py-2"
            >
              {predLoading ? 'Analyzing...' : 'Refresh AI Prediction'}
            </button>
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-sm font-semibold text-blue-600 mb-1">{product.brand} · {product.category}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={product.averageRating} size={18} showValue />
              <span className="text-sm text-gray-500">({product.totalReviews?.toLocaleString()} reviews)</span>
              <Link to={`/reviews/${product._id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Shield size={13} /> Review Analysis
              </Link>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-4xl font-extrabold text-gray-900">${product.lowestPrice?.toFixed(2)}</span>
                <span className="text-sm text-gray-400 ml-2">lowest</span>
              </div>
              {product.lowestPrice < product.highestPrice && (
                <span className="text-lg text-gray-400">–</span>
              )}
              {product.lowestPrice < product.highestPrice && (
                <span className="text-2xl font-bold text-gray-600">${product.highestPrice?.toFixed(2)}</span>
              )}
              <div className="flex gap-2">
                {product.pricePrediction?.willDrop && (
                  <span className="badge-green flex items-center gap-1">
                    <TrendingDown size={11} /> Price dropping
                  </span>
                )}
                <span className={`badge ${product.stores?.some(s => s.inStock) ? 'badge-green' : 'badge-red'}`}>
                  {product.stores?.some(s => s.inStock) ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Compare + Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => { inCompare ? removeFromCompare(product._id) : addToCompare(product); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all
                ${inCompare ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600'}`}
            >
              <GitCompare size={16} />
              {inCompare ? 'In Compare List' : 'Add to Compare'}
            </button>
            <Link to={`/price-tracker?product=${product._id}`} className="btn-secondary text-sm">
              <TrendingDown size={15} /> Track Price
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-1 -mb-px">
              {['overview', 'stores', 'specs', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors
                    ${activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags?.map(tag => (
                  <span key={tag} className="badge-blue"><Tag size={10} />{tag}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab: Stores */}
          {activeTab === 'stores' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {sortedStores.map((store, i) => (
                <div key={store.store} className={`p-4 rounded-xl border flex items-center justify-between gap-4
                  ${i === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{store.store}</span>
                      {i === 0 && <span className="badge-green text-[10px]">Best Price</span>}
                      {!store.inStock && <span className="badge-red text-[10px]">Out of Stock</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Truck size={11} />
                        {store.shippingCost === 0 ? 'Free shipping' : `$${store.shippingCost} shipping`}
                      </span>
                      <span>{store.shippingDays} days</span>
                      <StarRating rating={store.rating} size={11} />
                      <span>({store.reviewCount?.toLocaleString()})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-gray-900">${store.price.toFixed(2)}</div>
                    {store.originalPrice > store.price && (
                      <div className="text-xs text-gray-400 line-through">${store.originalPrice.toFixed(2)}</div>
                    )}
                    {store.discount > 0 && <div className="badge-red mt-1">-{store.discount}% off</div>}
                  </div>
                  <a href={store.url || '#'} target="_blank" rel="noopener noreferrer"
                    className="btn-primary text-xs py-2 flex-shrink-0">
                    Shop <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tab: Specifications */}
          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {specs.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {visibleSpecs.map(([key, value], i) => (
                    <div key={key} className={`flex px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <span className="w-1/3 font-medium text-gray-600">{key}</span>
                      <span className="w-2/3 text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No specifications available</p>
              )}
              {specs.length > 6 && (
                <button onClick={() => setShowAllSpecs(!showAllSpecs)} className="mt-3 btn-ghost text-sm">
                  {showAllSpecs ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {specs.length} specs</>}
                </button>
              )}
            </motion.div>
          )}

          {/* Tab: Reviews */}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {reviewData && (
                <>
                  <div className="card-padded flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold text-gray-900">{reviewData.summary.average?.toFixed(1)}</div>
                      <StarRating rating={reviewData.summary.average} size={18} />
                      <p className="text-xs text-gray-500 mt-1">{reviewData.summary.total} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {reviewData.summary.distribution?.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-right text-gray-600">{star}</span>
                          <span className="text-yellow-400">★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ width: reviewData.summary.total ? `${(count / reviewData.summary.total) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="w-6 text-gray-500">{count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className={`text-2xl font-bold ${reviewData.summary.fakePercent > 20 ? 'text-red-500' : 'text-green-600'}`}>
                        {reviewData.summary.fakePercent}%
                      </div>
                      <p className="text-xs text-gray-500">Suspicious</p>
                      <Link to={`/reviews/${id}`} className="text-xs text-blue-600 hover:underline mt-1 block">Full analysis →</Link>
                    </div>
                  </div>

                  {/* Review list */}
                  {reviewData.reviews?.slice(0, 5).map((review, i) => (
                    <div key={i} className={`card p-4 ${review.isFake ? 'border-orange-300' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {review.author?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{review.author}</p>
                            <StarRating rating={review.rating} size={12} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.verified && <span className="badge-green text-[10px]"><PackageCheck size={9} />Verified</span>}
                          {review.isFake && (
                            <span className="badge-yellow text-[10px]"><ShieldAlert size={9} />Suspicious</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </>
              )}

              {/* Add review form */}
              {isAuthenticated && (
                <div className="card-padded mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Write a Review</h4>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                        className={`text-2xl transition-colors ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.text}
                    onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                    placeholder="Share your experience..."
                    className="input-field h-24 resize-none"
                  />
                  <button
                    onClick={() => submitReview.mutate(reviewForm)}
                    disabled={!reviewForm.text.trim() || submitReview.isLoading}
                    className="btn-primary text-sm mt-3 disabled:opacity-50"
                  >
                    {submitReview.isLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
