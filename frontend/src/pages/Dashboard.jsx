import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Bookmark, Bell, TrendingDown, Sparkles,
  RefreshCw, Settings, Eye, Package, Star
} from 'lucide-react';
import { insightsAPI, usersAPI, aiAPI } from '../api';
import { useAuthStore } from '../store';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const INSIGHT_ICONS = {
  recommendation: { icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
  price_alert: { icon: TrendingDown, color: 'text-green-600 bg-green-50' },
  trend: { icon: TrendingDown, color: 'text-blue-600 bg-blue-50' },
  savings_tip: { icon: Star, color: 'text-yellow-600 bg-yellow-50' },
};

const TABS = ['Overview', 'Saved Products', 'Insights', 'Preferences'];

export default function Dashboard() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Overview');
  const [prefForm, setPrefForm] = useState({
    budget: user?.preferences?.budget || 500,
    categories: user?.preferences?.categories || [],
    priceAlerts: user?.preferences?.priceAlerts ?? true,
  });
  const queryClient = useQueryClient();

  const { data: savedProducts, isLoading: savedLoading } = useQuery({
    queryKey: ['saved-products'],
    queryFn: () => usersAPI.getSavedProducts().then(r => r.data.data),
    enabled: activeTab === 'Saved Products',
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => insightsAPI.getInsights().then(r => r.data.data),
    enabled: activeTab === 'Insights',
  });

  const generateInsights = useMutation({
    mutationFn: insightsAPI.generate,
    onSuccess: () => {
      queryClient.invalidateQueries(['insights']);
      toast.success('New insights generated!');
    },
    onError: () => toast.error('Failed to generate insights'),
  });

  const markRead = useMutation({
    mutationFn: (id) => insightsAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(['insights']),
  });

  const savePreferences = async () => {
    try {
      await usersAPI.updateProfile({ name: user?.name });
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];

  const toggleCategory = (cat) => {
    setPrefForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat],
    }));
  };

  const unreadCount = insights?.filter(i => !i.isRead).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <LayoutDashboard size={26} className="text-blue-600" /> Dashboard
          </h1>
          <p className="section-subtitle">Welcome back, <strong>{user?.name?.split(' ')[0]}</strong> 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Saved Products', value: savedProducts?.length || '—', icon: Bookmark, color: 'blue' },
          { label: 'AI Insights', value: insights?.length || '—', icon: Sparkles, color: 'purple' },
          { label: 'Unread Alerts', value: unreadCount || '—', icon: Bell, color: 'orange' },
          { label: 'Budget', value: `$${user?.preferences?.budget || 500}`, icon: TrendingDown, color: 'green' },
        ].map(({ label, value, icon: Icon, color }) => {
          const cls = { blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600', green: 'bg-green-50 text-green-600' };
          return (
            <div key={label} className="card-padded">
              <div className={`w-9 h-9 rounded-xl ${cls[color]} flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
              {tab === 'Insights' && unreadCount > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold inline-flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="card-padded">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Eye size={16} className="text-blue-600" /> Account Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Name:</span> <strong className="ml-2">{user?.name}</strong></div>
              <div><span className="text-gray-500">Email:</span> <strong className="ml-2">{user?.email}</strong></div>
              <div><span className="text-gray-500">Budget:</span> <strong className="ml-2">${user?.preferences?.budget}</strong></div>
              <div><span className="text-gray-500">Member since:</span> <strong className="ml-2">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</strong></div>
            </div>
          </div>
          <div className="ibm-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} className="text-blue-600" />
              <span className="font-bold text-blue-700 text-sm">AI Tip</span>
            </div>
            <p className="text-sm text-gray-700">
              You have {savedProducts?.length || 0} saved products. Our AI predicts {
                savedProducts?.filter(p => p?.pricePrediction?.willDrop).length || 0
              } of them may drop in price soon. Visit the <strong>Insights</strong> tab for more.
            </p>
          </div>
        </motion.div>
      )}

      {/* Tab: Saved Products */}
      {activeTab === 'Saved Products' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {savedLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : savedProducts?.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bookmark size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-semibold">No saved products yet</p>
              <p className="text-sm mt-1">Browse products and save your favorites</p>
              <a href="/products" className="btn-primary mt-4 inline-flex text-sm">Browse Products</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {savedProducts?.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab: Insights */}
      {activeTab === 'Insights' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">AI-powered shopping insights tailored to you</p>
            <button
              onClick={() => generateInsights.mutate()}
              disabled={generateInsights.isLoading}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {generateInsights.isLoading ? (
                <><LoadingSpinner size="sm" /> Generating...</>
              ) : (
                <><RefreshCw size={14} /> Generate Insights</>
              )}
            </button>
          </div>

          {insightsLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : insights?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-40" />
              <p>No insights yet. Click "Generate Insights" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights?.map(insight => {
                const cfg = INSIGHT_ICONS[insight.type] || INSIGHT_ICONS.recommendation;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={insight._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`card p-4 flex items-start gap-4 cursor-pointer transition-opacity
                      ${!insight.isRead ? 'border-l-4 border-l-blue-500' : 'opacity-75'}`}
                    onClick={() => !insight.isRead && markRead.mutate(insight._id)}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-900">{insight.title}</p>
                        {!insight.isRead && <span className="badge-blue text-[10px]">New</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(insight.createdAt).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab: Preferences */}
      {activeTab === 'Preferences' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-6">
          <div className="card-padded">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings size={16} /> Shopping Preferences
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget Limit: <span className="text-blue-600">${prefForm.budget}</span>
                </label>
                <input
                  type="range" min="50" max="5000" step="50"
                  value={prefForm.budget}
                  onChange={e => setPrefForm(f => ({ ...f, budget: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$50</span><span>$5,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Categories</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                        ${prefForm.categories.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Price Drop Alerts</p>
                  <p className="text-xs text-gray-500">Get notified when saved products drop in price</p>
                </div>
                <button
                  onClick={() => setPrefForm(f => ({ ...f, priceAlerts: !f.priceAlerts }))}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${prefForm.priceAlerts ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${prefForm.priceAlerts ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            <button onClick={savePreferences} className="btn-primary w-full mt-5">
              Save Preferences
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
