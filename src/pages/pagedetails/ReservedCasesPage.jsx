import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import SearchBar from '../../components/dashboard/SearchBar';
import RecentTable from '../../components/pagedetails/RecentTable';
import FilterSelect from '../../components/pagedetails/FilterSelect';
import Pagination from '../../components/pagedetails/Pagination';
import { RESERVED_CASES } from '../../components/pagedetails/mockCases';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/ReservedCasesPage.css';

const PAGE_SIZE = 6;

const STUDENT_OPTIONS_BASE = [
  { value: 'all', label: 'All Students' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
}

export default function ReservedCasesPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState(RESERVED_CASES);

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

  /* ── Build student filter options from data ──── */
  const studentOptions = useMemo(() => {
    const names = Array.from(new Set(RESERVED_CASES.map((c) => c.assignedStudent)));
    return [
      ...STUDENT_OPTIONS_BASE,
      ...names.map((n) => ({ value: n, label: n })),
    ];
  }, []);

  /* ── Filter, search, sort ──────────────────────── */
  const filteredCases = useMemo(() => {
    let result = [...cases];

    if (studentFilter !== 'all') {
      result = result.filter((c) => c.assignedStudent === studentFilter);
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
  }, [cases, search, studentFilter, sortBy]);

  /* ── Pagination ─────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedCases = filteredCases.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, studentFilter, sortBy]);

  /* ── Actions ────────────────────────────────────── */
  function handleMarkCompleted(caseId, patientName) {
    const confirmed = window.confirm(
      `Mark this case for ${patientName} as completed?`
    );
    if (!confirmed) return;
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  }

  const CASE_COLUMNS = [

    // {
    //   key: 'actions',
    //   label: 'Actions',
    //   render: (_v, row) => (
    //     <div className="table-actions">
    //       <button
    //         className="table-actions__btn"
    //         title="View Patient"
    //         aria-label={`View patient ${row.patientName}`}
    //         onClick={() => navigate(`/patients/${row.patientId}`)}
    //       >
    //         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    //           <circle cx="12" cy="12" r="3" />
    //         </svg>
    //       </button>
    //       <button
    //         className="table-actions__btn table-actions__btn--success"
    //         title="Mark As Completed"
    //         aria-label={`Mark case for ${row.patientName} as completed`}
    //         onClick={() => handleMarkCompleted(row.id, row.patientName)}
    //       >
    //         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //           <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    //           <polyline points="22 4 12 14.01 9 11.01" />
    //         </svg>
    //       </button>
    //     </div>
    //   ),
    // },
    { key: 'patientName', label: 'Patient Name' },
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
          <button
            className="table-actions__btn table-actions__btn--success"
            title="Mark As Completed"
            aria-label={`Mark case for ${row.patientName} as completed`}
            onClick={() => handleMarkCompleted(row.id, row.patientName)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </button>
        </div>
      ),
    },

    {
      key: 'toothNumber',
      label: 'Tooth Number',
      render: (v) => <strong>#{v}</strong>,
    },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'reservedDate', label: 'Reserved Date' },
    { key: 'assignedStudent', label: 'Assigned Student' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge value={v} />,
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
          pageTitle="Reserved Cases"
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
              <h2 className="page-header__title">Reserved Cases</h2>
              <p className="page-header__sub">
                Cases currently reserved by students, awaiting treatment.
              </p>
            </div>
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
                label="Student"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                options={studentOptions}
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
            title="Reserved Cases"
            columns={CASE_COLUMNS}
            rows={pagedCases}
            emptyMessage="No reserved cases match your search or filters."
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
