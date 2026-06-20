// 用户类型
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  phone?: string;
  creditScore: number;
  isVerified: boolean;
}

// 技能类型
export interface Skill {
  id: string;
  userId: string;
  user: User;
  title: string;
  category: string;
  description: string;
  price: number;
  priceUnit: string;
  rating: number;
  serviceCount: number;
  images: string[];
  distance: number;
  isActive: boolean;
  createdAt: string;
}

// 订单类型
export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  user: User;
  skillId: string;
  skill: Skill;
  providerId: string;
  provider: User;
  status: OrderStatus;
  address: string;
  serviceTime: string;
  remark: string;
  amount: number;
  createdAt: string;
  completedAt?: string;
}

// 评价类型
export interface Review {
  id: string;
  orderId: string;
  userId: string;
  user: User;
  skillId: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// 轮播图类型
export interface Banner {
  id: string;
  title: string;
  image: string;
  type: 'activity' | 'announcement' | 'skill';
  link?: string;
}