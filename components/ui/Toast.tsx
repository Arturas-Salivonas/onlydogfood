import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300); // Wait for animation
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start p-4 rounded-lg border shadow-lg bg-white transition-all duration-300',
        {
          'border-green-200 bg-green-50': toast.type === 'success',
          'border-red-200 bg-red-50': toast.type === 'error',
          'border-yellow-200 bg-yellow-50': toast.type === 'warning',
          'border-blue-200 bg-blue-50': toast.type === 'info',
        },
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Icon
        className={cn('h-5 w-5 flex-shrink-0 mt-0.5', {
          'text-green-600': toast.type === 'success',
          'text-red-600': toast.type === 'error',
          'text-yellow-600': toast.type === 'warning',
          'text-blue-600': toast.type === 'info',
        })}
      />
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
        {toast.description && (
          <p className="text-sm text-gray-700 mt-1">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="ml-3 flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
      >
        <X className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  );
}

// Convenience hooks for different toast types
export function useToastSuccess() {
  const { addToast } = useToast();
  return useCallback((title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'success', title, description, ...options });
  }, [addToast]);
}

export function useToastError() {
  const { addToast } = useToast();
  return useCallback((title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'error', title, description, ...options });
  }, [addToast]);
}

export function useToastWarning() {
  const { addToast } = useToast();
  return useCallback((title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'warning', title, description, ...options });
  }, [addToast]);
}

export function useToastInfo() {
  const { addToast } = useToast();
  return useCallback((title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'info', title, description, ...options });
  }, [addToast]);
}

// Toast hook that returns all convenience functions
export function useToasts() {
  return {
    success: useToastSuccess(),
    error: useToastError(),
    warning: useToastWarning(),
    info: useToastInfo(),
  };
}