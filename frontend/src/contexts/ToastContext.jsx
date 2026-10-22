import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showSuccess = useCallback((message) => {
    setToast({ message, type: 'success' })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const showError = useCallback((message, code = null) => {
    setToast({ message, type: 'error', code })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  return (
    <ToastContext.Provider value={{ showSuccess, showError, clearToast }}>
      {children}
      {toast && (
        <div
          className="global-toast"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={toast.type === 'success' ? 'Success' : 'Error'}
        >
          <div
            className={
              toast.type === 'success'
                ? 'alert alert-success alert-dismissible fade show shadow-sm'
                : 'alert alert-danger alert-dismissible fade show shadow-sm'
            }
          >
            {toast.code && <strong className="me-1">[{toast.code}]</strong>}
            {toast.message}
            <button
              type="button"
              className="btn-close"
              onClick={clearToast}
              aria-label="Dismiss notification"
            />
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
