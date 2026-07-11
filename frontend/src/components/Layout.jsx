import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, TrendingUp, Star, BarChart3,
  MessageCircle, Menu, X, User, LogOut, Bell, ChevronDown,
  Zap, Home, Package
} from 'lucide-react';
import { useAuthStore, useCompareStore, useUIStore } from '../store';
import ChatWidget from './ChatWidget';
import CompareBar from './CompareBar';

const navLinks = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/compare', label: 'Compare', icon: BarChart3 },
  { to: '/price-tracker', label: 'Prices', icon: TrendingUp },
  { to: '/assistant', label: 'AI Assistant', icon: MessageCircle },
];

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { compareList } = useCompareStore();
  const { chatOpen, setChatOpen } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                SmartShop<span className="gradient-text">AI</span>
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'}`
                  }
                >
                  <Icon size={15} />
                  {label}
                  {to === '/compare' && compareList.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {compareList.length}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* AI Chat button */}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`p-2 rounded-lg transition-all duration-200 relative
                  ${chatOpen ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'}`}
                title="AI Assistant"
              >
                <MessageCircle size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <NavLink to="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <User size={15} /> Dashboard
                        </NavLink>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <NavLink to="/login" className="btn-ghost text-sm py-1.5">Sign In</NavLink>
                  <NavLink to="/register" className="btn-primary text-sm py-1.5">Get Started</NavLink>
                </div>
              )}

              {/* Mobile menu */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <nav className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map(({ to, label, icon: Icon, exact }) => (
                  <NavLink key={to} to={to} end={exact}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                      ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`
                    }
                  >
                    <Icon size={16} />{label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded ai-gradient flex items-center justify-center">
                <Zap size={13} className="text-white" />
              </div>
              <span className="font-bold text-gray-800">SmartShop<span className="gradient-text">AI</span></span>
            </div>
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold text-ibm-blue">IBM Granite AI</span> · © {new Date().getFullYear()} SmartShop AI
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Compare Bar ── */}
      {compareList.length > 0 && <CompareBar />}

      {/* ── AI Chat Widget ── */}
      <ChatWidget />
    </div>
  );
}
