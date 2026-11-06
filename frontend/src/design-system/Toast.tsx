import { useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { ToastContext, type ToastItem, type ToastType } from './useToast'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        removeToast(id)
      }, 4000)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="vl-toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`vl-toast vl-toast-${toast.type}`} role="status">
            {toast.type === 'success' && (
              <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--positive)' }} />
            )}
            {toast.type === 'error' && (
              <AlertCircle size={16} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--negative)' }} />
            )}
            {toast.type === 'info' && (
              <Info size={16} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--accent)' }} />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss message"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                opacity: 0.7,
              }}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
