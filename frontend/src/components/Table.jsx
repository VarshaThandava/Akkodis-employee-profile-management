/**
 * Reusable table with configurable columns.
 * @param {Object} props
 * @param {Array<{ key: string, label: string, className?: string, render?: (row) => ReactNode }>} props.columns
 * @param {Array} props.data
 * @param {string} [props.emptyMessage] - Message when data is empty
 * @param {string} [props.className] - Optional class for the card wrapper
 */
function Table({ columns, data, emptyMessage = 'No records to display.', className = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className={'card ' + className}>
        <div className="card-body">
          <p className="empty-state-message mb-0 text-center py-5">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={'card ' + className}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.headerClassName || ''} scope="col">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.id != null ? row.id : rowIndex}>
                {columns.map((col) => (
                  <td key={col.key} className={col.cellClassName || ''}>
                    {col.render ? col.render(row) : row[col.key]}
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
