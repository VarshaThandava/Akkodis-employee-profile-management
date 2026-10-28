import { forwardRef } from 'react'

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      className = '',
      id,
      required,
      hint,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name
    const inputClass = 'form-control' + (error ? ' is-invalid' : '')
    return (
      <div className={'mb-3 ' + className}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <div id={`${inputId}-hint`} className="form-text">
            {hint}
          </div>
        )}
        {error && (
          <div id={`${inputId}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
