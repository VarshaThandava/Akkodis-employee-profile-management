import { useState, useCallback } from 'react'

/**
 * Boolean state toggle. Returns [value, toggle, setValue].
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(!!initial)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}
