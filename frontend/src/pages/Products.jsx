import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Package } from 'lucide-react';
import { productsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');

  const filters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'relevance',
    page: Number(searchParams.get('page') || 1),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsAPI.search(filters).then(r => r.data),
    keepPreviousData: true,
  });

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('q', localSearch);
  };

  const hasActiveFilters = filters.q || filters.category || filters.minPrice || filters.maxPrice || filters.minRating;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2"><Package size={26} className="text-blue-600" /> Products</h1>
        <p className="section-subtitle">Compare prices across multiple stores with AI insights</p>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary text-sm">Search</button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`btn-secondary text-sm flex items-center gap-2 ${filtersOpen ? 'border-blue-400 text-blue-600' : ''}`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600" />}
          </button>

          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="input-field py-2 text-sm w-auto"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card-padded mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select value={filters.category} onChange={e => updateFilter('category', e.target.value)} className="input-field text-sm">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Min Price</label>
            <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
              placeholder="$0" className="input-field text-sm" min="0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Max Price</label>
            <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
              placeholder="No limit" className="input-field text-sm" min="0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Min Rating</label>
            <select value={filters.minRating} onChange={e => updateFilter('minRating', e.target.value)} className="input-field text-sm">
              <option value="">Any</option>
              {[4.5, 4, 3.5, 3].map(r => <option key={r} value={r}>★ {r}+</option>)}
            </select>
          </div>
          {hasActiveFilters && (
            <div className="col-span-full">
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors">
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Results summary ── */}
      {data && (
        <p className="text-sm text-gray-500 mb-4">
          {isFetching ? 'Updating...' : `${data.pagination?.total || 0} products found`}
          {filters.q && <span> for "<strong>{filters.q}</strong>"</span>}
        </p>
      )}

      {/* ── Product grid ── */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No products found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary mt-4 text-sm">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {data?.data?.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => updateFilter('page', filters.page - 1)}
            disabled={filters.page <= 1}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 px-4">
            Page {filters.page} of {data.pagination.pages}
          </span>
          <button
            onClick={() => updateFilter('page', filters.page + 1)}
            disabled={filters.page >= data.pagination.pages}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
