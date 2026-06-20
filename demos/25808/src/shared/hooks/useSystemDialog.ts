import { useState } from 'react';

export interface SystemDialogState {
  isOpen: boolean;
  type: 'prompt' | 'confirm' | 'alert';
  title: string;
  message?: string;
  value?: string;
  onConfirm?: (val: string) => void;
}

export function useSystemDialog() {
  const [系统弹窗, set系统弹窗] = useState<SystemDialogState>({
    isOpen: false,
    type: 'alert',
    title: '',
  });

  const closeDialog = () => set系统弹窗(prev => ({ ...prev, isOpen: false }));

  const openPrompt = (title: string, onConfirm: (val: string) => void) => {
    set系统弹窗({ isOpen: true, type: 'prompt', title, value: '', onConfirm });
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    set系统弹窗({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  const openAlert = (title: string, message: string) => {
    set系统弹窗({ isOpen: true, type: 'alert', title, message });
  };

  return {
    系统弹窗,
    set系统弹窗,
    closeDialog,
    openPrompt,
    openConfirm,
    openAlert,
  };
}
