import axios from 'axios';
import { useAuthStore } from '../store';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updatePreferences: (data) => api.patch('/auth/preferences', data),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  search: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getTrending: () => api.get('/products/trending'),
  getCategories: () => api.get('/products/categories'),
};

// ─── Compare ──────────────────────────────────────────────────────────────────
export const compareAPI = {
  compare: (productIds, criteria) => api.post('/compare', { productIds, criteria }),
  getSession: (sessionId) => api.get(`/compare/${sessionId}`),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  recommend: (params) => api.post('/ai/recommend', params),
  analyzeReviews: (productId, reviews) => api.post('/ai/analyze-reviews', { productId, reviews }),
  pricePrediction: (productId) => api.post('/ai/price-prediction', { productId }),
  shoppingInsights: (data) => api.post('/ai/shopping-insights', data),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/reviews/${productId}`),
  addReview: (productId, data) => api.post(`/reviews/${productId}`, data),
};

// ─── Prices ───────────────────────────────────────────────────────────────────
export const pricesAPI = {
  getHistory: (productId, params) => api.get(`/prices/${productId}/history`, { params }),
  getPrediction: (productId) => api.get(`/prices/${productId}/prediction`),
  getDropAlerts: () => api.get('/prices/alerts/drops'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  saveProduct: (productId) => api.post('/users/save-product', { productId }),
  getSavedProducts: () => api.get('/users/saved-products'),
};

// ─── Insights ─────────────────────────────────────────────────────────────────
export const insightsAPI = {
  getInsights: () => api.get('/insights'),
  generate: () => api.post('/insights/generate'),
  markRead: (id) => api.patch(`/insights/${id}/read`),
};

export default api;
