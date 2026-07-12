import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar  from '../components/dashboard/Topbar';

import ManagementAccordion from '../components/adminsettings/Managementaccordion';
import ManagementSection   from '../components/adminsettings/ManagementSection';
import StudentManagement   from '../components/adminsettings/StudentManagement';
import DoctorManagement    from '../components/adminsettings/DoctorManagement';
import Toast               from '../components/adminsettings/Toast';

import { MOCK_STUDENTS, MOCK_DOCTORS } from '../components/adminsettings/data';
import '../styles/SettingsPage.css';

/* ── Section icons (defined here so they don't re-create on each render) ── */

const StudentIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2L2 6l8 4 8-4-8-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M2 10l8 4 8-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 6v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const DoctorIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M14 13v4M12 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* ================================================================
   SETTINGS PAGE
   Owns only:
     - sidebar open/close
     - toast notification
     - shared status maps (studentStatuses, doctorStatuses)
     - memoized getStudent / getDoctor lookup helpers
   Everything else is delegated to child components.
   ================================================================ */

export default function SettingsPage() {
  /* ── Sidebar ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add('sidebar-open');
    else             document.body.classList.remove('sidebar-open');
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  /* ── Toast ── */
  const [toast,    setToast] = useState(null);
  const toastTimer           = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ── Shared status maps ──
     Live overrides applied on top of mock base data.
     Passed down as setter functions so individual cards can update them.
     getStudent / getDoctor are memoized — their identity changes only when
     the corresponding status map changes, which re-triggers child useEffects
     that depend on them (keeping preview cards in sync after an action). ── */
  const [studentStatuses, setStudentStatuses] = useState({});
  const [doctorStatuses,  setDoctorStatuses]  = useState({});

  const getStudent = useCallback((id) => {
    const base = MOCK_STUDENTS[id];
    if (!base) return null;
    return { ...base, status: studentStatuses[id] ?? base.status };
  }, [studentStatuses]);

  const getDoctor = useCallback((id) => {
    const base = MOCK_DOCTORS[id];
    if (!base) return null;
    return { ...base, status: doctorStatuses[id] ?? base.status };
  }, [doctorStatuses]);

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="dashboard-content stg-page">

          {/* Page header */}
          <div className="stg-page-header">
            <div>
              <h1 className="stg-page-title">Settings</h1>
              <p className="stg-page-subtitle">Manage students, doctors, and system configuration.</p>
            </div>
            <div className="stg-page-header__badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 4v3.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Admin Panel
            </div>
          </div>

          {/* Accordion — only one section open at a time, both collapsed by default */}
          <ManagementAccordion>
            <ManagementSection sectionId="student" icon={StudentIcon} title="Student Management">
              <StudentManagement
                getStudent={getStudent}
                setStudentStatuses={setStudentStatuses}
                showToast={showToast}
              />
            </ManagementSection>

            <ManagementSection sectionId="doctor" icon={DoctorIcon} title="Doctor Management">
              <DoctorManagement
                getDoctor={getDoctor}
                setDoctorStatuses={setDoctorStatuses}
                showToast={showToast}
              />
            </ManagementSection>
          </ManagementAccordion>

          {/* Hint bar */}
          <div className="stg-hint-bar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span>
              Try mock IDs: <strong>STU-20240001</strong> through <strong>STU-20240005</strong> for students,
              and <strong>DOC-001</strong> through <strong>DOC-003</strong> for doctors.
            </span>
          </div>

        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}