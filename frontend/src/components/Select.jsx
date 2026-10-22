import { forwardRef } from 'react'

/**
 * Reusable select/dropdown with label and error.
 */
const Select = forwardRef(
  (
    {
      label,
      error,
      options = [],
      placeholder = 'Select...',
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name
    const selectClass = 'form-select' + (error ? ' is-invalid' : '')
    return (
      <div className={'mb-3 ' + className}>
        {label && (
          <label htmlFor={selectId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={selectClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <div id={`${selectId}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
