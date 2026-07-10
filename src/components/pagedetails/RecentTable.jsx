import '../../styles/pagedetails/RecentTable.css';

export default function RecentTable({
  title,
  columns,
  rows,
  emptyMessage = 'No data available.',
  loading = false,
  loadingRows = 5,
}) {
  return (
    <div className="recent-table">
      {title && <h3 className="recent-table__title">{title}</h3>}
      <div className="recent-table__scroll">
        <table className="recent-table__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="recent-table__th">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="recent-table__row">
                  {columns.map((col) => (
                    <td key={col.key} className="recent-table__td">
                      <span className="skeleton-bar" style={{ width: `${60 + ((i * 7 + col.key.length * 5) % 30)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="recent-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="recent-table__row">
                  {columns.map((col) => (
                    <td key={col.key} className="recent-table__td">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
