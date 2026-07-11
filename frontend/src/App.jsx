import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuthStore } from './store';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Home        = lazy(() => import('./pages/Home'));
const Products    = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Compare     = lazy(() => import('./pages/Compare'));
const Assistant   = lazy(() => import('./pages/Assistant'));
const PriceTracker = lazy(() => import('./pages/PriceTracker'));
const ReviewAnalysis = lazy(() => import('./pages/ReviewAnalysis'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner full />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="compare" element={<Compare />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="price-tracker" element={<PriceTracker />} />
          <Route path="reviews/:productId" element={<ReviewAnalysis />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
