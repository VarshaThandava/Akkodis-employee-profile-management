import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''
const api = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
})

export function setupApiErrorHandler(showError) {
  api.interceptors.response.use(
    (response) => response,
    (err) => {
      const res = err.response
      const data = res?.data
      const message =
        data?.error?.detail ||
        data?.error?.message ||
        err.message ||
        'Something went wrong'
      const code = data?.error?.code || (res ? `HTTP ${res.status}` : null)
      showError(message, code)
      return Promise.reject(err)
    }
  )
}

// Employees
export function getEmployees(params = {}) {
  return api.get('/employees', { params })
}

export function getEmployee(id) {
  return api.get(`/employees/${id}`)
}

export function createEmployee(payload) {
  return api.post('/employees', payload)
}

export function updateEmployee(id, payload) {
  return api.patch(`/employees/${id}`, payload)
}

export function deleteEmployee(id) {
  return api.delete(`/employees/${id}`)
}

// Attendance
export function getAttendanceByEmployee(employeeId, params = {}) {
  return api.get(`/attendance/${employeeId}`, { params })
}

export function getAllAttendance(params = {}) {
  return api.get('/attendance', { params })
}

export function createAttendance(payload) {
  return api.post('/attendance', payload)
}

export function updateAttendance(id, payload) {
  return api.patch(`/attendance/record/${id}`, payload)
}

export function deleteAttendance(id) {
  return api.delete(`/attendance/record/${id}`)
}

// Health (optional)
export function getHealth() {
  return API_BASE ? axios.get(`${API_BASE}/health`) : axios.get('/health')
}

export default api
