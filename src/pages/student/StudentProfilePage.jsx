import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import '../../styles/student/StudentProfilePage.css';

/* ================================================================
   MOCK DATA
   ================================================================ */

const MOCK_PROFILE = {
  name:     'Sarah Johnson',
  id:       'STU-20240001',
  year:     '3rd Year',
  email:    'sarah.johnson@dental.edu',
  phone:    '+20 100 123 4567',
  joinDate: 'September 2022',
};

const MOCK_STATS = {
  reserved:  4,
  active:    2,
  completed: 8,
};

const MOCK_RESERVED = [
  { id: 'r1', patient: 'Ahmed Hassan',  tooth: 16, diagnosis: 'Caries — Class II',  date: '2024-03-01' },
  { id: 'r2', patient: 'Fatima Malik',  tooth: 17, diagnosis: 'Remaining Root',     date: '2024-03-05' },
  { id: 'r3', patient: 'Omar Khalid',   tooth: 47, diagnosis: 'Caries — Class II',  date: '2024-03-08' },
  { id: 'r4', patient: 'Layla Ibrahim', tooth: 26, diagnosis: 'Extraction',         date: '2024-03-10' },
];

const MOCK_COMPLETED = [
  { id: 'c1', patient: 'Mohammed Ali', tooth: 36, diagnosis: 'Extraction',         date: '2024-02-14' },
  { id: 'c2', patient: 'Sara Ahmed',   tooth: 46, diagnosis: 'Remaining Root',     date: '2024-02-20' },
  { id: 'c3', patient: 'Ahmed Hassan', tooth: 11, diagnosis: 'Caries — Class IV',  date: '2024-02-28' },
  { id: 'c4', patient: 'Hana Youssef', tooth: 21, diagnosis: 'Caries — Class III', date: '2024-01-30' },
  { id: 'c5', patient: 'Karim Nasser', tooth: 14, diagnosis: 'Extraction',         date: '2024-01-22' },
];

/* ================================================================
   HELPERS
   ================================================================ */

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

/* ================================================================
   STAT CARD (inline — no external dependency on shared StatCard API)
   ================================================================ */

const ProfileStatCard = ({ label, value, color, icon }) => (
  <div className="sp-stat-card">
    <div className="sp-stat-card__icon" style={{ background: `${color}18`, color }} aria-hidden="true">
      {icon}
    </div>
    <div className="sp-stat-card__body">
      <span className="sp-stat-card__value" style={{ color }}>{value}</span>
      <span className="sp-stat-card__label">{label}</span>
    </div>
  </div>
);

/* ================================================================
   EDIT PROFILE DIALOG
   ================================================================ */

const EditProfileDialog = ({ open, initialValues, onSave, onCancel }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  /* Sync when dialog opens */
  useEffect(() => {
    if (open) setForm({ name: initialValues.name, phone: initialValues.phone, email: initialValues.email });
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const canSave = form.name.trim().length >= 2 && form.email.trim().includes('@');

  return (
    <div
      className="sp-dialog-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="sp-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sp-dialog__header">
          <h2 className="sp-dialog__title" id="edit-profile-title">Edit Profile</h2>
          <button
            type="button"
            className="sp-dialog__close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="sp-dialog__body">
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="edit-name">Full Name <span aria-hidden="true">*</span></label>
            <input
              id="edit-name"
              type="text"
              name="name"
              className="sp-input"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              autoComplete="name"
            />
          </div>

          <div className="sp-field">
            <label className="sp-field__label" htmlFor="edit-phone">Phone Number</label>
            <input
              id="edit-phone"
              type="tel"
              name="phone"
              className="sp-input"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +20 100 123 4567"
              autoComplete="tel"
              style={{ fontSize: 'max(16px, 0.875rem)' }}
            />
          </div>

          <div className="sp-field">
            <label className="sp-field__label" htmlFor="edit-email">Email Address <span aria-hidden="true">*</span></label>
            <input
              id="edit-email"
              type="email"
              name="email"
              className="sp-input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="sp-dialog__footer">
          <button type="button" className="sp-btn sp-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="sp-btn sp-btn--primary"
            onClick={() => onSave(form)}
            disabled={!canSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   TOAST NOTIFICATION
   ================================================================ */

const Toast = ({ msg, onClose }) => {
  if (!msg) return null;
  return (
    <div className="sp-toast" role="alert" aria-live="polite">
      <span className="sp-toast__icon" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="7" stroke="currentColor" />
          <path d="M4.5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="sp-toast__msg">{msg}</span>
      <button type="button" className="sp-toast__close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
};

/* ================================================================
   TABLE — reusable within this page
   ================================================================ */

const CasesTable = ({ rows, columns, emptyMsg }) => (
  <div className="sp-table-wrap">
    {rows.length === 0 ? (
      <p className="sp-table-empty">{emptyMsg}</p>
    ) : (
      <table className="sp-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="sp-table__th">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="sp-table__row">
              {columns.map((col) => (
                <td key={col.key} className="sp-table__td">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/* ================================================================
   TABLE COLUMN DEFINITIONS
   ================================================================ */

const RESERVED_COLS = [
  { key: 'patient',   label: 'Patient Name' },
  { key: 'tooth',     label: 'Tooth Number', render: (v) => <span className="sp-tooth-chip">Tooth {v}</span> },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'date',      label: 'Reservation Date', render: (v) => formatDate(v) },
];

const COMPLETED_COLS = [
  { key: 'patient',   label: 'Patient Name' },
  { key: 'tooth',     label: 'Tooth Number', render: (v) => <span className="sp-tooth-chip">Tooth {v}</span> },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'date',      label: 'Completion Date', render: (v) => formatDate(v) },
];

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function StudentProfilePage() {
  /* ── Sidebar ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add('sidebar-open');
    else             document.body.classList.remove('sidebar-open');
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  /* ── Profile state ── */
  const [profile,    setProfile]    = useState(MOCK_PROFILE);
  const [isEditing,  setIsEditing]  = useState(false);
  const [toastMsg,   setToastMsg]   = useState('');
  const toastTimer = React.useRef(null);

  /* ── Toast helper ── */
  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ── Edit save ── */
  const handleSave = (form) => {
    setProfile((prev) => ({ ...prev, name: form.name, phone: form.phone, email: form.email }));
    setIsEditing(false);
    showToast('Profile updated successfully.');
  };

  /* ── Stat icon SVGs ── */
  const icons = {
    reserved: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 5h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 3v4M13 3v4M3 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    active: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    completed: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="dashboard-content sp">

          {/* ══════════════════════════════════
              PROFILE HEADER
              ══════════════════════════════════ */}
          <section className="sp-profile-header">
            <div className="sp-profile-header__left">
              {/* Avatar */}
              <div className="sp-avatar" aria-hidden="true">
                {getInitials(profile.name)}
              </div>

              {/* Name + meta */}
              <div className="sp-profile-header__info">
                <h1 className="sp-profile-header__name">{profile.name}</h1>
                <div className="sp-profile-header__meta">
                  <span className="sp-meta-item">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M4 1.5v2M9 1.5v2M1.5 5.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {profile.id}
                  </span>
                  <span className="sp-meta-dot" aria-hidden="true">·</span>
                  <span className="sp-meta-item">{profile.year}</span>
                  <span className="sp-meta-dot" aria-hidden="true">·</span>
                  <span className="sp-meta-item">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <path d="M2 3.5C2 3.5 6.5 6.5 11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <rect x="1.5" y="2.5" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit button */}
            <button
              type="button"
              className="sp-btn sp-btn--outline"
              onClick={() => setIsEditing(true)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9.5 2L12 4.5M2 12l.5-2.5L10 2l2.5 2.5L4.5 12.5 2 13z"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Edit Profile
            </button>
          </section>

          {/* ══════════════════════════════════
              STATS
              ══════════════════════════════════ */}
          <div className="sp-stats-row">
            <ProfileStatCard
              label="Reserved Cases"
              value={MOCK_STATS.reserved}
              color="#F97316"
              icon={icons.reserved}
            />
            <ProfileStatCard
              label="Active Cases"
              value={MOCK_STATS.active}
              color="#1D6FD8"
              icon={icons.active}
            />
            <ProfileStatCard
              label="Completed Cases"
              value={MOCK_STATS.completed}
              color="#22C55E"
              icon={icons.completed}
            />
          </div>

          {/* ══════════════════════════════════
              PERSONAL INFORMATION
              ══════════════════════════════════ */}
          <section className="sp-section">
            <div className="sp-section__header">
              <h2 className="sp-section__title">Personal Information</h2>
            </div>
            <div className="sp-section__body">
              <dl className="sp-info-grid">
                <div className="sp-info-item">
                  <dt>Full Name</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div className="sp-info-item">
                  <dt>Student ID</dt>
                  <dd>
                    <span className="sp-id-chip">{profile.id}</span>
                  </dd>
                </div>
                <div className="sp-info-item">
                  <dt>Academic Year</dt>
                  <dd>{profile.year}</dd>
                </div>
                <div className="sp-info-item">
                  <dt>Phone Number</dt>
                  <dd>{profile.phone}</dd>
                </div>
                <div className="sp-info-item">
                  <dt>Email Address</dt>
                  <dd>
                    <a href={`mailto:${profile.email}`} className="sp-email-link">{profile.email}</a>
                  </dd>
                </div>
                <div className="sp-info-item">
                  <dt>Joined</dt>
                  <dd>{profile.joinDate}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* ══════════════════════════════════
              RECENT RESERVED CASES
              ══════════════════════════════════ */}
          <section className="sp-section">
            <div className="sp-section__header">
              <h2 className="sp-section__title">Recent Reserved Cases</h2>
              <span className="sp-section__badge sp-section__badge--reserved">
                {MOCK_RESERVED.length} cases
              </span>
            </div>
            <div className="sp-section__body sp-section__body--no-pad">
              <CasesTable
                rows={MOCK_RESERVED}
                columns={RESERVED_COLS}
                emptyMsg="No reserved cases yet."
              />
            </div>
          </section>

          {/* ══════════════════════════════════
              RECENT COMPLETED CASES
              ══════════════════════════════════ */}
          <section className="sp-section">
            <div className="sp-section__header">
              <h2 className="sp-section__title">Recent Completed Cases</h2>
              <span className="sp-section__badge sp-section__badge--completed">
                {MOCK_COMPLETED.length} cases
              </span>
            </div>
            <div className="sp-section__body sp-section__body--no-pad">
              <CasesTable
                rows={MOCK_COMPLETED}
                columns={COMPLETED_COLS}
                emptyMsg="No completed cases yet."
              />
            </div>
          </section>

        </main>
      </div>

      {/* ── Edit dialog ── */}
      <EditProfileDialog
        open={isEditing}
        initialValues={profile}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />

      {/* ── Toast ── */}
      <Toast msg={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}
