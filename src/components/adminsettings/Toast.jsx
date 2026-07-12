import React from 'react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`stg-toast stg-toast--${toast.type}`} role="alert" aria-live="polite">
      <span className="stg-toast__icon" aria-hidden="true">
        {toast.type === 'success' ? (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4.5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7.5 4.5v4M7.5 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span className="stg-toast__msg">{toast.msg}</span>
      <button type="button" className="stg-toast__close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}