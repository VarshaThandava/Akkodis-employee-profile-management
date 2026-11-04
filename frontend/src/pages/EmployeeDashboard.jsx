
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getMyEmployeeProfile,
  updateEmployee,
} from "../services/api";

// Employee fields used for CSV and PDF exports.
const EXPORT_FIELDS = [
  { header: "Full Name", key: "full_name" },
  { header: "Email ID", key: "email" },
  { header: "Department", key: "department" },
  { header: "Current Role", key: "current_role" },
  { header: "Years of Experience", key: "years_of_experience" },
  { header: "Location", key: "location" },
];

// Get formatted employee field values.
function getExportValue(employee, key) {
  const value = employee[key];

  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);

  return String(value);
}

// Download CSV file.
function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// Export individual employee details as CSV.
function exportEmployeeCSV(employee) {
  const escapeCSV = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const rows = [
    EXPORT_FIELDS.map((field) => escapeCSV(field.header)),
    EXPORT_FIELDS.map((field) =>
      escapeCSV(getExportValue(employee, field.key))
    ),
  ];

  // UTF-8 BOM supports international characters in Excel.
  const csv =
    "\uFEFF" + rows.map((row) => row.join(",")).join("\r\n");

  downloadBlob(
    csv,
    "text/csv;charset=utf-8;",
    `employee_${employee.employee_id}.csv`
  );
}

// Export individual employee details as PDF.
function exportEmployeePDF(employee) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(16);
  doc.text("Employee Profile", 14, 15);

  doc.setFontSize(10);
  doc.text(`Employee ID: ${employee.employee_id}`, 14, 23);

  autoTable(doc, {
    head: [EXPORT_FIELDS.map((field) => field.header)],
    body: [
      EXPORT_FIELDS.map((field) =>
        getExportValue(employee, field.key)
      ),
    ],
    startY: 30,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fontStyle: "bold",
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
    },
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  });

  doc.save(`employee_${employee.employee_id}.pdf`);
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [formData, setFormData] = useState({});

  // Load logged-in employee profile.
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUser =
        localStorage.getItem("hrmsUser") ||
        sessionStorage.getItem("hrmsUser");

      if (!storedUser) {
        setError("Please log in again.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user.employee_id) {
        setError("Employee ID not found. Please log in again.");
        return;
      }

      const response = await getMyEmployeeProfile(user.employee_id);

      setEmployee(response.data);
      setFormData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your employee profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle profile form changes.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enable profile editing.
  const handleEdit = () => {
    setFormData({ ...employee });
    setSuccess("");
    setError("");
    setExportOpen(false);
    setIsEditing(true);
  };

  // Cancel profile editing.
  const handleCancel = () => {
    setFormData({ ...employee });
    setIsEditing(false);
    setError("");
  };

  // Save updated employee details.
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateEmployee(employee.id, {
        full_name: formData.full_name,
        email: formData.email,
        department: formData.department,
        current_role: formData.current_role || null,
        years_of_experience:
          formData.years_of_experience === "" ||
          formData.years_of_experience == null
            ? null
            : Number(formData.years_of_experience),
        location: formData.location || null,
      });

      setEmployee(response.data);
      setFormData(response.data);

      setIsEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading state.
  if (loading) {
    return (
      <div className="employee-loading">
        Loading your profile...
      </div>
    );
  }

  // Error state when employee profile is unavailable.
  if (error && !employee) {
    return (
      <div className="employee-alert employee-alert-error">
        {error}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-loading">
        Employee profile not found.
      </div>
    );
  }

  return (
    <div className="employee-dashboard">

      {/* Dashboard Heading */}
      <div className="employee-dashboard-heading">
        <div>
          <span className="employee-eyebrow">
            MY WORKSPACE
          </span>

          <h1>Employee Dashboard</h1>

          <p>
            View and manage your employee profile.
          </p>
        </div>

        {!isEditing && (
          <div className="employee-header-actions">

            {/* Export Dropdown */}
            <div className="employee-export">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() =>
                  setExportOpen((open) => !open)
                }
                aria-expanded={exportOpen}
              >
                Export Profile <span aria-hidden="true">▾</span>
              </button>

              {exportOpen && (
                <div className="employee-export-menu">
                  <button
                    type="button"
                    className="employee-export-item"
                    onClick={() => {
                      exportEmployeeCSV(employee);
                      setExportOpen(false);
                    }}
                  >
                    Export as CSV
                  </button>

                  <button
                    type="button"
                    className="employee-export-item"
                    onClick={() => {
                      exportEmployeePDF(employee);
                      setExportOpen(false);
                    }}
                  >
                    Export as PDF
                  </button>
                </div>
              )}
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              className="employee-edit-btn"
              onClick={handleEdit}
            >
              Edit Profile
            </button>

          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="employee-alert employee-alert-success">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="employee-alert employee-alert-error">
          {error}
        </div>
      )}

      {/* Employee Profile Banner */}
      <div className="employee-profile-banner">
        <div className="employee-avatar">
          {employee.full_name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="employee-banner-info">
          <h2>{employee.full_name}</h2>

          <p>
            {employee.current_role || "Employee"}
          </p>

          <span>{employee.department}</span>
        </div>

        <div className="employee-banner-id">
          <span>EMPLOYEE ID</span>
          <strong>{employee.employee_id}</strong>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing ? (
        <form
          className="employee-card"
          onSubmit={handleSave}
        >
          <div className="employee-card-heading">
            <div>
              <h2>Edit Personal Profile</h2>

              <p>
                Update your employee information below.
              </p>
            </div>
          </div>

          <div className="employee-form-grid">

            <div className="employee-field">
              <label htmlFor="full_name">Full Name</label>

              <input
                id="full_name"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="employee-field">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="employee-field">
              <label htmlFor="department">Department</label>

              <input
                id="department"
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="employee-field">
              <label htmlFor="current_role">Current Role</label>

              <input
                id="current_role"
                name="current_role"
                value={formData.current_role || ""}
                onChange={handleChange}
              />
            </div>

            <div className="employee-field">
              <label htmlFor="years_of_experience">
                Years of Experience
              </label>

              <input
                id="years_of_experience"
                type="number"
                min="0"
                step="0.1"
                name="years_of_experience"
                value={formData.years_of_experience ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="employee-field">
              <label htmlFor="location">Location</label>

              <input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="employee-form-actions">
            <button
              type="button"
              className="employee-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="employee-edit-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (

        /* Employee Profile Details */
        <div className="employee-card">

          <div className="employee-card-heading">
            <div>
              <h2>Personal Information</h2>

              <p>
                Your registered employee details.
              </p>
            </div>

            <span className="employee-status">
              Active Profile
            </span>
          </div>

          <div className="employee-details-grid">

            <div className="employee-detail">
              <span>Full Name</span>
              <strong>{employee.full_name}</strong>
            </div>

            <div className="employee-detail">
              <span>Email Address</span>
              <strong>{employee.email}</strong>
            </div>

            <div className="employee-detail">
              <span>Employee ID</span>
              <strong>{employee.employee_id}</strong>
            </div>

            <div className="employee-detail">
              <span>Department</span>
              <strong>{employee.department}</strong>
            </div>

            <div className="employee-detail">
              <span>Current Role</span>
              <strong>
                {employee.current_role || "Not specified"}
              </strong>
            </div>

            <div className="employee-detail">
              <span>Experience</span>
              <strong>
                {employee.years_of_experience != null
                  ? `${employee.years_of_experience} years`
                  : "Not specified"}
              </strong>
            </div>

            <div className="employee-detail">
              <span>Location</span>
              <strong>
                {employee.location || "Not specified"}
              </strong>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
