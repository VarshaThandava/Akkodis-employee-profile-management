
import { useState } from 'react'
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

  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
    current_role: '',
    years_of_experience: '',
    location: '',
  })

  const [formErrors, setFormErrors] = useState({})

  function openCreate() {
    setEditingId(null)

    setForm({
      employee_id: '',
      full_name: '',
      email: '',
      department: '',
      current_role: '',
      years_of_experience: '',
      location: '',
    })

    setFormErrors({})
    setShowForm(true)
  }

  function openEdit(emp) {
    setEditingId(emp.id)

    setForm({
      employee_id: emp.employee_id || '',
      full_name: emp.full_name || '',
      email: emp.email || '',
      department: emp.department || '',
      current_role: emp.current_role || '',
      years_of_experience: emp.years_of_experience ?? '',
      location: emp.location || '',
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

    const employeeIdError = validateRequired(
      form.employee_id,
      'Employee ID'
    )

    if (employeeIdError) {
      errors.employee_id = employeeIdError
    }

    const nameError = validateRequired(
      form.full_name,
      'Full name'
    )

    if (nameError) {
      errors.full_name = nameError
    }

    const emailError = validateEmail(form.email)

    if (emailError) {
      errors.email = emailError
    }

    const departmentError = validateRequired(
      form.department,
      'Department'
    )

    if (departmentError) {
      errors.department = departmentError
    }

    const experience =
      form.years_of_experience === ''
        ? null
        : Number(form.years_of_experience)

    if (
      experience !== null &&
      (!Number.isFinite(experience) || experience < 0)
    ) {
      errors.years_of_experience =
        'Experience must be a non-negative number.'
    }

    if (Object.keys(errors).length > 0) {
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
      current_role: form.current_role.trim() || null,
      years_of_experience: experience,
      location: form.location.trim() || null,
    }

    const promise = editingId
      ? updateEmployee(editingId, {
          full_name: payload.full_name,
          email: payload.email,
          department: payload.department,
          current_role: payload.current_role,
          years_of_experience: payload.years_of_experience,
          location: payload.location,
        })
      : createEmployee(payload)

    promise
      .then(() => {
        const wasEditing = editingId !== null

        closeForm()
        loadEmployees()

        showSuccess(
          wasEditing
            ? 'Employee updated successfully.'
            : 'Employee added successfully.'
        )
      })
      .catch((err) => {
        const detail =
          err.response?.data?.error?.detail ||
          err.response?.data?.detail

        if (detail) {
          setFormErrors((prev) => ({
            ...prev,
            _: typeof detail === 'string'
              ? detail
              : JSON.stringify(detail),
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
        showSuccess('Employee deleted successfully.')
      })
      .catch(() => {})
  }

  // Search across all employee fields, including the new fields.
  const searchText = search.trim().toLowerCase()

  const searchableFields = [
    'employee_id',
    'full_name',
    'email',
    'department',
    'current_role',
    'years_of_experience',
    'location',
  ]

  const filteredEmployees = list.filter((employee) => {
    if (!searchText) {
      return true
    }

    return searchableFields.some((field) =>
      String(employee[field] ?? '')
        .toLowerCase()
        .includes(searchText)
    )
  })

  // Table sorting is handled by the reusable Table component.
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
      key: 'current_role',
      label: 'Current Role',
    },
    {
      key: 'years_of_experience',
      label: 'Years of Experience',
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      headerClassName: ' fw-semibold',
       headerStyle: { fontSize: '1rem', fontWeight: 600 },
      cellClassName: 'text-end',
      render: (row) => (
  <div className="d-flex justify-content-end align-items-center gap-2">
    <Button
      size="sm"
      variant="outline-primary"
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
  </div>
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

        <Button onClick={openCreate}>
          Add employee
        </Button>
      </div>

      <div className="mt-4 mb-4">
        <Input
          label="Search employees"
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, name, email, department, role, experience or location"
        />
      </div>

      {showForm && (
        <Card
          title={editingId ? 'Edit employee' : 'New employee'}
          className="mb-4"
        >
          <form onSubmit={handleSubmit} noValidate>
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

              <div className="col-md-6">
                <Input
                  label="Current Role"
                  name="current_role"
                  value={form.current_role}
                  onChange={handleChange}
                  placeholder="e.g. QA Engineer"
                />
              </div>

              <div className="col-md-6">
                <Input
                  label="Years of Experience"
                  name="years_of_experience"
                  type="number"
                  value={form.years_of_experience}
                  onChange={handleChange}
                  error={formErrors.years_of_experience}
                  placeholder="e.g. 5"
                />
              </div>

              <div className="col-md-6">
                <Input
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                />
              </div>
            </div>

            {formErrors._ && (
              <div className="form-alert-error" role="alert">
                {formErrors._}
              </div>
            )}

            <div className="d-flex gap-2 mt-3">
              <Button
                type="submit"
                loading={formLoading}
              >
                {editingId ? 'Update' : 'Create'}
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
                Add employee
              </Button>
            }
          />
        </Card>
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <EmptyState
            icon="🔍"
            title="No matching employees"
            message="Try searching by employee ID, name, email, department, role, experience or location."
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
