import { create } from 'zustand';
import { categoriesAPI, articlesAPI, authAPI } from '../lib/api';

export const useStore = create((set, get) => ({
  // ================= AUTH STATE =================
 user: null,
  token: null,
  authLoaded: false, // Ye flag bodyguard ka kaam karega

  loadAuthFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      // Dono mil gaye toh set kar do, warna null rakho, par authLoaded hamesha true hoga
      set({ user, token, authLoaded: true });
    } catch {
      set({ user: null, token: null, authLoaded: true });
    }
  },


  // ================= SETTERS =================
// useStore.js के अंदर सुधार
setUser: (user) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
  set({ user });
},

setToken: (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
  set({ token });
},

  // ================= LOGIN MODAL =================
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  // ================= LOGIN =================
  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    set({
      user,
      token,
    });
  },

  // ================= LOGOUT =================
  logout: () => {
    authAPI.logout?.();
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
    });
  },

  // Categories
  categories: [],
  categoriesLoading: false,
  fetchCategories: async () => {
    set({ categoriesLoading: true });
    try {
      const categories = await categoriesAPI.getAll();
      set({ categories, categoriesLoading: false });
    } catch (error) {
      set({ categoriesLoading: false });
    }
  },

  // Trending
  trending: [],
  trendingLoading: false,
  fetchTrending: async () => {
    set({ trendingLoading: true });
    try {
      const trending = await articlesAPI.getTrending(10);
      set({ trending, trendingLoading: false });
    } catch (error) {
      set({ trendingLoading: false });
    }
  },

  // Popular
  popular: [],
  popularLoading: false,
  fetchPopular: async () => {
    set({ popularLoading: true });
    try {
      const popular = await articlesAPI.getPopular(5);
      set({ popular, popularLoading: false });
    } catch (error) {
      set({ popularLoading: false });
    }
  },

  // UI
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),

}));
