import Modal from "@/components/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="font-serif text-ink-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {cancelText}
        </button>
        <button
          type="button"
          className={
            danger
              ? "inline-flex items-center justify-center gap-2 rounded-full bg-seal px-5 py-2.5 font-serif text-paper-light shadow-sm transition-all duration-200 hover:bg-seal/90 hover:shadow-md active:scale-[0.98]"
              : "btn-primary"
          }
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
