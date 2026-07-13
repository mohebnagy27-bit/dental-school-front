import '../../styles/RecentTable.css';

export default function RecentTable({ title, columns, rows, emptyMessage = 'No data available.', onRowClick }) {
  return (
    <div className="recent-table">
      {title && <h3 className="recent-table__title">{title}</h3>}
      <div className="recent-table__scroll">
        <table className="recent-table__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="recent-table__th">{col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} className="recent-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={`recent-table__row${onRowClick ? ' recent-table__row--clickable' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  } : undefined}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                >
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
