import { Link } from 'react-router-dom'
import { useDashboardStats } from '../hooks/useDashboardStats'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Card from '../components/Card'
import Button from '../components/Button'

export default function Dashboard() {
  const { stats, loading, error, refetch } = useDashboardStats()

  if (loading) {
    return (
      <Card>
        <LoadingSpinner label="Loading dashboard…" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <EmptyState
          variant="error"
          title="Couldn’t load dashboard"
          message={error}
          action={
            <Button onClick={refetch}>
              Try again
            </Button>
          }
        />
      </Card>
    )
  }

  const isEmpty = stats.employees === 0

  return (
    <div className="page-dashboard">
      <h2 className="page-title">
        Dashboard
      </h2>

      <p className="text-muted mb-4">
        Manage and view employee information
      </p>

      <div className="row g-4">
        <div className="col-sm-6 col-lg-4">
          <div className="stat-card">

            <p className="stat-card-label">
              Total employees-98
            </p>

            <p className="stat-card-value">
              {stats.employees}
            </p>

            <Link
              to="/employees"
              className="stat-card-link"
            >
              Manage employees →
            </Link>

          </div>
        </div>
      </div>

      {isEmpty && (
        <Card className="mt-4">
          <EmptyState
            icon="📋"
            title="No employees yet"
            message="Add employees to see employee information here."
            action={
              <Link to="/employees">
                <Button>
                  Add first employee
                </Button>
              </Link>
            }
          />
        </Card>
      )}
    </div>
  )
}