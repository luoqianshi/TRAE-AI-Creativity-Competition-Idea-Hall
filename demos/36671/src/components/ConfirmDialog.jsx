export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        {title && <p className="text-base font-semibold mb-2">{title}</p>}
        <p className="text-sm text-text-secondary mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium tap-active"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium tap-active"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
