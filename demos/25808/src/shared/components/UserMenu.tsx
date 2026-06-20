import React, { useState } from 'react';
import { LogOut, KeyRound, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserMenuProps {
  用户: { 姓名: string; 角色: string };
  触发退出登录: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ 用户, 触发退出登录 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
      >
        <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-700 text-xs font-bold shrink-0">
          {用户.姓名.substring(0, 2)}
        </div>
        <div className="flex flex-col items-start truncate">
          <span className="text-xs font-bold text-slate-700">{用户.姓名}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50"
          >
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <KeyRound className="h-3.5 w-3.5" />
              <span>修改密码</span>
            </button>
            <button
              onClick={触发退出登录}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>退出登录</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
