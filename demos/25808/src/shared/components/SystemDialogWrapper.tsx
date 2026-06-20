import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface SystemDialogWrapperProps {
  isOpen: boolean;
  title: string;
  message?: string;
  type: 'confirm' | 'prompt' | 'alert';
  value: string;
  closeDialog: () => void;
  set系统弹窗: React.Dispatch<React.SetStateAction<any>>;
  onConfirm?: (val: string) => void;
}

export const SystemDialogWrapper: React.FC<SystemDialogWrapperProps> = ({
  isOpen,
  title,
  message,
  type,
  value,
  closeDialog,
  set系统弹窗,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-hidden w-full max-w-sm"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
                <button 
                  onClick={closeDialog} 
                  className="text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {message && (
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">{message}</p>
              )}
              
              {type === 'prompt' && (
                <input
                  type="text"
                  autoFocus
                  value={value}
                  onChange={(e) => set系统弹窗((prev: any) => ({ ...prev, value: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onConfirm) {
                      closeDialog();
                      onConfirm(value);
                    }
                  }}
                  className="w-full py-2.5 px-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                />
              )}
            </div>
            
            <div className="bg-zinc-50 border-t border-zinc-100 p-4 flex justify-end space-x-2">
              {type !== 'alert' && (
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-650 hover:bg-zinc-200/50 transition-colors cursor-pointer"
                >
                  取消
                </button>
              )}
              <button
                onClick={() => {
                  closeDialog();
                  if (onConfirm) onConfirm(value);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                确定
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
