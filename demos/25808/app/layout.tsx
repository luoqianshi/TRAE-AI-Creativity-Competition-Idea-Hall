'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BookOpen, Calendar, Settings, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

interface 布局属性 {
  children: React.ReactNode;
}

export default function 全局布局外壳({ children }: 布局属性) {
  const 路径名 = usePathname();
  const 路由 = useRouter();
  const [当前用户, set当前用户] = useState<{ 账号: string; 角色: string; 姓名: string; 状态: string } | null>(null);
  const [检查完成, set检查完成] = useState(false);

  useEffect(() => {
    const 用户数据串 = localStorage.getItem('当前用户');
    if (用户数据串) {
      try {
        const 解析用户 = JSON.parse(用户数据串);
        set当前用户(解析用户);

        if (解析用户.角色 === 'ENGINEER' && 路径名 === '/settings') {
          路由.push('/daily');
        }
      } catch (异常) {
        localStorage.removeItem('当前用户');
        if (路径名 !== '/login') {
          路由.push('/login');
        }
      }
    } else {
      if (路径名 !== '/login') {
        路由.push('/login');
      }
    }
    set检查完成(true);
  }, [路径名, 路由]);

  const 执行退出 = () => {
    localStorage.removeItem('当前用户');
    set当前用户(null);
    路由.push('/login');
  };

  if (!检查完成) {
    return (
      <html lang="zh-CN">
        <body className="bg-zinc-50 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 border-2 border-zinc-200 border-t-cyan-500 rounded-full animate-spin"></div>
            <span className="text-sm text-zinc-500 font-sans">正在加载系统配置...</span>
          </div>
        </body>
      </html>
    );
  }

  if (路径名 === '/login') {
    return (
      <html lang="zh-CN">
        <body className="bg-zinc-50 min-h-screen text-zinc-950 font-sans antialiased">
          {children}
        </body>
      </html>
    );
  }

  const 菜单激活样式 = 'bg-cyan-50 text-cyan-700 border-cyan-100/50';
  const 菜单默认样式 = 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 border-transparent';

  return (
    <html lang="zh-CN">
      <body className="bg-zinc-50 min-h-screen text-zinc-950 font-sans antialiased flex">
        {/* 常驻侧边栏 */}
        <aside className="w-64 bg-white border-r border-zinc-200/60 flex flex-col shrink-0">
          <div className="h-16 px-6 border-b border-zinc-100 flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-md font-bold tracking-wider">能</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-900 leading-none">能耗审计系统</span>
              <span className="text-xxs text-zinc-400 mt-1 leading-none">酒店回路管理</span>
            </div>
          </div>

          <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => 路由.push('/dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                路径名 === '/dashboard' ? 菜单激活样式 : 菜单默认样式
              }`}
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span>能效大盘</span>
            </button>

            <button
              onClick={() => 路由.push('/daily')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                路径名 === '/daily' ? 菜单激活样式 : 菜单默认样式
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>日常抄表录入</span>
            </button>

            <button
              onClick={() => 路由.push('/monthly')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                路径名 === '/monthly' ? 菜单激活样式 : 菜单默认样式
              }`}
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span>月度大盘盘点</span>
            </button>

            {当前用户?.角色 === 'ADMIN' && (
              <button
                onClick={() => 路由.push('/settings')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  路径名 === '/settings' ? 菜单激活样式 : 菜单默认样式
                }`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>系统字典配置</span>
              </button>
            )}
          </div>

          {/* 底部用户信息及退出 */}
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/55 space-y-3">
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-lg">
              <div className="h-9 w-9 rounded-full bg-zinc-100 border border-zinc-200/50 flex items-center justify-center text-zinc-600">
                <UserIcon className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-950 truncate">
                  {当前用户?.姓名 || '未知用户'}
                </span>
                <span className="text-xxs text-zinc-400 mt-0.5 truncate">
                  {当前用户?.角色 === 'ADMIN' ? '工程总监' : '工程主管'} | 激活
                </span>
              </div>
            </div>

            <button
              onClick={执行退出}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] transition-all duration-200 shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>安全退出系统</span>
            </button>
          </div>
        </aside>

        {/* 内容主视窗 */}
        <main className="flex-1 flex flex-col min-w-0 min-h-screen">
          <header className="h-16 border-b border-zinc-200/60 bg-white flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-zinc-400">/</span>
              <span className="text-sm font-medium text-zinc-800">
                {路径名 === '/dashboard' && '能效大盘'}
                {路径名 === '/daily' && '日常抄表录入'}
                {路径名 === '/monthly' && '月度大盘盘点'}
                {路径名 === '/settings' && '系统字典配置'}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-zinc-500 font-sans">
              <span>系统时间：2026年06月09日</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 bg-zinc-50">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
