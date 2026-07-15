import {
  BookOpen, Dumbbell, Leaf, Brain, Music, PenTool, Droplets, Apple, Moon,
  Trophy, Palette, Pencil, Heart, Target, Star, Zap, Coffee, Cloud, Sun,
  Smile, Sparkles, Flame, Award, Gem, Crown, TrendingUp, Timer, Bell,
  MessageCircle, User, Settings, Home, BarChart3, ListChecks, Plus,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  book: BookOpen, dumbbell: Dumbbell, leaf: Leaf, brain: Brain,
  music: Music, pen: PenTool, droplet: Droplets, apple: Apple, moon: Moon,
  trophy: Trophy, palette: Palette, pencil: Pencil, heart: Heart,
  target: Target, star: Star, zap: Zap, coffee: Coffee, cloud: Cloud,
  sun: Sun, smile: Smile,
  // Achievement icons
  sparkles: Sparkles, flame: Flame, award: Award, gem: Gem, crown: Crown,
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "学习": BookOpen,
  "运动": Dumbbell,
  "生活": Sun,
  "心理": Brain,
};

export const CATEGORY_ICON_KEYS: Record<string, string> = {
  "学习": "book",
  "运动": "dumbbell",
  "生活": "sun",
  "心理": "brain",
};

export const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_checkin: "sparkles",
  streak_3: "flame",
  streak_7: "star",
  streak_14: "zap",
  streak_21: "trophy",
  total_50: "target",
  total_100: "award",
  perfect_7: "gem",
};

export const HABIT_ICON_OPTIONS = [
  { key: "book", icon: BookOpen },
  { key: "dumbbell", icon: Dumbbell },
  { key: "leaf", icon: Leaf },
  { key: "brain", icon: Brain },
  { key: "music", icon: Music },
  { key: "pen", icon: PenTool },
  { key: "droplet", icon: Droplets },
  { key: "apple", icon: Apple },
  { key: "moon", icon: Moon },
  { key: "heart", icon: Heart },
  { key: "target", icon: Target },
  { key: "star", icon: Star },
  { key: "zap", icon: Zap },
  { key: "coffee", icon: Coffee },
  { key: "sun", icon: Sun },
  { key: "smile", icon: Smile },
  { key: "trophy", icon: Trophy },
  { key: "palette", icon: Palette },
  { key: "pencil", icon: Pencil },
  { key: "cloud", icon: Cloud },
];

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
  color?: string;
}

export default function Icon({ name, className = "", size = 24, style, color }: IconProps) {
  const Component = iconMap[name] || Sparkles;
  return <Component className={className} size={size} style={style} color={color} />;
}

export function CategoryIcon({ category, className = "", size = 24 }: { category: string; className?: string; size?: number }) {
  const Component = CATEGORY_ICONS[category] || Sparkles;
  return <Component className={className} size={size} />;
}
