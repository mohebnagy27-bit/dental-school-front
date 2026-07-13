import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import RecentTable from '../components/dashboard/RecentTable';
import SearchBar from '../components/dashboard/SearchBar';
import { useAuth } from '../context/AuthContext';
import { getDashboardStatistics, getPatientsOverview } from '../services/managementService';
import {
  filterStudentRecords,
  getPatientCases,
  getPatientId,
  getPatientName,
  getResponseList,
} from '../lib/studentData';
import '../styles/DoctorDashboard.css';

/* ── Icons ─────────────────────────────────────── */
const Icon = {
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  folder: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  bookmark: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};


/* ── Status badge renderer ──────────────────────── */
function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
}

function getDashboardData(response) {
  const data = response?.data ?? response ?? {};
  return data?.dashboard ?? data?.statistics ?? data?.stats ?? data;
}

function getNumericValue(data, keys, fallback = 0) {
  const value = keys.map((key) => data?.[key]).find((item) => Number.isFinite(Number(item)));
  return value === undefined ? fallback : Number(value);
}

function getPatientRegistrationDate(patient) {
  return patient?.registrationDate || patient?.registeredAt || patient?.createdAt || patient?.dateCreated;
}

function formatRegistrationDate(date) {
  if (!date) return '—';

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? String(date)
    : parsedDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPatientStatus(patient) {
  if (patient?.status) return String(patient.status).toLowerCase();

  const statuses = getPatientCases(patient).map((currentCase) => String(currentCase?.status || '').toLowerCase());
  if (statuses.includes('available')) return 'active';
  if (statuses.includes('reserved')) return 'reserved';
  if (statuses.includes('completed')) return 'completed';
  return 'waiting';
}

function calculateCaseStatistics(patients) {
  return patients.flatMap(getPatientCases).reduce(
    (statistics, currentCase) => {
      const status = String(currentCase?.status || '').toUpperCase();
      statistics.totalCases += 1;
      if (status === 'AVAILABLE') statistics.availableCases += 1;
      if (status === 'RESERVED') statistics.reservedCases += 1;
      if (status === 'COMPLETED') statistics.completedCases += 1;
      return statistics;
    },
    { totalCases: 0, availableCases: 0, reservedCases: 0, completedCases: 0 }
  );
}

/* ── Patient table columns ──────────────────────── */
const PATIENT_COLUMNS = [
  { key: 'name',   label: 'Patient Name' },
  { key: 'date',   label: 'Registration Date' },
  { key: 'caseCount', label: 'No. of Cases', render: (v) => <strong>{v}</strong> },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
];

/* ── Component ──────────────────────────────────── */
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: dashboardResponse } = useQuery({
    queryKey: ['management-dashboard'],
    queryFn: getDashboardStatistics,
  });
  const { data: patientsResponse } = useQuery({
    queryKey: ['management-patients-overview'],
    queryFn: getPatientsOverview,
  });

  const patients = useMemo(() => getResponseList(patientsResponse), [patientsResponse]);
  const patientRows = useMemo(() => patients
    .map((patient) => ({
      id: getPatientId(patient),
      name: getPatientName(patient),
      date: formatRegistrationDate(getPatientRegistrationDate(patient)),
      registrationTimestamp: new Date(getPatientRegistrationDate(patient)).getTime() || 0,
      caseCount: getPatientCases(patient).length,
      status: getPatientStatus(patient),
      cases: getPatientCases(patient),
    }))
    .sort((firstPatient, secondPatient) => secondPatient.registrationTimestamp - firstPatient.registrationTimestamp),
    [patients]
  );
  const caseStatistics = calculateCaseStatistics(patients);
  const dashboardStatistics = getDashboardData(dashboardResponse);
  const statistics = {
    totalPatients: getNumericValue(dashboardStatistics, ['totalPatients', 'patientsCount'], patients.length),
    totalCases: getNumericValue(dashboardStatistics, ['totalCases', 'casesCount'], caseStatistics.totalCases),
    availableCases: getNumericValue(dashboardStatistics, ['availableCases', 'availableCasesCount'], caseStatistics.availableCases),
    reservedCases: getNumericValue(dashboardStatistics, ['reservedCases', 'reservedCasesCount'], caseStatistics.reservedCases),
    completedCases: getNumericValue(dashboardStatistics, ['completedCases', 'completedCasesCount'], caseStatistics.completedCases),
  };
  const filteredPatients = filterStudentRecords(patientRows, search).slice(0, 10);

  function handleLogout() {
    navigate('/doctor/login');
  }

  const doctorUser = {
    name: user?.name || '',
    role: 'Doctor',
    initials: user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  };

  return (
    <div className="doctor-dashboard">
      <Sidebar 
      role="doctor" 
      onLogout={handleLogout}
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)} />

      <div className="doctor-dashboard__main">
        <Topbar
          pageTitle="Dashboard"
          user={doctorUser}
          
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="doctor-dashboard__content">
          {/* Welcome */}
          <div className="doctor-dashboard__welcome">
            <div>
              <h2 className="doctor-dashboard__welcome-title">
                Good morning, {doctorUser.name || 'Doctor'} 👋
              </h2>
              <p className="doctor-dashboard__welcome-sub">
                Here's what's happening in your clinic today.
              </p>
            </div>
            <div className="doctor-dashboard__date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="doctor-dashboard__stats">
            <StatCard label="Total Patients"   value={statistics.totalPatients}   icon={Icon.users}    accent="navy" />
            <StatCard label="Total Cases"      value={statistics.totalCases}      icon={Icon.folder}   accent="blue" />
            <StatCard label="Available Cases"  value={statistics.availableCases}  icon={Icon.clock}    accent="amber" />
            <StatCard label="Reserved Cases"   value={statistics.reservedCases}   icon={Icon.bookmark} accent="rose" />
            <StatCard label="Completed Cases"  value={statistics.completedCases}  icon={Icon.check}    accent="green" />
          </div>

          {/*Search */}
          <div className="dd-search-row">
          <SearchBar
          placeholder="Search patients, cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
         />
          </div>

          {/* Bottom grid */}
          <div className="doctor-dashboard__grid">
            {/* Recent Patients */}
            <div className="doctor-dashboard__table-col">
              <RecentTable
                title="Recent Patients"
                columns={PATIENT_COLUMNS}
                rows={filteredPatients}
                emptyMessage="No patients match your search."
                onRowClick={(patient) => {
                  if (patient.id) navigate(`/doctor/patients/${patient.id}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
