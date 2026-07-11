import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (updates) => set(state => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'smartshop-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useCompareStore = create((set, get) => ({
  compareList: [],      // array of product objects
  maxItems: 4,

  addToCompare: (product) => {
    const { compareList, maxItems } = get();
    if (compareList.find(p => p._id === product._id)) return;
    if (compareList.length >= maxItems) return;
    set({ compareList: [...compareList, product] });
  },

  removeFromCompare: (productId) => {
    set(state => ({ compareList: state.compareList.filter(p => p._id !== productId) }));
  },

  clearCompare: () => set({ compareList: [] }),

  isInCompare: (productId) => get().compareList.some(p => p._id === productId),
}));

export const useUIStore = create((set) => ({
  sidebarOpen: false,
  chatOpen: false,
  darkMode: false,
  searchQuery: '',

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
