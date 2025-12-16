import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React from 'react';

import { Toast as ToastType, useToasts } from '../context/ToastContext.js';

const ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle
};

const STYLES = {
  info: 'bg-blue-500/90 border-blue-400',
  success: 'bg-emerald-500/90 border-emerald-400',
  warning: 'bg-amber-500/90 border-amber-400',
  error: 'bg-red-500/90 border-red-400'
};

const ToastItem: React.FC<{ toast: ToastType; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const Icon = ICONS[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-white ${STYLES[toast.type]} animate-slide-in`}
    >
      <Icon size={18} className="shrink-0" aria-hidden />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 max-w-sm"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default ToastContainer;
