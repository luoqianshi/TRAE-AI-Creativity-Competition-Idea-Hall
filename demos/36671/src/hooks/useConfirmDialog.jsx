import { useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

export function useConfirmDialog() {
  const [config, setConfig] = useState(null);

  const ask = useCallback((message, onConfirm, options = {}) => {
    setConfig({ message, onConfirm, ...options });
  }, []);

  const dismiss = useCallback(() => setConfig(null), []);

  const dialog = (
    <ConfirmDialog
      open={!!config}
      message={config?.message ?? ''}
      title={config?.title}
      confirmText={config?.confirmText}
      cancelText={config?.cancelText}
      onConfirm={() => {
        config?.onConfirm?.();
        dismiss();
      }}
      onCancel={dismiss}
    />
  );

  return { ask, dialog };
}
