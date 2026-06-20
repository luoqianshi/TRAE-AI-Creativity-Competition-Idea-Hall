import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface DirtyIndicatorProps {
  isDirty: boolean;
  message?: string;
  onSave?: () => void;
}

export const DirtyIndicator: React.FC<DirtyIndicatorProps> = ({
  isDirty,
  message = '您有未保存的变更',
  onSave,
}) => {
  if (!isDirty) return null;

  return (
    <div className="bg-amber-50 border border-amber-150 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">{message}</p>
        <p className="text-xs text-amber-600 mt-1">
          请点击"保存配置"按钮保存您的更改，否则在离开此页面时将会丢失。
        </p>
      </div>
      {onSave && (
        <button
          onClick={onSave}
          className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition"
        >
          立即保存
        </button>
      )}
    </div>
  );
};
