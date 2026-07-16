import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import RecentTable from '../components/dashboard/RecentTable';
import SearchBar from '../components/dashboard/SearchBar';
import {
  getCases,
  getCompletedCases,
  getPatients,
  getReservedCases,
} from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import {
  filterStudentRecords,
  getCaseTreatment,
  getPatientId,
  getPatientCases,
  getPatientName,
  getResponseList,
  getStudentProfile,
  getTreatmentColor,
} from '../lib/studentData';
import '../styles/StudentDashboard.css';

function calculateCaseStatistics(cases) {
  return cases.reduce(
    (statistics, currentCase) => {
      const status = currentCase.status?.toUpperCase();

      if (status === 'AVAILABLE') statistics.availableCases += 1;
      if (status === 'RESERVED') statistics.reservedCases += 1;
      if (status === 'COMPLETED') statistics.completedCases += 1;

      return statistics;
    },
    { availableCases: 0, reservedCases: 0, completedCases: 0 }
  );
}

function getTreatmentTypes(patient) {
  const treatments = getPatientCases(patient)
    .map(getCaseTreatment)
    .filter((treatment) => typeof treatment === 'string' && treatment.trim());

  return [...new Set(treatments)];
}

/* ── Stat icons ─────────────────────────────────── */
const Icon = {
  available: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  reserved: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  completed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

/* ── Status badge ───────────────────────────────── */
const PATIENT_COLUMNS = [
  { key: 'patientName', label: 'Patient Name' },
  {
    key: 'treatmentTypes',
    label: 'Treatment Types',
    render: (treatmentTypes) => (
      <div className="patient-treatment-indicators">
        {treatmentTypes.map((treatment) => (
          <span
            key={treatment}
            className="patient-treatment-indicator"
            style={{ '--treatment-color': getTreatmentColor(treatment) }}
            title={treatment}
            aria-label={treatment}
          />
        ))}
      </div>
    ),
  },
  { key: 'phoneNumber', label: 'Phone Number' },
];

/* ── Component ──────────────────────────────────── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const studentId = localStorage.getItem('userId');

  const { data: allCasesResponse } = useQuery({
    queryKey: ['student-cases'],
    queryFn: getCases,
  });
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
  const { data: patientsResponse } = useQuery({
    queryKey: ['student-patients'],
    queryFn: getPatients,
  });

  const caseStatistics = calculateCaseStatistics(getResponseList(allCasesResponse));
  const reservedCases = getResponseList(reservedCasesResponse);
  const completedCases = getResponseList(completedCasesResponse);
  const assignedCasesCount = reservedCases.length + completedCases.length;
  const progressPercentage = assignedCasesCount
    ? Math.round((completedCases.length / assignedCasesCount) * 100)
    : 0;
  const studentProfile = getStudentProfile(user, studentId);
  const patientRows = useMemo(
    () => getResponseList(patientsResponse).map((patient) => {
      const treatmentTypes = getTreatmentTypes(patient);

      return {
        id: getPatientId(patient),
        patientName: getPatientName(patient),
        phoneNumber: patient.phone || patient.phoneNumber || '—',
        treatmentTypes,
        cases: getPatientCases(patient),
      };
    }),
    [patientsResponse]
  );

  const visiblePatients = filterStudentRecords(patientRows, search).slice(0, 10);

  const handleClear = () => {
    setSearch('');
    // if (onSearch) onSearch('');
  };

  return (
    <div className="student-dashboard">
      <Sidebar role="student" 
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      />

      <div className="student-dashboard__main">
        <Topbar
          pageTitle="Student Dashboard"
          user={{ name: studentProfile.name, role: 'Student', initials: studentProfile.initials }}
          onMenuClick={() => setSidebarOpen(true)}
          // searchValue={search}
          // onSearchChange={(e) => setSearch(e.target.value)}
        />

        <div className="student-dashboard__content">
          {/* Profile summary */}
          <div className="student-profile-card">
            <div className="student-profile-card__avatar">{studentProfile.initials}</div>
            <div className="student-profile-card__info">
              <h2 className="student-profile-card__name">{studentProfile.name}</h2>
              <div className="student-profile-card__meta">
                <span className="student-profile-card__tag" >
                {studentProfile.academicYear}</span>
                <span className="student-profile-card__id">{studentProfile.id}</span>
                <span className="student-profile-card__program" />
              </div>
            </div>
            <div className="student-profile-card__progress">
              <span className="student-profile-card__progress-label">Case Progress</span>
              <div className="student-profile-card__progress-bar-wrap">
                <div
                  className="student-profile-card__progress-bar"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="student-profile-card__progress-pct">
                {completedCases.length} completed
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="student-dashboard__stats">
            <StatCard label="Available Cases"  value={caseStatistics.availableCases}  icon={Icon.available} accent="blue" />
            <StatCard label="Reserved Cases"   value={caseStatistics.reservedCases}   icon={Icon.reserved}  accent="amber" />
            <StatCard label="Completed Cases"  value={caseStatistics.completedCases}  icon={Icon.completed} accent="green" />
          </div>

          <div className="sd-search-row">
            <SearchBar 
            placeholder="Search patients, cases…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={handleClear}
            />
          </div>

          {/* Cases table */}
          <div className="sd-tables-grid">
          <RecentTable
            title="Patients"
            columns={PATIENT_COLUMNS}
            rows={visiblePatients}
            emptyMessage="No patients match your search or filter."
            onRowClick={(patient) => {
              if (patient.id) navigate(`/student/patients/${patient.id}`);
            }}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
