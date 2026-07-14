import React from 'react';

export default function ImportPreviewDialog({
  open,
  fileName,
  loading,
  confirmLabel,
  description,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

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

          {/* Selected file */}
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
          </div>
          <p className="stg-dialog__msg">{description}</p>
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
