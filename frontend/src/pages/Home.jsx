import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, TrendingUp, TrendingDown, Star, Zap, Shield,
  ArrowRight, Sparkles, BarChart3, Package, ShoppingBag
} from 'lucide-react';
import { productsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const features = [
  {
    icon: BarChart3, color: 'blue',
    title: 'Multi-Store Comparison',
    desc: 'Compare prices across Amazon, Walmart, Best Buy and more in real-time.',
  },
  {
    icon: Sparkles, color: 'purple',
    title: 'AI Recommendations',
    desc: 'IBM Granite AI analyzes your budget and preferences to find perfect products.',
  },
  {
    icon: Shield, color: 'green',
    title: 'Fake Review Detection',
    desc: 'Advanced NLP identifies incentivized and fake reviews automatically.',
  },
  {
    icon: TrendingDown, color: 'orange',
    title: 'Price Drop Prediction',
    desc: 'Our AI predicts when products will go on sale so you can buy at the right time.',
  },
];

const colorMap = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
};

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => productsAPI.getTrending().then(r => r.data.data),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/products?q=${encodeURIComponent(searchInput)}`);
  };

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 25% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 75% 20%, #8b5cf6 0%, transparent 50%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 mb-6 text-sm font-medium border border-white/20">
              <Sparkles size={14} className="text-yellow-400" />
              <span>Powered by IBM Granite AI</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              Shop Smarter<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                With AI
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Compare products across stores, detect fake reviews, predict price drops, and get personalized recommendations — all powered by IBM Granite AI.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
              <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                <div className="flex items-center px-4 text-gray-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products, brands, or categories..."
                  className="flex-1 py-4 text-gray-800 outline-none text-lg bg-transparent placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-1.5"><Package size={14} /><span>8+ Products</span></div>
              <div className="flex items-center gap-1.5"><ShoppingBag size={14} /><span>4 Stores</span></div>
              <div className="flex items-center gap-1.5"><Star size={14} className="text-yellow-400" /><span>AI-Powered Reviews</span></div>
              <div className="flex items-center gap-1.5"><TrendingDown size={14} className="text-green-400" /><span>Price Predictions</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Everything you need to shop smart</h2>
            <p className="section-subtitle mt-2">AI-powered tools built with IBM Granite to save time and money</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-padded text-center hover:border-blue-200 cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl ${colorMap[color]} flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Products ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <TrendingUp size={24} className="text-blue-600" /> Trending Products
              </h2>
              <p className="section-subtitle">Most compared products right now</p>
            </div>
            <Link to="/products" className="btn-secondary text-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {trendingLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {(trendingData || []).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Zap size={40} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-4xl font-extrabold mb-4">Start shopping smarter today</h2>
          <p className="text-blue-100 text-lg mb-8">
            Create a free account to unlock personalized AI recommendations, price alerts, and saved products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Get Started Free
            </Link>
            <Link to="/assistant" className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors">
              Try AI Assistant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
