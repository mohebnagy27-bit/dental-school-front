import React from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  detail,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="stg-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stg-confirm-title"
    >
      <div className="stg-dialog stg-dialog--sm" onClick={(e) => e.stopPropagation()}>
        <div className="stg-dialog__header">
          <h2 className="stg-dialog__title" id="stg-confirm-title">{title}</h2>
        </div>

        <div className="stg-dialog__body">
          <p className="stg-dialog__msg">{message}</p>
          {detail && <div className="stg-dialog__detail">{detail}</div>}
        </div>

        <div className="stg-dialog__footer">
          <button type="button" className="stg-btn stg-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`stg-btn stg-btn--${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}