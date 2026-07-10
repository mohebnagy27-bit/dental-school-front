import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import StatCard from '../components/dashboard/StatCard';
import RecentTable from '../components/dashboard/RecentTable';
import SearchBar from '../components/dashboard/SearchBar';
import '../styles/DoctorDashboard.css';

/* ── Mock Data ─────────────────────────────────── */
const MOCK_STATS = {
  totalPatients: 148,
  totalCases: 312,
  waitingCases: 24,
  reservedCases: 38,
  completedCases: 250,
};

const MOCK_PATIENTS = [
  { id: 1, name: 'Ahmed Hassan',    date: '08 Jun 2026', cases: 3, status: 'active' },
  { id: 2, name: 'Sara Khaled',     date: '07 Jun 2026', cases: 1, status: 'waiting' },
  { id: 3, name: 'Mohamed Ali',     date: '06 Jun 2026', cases: 5, status: 'completed' },
  { id: 4, name: 'Nour Ibrahim',    date: '05 Jun 2026', cases: 2, status: 'reserved' },
  { id: 5, name: 'Layla Mahmoud',   date: '04 Jun 2026', cases: 4, status: 'completed' },
  { id: 6, name: 'Omar Farouk',     date: '03 Jun 2026', cases: 1, status: 'waiting' },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'register', text: 'New patient Ahmed Hassan registered', time: '5 min ago' },
  { id: 2, type: 'complete', text: 'Case #204 marked as completed by Dr. Rania', time: '22 min ago' },
  { id: 3, type: 'reserve',  text: 'Sara Khaled reserved case #198', time: '1 hr ago' },
  { id: 4, type: 'register', text: 'New patient Omar Farouk registered', time: '2 hrs ago' },
  { id: 5, type: 'complete', text: 'Case #191 marked as completed by Dr. Samir', time: '3 hrs ago' },
  { id: 6, type: 'reserve',  text: 'Nour Ibrahim reserved case #187', time: '5 hrs ago' },
];

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

/* ── Activity icon map ──────────────────────────── */
function ActivityIcon({ type }) {
  const map = {
    register: { bg: '#dbeafe', color: '#2563eb', icon: '👤' },
    complete:  { bg: '#dcfce7', color: '#16a34a', icon: '✓' },
    reserve:   { bg: '#ede9fe', color: '#7c3aed', icon: '📋' },
  };
  const { bg, color, icon } = map[type] || map.register;
  return (
    <span className="activity__icon" style={{ background: bg, color }}>
      {icon}
    </span>
  );
}

/* ── Status badge renderer ──────────────────────── */
function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
}

/* ── Patient table columns ──────────────────────── */
const PATIENT_COLUMNS = [
  { key: 'name',   label: 'Patient Name' },
  { key: 'date',   label: 'Registration Date' },
  { key: 'cases',  label: 'No. of Cases', render: (v) => <strong>{v}</strong> },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
];

/* ── Component ──────────────────────────────────── */
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredPatients = MOCK_PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleLogout() {
    navigate('/doctor/login');
  }

  const handleClear = () => {
    setSearch('');
    if (onSearch) onSearch('');
  };

  const doctorUser = {
    name: 'Dr. Ahmed Nasser',
    role: 'Doctor',
    initials: 'AN',
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
                Good morning, Dr. Nasser 👋
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
            <StatCard label="Total Patients"   value={MOCK_STATS.totalPatients}   icon={Icon.users}    accent="navy"  trend={{ dir: 'up', text: '+12 this month' }} />
            <StatCard label="Total Cases"      value={MOCK_STATS.totalCases}      icon={Icon.folder}   accent="blue"  trend={{ dir: 'up', text: '+8 this week' }} />
            <StatCard label="Waiting Cases"    value={MOCK_STATS.waitingCases}    icon={Icon.clock}    accent="amber" />
            <StatCard label="Reserved Cases"   value={MOCK_STATS.reservedCases}   icon={Icon.bookmark} accent="rose"  />
            <StatCard label="Completed Cases"  value={MOCK_STATS.completedCases}  icon={Icon.check}    accent="green" trend={{ dir: 'up', text: '+5 today' }} />
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
              />
            </div>

            {/* Activity feed */}
            <div className="doctor-dashboard__activity-col">
              <div className="activity-feed">
                <h3 className="activity-feed__title">Recent Activity</h3>
                <ul className="activity-feed__list">
                  {MOCK_ACTIVITY.map((item) => (
                    <li key={item.id} className="activity__item">
                      <ActivityIcon type={item.type} />
                      <div className="activity__body">
                        <p className="activity__text">{item.text}</p>
                        <span className="activity__time">{item.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
