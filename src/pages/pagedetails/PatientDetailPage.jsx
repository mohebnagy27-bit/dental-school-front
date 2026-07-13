import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import PatientDentalChart from '../../components/DentalChart/PatientDentalChart';
import { useAuth } from '../../context/AuthContext';
import { getPatientDetails } from '../../services/managementService';
import {
  getCaseDiagnosis,
  getCaseTooth,
  getCaseTreatment,
  getPatientCases,
  getPatientId,
  getPatientName,
} from '../../lib/studentData';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/PatientDetailsPage.css';

const valueOr = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function getPatient(response) {
  const patient = response?.patient || response?.data?.patient || response?.data || response;
  return patient && typeof patient === 'object' && !Array.isArray(patient) ? patient : null;
}

function formatValue(value) {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(', ') : '—';
  if (typeof value === 'object') return value.name || value.fullName || value.label || '—';
  return String(value);
}

function formatDate(value) {
  if (!value) return '—';

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? formatValue(value)
    : parsedDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatStatus(value) {
  return String(value || 'AVAILABLE').toUpperCase();
}

function formatStatusLabel(value) {
  const status = formatStatus(value).toLowerCase();
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getAssignedStudent(caseInfo) {
  const student = valueOr(
    caseInfo?.assignedStudent,
    caseInfo?.reservedBy,
    caseInfo?.bookedBy,
    caseInfo?.student,
    caseInfo?.studentId,
  );

  return formatValue(student);
}

function normalizeCase(caseInfo) {
  const diagnosis = getCaseDiagnosis(caseInfo) || '—';
  const treatment = getCaseTreatment(caseInfo) || '—';

  return {
    id: valueOr(caseInfo?.id, caseInfo?._id, caseInfo?.caseId),
    tooth: getCaseTooth(caseInfo) ?? '—',
    diagnosis,
    diagnosisLabel: diagnosis,
    treatment,
    details: valueOr(caseInfo?.details, caseInfo?.description, caseInfo?.caseDetails),
    notes: valueOr(caseInfo?.notes, caseInfo?.caseNotes, caseInfo?.note),
    status: formatStatus(valueOr(caseInfo?.status, caseInfo?.caseStatus, caseInfo?.reservationStatus)),
    reservationStatus: formatStatus(valueOr(caseInfo?.reservationStatus, caseInfo?.status, caseInfo?.caseStatus)),
    assignedStudent: getAssignedStudent(caseInfo),
  };
}

function getPatientStatus(patient, cases) {
  if (patient?.status) return String(patient.status).toLowerCase();
  if (cases.some((caseInfo) => caseInfo.status === 'AVAILABLE')) return 'available';
  if (cases.some((caseInfo) => caseInfo.status === 'RESERVED')) return 'reserved';
  if (cases.some((caseInfo) => caseInfo.status === 'COMPLETED')) return 'completed';
  return 'waiting';
}

function StatusBadge({ value }) {
  const status = String(value || 'waiting').toLowerCase();
  return <span className={`status-badge status-badge--${status}`}>{formatStatusLabel(status)}</span>;
}

function CaseDetail({ label, value, wide = false }) {
  return (
    <div className={`case-card__item${wide ? ' patient-info-item--wide' : ''}`}>
      <span className="case-card__label">{label}</span>
      <span className="case-card__value">{formatValue(value)}</span>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const caseRefs = useRef({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['management-patient-details', id],
    queryFn: () => getPatientDetails(id),
    enabled: Boolean(id),
    retry: false,
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
  const patient = useMemo(() => getPatient(data), [data]);
  const cases = useMemo(
    () => getPatientCases(patient).map(normalizeCase).filter((caseInfo) => caseInfo.id),
    [patient]
  );
  const handleToothClick = useCallback((tooth) => {
    const caseInfo = cases.find((currentCase) => String(currentCase.tooth) === String(tooth));
    caseRefs.current[caseInfo?.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [cases]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="section-card patient-details__not-found"><p>Loading patient details…</p></div>;
    }

    if (isError || !patient) {
      const message = error?.response?.status === 404 || !patient
        ? 'Patient not found.'
        : 'Unable to load patient details. Please try again.';

      return (
        <div className="section-card patient-details__not-found">
          <h2 className="page-header__title">{message}</h2>
          <Link to="/doctor/patients" className="btn btn--primary">← Back to Patients</Link>
        </div>
      );
    }

    const patientId = getPatientId(patient) || id || '—';
    const patientStatus = getPatientStatus(patient, cases);
    const medicalInformation = patient.medicalInformation || patient.medical || {};
    const patientInformation = [
      ['Name', getPatientName(patient)],
      ['Patient ID', patientId],
      ['Age', valueOr(patient.age, patient.patientAge)],
      ['Phone', valueOr(patient.phone, patient.phoneNumber, patient.mobile)],
      ['Email', patient.email],
      ['Gender', valueOr(patient.gender, patient.sex)],
      ['Address', valueOr(patient.address, patient.homeAddress)],
      ['Registration Date', formatDate(valueOr(patient.registrationDate, patient.registeredAt, patient.createdAt, patient.dateCreated))],
      ['Medical History', valueOr(patient.medicalHistory, patient.medicalNotes, medicalInformation.history), true],
      ['Complications', valueOr(patient.complications, medicalInformation.complications), true],
      ['Notes', valueOr(patient.notes, patient.patientNotes, medicalInformation.notes), true],
    ];

    return (
      <>
        <div className="page-header">
          <div>
            <Link to="/doctor/patients" className="patient-details__back">← Back to Patients</Link>
            <h2 className="page-header__title">{getPatientName(patient)}</h2>
            <p className="page-header__sub">Patient ID: {patientId} · Registered {formatDate(valueOr(patient.registrationDate, patient.registeredAt, patient.createdAt, patient.dateCreated))}</p>
          </div>
          <div className="page-header__actions"><StatusBadge value={patientStatus} /></div>
        </div>

        <section className="section-card">
          <h3 className="section-card__title">Dental Overview</h3>
          <PatientDentalChart cases={cases} onToothClick={handleToothClick} />
        </section>

        <section className="section-card">
          <h3 className="section-card__title">Patient Information</h3>
          <div className="patient-info-grid">
            {patientInformation.map(([label, value, wide]) => (
              <div key={label} className={`patient-info-item${wide ? ' patient-info-item--wide' : ''}`}>
                <span className="patient-info-item__label">{label}</span>
                <span className="patient-info-item__value">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card">
          <h3 className="section-card__title">Case Information ({cases.length})</h3>
          {cases.length === 0 ? <p className="page-header__sub">No cases recorded for this patient.</p> : (
            <div className="case-list">
              {cases.map((caseInfo) => (
                <div key={caseInfo.id} ref={(element) => { caseRefs.current[caseInfo.id] = element; }} className="case-card">
                  <div className="case-card__header">
                    <span className="case-card__tooth">Tooth #{caseInfo.tooth}</span>
                    <StatusBadge value={caseInfo.status} />
                  </div>
                  <div className="case-card__grid">
                    <CaseDetail label="Case ID" value={caseInfo.id} />
                    <CaseDetail label="Diagnosis" value={caseInfo.diagnosis} />
                    <CaseDetail label="Treatment Type" value={caseInfo.treatment} />
                    <CaseDetail label="Status" value={formatStatusLabel(caseInfo.status)} />
                    <CaseDetail label="Reservation Status" value={formatStatusLabel(caseInfo.reservationStatus)} />
                    <CaseDetail label="Assigned Student" value={caseInfo.assignedStudent} />
                    <CaseDetail label="Details" value={caseInfo.details} wide />
                    <CaseDetail label="Notes" value={caseInfo.notes} wide />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    );
  };

  return (
    <div className="page-shell">
      <Sidebar role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-shell__main">
        <Topbar pageTitle="Patient Details" user={doctorUser} onMenuClick={() => setSidebarOpen(true)} />
        <div className="page-shell__content">{renderContent()}</div>
      </div>
    </div>
  );
}
