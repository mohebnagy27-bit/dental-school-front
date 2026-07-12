import React, { useState, useEffect } from 'react';
import { isValidEmail } from './data';

/**
 * AddDoctorModal
 * Modal dialog with a create-doctor form.
 * Manages its own form state; calls onSave(formData) on success.
 *
 * Props:
 *   open     - boolean
 *   onSave   - (form: { username, email, password }) => void
 *   onCancel - () => void
 */
export default function AddDoctorModal({ open, onSave, onCancel }) {
  const [form,    setForm]    = useState({ username: '', email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  /* Reset form every time the dialog opens */
  useEffect(() => {
    if (open) {
      setForm({ username: '', email: '', password: '' });
      setErrors({});
      setLoading(false);
      setShowPw(false);
    }
  }, [open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.username.trim())     e.username = 'Username is required.';
    if (!isValidEmail(form.email)) e.email    = 'Enter a valid email address.';
    if (!form.password.trim())     e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    onSave({ ...form });
  };

  return (
    <div
      className="stg-overlay"
      onClick={!loading ? onCancel : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stg-add-doctor-title"
    >
      <div className="stg-dialog stg-dialog--md" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="stg-dialog__header">
          <h2 className="stg-dialog__title" id="stg-add-doctor-title">Add New Doctor</h2>
          {!loading && (
            <button type="button" className="stg-dialog__close" onClick={onCancel} aria-label="Close">
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="stg-dialog__body">

          {/* Username */}
          <div className={`stg-field${errors.username ? ' stg-field--error' : ''}`}>
            <label className="stg-field__label" htmlFor="doc-username">
              Username <span aria-hidden="true">*</span>
            </label>
            <input
              id="doc-username"
              type="text"
              className="stg-input"
              value={form.username}
              onChange={handleChange('username')}
              placeholder="e.g. dr.ahmed"
              autoComplete="username"
              disabled={loading}
            />
            {errors.username && <span className="stg-field__error">{errors.username}</span>}
          </div>

          {/* Email */}
          <div className={`stg-field${errors.email ? ' stg-field--error' : ''}`}>
            <label className="stg-field__label" htmlFor="doc-email">
              Email Address <span aria-hidden="true">*</span>
            </label>
            <input
              id="doc-email"
              type="email"
              className="stg-input"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="doctor@dental.edu"
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && <span className="stg-field__error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={`stg-field${errors.password ? ' stg-field--error' : ''}`}>
            <label className="stg-field__label" htmlFor="doc-password">
              Password <span aria-hidden="true">*</span>
            </label>
            <div className="stg-input-wrap">
              <input
                id="doc-password"
                type={showPw ? 'text' : 'password'}
                className="stg-input stg-input--pw"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="stg-pw-toggle"
                onClick={() => setShowPw((p) => !p)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="stg-field__error">{errors.password}</span>}
          </div>
        </div>

        {/* Footer */}
        <div className="stg-dialog__footer">
          <button type="button" className="stg-btn stg-btn--ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="stg-btn stg-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><span className="stg-spinner" aria-hidden="true" /> Creating…</>
              : 'Create Doctor'}
          </button>
        </div>
      </div>
    </div>
  );
}