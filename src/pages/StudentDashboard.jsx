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
import '../styles/StudentDashboard.css';

function getCaseList(response) {
  if (Array.isArray(response)) return response;
  return response?.cases || response?.data || [];
}

function getPatientList(response) {
  if (Array.isArray(response)) return response;
  return response?.patients || response?.data || [];
}

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

const TREATMENT_TYPE_COLORS = {
  caries: '#2563eb',
  'root canal treatment': '#f59e0b',
  extraction: '#dc2626',
  'crown restoration': '#7c3aed',
  'pulp capping': '#0891b2',
  'fixed partial denture': '#db2777',
  'scaling & root planing': '#16a34a',
};

function getPatientCases(patient) {
  const cases = patient.cases || patient.patientCases || [];
  return Array.isArray(cases) ? cases : [];
}

function getPatientName(patient) {
  if (patient.name || patient.fullName) return patient.name || patient.fullName;

  return [patient.firstName, patient.lastName].filter(Boolean).join(' ') || '—';
}

function getTreatmentTypes(patient) {
  const treatments = getPatientCases(patient)
    .map((currentCase) => currentCase.treatmentType || currentCase.treatment?.type || currentCase.treatment)
    .filter((treatment) => typeof treatment === 'string' && treatment.trim());

  return [...new Set(treatments)];
}

function getTreatmentColor(treatment) {
  return TREATMENT_TYPE_COLORS[treatment.toLowerCase()] || '#64748b';
}

function getPatientSearchValues(patient, treatmentTypes) {
  const caseValues = getPatientCases(patient).flatMap((currentCase) => [
    currentCase.treatmentType,
    currentCase.treatment?.type,
    currentCase.problem,
    currentCase.diagnosis,
    currentCase.toothNumber,
    currentCase.tooth,
  ]);

  return [getPatientName(patient), ...treatmentTypes, ...caseValues]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
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

/* ── Filter options ─────────────────────────────── */
const FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'newest',    label: 'Newest' },
  { key: 'oldest',    label: 'Oldest' },
  { key: 'available', label: 'Available Only' },
];

/* ── Component ──────────────────────────────────── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
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

  const caseStatistics = calculateCaseStatistics(getCaseList(allCasesResponse));
  const reservedCases = getCaseList(reservedCasesResponse);
  const completedCases = getCaseList(completedCasesResponse);
  const assignedCasesCount = reservedCases.length + completedCases.length;
  const progressPercentage = assignedCasesCount
    ? Math.round((completedCases.length / assignedCasesCount) * 100)
    : 0;
  const studentName = user?.name || '';
  const studentProfile = {
    name: studentName,
    id: user?.id || studentId || '',
    phoneNumber: user?.phone || user?.phoneNumber || '',
    initials: getInitials(studentName),
  };
  const patientRows = useMemo(
    () => getPatientList(patientsResponse).map((patient) => {
      const treatmentTypes = getTreatmentTypes(patient);

      return {
        id: patient.id || patient._id,
        patientName: getPatientName(patient),
        phoneNumber: patient.phone || patient.phoneNumber || '—',
        treatmentTypes,
        searchValues: getPatientSearchValues(patient, treatmentTypes),
        cases: getPatientCases(patient),
      };
    }),
    [patientsResponse]
  );

  function handleLogout() {
    navigate('/student/login');
  }

  /* Apply filter + search to the loaded patient data */
  let displayedPatients = [...patientRows];

  if (filter === 'available') {
    displayedPatients = displayedPatients.filter((patient) =>
      patient.cases.some((currentCase) => currentCase.status?.toUpperCase() === 'AVAILABLE')
    );
  } else if (filter === 'oldest') {
    displayedPatients = displayedPatients.reverse();
  }

  if (search.trim()) {
    const query = search.trim().toLowerCase();
    displayedPatients = displayedPatients.filter((patient) => patient.searchValues.includes(query));
  }

  const visiblePatients = displayedPatients.slice(0, 10);

  const handleClear = () => {
    setSearch('');
    // if (onSearch) onSearch('');
  };

  return (
    <div className="student-dashboard">
      <Sidebar role="student" 
      onLogout={handleLogout}
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
                <span className="student-profile-card__tag" />
                <span className="student-profile-card__id">{studentProfile.id}</span>
                <span className="student-profile-card__id">{studentProfile.phoneNumber}</span>
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
          
          {/* Filters row */}
          <div className="student-dashboard__filters-row">
            <div className="student-dashboard__filter-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`filter-tab${filter === f.key ? ' filter-tab--active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="student-dashboard__case-count">
              {visiblePatients.length} patient{visiblePatients.length !== 1 ? 's' : ''}
            </span>
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
