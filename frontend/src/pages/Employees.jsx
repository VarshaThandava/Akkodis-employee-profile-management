import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useEmployees } from '../hooks/useEmployees'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import Table from '../components/Table'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'


const EXPORT_FIELDS = [
  { header: 'Full Name', key: 'full_name' },
  { header: 'Department', key: 'department' },
  { header: 'Current Role', key: 'current_role' },
  { header: 'Email ID', key: 'email' },
  { header: 'Skills', key: 'skills' },
  { header: 'Certification', key: 'certification' },
  { header: 'Education', key: 'education' },
  { header: 'Years of Experience', key: 'years_of_experience' },
  { header: 'Location', key: 'location' },
]

function getExportValue(employee, key) {
  const value = employee[key]

  if (value == null) return ''
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)

  return String(value)
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function exportEmployeesCSV(employees) {
  const escapeCSV = (value) =>
    `"${String(value).replace(/"/g, '""')}"`

  const rows = [
    EXPORT_FIELDS.map((field) => escapeCSV(field.header)),
    ...employees.map((employee) =>
      EXPORT_FIELDS.map((field) =>
        escapeCSV(getExportValue(employee, field.key))
      )
    ),
  ]

  // UTF-8 BOM helps Excel display international characters correctly.
  const csv = '\uFEFF' + rows.map((row) => row.join(',')).join('\r\n')

  downloadBlob(
    csv,
    'text/csv;charset=utf-8;',
    'employees.csv'
  )
}

function exportEmployeesPDF(employees) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  })

  doc.setFontSize(16)
  doc.text('Employee Report', 14, 15)

  doc.setFontSize(9)
  doc.text(`Total employees: ${employees.length}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [EXPORT_FIELDS.map((field) => field.header)],
    body: employees.map((employee) =>
      EXPORT_FIELDS.map((field) =>
        getExportValue(employee, field.key)
      )
    ),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [22, 84, 145],
    },
    margin: { left: 10, right: 10 },
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
  })

  doc.save('employees.pdf')
}

function validateEmail(value) {
  if (!value || !value.trim()) {
    return 'Email is required.'
  }

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!re.test(value.trim())) {
    return 'Enter a valid email address.'
  }

  return null
}

function validateRequired(value, fieldName) {
  if (!value || !String(value).trim()) {
    return `${fieldName} is required.`
  }

  return null
}

export default function Employees() {
  const { showSuccess } = useToast()

  const {
    employees: list,
    loading,
    error,
    refetch: loadEmployees,
  } = useEmployees()

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  })

  const [formErrors, setFormErrors] = useState({})

  function openCreate() {
    setEditingId(null)

    setForm({
      employee_id: '',
      full_name: '',
      email: '',
      department: '',
    })

    setFormErrors({})
    setShowForm(true)
  }

  function openEdit(emp) {
    setEditingId(emp.id)

    setForm({
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      email: emp.email,
      department: emp.department,
    })

    setFormErrors({})
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setFormErrors({})
  }

  function handleChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()

    const errors = {}

    const eId = validateRequired(
      form.employee_id,
      'Employee ID'
    )

    if (eId) {
      errors.employee_id = eId
    }

    const name = validateRequired(
      form.full_name,
      'Full name'
    )

    if (name) {
      errors.full_name = name
    }

    const email = validateEmail(form.email)

    if (email) {
      errors.email = email
    }

    const dept = validateRequired(
      form.department,
      'Department'
    )

    if (dept) {
      errors.department = dept
    }

    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setFormLoading(true)

    const payload = {
      employee_id: form.employee_id.trim(),
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
    }

    const promise = editingId
      ? updateEmployee(editingId, {
        full_name: payload.full_name,
        email: payload.email,
        department: payload.department,
      })
      : createEmployee(payload)

    promise
      .then(() => {
        closeForm()
        loadEmployees()

        showSuccess(
          editingId
            ? 'Employee updated successfully.'
            : 'Employee added successfully.'
        )
      })
      .catch((err) => {
        const detail =
          err.response?.data?.error?.detail

        if (detail) {
          setFormErrors((prev) => ({
            ...prev,
            _: detail,
          }))
        }
      })
      .finally(() => {
        setFormLoading(false)
      })
  }

  function handleDelete(emp) {
    if (
      !window.confirm(
        `Delete ${emp.full_name}? This cannot be undone.`
      )
    ) {
      return
    }

    deleteEmployee(emp.id)
      .then(() => {
        loadEmployees()

        showSuccess(
          'Employee deleted successfully.'
        )
      })
      .catch(() => { })
  }

  const searchText = search
    .trim()
    .toLowerCase()

  const filteredEmployees = list.filter((employee) => {
    if (!searchText) {
      return true
    }

    const employeeId = String(
      employee.employee_id || ''
    ).toLowerCase()

    const name = String(
      employee.full_name || ''
    ).toLowerCase()

    const email = String(
      employee.email || ''
    ).toLowerCase()

    const department = String(
      employee.department || ''
    ).toLowerCase()

    return (
      employeeId.includes(searchText) ||
      name.includes(searchText) ||
      email.includes(searchText) ||
      department.includes(searchText)
    )
  })

  const tableColumns = [
    {
      key: 'employee_id',
      label: 'Employee ID',
    },
    {
      key: 'full_name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'department',
      label: 'Department',
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-end',
      cellClassName: 'text-end',

      render: (row) => (
        <>
          <Button
            size="sm"
            variant="outline-primary"
            className="me-1"
            onClick={() => openEdit(row)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => handleDelete(row)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ]

  return (
    <div className="page-employees">

      <div className="page-header-row">
        <div>
          <h2 className="page-title mb-1">
            Employees
          </h2>

          <p className="text-muted mb-0">
            Manage and view employee information
          </p>
        </div>

        <div className="employee-header-actions">
          <div className="employee-export">
            <Button
              type="button"
              onClick={() => setExportOpen((open) => !open)}
              disabled={loading || list.length === 0}
            >
              Export Employee Details<span aria-hidden="true">▾</span>
            </Button>

            {exportOpen && (
              <div className="employee-export-menu">
                <button
                  type="button"
                  className="employee-export-item"
                  disabled={filteredEmployees.length === 0}
                  onClick={() => {
                    exportEmployeesCSV(filteredEmployees)
                    setExportOpen(false)
                  }}
                >
                  Export as CSV
                </button>

                <button
                  type="button"
                  className="employee-export-item"
                  disabled={filteredEmployees.length === 0}
                  onClick={() => {
                    exportEmployeesPDF(filteredEmployees)
                    setExportOpen(false)
                  }}
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          <Button onClick={openCreate}>Add employee</Button>
        </div>

      </div>


      <div className="mt-4 mb-4">
        <Input
          label="Search employees"
          name="search"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by employee ID, name, email or department"
        />
      </div>

      {showForm && (
        <Card
          title={
            editingId
              ? 'Edit employee'
              : 'New employee'
          }
          className="mb-4"
        >
          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="row g-3">

              <div className="col-md-6">
                <Input
                  label="Employee ID"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  error={formErrors.employee_id}
                  required
                  disabled={!!editingId}
                  placeholder="e.g. EMP001"
                />
              </div>

              <div className="col-md-6">
                <Input
                  label="Full name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  error={formErrors.full_name}
                  required
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="col-md-6">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={formErrors.email}
                  required
                  placeholder="e.g. jane@example.com"
                />
              </div>

              <div className="col-md-6">
                <Input
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  error={formErrors.department}
                  required
                  placeholder="e.g. Engineering"
                />
              </div>

            </div>

            {formErrors._ && (
              <div
                className="form-alert-error"
                role="alert"
              >
                {formErrors._}
              </div>
            )}

            <div className="d-flex gap-2 mt-3">

              <Button
                type="submit"
                loading={formLoading}
              >
                {editingId
                  ? 'Update'
                  : 'Create'}
              </Button>

              <Button
                type="button"
                variant="outline-secondary"
                onClick={closeForm}
              >
                Cancel
              </Button>

            </div>

          </form>
        </Card>
      )}

      {loading && list.length === 0 ? (

        <Card>
          <LoadingSpinner label="Loading employees…" />
        </Card>

      ) : error && list.length === 0 ? (

        <Card>
          <EmptyState
            variant="error"
            title="Couldn’t load employees"
            message={error}
            action={
              <Button onClick={loadEmployees}>
                Try again
              </Button>
            }
          />
        </Card>

      ) : list.length === 0 ? (

        <Card>
          <EmptyState
            icon="👥"
            title="No employees"
            message="No employee records are available."
            action={
              <Button onClick={openCreate}>
              </Button>
            }
          />
        </Card>

      ) : filteredEmployees.length === 0 ? (

        <Card>
          <EmptyState
            icon="🔍"
            title="No matching employees"
            message="Try searching with another employee ID, name, email or department."
          />
        </Card>

      ) : (

        <Table
          columns={tableColumns}
          data={filteredEmployees}
          emptyMessage="No employees found."
        />

      )}

    </div>
  )
}