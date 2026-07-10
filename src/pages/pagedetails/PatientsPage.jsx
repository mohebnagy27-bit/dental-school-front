import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import SearchBar from '../../components/dashboard/SearchBar';
import RecentTable from '../../components/pagedetails/RecentTable';
import FilterSelect from '../../components/pagedetails/FilterSelect';
import Pagination from '../../components/pagedetails/Pagination';
import { MOCK_PATIENTS } from '../../components/pagedetails/mockPatients';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/PatientsPage.css';

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: 'all',       label: 'All Statuses' },
  { value: 'active',    label: 'Active' },
  { value: 'waiting',   label: 'Waiting' },
  { value: 'reserved',  label: 'Reserved' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name',   label: 'Name (A–Z)' },
];

function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
}

export default function PatientsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState(MOCK_PATIENTS);

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

  /* ── Filter, search, sort ──────────────────────── */
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'oldest') {
      result = [...result].reverse();
    }
    /* 'newest' = natural mock order, no-op */

    return result;
  }, [patients, search, statusFilter, sortBy]);

  /* ── Pagination ─────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPatients = filteredPatients.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  /* Reset to page 1 whenever filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy]);

  /* ── Actions ────────────────────────────────────── */
  function handleDelete(id, name) {
    const confirmed = window.confirm(`Remove ${name} from the patient list?`);
    if (!confirmed) return;
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(name) {
    window.alert(`Edit patient "${name}" — form coming soon.`);
  }

  const PATIENT_COLUMNS = [
    { key: 'name', label: 'Patient Name' },
    { key: 'age', label: 'Age' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'registrationDate', label: 'Registration Date' },
    {
      key: 'caseCount',
      label: 'No. of Cases',
      render: (_v, row) => <strong>{row.cases.length}</strong>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge value={v} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v, row) => (
        <div className="table-actions">
          <button
            className="table-actions__btn"
            title="View Details"
            aria-label={`View details for ${row.name}`}
            onClick={() => navigate(`/doctor/patients/${row.id}`)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            className="table-actions__btn"
            title="Edit"
            aria-label={`Edit ${row.name}`}
            onClick={() => handleEdit(row.name)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="table-actions__btn table-actions__btn--danger"
            title="Delete"
            aria-label={`Delete ${row.name}`}
            onClick={() => handleDelete(row.id, row.name)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <Sidebar
        role="doctor"
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="page-shell__main">
        <Topbar
          pageTitle="Patients"
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
              <h2 className="page-header__title">Patients</h2>
              <p className="page-header__sub">
                Manage your clinic&apos;s registered patients and their cases.
              </p>
            </div>
            <div className="page-header__actions">
              <button
                className="btn btn--primary"
                onClick={() => navigate('/doctor/new-patient')}
              >
                + New Patient
              </button>
            </div>
          </div>

          {/* Toolbar: search + filters */}
          <div className="toolbar">
            <div className="toolbar__search">
              <SearchBar
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar__filters">
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={STATUS_OPTIONS}
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
            title="All Patients"
            columns={PATIENT_COLUMNS}
            rows={pagedPatients}
            emptyMessage="No patients match your search or filters."
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
