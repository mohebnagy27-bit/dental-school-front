import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar  from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';

import ManagementAccordion from '../components/adminsettings/Managementaccordion';
import ManagementSection   from '../components/adminsettings/ManagementSection';
import StudentManagement   from '../components/adminsettings/StudentManagement';
import DoctorManagement    from '../components/adminsettings/DoctorManagement';
import Toast               from '../components/adminsettings/Toast';

import {
  addDoctor,
  bulkDeactivateStudents,
  deactivateDoctor,
  deactivateStudent,
  reactivateDoctor,
  reactivateStudent,
  uploadStudents,
} from '../services/adminService';
import { getDashboardStatistics } from '../services/managementService';
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

const StatIcons = {
  students: StudentIcon,
  doctors: DoctorIcon,
};

function getDashboardData(response) {
  const data = response?.data ?? response ?? {};
  return data.dashboard ?? data.statistics ?? data.stats ?? data;
}

function getStatValue(data, group, state) {
  const directKeys = {
    students: {
      total: ['totalStudents', 'studentsCount', 'studentCount'],
      active: ['activeStudents', 'activeStudentsCount'],
      inactive: ['inactiveStudents', 'inactiveStudentsCount', 'disabledStudents'],
    },
    doctors: {
      total: ['totalDoctors', 'doctorsCount', 'doctorCount'],
      active: ['activeDoctors', 'activeDoctorsCount'],
      inactive: ['inactiveDoctors', 'inactiveDoctorsCount', 'disabledDoctors'],
    },
  };
  const nested = data?.[group] ?? data?.[`${group}Statistics`] ?? data?.[`${group}Stats`];
  const candidates = [
    ...directKeys[group][state].map((key) => data?.[key]),
    nested?.[state],
    nested?.[`${state}Count`],
    state === 'total' ? nested?.count : undefined,
  ];
  const value = candidates.find((candidate) => Number.isFinite(Number(candidate)));
  return value === undefined ? '—' : Number(value);
}

function getResponseMessage(response, fallback) {
  return response?.message || response?.data?.message || fallback;
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.userMessage || 'Unable to complete the request. Please try again.';
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
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

  const { data: dashboardResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ['management-dashboard'],
    queryFn: getDashboardStatistics,
  });
  const refreshStatistics = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['management-dashboard'] });
  }, [queryClient]);

  const uploadStudentsMutation = useMutation({ mutationFn: uploadStudents, onSuccess: refreshStatistics });
  const bulkDeactivateMutation = useMutation({ mutationFn: bulkDeactivateStudents, onSuccess: refreshStatistics });
  const addDoctorMutation = useMutation({ mutationFn: addDoctor, onSuccess: refreshStatistics });
  const deactivateStudentMutation = useMutation({ mutationFn: deactivateStudent, onSuccess: refreshStatistics });
  const reactivateStudentMutation = useMutation({ mutationFn: reactivateStudent, onSuccess: refreshStatistics });
  const deactivateDoctorMutation = useMutation({ mutationFn: deactivateDoctor, onSuccess: refreshStatistics });
  const reactivateDoctorMutation = useMutation({ mutationFn: reactivateDoctor, onSuccess: refreshStatistics });

  const dashboardStatistics = useMemo(() => getDashboardData(dashboardResponse), [dashboardResponse]);
  const statistics = useMemo(() => ({
    totalStudents: getStatValue(dashboardStatistics, 'students', 'total'),
    activeStudents: getStatValue(dashboardStatistics, 'students', 'active'),
    inactiveStudents: getStatValue(dashboardStatistics, 'students', 'inactive'),
    totalDoctors: getStatValue(dashboardStatistics, 'doctors', 'total'),
    activeDoctors: getStatValue(dashboardStatistics, 'doctors', 'active'),
    inactiveDoctors: getStatValue(dashboardStatistics, 'doctors', 'inactive'),
  }), [dashboardStatistics]);

  const runAction = useCallback(async (mutation, variables, fallbackMessage) => {
    try {
      const response = await mutation.mutateAsync(variables);
      showToast(getResponseMessage(response, fallbackMessage));
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showToast(message, 'error');
      throw error;
    }
  }, [showToast]);

  const createFilePayload = useCallback((file) => {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  }, []);

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

          <section className="stg-stats" aria-label="Account statistics">
            <StatCard label="Total Students" value={isStatsLoading ? '…' : statistics.totalStudents} icon={StatIcons.students} accent="blue" />
            <StatCard label="Active Students" value={isStatsLoading ? '…' : statistics.activeStudents} icon={StatIcons.students} accent="green" />
            <StatCard label="Inactive Students" value={isStatsLoading ? '…' : statistics.inactiveStudents} icon={StatIcons.students} accent="rose" />
            <StatCard label="Total Doctors" value={isStatsLoading ? '…' : statistics.totalDoctors} icon={StatIcons.doctors} accent="navy" />
            <StatCard label="Active Doctors" value={isStatsLoading ? '…' : statistics.activeDoctors} icon={StatIcons.doctors} accent="green" />
            <StatCard label="Inactive Doctors" value={isStatsLoading ? '…' : statistics.inactiveDoctors} icon={StatIcons.doctors} accent="rose" />
          </section>

          {/* Accordion — only one section open at a time, both collapsed by default */}
          <ManagementAccordion>
            <ManagementSection sectionId="student" icon={StudentIcon} title="Student Management">
              <StudentManagement
                onImportStudents={(file) => runAction(uploadStudentsMutation, createFilePayload(file), 'Students imported successfully.')}
                onBulkDeactivateStudents={(file) => runAction(bulkDeactivateMutation, createFilePayload(file), 'Students disabled successfully.')}
                onDeactivateStudent={(id) => runAction(deactivateStudentMutation, id, 'Student disabled successfully.')}
                onReactivateStudent={(id) => runAction(reactivateStudentMutation, id, 'Student reactivated successfully.')}
              />
            </ManagementSection>

            <ManagementSection sectionId="doctor" icon={DoctorIcon} title="Doctor Management">
              <DoctorManagement
                onAddDoctor={(data) => runAction(addDoctorMutation, data, 'Doctor created successfully.')}
                onDeactivateDoctor={(id) => runAction(deactivateDoctorMutation, id, 'Doctor disabled successfully.')}
                onReactivateDoctor={(id) => runAction(reactivateDoctorMutation, id, 'Doctor reactivated successfully.')}
              />
            </ManagementSection>
          </ManagementAccordion>

        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
