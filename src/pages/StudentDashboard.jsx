import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import RecentTable from '../components/dashboard/RecentTable';
import SearchBar from '../components/dashboard/SearchBar';
import '../styles/StudentDashboard.css';

/* ── Mock Data ─────────────────────────────────── */
const MOCK_STUDENT_STATS = {
  availableCases: 47,
  reservedCases: 3,
  completedCases: 18,
};
const MOCK_CASES = [
  { id: 1, patient: 'Ahmed Hassan',   tooth: '16',  diagnosis: 'Caries – Class II',       status: 'available' },
  { id: 2, patient: 'Sara Khaled',    tooth: '21',  diagnosis: 'Root Canal Treatment',     status: 'reserved'  },
  { id: 3, patient: 'Mohamed Ali',    tooth: '36',  diagnosis: 'Extraction – Impacted',    status: 'completed' },
  { id: 4, patient: 'Nour Ibrahim',   tooth: '11',  diagnosis: 'Crown Restoration',        status: 'available' },
  { id: 5, patient: 'Layla Mahmoud',  tooth: '46',  diagnosis: 'Caries – Class I',         status: 'available' },
  { id: 6, patient: 'Omar Farouk',    tooth: '24',  diagnosis: 'Pulp Capping',             status: 'reserved'  },
  { id: 7, patient: 'Rania Sayed',    tooth: '14',  diagnosis: 'Fixed Partial Denture',    status: 'completed' },
  { id: 8, patient: 'Khaled Nasser',  tooth: '31',  diagnosis: 'Scaling & Root Planing',   status: 'available' },
];

const MOCK_STUDENT = {
  name: 'Yasmin El-Sayed',
  id: 'STU-2024-0058',
  year: '4th Year',
  program: 'BDS – Cairo University',
  initials: 'YE',
};

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
function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
}

const CASE_COLUMNS = [
  { key: 'patient',   label: 'Patient Name' },
  { key: 'tooth',     label: 'Tooth No.', render: (v) => <strong>#{v}</strong> },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'status',    label: 'Status', render: (v) => <StatusBadge value={v} /> },
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    navigate('/student/login');
  }

  /* Apply filter + search */
  let displayedCases = [...MOCK_CASES];

  if (filter === 'available') {
    displayedCases = displayedCases.filter((c) => c.status === 'available');
  } else if (filter === 'oldest') {
    displayedCases = displayedCases.reverse();
  }

  if (search.trim()) {
    displayedCases = displayedCases.filter(
      (c) =>
        c.patient.toLowerCase().includes(search.toLowerCase()) ||
        c.diagnosis.toLowerCase().includes(search.toLowerCase())
    );
  }

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
          user={{ name: MOCK_STUDENT.name, role: 'Student', initials: MOCK_STUDENT.initials }}
          onMenuClick={() => setSidebarOpen(true)}
          // searchValue={search}
          // onSearchChange={(e) => setSearch(e.target.value)}
        />

        <div className="student-dashboard__content">
          {/* Profile summary */}
          <div className="student-profile-card">
            <div className="student-profile-card__avatar">{MOCK_STUDENT.initials}</div>
            <div className="student-profile-card__info">
              <h2 className="student-profile-card__name">{MOCK_STUDENT.name}</h2>
              <div className="student-profile-card__meta">
                <span className="student-profile-card__tag">{MOCK_STUDENT.year}</span>
                <span className="student-profile-card__id">{MOCK_STUDENT.id}</span>
                <span className="student-profile-card__program">{MOCK_STUDENT.program}</span>
              </div>
            </div>
            <div className="student-profile-card__progress">
              <span className="student-profile-card__progress-label">Case Progress</span>
              <div className="student-profile-card__progress-bar-wrap">
                <div
                  className="student-profile-card__progress-bar"
                  style={{ width: `${Math.round((MOCK_STUDENT_STATS.completedCases / (MOCK_STUDENT_STATS.availableCases + MOCK_STUDENT_STATS.completedCases)) * 100)}%` }}
                />
              </div>
              <span className="student-profile-card__progress-pct">
                {MOCK_STUDENT_STATS.completedCases} completed
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="student-dashboard__stats">
            <StatCard label="Available Cases"  value={MOCK_STUDENT_STATS.availableCases}  icon={Icon.available} accent="blue"  trend={{ dir: 'up', text: '+5 new today' }} />
            <StatCard label="Reserved Cases"   value={MOCK_STUDENT_STATS.reservedCases}   icon={Icon.reserved}  accent="amber" />
            <StatCard label="Completed Cases"  value={MOCK_STUDENT_STATS.completedCases}  icon={Icon.completed} accent="green" trend={{ dir: 'up', text: '+2 this week' }} />
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
              {displayedCases.length} case{displayedCases.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Cases table */}
          <div className="sd-tables-grid">
          <RecentTable
            title="Cases"
            columns={CASE_COLUMNS}
            rows={displayedCases}
            emptyMessage="No cases match your search or filter."
          />
          </div>
        </div>
      </div>
    </div>
  );
}
