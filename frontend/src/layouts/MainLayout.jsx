
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../components/Logo";

const getLoggedInUser = () => {
  try {
    const storedUser =
      localStorage.getItem("hrmsUser") ||
      sessionStorage.getItem("hrmsUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export default function MainLayout() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const user = getLoggedInUser();
  const navigate = useNavigate();

  const isAdmin = user?.role === "HR Admin";

  const navItems = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard", icon: "📊" },
        { to: "/employees", label: "Employees", icon: "👥" },
      ]
    : [
        {
          to: "/employee-dashboard",
          label: "Employee Dashboard",
          icon: "👤",
        },
      ];

  const handleLogout = () => {
    localStorage.removeItem("hrmsToken");
    localStorage.removeItem("hrmsUser");

    sessionStorage.removeItem("hrmsToken");
    sessionStorage.removeItem("hrmsUser");

    setIsAccountOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside
        className="sidebar"
        aria-label="Main navigation"
      >
        <nav className="sidebar-nav">

          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              <span
                className="sidebar-link-icon"
                aria-hidden="true"
              >
                {icon}
              </span>

              <span>{label}</span>
            </NavLink>
          ))}

        </nav>
      </aside>

      <div className="main-wrapper">

        <header className="top-header">

          <div className="top-header-brand">

            <Logo width={120} />

            <span className="top-header-title">
              Employee Profile Management
            </span>

          </div>

          <div className="account-menu">

            <button
              type="button"
              className="account-button"
              onClick={() => setIsAccountOpen((prev) => !prev)}
            >
              {isAdmin ? "Admin" : "Employee"} ▼
            </button>

            {isAccountOpen && (
              <div className="account-dropdown">

                <button
                  type="button"
                  className="btn btn-signout"
                  onClick={handleLogout}
                >
                  Sign out
                </button>

              </div>
            )}

          </div>

        </header>

        <main
          id="main-content"
          className="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}
