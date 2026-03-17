"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";

type Toast = {
  id: string;
  title: string;
  message?: string;
  type?: "info" | "success" | "warning" | "error";
  onClick?: () => void;
};

type ToastContextType = {
  showToast: (title: string, message?: string, type?: Toast["type"], onClick?: () => void) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback(
    (title: string, message?: string, type: Toast["type"] = "info", onClick?: () => void) => {
      const id = `toast-${++counterRef.current}`;
      setToasts((prev) => [...prev, { id, title, message, type, onClick }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, onClick ? 8000 : 5000); // Longer dismiss for clickable toasts
    },
    []
  );

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToastClick = (toast: Toast) => {
    if (toast.onClick) {
      toast.onClick();
      dismiss(toast.id);
    }
  };

  const iconMap = {
    info: (
      <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map((toast, i) => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-slide-in-right flex items-start gap-3 w-[360px] max-w-[calc(100vw-2rem)] p-4 rounded-xl shadow-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 backdrop-blur-sm ${toast.onClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" : ""}`}
            style={{ animationDelay: `${i * 50}ms` }}
            onClick={() => handleToastClick(toast)}
          >
            <div className="shrink-0 mt-0.5">
              {iconMap[toast.type || "info"]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {toast.message}
                </p>
              )}
              {toast.onClick && (
                <p className="text-[10px] text-brand-500 font-medium mt-1">Click to respond</p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }}
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
