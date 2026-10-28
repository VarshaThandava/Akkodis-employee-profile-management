import { useState, useCallback, useEffect } from 'react'
import { getEmployees, getAllAttendance } from '../services/api'

function todayISO() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

/**
 * Dashboard stats: employees count, today's attendance count, present/absent today.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    employees: 0,
    todayAttendance: 0,
    todayPresent: 0,
    todayAbsent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    const today = todayISO()
    Promise.all([
      getEmployees({ limit: 500 }),
      getAllAttendance({ from_date: today, to_date: today, limit: 500 }),
    ])
      .then(([empRes, attRes]) => {
        const employees = (empRes.data && empRes.data.length) || 0
        const todayList = attRes.data || []
        const present = todayList.filter((r) => r.status === 'Present').length
        const absent = todayList.filter((r) => r.status === 'Absent').length
        setStats({
          employees,
          todayAttendance: todayList.length,
          todayPresent: present,
          todayAbsent: absent,
        })
      })
      .catch(() => {
        setStats({
          employees: 0,
          todayAttendance: 0,
          todayPresent: 0,
          todayAbsent: 0,
        })
        setError('Unable to load dashboard. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { stats, loading, error, refetch }
}
