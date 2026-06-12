import { create } from 'zustand';
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type, duration, createdAt: Date.now() };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const accentMap = {
  success: 'bg-spotify-green',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const iconColorMap = {
  success: 'text-spotify-green',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = iconMap[toast.type];

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  }, [onRemove]);

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 pl-5 pr-10 py-3.5 rounded-lg shadow-2xl shadow-black/50 text-white text-sm font-medium overflow-hidden min-w-[300px] max-w-[440px] cursor-pointer',
        'bg-[#2a2a2a] border border-white/10 backdrop-blur-xl',
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      )}
      onClick={handleRemove}
    >
      <Icon className={cn('w-5 h-5 shrink-0', iconColorMap[toast.type])} />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
        <div
          className={cn('h-full rounded-full', accentMap[toast.type])}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-28 lg:bottom-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
