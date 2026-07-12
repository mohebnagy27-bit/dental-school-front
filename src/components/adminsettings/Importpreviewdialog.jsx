import React from 'react';
import ProgressBar from './ProgressBar';

export default function ImportPreviewDialog({
  open,
  fileName,
  rows,
  loading,
  progress,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const valid   = rows.filter((r) => r.valid).length;
  const invalid = rows.length - valid;

  return (
    <div
      className="stg-overlay"
      onClick={!loading ? onCancel : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stg-import-title"
    >
      <div className="stg-dialog stg-dialog--lg" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="stg-dialog__header">
          <h2 className="stg-dialog__title" id="stg-import-title">Import Preview</h2>
          {!loading && (
            <button type="button" className="stg-dialog__close" onClick={onCancel} aria-label="Close">
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="stg-dialog__body">

          {/* Stats row */}
          <div className="stg-import-stats">
            <div className="stg-import-stat">
              <span className="stg-import-stat__label">File</span>
              <span className="stg-import-stat__value stg-import-stat__value--file">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 2h6l3 3v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {fileName}
              </span>
            </div>
            <div className="stg-import-stat">
              <span className="stg-import-stat__label">Total Records</span>
              <span className="stg-import-stat__value">{rows.length}</span>
            </div>
            <div className="stg-import-stat stg-import-stat--valid">
              <span className="stg-import-stat__label">Valid</span>
              <span className="stg-import-stat__value">{valid}</span>
            </div>
            <div className="stg-import-stat stg-import-stat--invalid">
              <span className="stg-import-stat__label">Invalid</span>
              <span className="stg-import-stat__value">{invalid}</span>
            </div>
          </div>

          {/* Preview table */}
          <div className="stg-table-wrap">
            <table className="stg-table">
              <thead>
                <tr>
                  <th className="stg-table__th">Row</th>
                  <th className="stg-table__th">Name</th>
                  <th className="stg-table__th">Student ID</th>
                  <th className="stg-table__th">Year</th>
                  <th className="stg-table__th">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.row}
                    className={`stg-table__row${r.valid ? '' : ' stg-table__row--invalid'}`}
                  >
                    <td className="stg-table__td stg-table__td--muted">#{r.row}</td>
                    <td className="stg-table__td">
                      {r.name || <span className="stg-empty-cell">Missing</span>}
                    </td>
                    <td className="stg-table__td">
                      {r.id || <span className="stg-empty-cell">Missing</span>}
                    </td>
                    <td className="stg-table__td">{r.year}</td>
                    <td className="stg-table__td">
                      {r.valid
                        ? <span className="stg-badge stg-badge--active">Valid</span>
                        : <span className="stg-badge stg-badge--inactive">Invalid</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Progress bar (shown during loading) */}
          {loading && (
            <div className="stg-import-progress">
              <p className="stg-import-progress__label">Processing…</p>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="stg-dialog__footer">
          <button
            type="button"
            className="stg-btn stg-btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="stg-btn stg-btn--primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? <><span className="stg-spinner" aria-hidden="true" /> Processing…</>
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}