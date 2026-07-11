import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingDown, TrendingUp, Minus, AlertCircle, Package, BarChart2
} from 'lucide-react';
import { pricesAPI, productsAPI } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const STORE_COLORS = {
  Amazon: '#FF9900', 'Best Buy': '#0046BE', Walmart: '#007DC6',
  Target: '#CC0000', Costco: '#005DAA', Dyson: '#CC0000',
  Samsung: '#1428A0', Apple: '#555555', Garmin: '#006DC6',
  Nike: '#111111', "Barnes & Noble": '#4B7A3E', REI: '#2F6B29',
  'Foot Locker': '#E8A925', 'Apple Store': '#555555',
};

function getStoreColor(store) {
  return STORE_COLORS[store] || `hsl(${store.charCodeAt(0) * 15 % 360}, 60%, 45%)`;
}

export default function PriceTracker() {
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('product');
  const [selectedProduct, setSelectedProduct] = useState(initialProductId || '');
  const [days, setDays] = useState(30);

  const { data: trendingData } = useQuery({
    queryKey: ['trending-for-prices'],
    queryFn: () => productsAPI.getTrending().then(r => r.data.data),
  });

  const { data: historyData, isLoading: histLoading } = useQuery({
    queryKey: ['price-history', selectedProduct, days],
    queryFn: () => pricesAPI.getHistory(selectedProduct, { days }).then(r => r.data.data),
    enabled: !!selectedProduct,
  });

  const { data: dropsData } = useQuery({
    queryKey: ['price-drops'],
    queryFn: () => pricesAPI.getDropAlerts().then(r => r.data.data),
  });

  const buildChartData = () => {
    if (!historyData?.byStore) return null;
    const stores = Object.keys(historyData.byStore);
    if (!stores.length) return null;

    // Create unified date labels from first store
    const firstStore = historyData.byStore[stores[0]];
    const labels = firstStore.map(h =>
      new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    return {
      labels,
      datasets: stores.map(store => ({
        label: store,
        data: historyData.byStore[store].map(h => h.price),
        borderColor: getStoreColor(store),
        backgroundColor: `${getStoreColor(store)}18`,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: false,
      })),
    };
  };

  const chartData = buildChartData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <TrendingDown size={26} className="text-green-600" /> Price Tracker
        </h1>
        <p className="section-subtitle">Monitor price history and get AI predictions for when to buy</p>
      </div>

      {/* Product selector */}
      <div className="card-padded mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select a Product</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="input-field"
          >
            <option value="">— Choose a product —</option>
            {trendingData?.map(p => (
              <option key={p._id} value={p._id}>{p.name} (${p.lowestPrice?.toFixed(2)})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Range</label>
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="input-field w-36">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Price chart */}
      {selectedProduct && (
        <div className="card-padded mb-8">
          {histLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : chartData ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <BarChart2 size={18} className="text-blue-600" />
                  {historyData.productName} — Price History
                </h2>
                <span className="badge-blue">Last {days} days</span>
              </div>
              <div style={{ height: '320px' }}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
                      tooltip: {
                        callbacks: {
                          label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        ticks: { callback: v => `$${v}` },
                        grid: { color: '#f3f4f6' },
                      },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              </div>

              {/* Current prices per store */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {historyData.currentPrices?.map(s => (
                  <div key={s.store} className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{s.store}</p>
                    <p className="text-xl font-bold" style={{ color: getStoreColor(s.store) }}>
                      ${s.price.toFixed(2)}
                    </p>
                    {!s.inStock && <span className="badge-red text-[10px] mt-1">Out of stock</span>}
                    {s.discount > 0 && <span className="badge-green text-[10px] mt-1">-{s.discount}%</span>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BarChart2 size={40} className="mx-auto mb-3 opacity-50" />
              <p>No price history available for this product.</p>
            </div>
          )}
        </div>
      )}

      {/* Price Drop Alerts */}
      <div>
        <h2 className="font-bold text-xl text-gray-900 mb-5 flex items-center gap-2">
          <AlertCircle size={20} className="text-orange-500" /> Predicted Price Drops
        </h2>
        {dropsData?.length === 0 ? (
          <p className="text-gray-400 text-sm">No price drops predicted in the near term.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dropsData || []).map(product => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 border-l-4 border-l-green-500"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={product.thumbnail || `https://picsum.photos/seed/${product._id}/80/80`}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-gray-900">${product.lowestPrice?.toFixed(2)}</span>
                      <span className="badge-green flex items-center gap-1">
                        <TrendingDown size={10} />
                        -{product.pricePrediction.predictedDropPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(product.pricePrediction.confidence * 100)}% •
                      {product.pricePrediction.predictedDropDate &&
                        ` ~${new Date(product.pricePrediction.predictedDropDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/products/${product._id}`}
                  className="mt-3 w-full btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                >
                  <Package size={12} /> View Product
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
