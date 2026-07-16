import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import {
  getCompletedCases,
  getReservedCases,
  updateStudentProfile,
} from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { getResponseList } from '../../lib/studentData';
import '../../styles/student/StudentProfilePage.css';

const normalizeProfile = (student, studentId) => ({
  id: student?.id || student?.studentId || studentId || '',
  name: student?.name || student?.fullName || '',
  phone: student?.phone || student?.phoneNumber || '',
  academicYear: student?.academicYear || student?.year || '',
  collegeName: student?.collegeName || '',
});

const getInitials = (name = '') => name
  .split(' ')
  .filter(Boolean)
  .map((part) => part[0])
  .join('')
  .toUpperCase()
  .slice(0, 2);

const formatValue = (value) => {
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
};

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

const EditProfileDialog = ({ open, initialValues, onSave, onCancel, isSaving }) => {
  const [academicYear, setAcademicYear] = useState('');

  /* Sync when dialog opens */
  useEffect(() => {
    if (open) {
      setAcademicYear(initialValues.academicYear || '');
    }
  }, [open, initialValues]);

  if (!open) return null;

  const canSave = Boolean(academicYear);

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
            <label className="sp-field__label" htmlFor="edit-academic-year">Academic Year <span aria-hidden="true">*</span></label>
            <select
              id="edit-academic-year"
              className="sp-input"
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
            >
              <option value="" disabled>Select academic year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
            </select>
          </div>
        </div>

        <div className="sp-dialog__footer">
          <button type="button" className="sp-btn sp-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="sp-btn sp-btn--primary"
            onClick={() => onSave(academicYear)}
            disabled={!canSave || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
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
   MAIN PAGE
   ================================================================ */

export default function StudentProfilePage() {
  /* ── Sidebar ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, updateUser } = useAuth();
  const studentId = user?.id || localStorage.getItem('userId');
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add('sidebar-open');
    else             document.body.classList.remove('sidebar-open');
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  const [isEditing,  setIsEditing]  = useState(false);
  const [toastMsg,   setToastMsg]   = useState('');
  const toastTimer = React.useRef(null);

  const { data: reservedCasesResponse } = useQuery({
    queryKey: ['student-reserved-cases', studentId],
    queryFn: () => getReservedCases(studentId),
    enabled: Boolean(studentId),
  });
  const { data: completedCasesResponse } = useQuery({
    queryKey: ['student-completed-cases', studentId],
    queryFn: () => getCompletedCases(studentId),
    enabled: Boolean(studentId),
  });
  const updateProfileMutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: (_, academicYear) => {
      updateUser({ academicYear });
      setIsEditing(false);
      showToast('Profile updated successfully.');
    },
    onError: (error) => {
      showToast(error.response?.data?.message || error.userMessage || 'Unable to update the profile. Please try again.');
    },
  });

  const profile = normalizeProfile(user, studentId);
  const reservedCases = getResponseList(reservedCasesResponse);
  const completedCases = getResponseList(completedCasesResponse);

  /* ── Toast helper ── */
  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ── Edit save ── */
  const handleSave = (academicYear) => {
    updateProfileMutation.mutate(academicYear);
  };

  /* ── Stat icon SVGs ── */
  const icons = {
    reserved: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 5h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 3v4M13 3v4M3 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
      <Sidebar role='student' isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="dashboard-main">
        <Topbar
          pageTitle="Student Profile"
          user={{ name: profile.name, id: profile.id, initials: getInitials(profile.name) }}
          onMenuClick={() => setSidebarOpen(true)}
        />

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
                    {formatValue(profile.id)}
                  </span>
                  <span className="sp-meta-dot" aria-hidden="true">·</span>
                  <span className="sp-meta-item">{formatValue(profile.academicYear)}</span>
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
              value={reservedCases.length}
              color="#F97316"
              icon={icons.reserved}
            />
            <ProfileStatCard
              label="Completed Cases"
              value={completedCases.length}
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
                  <dd>{formatValue(profile.name)}</dd>
                </div>
                <div className="sp-info-item">
                  <dt>Student ID</dt>
                  <dd><span className="sp-id-chip">{formatValue(profile.id)}</span></dd>
                </div>
                <div className="sp-info-item">
                  <dt>Academic Year</dt>
                  <dd>{formatValue(profile.academicYear)}</dd>
                </div>
                <div className="sp-info-item">
                  <dt>College/Faculty Name</dt>
                  <dd>{formatValue(profile.collegeName)}</dd>
                </div>
                <div className="sp-info-item">
                  <dt>Phone Number</dt>
                  <dd>{formatValue(profile.phone)}</dd>
                </div>
              </dl>
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
        isSaving={updateProfileMutation.isPending}
      />

      {/* ── Toast ── */}
      <Toast msg={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}
