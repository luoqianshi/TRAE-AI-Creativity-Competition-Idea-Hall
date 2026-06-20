import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, BookOpen, Settings, Zap, Droplet, Flame, Archive } from 'lucide-react';
import { 当前用户, AppRoute } from '../types';

interface SidebarProps {
  当前路由: string;
  用户: 当前用户 | null;
  安全跳转路由: (路由: AppRoute) => void;
  酒店名称?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 当前路由, 用户, 安全跳转路由, 酒店名称 }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  if (!用户) return null;
  const menuItems = [
    { id: '能效大盘', label: '综合能耗大盘', icon: BarChart3 },
    { id: '用电看板', label: '用电大盘', icon: Zap },
    { id: '用水看板', label: '用水大盘', icon: Droplet },
    { id: '用气看板', label: '用气大盘', icon: Flame },
    { id: '日常抄表', label: '抄表录入', icon: BookOpen },
    { id: '历史抄表库', label: '历史抄表库', icon: Archive },
  ];

  if (用户.角色 === '工程总监') {
    menuItems.push({ id: '字典配置', label: '系统字典配置', icon: Settings });
  }
  return (
    <aside className={`${isExpanded ? 'w-64' : 'w-20'} bg-slate-950 text-slate-100 flex flex-col shrink-0 select-none shadow-2xl relative z-10 font-sans transition-all duration-300 h-screen`}>
      {/* Brand Header */}
      <div className="h-20 px-6 border-b border-slate-800/60 flex items-center justify-between bg-slate-950 flex-shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-950/40 flex-shrink-0">
            <div className="w-3 h-3 bg-slate-950 rounded-full animate-pulse" />
          </div>
          {isExpanded && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold tracking-widest text-slate-300 uppercase leading-none truncate max-w-[130px]" title={酒店名称 || "国信金融酒店"}>
                {酒店名称 || "国信金融酒店"}
              </span>
              <span className="text-xs font-extrabold text-white tracking-tight mt-1 leading-none font-sans">
                能耗审计总控制台
              </span>
            </div>
          )}
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-white transition-colors p-1">
          {isExpanded ? '«' : '»'}
        </button>
      </div>

      {/* Menu Area */}
      <div className={`flex-1 py-6 ${isExpanded ? 'px-6' : 'px-4'} space-y-1.5`}>
        {menuItems.map(item => {
          const isActive = 当前路由 === item.id;
          return (
            <button
              key={item.id}
              onClick={() => 安全跳转路由(item.id as AppRoute)}
              className="w-full flex items-center space-x-3.5 px-3 py-3 rounded-xl text-xs font-semibold relative cursor-pointer group transition-all duration-300"
              id={item.id}
            >
              <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              </span>

              {isExpanded && (
                <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  {item.label}
                </span>
              )}

              {isActive && isExpanded && (
                <motion.span
                  layoutId="sidebar-active-dot"
                  className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
