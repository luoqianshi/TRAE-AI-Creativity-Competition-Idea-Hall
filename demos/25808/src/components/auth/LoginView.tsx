import React from "react";
import { motion } from "motion/react";
import { User as UserIcon, KeyRound, AlertTriangle, Info } from "lucide-react";

interface LoginViewProps {
  登录账号: string;
  set登录账号: (val: string) => void;
  登录密码: string;
  set登录密码: (val: string) => void;
  登录错误: string;
  登录中: boolean;
  触发登录Action: (e: React.FormEvent) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  登录账号,
  set登录账号,
  登录密码,
  set登录密码,
  登录错误,
  登录中,
  触发登录Action,
}) => {
  return (
    <motion.div
      key="登录页面"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full flex items-center justify-center min-h-screen p-6 bg-zinc-50"
      id="登录窗口"
    >
      <div className="w-full max-w-[420px] bg-white border border-zinc-200/60 rounded-3xl shadow-xs p-10 flex flex-col space-y-8 select-none">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-xs group cursor-pointer">
            <div className="w-5 h-5 bg-white rounded-full transition-transform duration-500 group-hover:scale-110"></div>
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight text-zinc-900 font-sans"
              id="主标题"
            >
              能耗审计系统
            </h1>
            <p
              className="text-xs text-zinc-400 mt-1.5 font-sans tracking-wide"
              id="副标题"
            >
              酒店全量能耗统计
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-50/80 border border-zinc-200/50 rounded-2xl space-y-2.5 text-xxs text-zinc-500 font-sans leading-relaxed">
          <div className="font-semibold text-zinc-700 flex items-center space-x-1">
            <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>系统预置凭证：</span>
          </div>
          <div className="pl-4 space-y-1.5">
            <p>
              <span className="font-semibold text-zinc-600">超级管理员</span>
              ：superadmin / admin123
            </p>
            <p>
              <span className="font-semibold text-zinc-600">
                工程总监 (管理员)
              </span>
              ：admin / admin123
            </p>
            <p>
              <span className="font-semibold text-zinc-600">
                工程主管 (抄表员)
              </span>
              ：engineer / 123456
            </p>
          </div>
        </div>

        <form onSubmit={触发登录Action} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xxs font-semibold text-zinc-400 uppercase tracking-widest pl-1">
              工作账号
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <UserIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={登录账号}
                onChange={(e) => set登录账号(e.target.value)}
                placeholder="请输入工作账号..."
                className="block w-full pl-11 pr-4 py-3 bg-zinc-50/40 border border-zinc-200 rounded-xl text-zinc-950 placeholder-zinc-400 text-sm focus:outline-none focus:ring-3 focus:ring-cyan-100/40 focus:border-cyan-500/50 focus:bg-white transition-all duration-200 font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xxs font-semibold text-zinc-400 uppercase tracking-widest pl-1">
              登录密码
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={登录密码}
                onChange={(e) => set登录密码(e.target.value)}
                placeholder="请输入登录密码..."
                className="block w-full pl-11 pr-4 py-3 bg-zinc-50/40 border border-zinc-200 rounded-xl text-zinc-950 placeholder-zinc-400 text-sm focus:outline-none focus:ring-3 focus:ring-cyan-100/40 focus:border-cyan-500/50 focus:bg-white transition-all duration-200 font-sans"
              />
            </div>
          </div>

          {登录错误 && (
            <div className="flex items-start space-x-2 p-3 rounded-xl bg-red-50/50 border border-red-100 text-red-700 text-xxs transition-all duration-200 leading-relaxed animate-shake">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{登录错误}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={登录中}
            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 active:scale-[0.985] shadow-xs cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {登录中 ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>登录中...</span>
              </span>
            ) : (
              "登录"
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-center text-[10px] text-zinc-400 font-sans tracking-wider space-x-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>回路测定在线</span>
          <span className="text-zinc-200">|</span>
          <span>国家计量院标准认证</span>
        </div>
      </div>
    </motion.div>
  );
};
