'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (title: string, options?: { type?: ToastType; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, options?: { type?: ToastType; message?: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        title,
        type: options?.type || 'info',
        message: options?.message,
        duration: options?.duration || 4000,
      };

      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => {
    addToast(title, { type: 'success', message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast(title, { type: 'error', message, duration: 6000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast(title, { type: 'info', message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in slide-in-from-right ${
                isError
                  ? 'bg-raisin-900/95 border-coral-500/60 text-timberwolf-100 shadow-coral-500/10'
                  : isSuccess
                  ? 'bg-raisin-900/95 border-emerald-500/60 text-timberwolf-100 shadow-emerald-500/10'
                  : 'bg-raisin-900/95 border-timberwolf-300/30 text-timberwolf-100 shadow-black/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isError && <AlertCircle className="w-5 h-5 text-coral-500" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {!isError && !isSuccess && <Info className="w-5 h-5 text-timberwolf-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-timberwolf-100">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-xs text-timberwolf-400 mt-1 leading-relaxed break-words">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-timberwolf-500 hover:text-timberwolf-200 transition-colors p-1"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
