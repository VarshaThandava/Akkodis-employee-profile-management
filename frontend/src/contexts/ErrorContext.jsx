import { createContext, useContext, useState, useCallback } from 'react'

const ErrorContext = createContext(null)

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null)

  const showError = useCallback((message, code = null) => {
    setError({ message, code })
    setTimeout(() => setError(null), 5000)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
      {error && (
        <div className="global-error-toast">
          <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
            {error.code && <strong>[{error.code}] </strong>}
            {error.message}
            <button
              type="button"
              className="btn-close"
              onClick={clearError}
              aria-label="Close"
            />
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useError must be used within ErrorProvider')
  return ctx
}
