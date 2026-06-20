import { create } from 'zustand';
import { User, Skill, Order, Category, Banner } from '@/types';
import { mockUsers, mockSkills, mockOrders, mockCategories, mockBanners, currentUser } from '@/utils/mockData';

interface AppState {
  // 用户状态
  currentUser: User | null;
  isLoggedIn: boolean;
  
  // 数据状态
  skills: Skill[];
  orders: Order[];
  categories: Category[];
  banners: Banner[];
  
  // 筛选状态
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: 'distance' | 'rating' | 'price' | 'serviceCount';
  
  // UI状态
  activeTab: 'home' | 'skills' | 'publish' | 'orders' | 'profile';
  isLoading: boolean;
  
  // Actions
  login: () => void;
  logout: () => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'distance' | 'rating' | 'price' | 'serviceCount') => void;
  setActiveTab: (tab: 'home' | 'skills' | 'publish' | 'orders' | 'profile') => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addSkill: (skill: Skill) => void;
}

export const useStore = create<AppState>((set) => ({
  // 初始状态
  currentUser: currentUser,
  isLoggedIn: true,
  skills: mockSkills,
  orders: mockOrders,
  categories: mockCategories,
  banners: mockBanners,
  selectedCategory: null,
  searchQuery: '',
  sortBy: 'distance',
  activeTab: 'home',
  isLoading: false,
  
  // Actions
  login: () => set({ currentUser: currentUser, isLoggedIn: true }),
  logout: () => set({ currentUser: null, isLoggedIn: false }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy: sortBy }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((o) => o.id === orderId ? { ...o, status } : o),
  })),
  addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
}));