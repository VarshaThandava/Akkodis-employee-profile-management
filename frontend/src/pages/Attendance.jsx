import { useState } from 'react'
import { createAttendance, deleteAttendance } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useEmployees } from '../hooks/useEmployees'
import { useAttendanceByEmployee, useAllAttendance } from '../hooks/useAttendance'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Card from '../components/Card'
import Table from '../components/Table'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const STATUS_OPTIONS = [
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
]

function StatusBadge({ status }) {
  const isPresent = status === 'Present'
  return (
    <span className={isPresent ? 'badge bg-success' : 'badge bg-secondary'}>
      {status}
    </span>
  )
}

export default function Attendance() {
  const { showSuccess } = useToast()
  const { employees, loading: employeesLoading, error: employeesError, refetch: refreshEmployees } = useEmployees()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [dateFilter, setDateFilter] = useState({ from_date: '', to_date: '' })
  const { data: attendanceData, loading: attendanceLoading, error: attendanceError, refetch: refreshAttendance } =
    useAttendanceByEmployee(selectedEmployeeId, dateFilter)

  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
  })
  const [formErrors, setFormErrors] = useState({})

  const selectedEmployee = employees.find((e) => e.id === Number(selectedEmployeeId))

  function openForm() {
    setForm({
      employee_id: employees[0]?.id?.toString() || '',
      date: new Date().toISOString().slice(0, 10),
      status: 'Present',
    })
    setFormErrors({})
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setFormErrors({})
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }))
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    setFormErrors({})
    if (!form.employee_id?.trim()) {
      setFormErrors((prev) => ({ ...prev, employee_id: 'Select an employee.' }))
      return
    }
    if (!form.date?.trim()) {
      setFormErrors((prev) => ({ ...prev, date: 'Date is required.' }))
      return
    }
    setFormLoading(true)
    createAttendance({
      employee_id: Number(form.employee_id),
      date: form.date,
      status: form.status,
    })
      .then(() => {
        closeForm()
        showSuccess('Attendance recorded successfully.')
        refreshEmployees()
        if (selectedEmployeeId === form.employee_id) {
          refreshAttendance()
        } else {
          setSelectedEmployeeId(form.employee_id)
        }
      })
      .catch((err) => {
        const detail = err.response?.data?.error?.detail
        if (detail) setFormErrors((prev) => ({ ...prev, _: detail }))
      })
      .finally(() => setFormLoading(false))
  }

  function handleDelete(record) {
    if (!window.confirm(`Delete attendance record for ${record.date}?`)) return
    deleteAttendance(record.id).then(() => {
      showSuccess('Attendance record deleted.')
      refreshAttendance()
    })
  }

  function handleDateFilterChange(e) {
    const { name, value } = e.target
    setDateFilter((prev) => ({ ...prev, [name]: value || '' }))
  }

  const employeeOptions = employees.map((e) => ({
    value: String(e.id),
    label: `${e.full_name} (${e.employee_id})`,
  }))

  const recordsTableColumns = [
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-end',
      cellClassName: 'text-end',
      render: (row) => (
        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(row)}>
          Delete
        </Button>
      ),
    },
  ]

  const records = attendanceData?.records || []
  const totalPresentDays = attendanceData?.total_present_days ?? 0

  return (
    <div className="page-attendance">
      <div className="page-header-row">
        <h2 className="page-title mb-0">Attendance</h2>
        <Button onClick={openForm} disabled={employees.length === 0}>
          Record attendance
        </Button>
      </div>

      {showForm && (
        <Card title="Record attendance" className="mb-4">
          <form onSubmit={handleFormSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-4">
                <Select
                  label="Employee"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleFormChange}
                  options={employeeOptions}
                  placeholder="Select employee"
                  error={formErrors.employee_id}
                  required
                />
              </div>
              <div className="col-md-4">
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleFormChange}
                  error={formErrors.date}
                  required
                />
              </div>
              <div className="col-md-4">
                <Select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  options={STATUS_OPTIONS}
                  error={formErrors.status}
                />
              </div>
            </div>
            {formErrors._ && (
              <div className="form-alert-error" role="alert">
                {formErrors._}
              </div>
            )}
            <div className="d-flex gap-2 mt-3">
              <Button type="submit" loading={formLoading}>
                Save
              </Button>
              <Button type="button" variant="outline-secondary" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="View attendance" className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <Select
              label="Employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              options={employeeOptions}
              placeholder="All employees"
            />
          </div>
          {selectedEmployeeId && (
            <>
              <div className="col-md-2">
                <Input
                  label="From date"
                  name="from_date"
                  type="date"
                  value={dateFilter.from_date}
                  onChange={handleDateFilterChange}
                />
              </div>
              <div className="col-md-2">
                <Input
                  label="To date"
                  name="to_date"
                  type="date"
                  value={dateFilter.to_date}
                  onChange={handleDateFilterChange}
                />
              </div>
            </>
          )}
        </div>
        {selectedEmployeeId && attendanceData && !attendanceLoading && !attendanceError && (
          <div className="attendance-summary mt-3">
            <span className="text-muted">Total present days (filtered):</span>{' '}
            <strong>{totalPresentDays}</strong>
          </div>
        )}
      </Card>

      {employeesLoading && employees.length === 0 ? (
        <Card>
          <LoadingSpinner label="Loading employees…" />
        </Card>
      ) : employeesError && employees.length === 0 ? (
        <Card>
          <EmptyState
            variant="error"
            title="Couldn’t load employees"
            message={employeesError}
            action={<Button onClick={refreshEmployees}>Try again</Button>}
          />
        </Card>
      ) : employees.length === 0 ? (
        <Card>
          <EmptyState
            icon="👥"
            title="No employees"
            message="Add employees first, then record attendance."
          />
        </Card>
      ) : selectedEmployeeId ? (
        <>
          {attendanceLoading && records.length === 0 ? (
            <Card>
              <LoadingSpinner label="Loading attendance…" />
            </Card>
          ) : attendanceError && records.length === 0 ? (
            <Card>
              <EmptyState
                variant="error"
                title="Couldn’t load attendance"
                message={attendanceError}
                action={<Button onClick={refreshAttendance}>Try again</Button>}
              />
            </Card>
          ) : records.length === 0 ? (
            <Card>
              <EmptyState
                icon="📅"
                title="No attendance records"
                message={`No attendance for ${selectedEmployee?.full_name || 'this employee'} in the selected period.`}
                action={<Button onClick={openForm}>Record attendance</Button>}
              />
            </Card>
          ) : (
            <Table
              columns={recordsTableColumns}
              data={records}
              emptyMessage="No records in this range."
            />
          )}
        </>
      ) : (
        <AllAttendanceSection employees={employees} openForm={openForm} />
      )}
    </div>
  )
}

function AllAttendanceSection({ employees, openForm }) {
  const { data: list, loading, error, refetch } = useAllAttendance(true)

  const allTableColumns = [
    {
      key: 'employee_id',
      label: 'Employee ID',
      render: (row) => {
        const emp = employees.find((e) => e.id === row.employee_id)
        return emp ? emp.employee_id : row.employee_id
      },
    },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  if (loading && list.length === 0) {
    return (
      <Card>
        <LoadingSpinner label="Loading recent attendance…" />
      </Card>
    )
  }
  if (error && list.length === 0) {
    return (
      <Card>
        <EmptyState
          variant="error"
          title="Couldn’t load attendance"
          message={error}
          action={<Button onClick={refetch}>Try again</Button>}
        />
      </Card>
    )
  }
  if (list.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="📅"
          title="No attendance records"
          message="Select an employee above or record new attendance."
          action={<Button onClick={openForm}>Record attendance</Button>}
        />
      </Card>
    )
  }
  return (
    <Table
      columns={allTableColumns}
      data={list.slice(0, 100)}
      emptyMessage="No records."
    />
  )
}
