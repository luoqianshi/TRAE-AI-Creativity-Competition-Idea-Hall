'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, User as UserIcon, Shield, AlertTriangle } from 'lucide-react';

export default function 登录页面() {
  const 路由 = useRouter();
  const [账号, set账号] = useState('');
  const [密码, set密码] = useState('');
  const [错误信息, set错误信息] = useState('');
  const [正在加载, set正在加载] = useState(false);

  const 提交登录 = async (事件: React.FormEvent) => {
    事件.preventDefault();
    set错误信息('');
    set正在加载(true);

    try {
      if (!账号 || !密码) {
        set错误信息('请完整填写工作账号与登录密码。');
        set正在加载(false);
        return;
      }

      if (账号 === 'admin' && 密码 === 'admin123') {
        const 用户数据 = {
          账号: 'admin',
          角色: 'ADMIN',
          姓名: '工程总监',
          状态: '激活'
        };
        localStorage.setItem('当前用户', JSON.stringify(用户数据));
        路由.push('/dashboard');
      } else if (账号 === 'engineer' && 密码 === '123456') {
        const 用户数据 = {
          账号: 'engineer',
          角色: 'ENGINEER',
          姓名: '工程主管',
          状态: '激活'
        };
        localStorage.setItem('当前用户', JSON.stringify(用户数据));
        路由.push('/daily');
      } else {
        set错误信息('账号或密码不正确，请重新输入。');
      }
    } catch (异常) {
      set错误信息('登录时发生异常，请联系系统管理员。');
    } finally {
      set正在加载(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 flex flex-col items-center justify-center p-4 selection:bg-cyan-100 selection:text-cyan-900">
      <div className="w-full max-w-md bg-white border border-zinc-200/60 rounded-2xl shadow-sm p-8 transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-4 transition-transform duration-500 hover:rotate-12">
            <Shield className="h-6 w-6 text-cyan-600" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-1.5 font-sans">
            能耗审计系统
          </h1>
          <p className="text-sm text-zinc-500 font-sans tracking-wide">
            酒店全量能耗统计
          </p>
        </div>

        <form onSubmit={提交登录} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider font-sans">
              工作账号
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <UserIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={账号}
                onChange={(e) => set账号(e.target.value)}
                placeholder="请输入工作账号..."
                className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-950 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider font-sans">
              登录密码
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={密码}
                onChange={(e) => set密码(e.target.value)}
                placeholder="请输入登录密码..."
                className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-950 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {错误信息 && (
            <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs transition-all duration-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span className="leading-relaxed">{错误信息}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={正在加载}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-850 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          >
            {正在加载 ? '正在登录...' : '登录'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col items-center justify-center space-y-2 text-xxs text-zinc-400 font-sans">
          <div className="flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>系统连接状态正常</span>
          </div>
        </div>
      </div>
    </div>
  );
}
