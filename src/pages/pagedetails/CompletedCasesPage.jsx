import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import SearchBar from '../../components/dashboard/SearchBar';
import StatCard from '../../components/dashboard/StatCard';
import RecentTable from '../../components/pagedetails/RecentTable';
import { useAuth } from '../../context/AuthContext';
import {
  filterStudentRecords,
  getResponseList,
  getStudentProfile,
  normalizeStudentCase,
} from '../../lib/studentData';
import { getCompletedCases } from '../../services/studentService';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/CompletedCasesPage.css';

const Icon = {
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  tooth: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-2.5 0-4.5 1.5-5.5 3.5C5.5 7.5 5 9 5 11c0 3 1 6 2 8 .5 1 1.5 1.5 2 0 .5-1.5 1-3 2-3s1.5 1.5 2 3c.5 1.5 1.5 1 2 0 1-2 2-5 2-8 0-2-.5-3.5-1.5-5.5C16.5 3.5 14.5 2 12 2z" />
    </svg>
  ),
};

export default function CompletedCasesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const studentId = user?.id || localStorage.getItem('userId');
  const studentProfile = getStudentProfile(user, studentId);

  const { data, isLoading } = useQuery({
    queryKey: ['student-completed-cases', studentId],
    queryFn: () => getCompletedCases(studentId),
    enabled: Boolean(studentId),
  });

  const rows = useMemo(
    () => getResponseList(data).map(normalizeStudentCase),
    [data],
  );
  const filteredRows = filterStudentRecords(rows, search);
  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return rows.filter((row) => {
      const date = new Date(row.completionDate);
      return !Number.isNaN(date.valueOf())
        && date.getMonth() === now.getMonth()
        && date.getFullYear() === now.getFullYear();
    }).length;
  }, [rows]);
  const mostCommonTreatment = useMemo(() => {
    const counts = rows.reduce((result, row) => {
      if (row.treatmentType !== '—') result[row.treatmentType] = (result[row.treatmentType] || 0) + 1;
      return result;
    }, {});
    return Object.entries(counts).sort(([, left], [, right]) => right - left)[0]?.[0] || '—';
  }, [rows]);

  const columns = [
    { key: 'patientName', label: 'Patient Name' },
    { key: 'toothNumber', label: 'Tooth Number', render: (value) => <strong>#{value}</strong> },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'treatmentType', label: 'Treatment Type' },
  ];

  return (
    <div className="page-shell">
      <Sidebar role="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-shell__main">
        <Topbar pageTitle="Completed Cases" user={studentProfile} onMenuClick={() => setSidebarOpen(true)} />

        <div className="page-shell__content">
          <div className="page-header">
            <div>
              <h2 className="page-header__title">Completed Cases</h2>
              <p className="page-header__sub">A record of your completed treatments.</p>
            </div>
          </div>

          <div className="stat-grid-3">
            <StatCard label="Total Completed Cases" value={rows.length} icon={Icon.check} accent="green" />
            <StatCard label="Completed This Month" value={completedThisMonth} icon={Icon.check} accent="blue" />
            <StatCard label="Most Common Treatment" value={mostCommonTreatment} icon={Icon.tooth} accent="navy" />
          </div>

          <div className="toolbar">
            <div className="toolbar__search">
              <SearchBar
                placeholder="Search by patient, treatment, diagnosis, or tooth..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch('')}
              />
            </div>
          </div>

          <RecentTable
            title="Completed Cases"
            columns={columns}
            rows={filteredRows}
            emptyMessage="No completed cases match your search."
            loading={isLoading}
            onRowClick={(row) => row.patientId && navigate(`/student/patients/${row.patientId}`)}
          />
        </div>
      </div>
    </div>
  );
}
