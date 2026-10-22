import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import ApiErrorSetup from "./components/ApiErrorSetup";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";

function AppRoutes() {
  return (
    <>
      <ApiErrorSetup />

      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Main Application */}
        <Route
          path="/"
          element={<MainLayout />}
        >
          {/* Default route */}
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* Employees */}
          <Route
            path="employees"
            element={<Employees />}
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