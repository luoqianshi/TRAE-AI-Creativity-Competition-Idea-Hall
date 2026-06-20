import React from 'react';
import { UserMenu } from './UserMenu';
import { 当前用户 } from '../types';

interface HeaderProps {
  当前路由: string;
  最新记录日期: string;
  用户: 当前用户;
  触发退出登录: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 当前路由, 最新记录日期, 用户, 触发退出登录 }) => {
  return (
    <header className="h-20 border-b border-zinc-200/50 bg-white flex items-center justify-between px-8 select-none shadow-xs">
      <div className="flex items-center space-x-2">
        <span className="text-zinc-200 font-medium text-lg">/</span>
        <span className="text-xs font-bold text-zinc-900 tracking-wider font-sans uppercase">
          {当前路由 === '能效大盘' && '综合能耗大盘'}
          {当前路由 === '用电看板' && '用电大盘'}
          {当前路由 === '用水看板' && '用水大盘'}
          {当前路由 === '用气看板' && '用气大盘'}
          {当前路由 === '日常抄表' && '抄表录入'}
          {当前路由 === '历史抄表库' && '历史抄表库'}
          {当前路由 === '月度大盘' && '月度大盘盘点'}
          {当前路由 === '字典配置' && '系统字典配置'}
        </span>
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-[10px] text-zinc-400 flex items-center space-x-3.5 font-sans font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>系统最新数据：{最新记录日期}</span>
          </div>
        </div>
        <UserMenu 用户={用户} 触发退出登录={触发退出登录} />
      </div>
    </header>
  );
};
