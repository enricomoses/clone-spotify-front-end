import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  message?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmLabel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const isVisible = open ?? isOpen ?? false;
  const displayMessage = description || message || '';
  const displayConfirmText = confirmLabel || confirmText;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="relative bg-spotify-card rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-up">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-spotify-muted mb-6">{displayMessage}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              'px-5 py-2 text-sm font-bold rounded-full transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-spotify-green hover:bg-spotify-green-bright text-black'
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {displayConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
