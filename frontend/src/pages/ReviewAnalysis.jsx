import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield, ShieldAlert, ShieldCheck, Sparkles, AlertTriangle,
  ThumbsUp, ThumbsDown, Minus, ArrowLeft, RefreshCw
} from 'lucide-react';
import { reviewsAPI, aiAPI } from '../api';
import StarRating from '../components/ui/StarRating';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ReviewAnalysis() {
  const { productId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsAPI.getByProduct(productId).then(r => r.data.data),
  });

  const aiAnalysis = useMutation({
    mutationFn: () => aiAPI.analyzeReviews(productId, null),
  });

  const summary = data?.summary;
  const reviews = data?.reviews || [];

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'positive') return <ThumbsUp size={13} className="text-green-600" />;
    if (sentiment === 'negative') return <ThumbsDown size={13} className="text-red-500" />;
    return <Minus size={13} className="text-gray-400" />;
  };

  const getFakeColor = (score) => {
    if (score > 0.7) return 'text-red-600 bg-red-50 border-red-200';
    if (score > 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/products/${productId}`} className="btn-ghost text-sm">
          <ArrowLeft size={14} /> Back to Product
        </Link>
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Shield size={24} className="text-blue-600" /> Review Analysis
          </h1>
          <p className="section-subtitle">AI-powered fake review detection using IBM Granite</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* Summary stats */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Reviews', value: summary.total, icon: Shield, color: 'blue' },
                { label: 'Avg Rating', value: summary.average?.toFixed(1) + ' ★', icon: Sparkles, color: 'yellow' },
                { label: 'Suspicious', value: `${summary.fakePercent}%`, icon: ShieldAlert, color: summary.fakePercent > 20 ? 'red' : 'green' },
                { label: 'Authentic', value: `${100 - summary.fakePercent}%`, icon: ShieldCheck, color: 'green' },
              ].map(({ label, value, icon: Icon, color }) => {
                const colorClasses = {
                  blue: 'bg-blue-50 text-blue-700',
                  yellow: 'bg-yellow-50 text-yellow-700',
                  red: 'bg-red-50 text-red-600',
                  green: 'bg-green-50 text-green-700',
                };
                return (
                  <div key={label} className="card-padded text-center">
                    <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mx-auto mb-2`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sentiment breakdown */}
          {summary?.sentimentBreakdown && (
            <div className="card-padded mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Positive', key: 'positive', color: '#22c55e', icon: ThumbsUp },
                  { label: 'Neutral', key: 'neutral', color: '#94a3b8', icon: Minus },
                  { label: 'Negative', key: 'negative', color: '#ef4444', icon: ThumbsDown },
                ].map(({ label, key, color, icon: Icon }) => {
                  const count = summary.sentimentBreakdown[key] || 0;
                  const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <Icon size={14} style={{ color }} />
                      <span className="text-sm font-medium text-gray-700 w-20">{label}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <span className="text-sm font-bold w-12 text-right text-gray-700">{pct}%</span>
                      <span className="text-xs text-gray-400 w-12">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Deep Analysis */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => aiAnalysis.mutate()}
              disabled={aiAnalysis.isLoading}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {aiAnalysis.isLoading ? (
                <><LoadingSpinner size="sm" /> Analyzing with IBM Granite...</>
              ) : (
                <><Sparkles size={15} /> Run AI Deep Analysis</>
              )}
            </button>
            {aiAnalysis.data && (
              <button onClick={() => aiAnalysis.reset()} className="btn-ghost text-sm">
                <RefreshCw size={13} /> Re-run
              </button>
            )}
          </div>

          {aiAnalysis.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ibm-card p-5 mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-blue-600" />
                <span className="font-bold text-blue-700">IBM Granite Analysis</span>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {aiAnalysis.data.data?.data?.summary || 'Analysis complete.'}
              </div>
              {aiAnalysis.data.data?.data?.fakePercent !== undefined && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <div className={`text-2xl font-extrabold ${aiAnalysis.data.data.data.fakePercent > 20 ? 'text-red-600' : 'text-green-600'}`}>
                    {aiAnalysis.data.data.data.fakePercent}%
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Suspected Fake Reviews</p>
                    <p className="text-xs text-gray-500">
                      Trust Score: {Math.round((aiAnalysis.data.data.data.overallTrustScore || 0.8) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Individual reviews */}
          <h3 className="font-bold text-lg text-gray-900 mb-4">Individual Review Analysis</h3>
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`card p-4 border-l-4 ${
                  review.fakeScore > 0.6 ? 'border-l-orange-400' :
                  review.fakeScore > 0.3 ? 'border-l-yellow-400' : 'border-l-green-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                      {review.author?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size={12} />
                        {review.verified && <span className="text-[10px] text-green-600 font-semibold">✓ Verified</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getSentimentIcon(review.sentiment)}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold ${getFakeColor(review.fakeScore)}`}>
                      {review.fakeScore > 0.6 ? <ShieldAlert size={11} /> : <ShieldCheck size={11} />}
                      {review.fakeScore > 0.6 ? 'Suspicious' : review.fakeScore > 0.3 ? 'Unclear' : 'Authentic'}
                      <span className="text-[10px] opacity-70">({Math.round(review.fakeScore * 100)}%)</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>

                {review.fakeScore > 0.6 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg">
                    <AlertTriangle size={12} />
                    <span>This review shows patterns common in incentivized or AI-generated reviews</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
