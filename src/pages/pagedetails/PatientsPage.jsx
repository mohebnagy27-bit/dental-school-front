import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import SearchBar from '../../components/dashboard/SearchBar';
import RecentTable from '../../components/pagedetails/RecentTable';
import Pagination from '../../components/pagedetails/Pagination';
import { useAuth } from '../../context/AuthContext';
import { getPatientsOverview } from '../../services/managementService';
import {
  filterStudentRecords,
  getPatientCases,
  getPatientId,
  getPatientName,
  getResponseList,
} from '../../lib/studentData';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/PatientsPage.css';

const PAGE_SIZE = 10;

function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
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

const PATIENT_COLUMNS = [
  { key: 'name', label: 'Patient Name' },
  { key: 'age', label: 'Age' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'registrationDate', label: 'Registration Date' },
  { key: 'caseCount', label: 'No. of Cases', render: (value) => <strong>{value}</strong> },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge value={value} /> },
];

export default function PatientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: patientsResponse, isLoading } = useQuery({
    queryKey: ['management-patients-overview'],
    queryFn: getPatientsOverview,
  });

  const doctorUser = {
    name: user?.name || '',
    role: user?.role === 'SUPER_ADMIN' ? 'Admin' : 'Doctor',
    initials: user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  };

  const patientRows = useMemo(
    () => getResponseList(patientsResponse).map((patient) => ({
      id: getPatientId(patient),
      name: getPatientName(patient),
      age: patient?.age ?? patient?.patientAge ?? '—',
      phone: patient?.phone || patient?.phoneNumber || patient?.mobile || '—',
      registrationDate: formatRegistrationDate(getPatientRegistrationDate(patient)),
      caseCount: getPatientCases(patient).length,
      status: getPatientStatus(patient),
      cases: getPatientCases(patient),
    })),
    [patientsResponse]
  );
  const filteredPatients = filterStudentRecords(patientRows, search);
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPatients = filteredPatients.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="page-shell">
      <Sidebar role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-shell__main">
        <Topbar
          pageTitle="Patients"
          user={doctorUser}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="page-shell__content">
          <div className="page-header">
            <div>
              <h2 className="page-header__title">Patients</h2>
              <p className="page-header__sub">
                Manage your clinic&apos;s registered patients and their cases.
              </p>
            </div>
          </div>

          <div className="toolbar">
            <div className="toolbar__search">
              <SearchBar
                placeholder="Search patients or cases..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch('')}
              />
            </div>
          </div>

          <RecentTable
            title="All Patients"
            columns={PATIENT_COLUMNS}
            rows={pagedPatients}
            emptyMessage="No patients match your search."
            loading={isLoading}
            loadingRows={PAGE_SIZE}
            onRowClick={(patient) => {
              if (patient.id) navigate(`/doctor/patients/${patient.id}`);
            }}
          />

          {!isLoading && (
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
