import { Outlet, NavLink } from 'react-router-dom'
import Logo from '../components/Logo'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/employees', label: 'Employees', icon: '👥' },
]

export default function MainLayout() {
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
                'sidebar-link' + (isActive ? ' active' : '')
              }
              aria-current={({ isActive }) =>
                isActive ? 'page' : undefined
              }
            >

              <span
                className="sidebar-link-icon"
                aria-hidden="true"
              >
                {icon}
              </span>

              <span>
                {label}
              </span>

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
  )
}