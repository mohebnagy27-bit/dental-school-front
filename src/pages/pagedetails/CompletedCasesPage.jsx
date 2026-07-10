import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import SearchBar from '../../components/dashboard/SearchBar';
import StatCard from '../../components/dashboard/StatCard';
import RecentTable from '../../components/pagedetails/RecentTable';
import FilterSelect from '../../components/pagedetails/FilterSelect';
import Pagination from '../../components/pagedetails/Pagination';
import { COMPLETED_CASES } from '../../components/pagedetails/mockCases';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/CompletedCasesPage.css';

const PAGE_SIZE = 6;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

/* ── Icons ─────────────────────────────────────── */
const Icon = {
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  tooth: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-2.5 0-4.5 1.5-5.5 3.5C5.5 7.5 5 9 5 11c0 3 1 6 2 8 .5 1 1.5 1.5 2 0 .5-1.5 1-3 2-3s1.5 1.5 2 3c.5 1.5 1.5 1 2 0 1-2 2-5 2-8 0-2-.5-3.5-1.5-5.5C16.5 3.5 14.5 2 12 2z" />
    </svg>
  ),
};

function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
}

/* Parse "DD Mon YYYY" formatted mock dates */
function parseMockDate(str) {
  return new Date(str);
}

/* "This month" relative to the most recent completion date in the mock set,
   so the stat stays meaningful regardless of the real current date. */
function getReferenceMonth(cases) {
  if (cases.length === 0) return { month: 0, year: 0 };
  const latest = cases.reduce((acc, c) => {
    const d = parseMockDate(c.completionDate);
    return d > acc ? d : acc;
  }, parseMockDate(cases[0].completionDate));
  return { month: latest.getMonth(), year: latest.getFullYear() };
}

export default function CompletedCasesPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cases] = useState(COMPLETED_CASES);

  /* Simulate initial data load */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  function handleLogout() {
    setSidebarOpen(false);
    navigate('/doctor/login');
  }

  const doctorUser = {
    name: 'Dr. Ahmed Nasser',
    role: 'Doctor',
    initials: 'AN',
  };

  /* ── Statistics ─────────────────────────────────── */
  const stats = useMemo(() => {
    const total = cases.length;

    const { month, year } = getReferenceMonth(cases);
    const completedThisMonth = cases.filter((c) => {
      const d = parseMockDate(c.completionDate);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;

    const treatmentCounts = cases.reduce((acc, c) => {
      acc[c.treatmentType] = (acc[c.treatmentType] || 0) + 1;
      return acc;
    }, {});
    const mostCommon = Object.entries(treatmentCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      completedThisMonth,
      mostCommonTreatment: mostCommon ? mostCommon[0] : '—',
    };
  }, [cases]);

  /* ── Treatment filter options ─────────────────── */
  const treatmentOptions = useMemo(() => {
    const types = Array.from(new Set(cases.map((c) => c.treatmentType)));
    return [
      { value: 'all', label: 'All Treatments' },
      ...types.map((t) => ({ value: t, label: t })),
    ];
  }, [cases]);

  /* ── Filter, search, sort ──────────────────────── */
  const filteredCases = useMemo(() => {
    let result = [...cases];

    if (treatmentFilter !== 'all') {
      result = result.filter((c) => c.treatmentType === treatmentFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.patientName.toLowerCase().includes(q) ||
          c.diagnosis.toLowerCase().includes(q) ||
          c.assignedStudent.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'oldest') {
      result = [...result].reverse();
    }

    return result;
  }, [cases, search, treatmentFilter, sortBy]);

  /* ── Pagination ─────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedCases = filteredCases.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, treatmentFilter, sortBy]);

  const CASE_COLUMNS = [
    { key: 'patientName', label: 'Patient Name' },
    {
      key: 'toothNumber',
      label: 'Tooth Number',
      render: (v) => <strong>#{v}</strong>,
    },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'assignedStudent', label: 'Student Name' },
    { key: 'completionDate', label: 'Completion Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v, row) => (
        <div className="table-actions">
          <button
            className="table-actions__btn"
            title="View Patient"
            aria-label={`View patient ${row.patientName}`}
            onClick={() => navigate(`/patients/${row.patientId}`)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <Sidebar
        role="student"
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="page-shell__main">
        <Topbar
          pageTitle="Completed Cases"
          user={doctorUser}
          searchValue={search}
          // onSearchChange={(e) => setSearch(e.target.value)}
          // onMenuToggle={() => setSidebarOpen((o) => !o)}
          onMenuClick={() => setSidebarOpen(true)}

        />

        <div className="page-shell__content">
          {/* Header */}
          <div className="page-header">
            <div>
              <h2 className="page-header__title">Completed Cases</h2>
              <p className="page-header__sub">
                A record of all treatments completed by students.
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="stat-grid-3">
            <StatCard
              label="Total Completed Cases"
              value={stats.total}
              icon={Icon.check}
              accent="green"
            />
            <StatCard
              label="Completed This Month"
              value={stats.completedThisMonth}
              icon={Icon.calendar}
              accent="blue"
            />
            <StatCard
              label="Most Common Treatment"
              value={stats.mostCommonTreatment}
              icon={Icon.tooth}
              accent="navy"
            />
          </div>

          {/* Toolbar: search + filters */}
          <div className="toolbar">
            <div className="toolbar__search">
              <SearchBar
                placeholder="Search by patient, diagnosis, or student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar__filters">
              <FilterSelect
                label="Treatment"
                value={treatmentFilter}
                onChange={(e) => setTreatmentFilter(e.target.value)}
                options={treatmentOptions}
              />
              <FilterSelect
                label="Sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          {/* Table */}
          <RecentTable
            title="Completed Cases"
            columns={CASE_COLUMNS}
            rows={pagedCases}
            emptyMessage="No completed cases match your search or filters."
            loading={loading}
            loadingRows={PAGE_SIZE}
          />

          {/* Pagination */}
          {!loading && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
