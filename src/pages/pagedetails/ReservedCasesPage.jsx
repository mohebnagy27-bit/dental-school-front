import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import SearchBar from '../../components/dashboard/SearchBar';
import RecentTable from '../../components/pagedetails/RecentTable';
import { useAuth } from '../../context/AuthContext';
import {
  filterStudentRecords,
  getResponseList,
  getStudentProfile,
  normalizeStudentCase,
} from '../../lib/studentData';
import { completeCase, getReservedCases } from '../../services/studentService';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/ReservedCasesPage.css';

export default function ReservedCasesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const studentId = user?.id || localStorage.getItem('userId');
  const studentProfile = getStudentProfile(user, studentId);

  const { data, isLoading } = useQuery({
    queryKey: ['student-reserved-cases', studentId],
    queryFn: () => getReservedCases(studentId),
    enabled: Boolean(studentId),
  });

  const rows = useMemo(
    () => getResponseList(data).map(normalizeStudentCase),
    [data],
  );
  const filteredRows = filterStudentRecords(rows, search);

  const completeMutation = useMutation({
    mutationFn: (caseId) => completeCase(studentId, caseId),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ['student-reserved-cases', studentId] }),
      queryClient.invalidateQueries({ queryKey: ['student-completed-cases', studentId] }),
      queryClient.invalidateQueries({ queryKey: ['student-cases'] }),
      queryClient.invalidateQueries({ queryKey: ['student-patient-details'] }),
    ]),
  });

  const columns = [
    { key: 'patientName', label: 'Patient Name' },
    { key: 'toothNumber', label: 'Tooth Number', render: (value) => <strong>#{value}</strong> },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'treatmentType', label: 'Treatment Type' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, row) => (
        <div className="table-actions">
          <button
            type="button"
            className="table-actions__btn table-actions__btn--success"
            title="Mark as completed"
            aria-label={`Mark case for ${row.patientName} as completed`}
            disabled={completeMutation.isPending || !row.id}
            onClick={(event) => {
              event.stopPropagation();
              completeMutation.mutate(row.id);
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <Sidebar role="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-shell__main">
        <Topbar pageTitle="Reserved Cases" user={studentProfile} onMenuClick={() => setSidebarOpen(true)} />

        <div className="page-shell__content">
          <div className="page-header">
            <div>
              <h2 className="page-header__title">Reserved Cases</h2>
              <p className="page-header__sub">Cases you have reserved and are awaiting treatment.</p>
            </div>
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
            title="Reserved Cases"
            columns={columns}
            rows={filteredRows}
            emptyMessage="No reserved cases match your search."
            loading={isLoading}
            onRowClick={(row) => row.patientId && navigate(`/student/patients/${row.patientId}`)}
          />
        </div>
      </div>
    </div>
  );
}
