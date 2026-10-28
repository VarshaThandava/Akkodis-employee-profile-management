import { useCallback, useEffect, useState } from 'react'
import { getEmployees } from '../services/api'

/**
 * Shared hook: employees list with loading, error, refetch.
 * Used by Dashboard, Employees, and Attendance.
 */
export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    getEmployees({ limit: 500 })
      .then((res) => {
        setEmployees(res.data || [])
        setError(null)
      })
      .catch(() => {
        setEmployees([])
        setError('Unable to load employees. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { employees, loading, error, refetch }
}
