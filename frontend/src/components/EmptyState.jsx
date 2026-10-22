/**
 * Empty state or error state with consistent styling and a11y.
 * variant: 'empty' | 'error'
 */
function EmptyState({ variant = 'empty', icon, title, message, action }) {
  const isError = variant === 'error'
  return (
    <div
      className={'empty-state' + (isError ? ' empty-state--error' : '')}
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
    >
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      {title && <h2 className="empty-state-title">{title}</h2>}
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export default EmptyState
