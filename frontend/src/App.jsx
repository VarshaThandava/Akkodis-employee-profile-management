
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import ApiErrorSetup from "./components/ApiErrorSetup";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDashboard from "./pages/EmployeeDashboard";

// Read the logged-in user from browser storage.
function getLoggedInUser() {
  try {
    const storedUser =
      localStorage.getItem("hrmsUser") ||
      sessionStorage.getItem("hrmsUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

// Protect routes based on authentication and role.
function ProtectedRoute({ allowedRole, children }) {
  const user = getLoggedInUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={
          user.role === "HR Admin"
            ? "/dashboard"
            : "/employee-dashboard"
        }
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  return (
    <>
      <ApiErrorSetup />

      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected application layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default route */}
          <Route
            index
            element={
              <Navigate
                to={
                  getLoggedInUser()?.role === "HR Admin"
                    ? "/dashboard"
                    : "/employee-dashboard"
                }
                replace
              />
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRole="HR Admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Employees */}
          <Route
            path="employees"
            element={
              <ProtectedRoute allowedRole="HR Admin">
                <Employees />
              </ProtectedRoute>
            }
          />

          {/* Employee Dashboard */}
          <Route
            path="employee-dashboard"
            element={
              <ProtectedRoute allowedRole="Employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Unknown URL */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
