import { useState, useEffect, useCallback } from 'react'
import { getAttendanceByEmployee, getAllAttendance } from '../services/api'

/**
 * Attendance records for one employee, with optional date filter.
 * Returns { data: { records, total_present_days }, loading, error, refetch }.
 */
export function useAttendanceByEmployee(employeeId, dateFilter = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(() => {
    if (!employeeId) {
      setData(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const params = {}
    if (dateFilter.from_date) params.from_date = dateFilter.from_date
    if (dateFilter.to_date) params.to_date = dateFilter.to_date
    getAttendanceByEmployee(Number(employeeId), params)
      .then((res) =>
        setData({
          records: res.data?.records || [],
          total_present_days: res.data?.total_present_days ?? 0,
        })
      )
      .catch(() => {
        setData(null)
        setError('Unable to load attendance. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [employeeId, dateFilter.from_date, dateFilter.to_date])

  useEffect(() => {
    if (!employeeId) {
      setData(null)
      setError(null)
      return
    }
    fetchData()
  }, [employeeId, fetchData])

  return { data, loading, error, refetch: fetchData }
}

/**
 * All attendance records (for "all employees" view).
 */
export function useAllAttendance(enabled = true) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    getAllAttendance({ limit: 200 })
      .then((res) => {
        setData(res.data || [])
        setError(null)
      })
      .catch(() => {
        setData([])
        setError('Unable to load attendance. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [enabled])

  useEffect(() => {
    if (enabled) refetch()
  }, [enabled, refetch])

  return { data, loading, error, refetch }
}
