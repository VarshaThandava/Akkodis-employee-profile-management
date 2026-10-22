function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  return (
    <div
      className="loading-state"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={'spinner-border text-primary' + (size === 'sm' ? ' spinner-border-sm' : '')}
        aria-hidden="true"
      />
      <p className="loading-state-label">{label}</p>
    </div>
  )
}

export default LoadingSpinner
