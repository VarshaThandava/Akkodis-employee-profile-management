import { forwardRef } from 'react'

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size,
      className = '',
      loading = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const classes = [
      'btn',
      `btn-${variant}`,
      size && `btn-${size}`,
      className,
    ].filter(Boolean).join(' ')
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={classes}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
