
import { useState } from 'react'

function Table({
  columns,
  data,
  emptyMessage = 'No records to display.',
  className = '',
}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  })

  function handleSort(column) {
    if (column.sortable === false) return

    setSortConfig((previous) => ({
      key: column.key,
      direction:
        previous.key === column.key && previous.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  const sortedData = [...(data || [])].sort((a, b) => {
    const { key, direction } = sortConfig

    if (!key) return 0

    const aValue = a[key]
    const bValue = b[key]

    const aMissing = aValue == null || aValue === ''
    const bMissing = bValue == null || bValue === ''

    if (aMissing && bMissing) return 0
    if (aMissing) return 1
    if (bMissing) return -1

    let comparison

    if (key === 'years_of_experience') {
      comparison = Number(aValue) - Number(bValue)
    } else {
      comparison = String(aValue).localeCompare(
        String(bValue),
        undefined,
        { numeric: true, sensitivity: 'base' }
      )
    }

    return direction === 'asc' ? comparison : -comparison
  })

  if (!data || data.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="card-body">
          <p className="empty-state-message mb-0 text-center py-5">
            {emptyMessage}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((column) => {
                const isSorted = sortConfig.key === column.key

                return (
                  <th
                    key={column.key}
                    className={column.headerClassName || ''}
                    style={column.headerStyle}
                    scope="col"
                  >
                    {column.sortable === false ? (
                      column.label
                    ) : (
                      <button
                        type="button"
                        className="btn btn-link p-0 text-reset text-decoration-none fw-semibold"
                        onClick={() => handleSort(column)}
                        aria-label={`Sort by ${column.label}`}
                        aria-sort={
                          isSorted
                            ? sortConfig.direction === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                      >
                        {column.label}{' '}
                        <span aria-hidden="true">
                          {isSorted
                            ? sortConfig.direction === 'asc'
                              ? '▲'
                              : '▼'
                            : '↕'}
                        </span>
                      </button>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.cellClassName || ''}
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
