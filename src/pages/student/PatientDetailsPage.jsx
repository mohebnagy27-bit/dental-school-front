import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import PatientDentalChart from '../../components/DentalChart/PatientDentalChart';
import { useAuth } from '../../context/AuthContext';
import {
  bookCase,
  completeCase,
  getPatientDetails,
  unreserveCase,
  updateCaseNotes,
} from '../../services/studentService';
import { getStudentProfile } from '../../lib/studentData';
import '../../styles/student/PatientDetailsPage.css';

const valueOr = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function getId(value) {
  if (value && typeof value === 'object') return value.id || value._id || value.studentId || value.userId;
  return value;
}

function getPatient(response) {
  const patient = response?.patient || response?.data?.patient || response?.data || response;
  return patient && typeof patient === 'object' && !Array.isArray(patient) ? patient : null;
}

function getPatientCases(patient) {
  const cases = patient?.cases || patient?.patientCases || patient?.caseRecords || [];
  return Array.isArray(cases) ? cases : [];
}

function getPatientName(patient) {
  return valueOr(
    patient?.name,
    patient?.fullName,
    [patient?.firstName, patient?.lastName].filter(Boolean).join(' '),
  ) || '—';
}

function getDiagnosisKey(value) {
  const normalized = String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized.includes('caries')) return 'caries';
  if (normalized.includes('extract')) return 'extraction';
  if (normalized.includes('remaining') && normalized.includes('root')) return 'remaining_root';
  return normalized || 'other';
}

function formatStatus(status) {
  return String(status || 'AVAILABLE').toUpperCase();
}

function formatStatusLabel(status) {
  const normalized = formatStatus(status).toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeCase(caseInfo) {
  const diagnosisSource = valueOr(
    caseInfo.diagnosisCategory,
    caseInfo.diagnosis?.type,
    caseInfo.diagnosis?.category,
    caseInfo.diagnosis,
  );
  const diagnosis = getDiagnosisKey(diagnosisSource);
  const tooth = valueOr(
    caseInfo.toothNumber,
    caseInfo.tooth,
    Array.isArray(caseInfo.teeth) ? caseInfo.teeth[0] : undefined,
    Array.isArray(caseInfo.treatmentTeeth) ? caseInfo.treatmentTeeth[0] : undefined,
  );
  const assignedStudent = valueOr(
    caseInfo.assignedStudent,
    caseInfo.reservedBy,
    caseInfo.bookedBy,
    caseInfo.student,
    caseInfo.studentId,
  );

  return {
    id: getId(caseInfo) || caseInfo.caseId,
    tooth: tooth === undefined ? '—' : tooth,
    diagnosis,
    diagnosisLabel: valueOr(
      caseInfo.diagnosisLabel,
      caseInfo.diagnosis?.label,
      typeof diagnosisSource === 'string' ? diagnosisSource : undefined,
    ) || '—',
    treatment: valueOr(
      caseInfo.treatmentType,
      caseInfo.treatment?.type,
      caseInfo.treatment?.name,
      typeof caseInfo.treatment === 'string' ? caseInfo.treatment : undefined,
      caseInfo.treatmentLabel,
    ) || '—',
    details: valueOr(caseInfo.details, caseInfo.description, caseInfo.caseDetails),
    notes: valueOr(caseInfo.notes, caseInfo.caseNotes, caseInfo.note),
    status: formatStatus(valueOr(caseInfo.status, caseInfo.caseStatus, caseInfo.reservationStatus)),
    assignedStudentId: getId(assignedStudent),
  };
}

function isReservedByCurrentStudent(caseInfo, studentId) {
  return Boolean(studentId && caseInfo.assignedStudentId && String(caseInfo.assignedStudentId) === String(studentId));
}

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-badge--${status.toLowerCase()}`}>
    {formatStatusLabel(status)}
  </span>
);

const DiagBadge = ({ diagnosis, label }) => (
  <span className={`diag-badge diag-badge--${diagnosis}`}>{label}</span>
);

function Toast({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className={`pdp-toast pdp-toast--${notification.type}`} role="alert" aria-live="polite">
      <span className="pdp-toast__icon" aria-hidden="true">{notification.type === 'success' ? '✓' : '!'}</span>
      <span className="pdp-toast__msg">{notification.message}</span>
      <button type="button" className="pdp-toast__close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}

function StatusDialog({ caseInfo, isPending, onComplete, onUnreserve }) {
  if (!caseInfo) return null;

  return (
    <div className="pdp-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="status-title">
      <div className="pdp-dialog">
        <div className="pdp-dialog__header">
          <h2 className="pdp-dialog__title" id="status-title">Change Case Status</h2>
        </div>
        <div className="pdp-dialog__body">
          <div className="pdp-dialog__detail">
            <span>Tooth {caseInfo.tooth}</span>
            <span>—</span>
            <span>{caseInfo.diagnosisLabel}</span>
          </div>
        </div>
        <div className="pdp-dialog__footer">
          <button type="button" className="pdp-dialog__btn pdp-dialog__btn--confirm" onClick={onComplete} disabled={isPending}>
            Mark as Completed
          </button>
          <button type="button" className="pdp-dialog__btn pdp-dialog__btn--cancel" onClick={onUnreserve} disabled={isPending}>
            Cancel Reservation
          </button>
        </div>
      </div>
    </div>
  );
}

function NotesDialog({ caseInfo, isPending, onCancel, onSave }) {
  const [notes, setNotes] = useState(caseInfo?.notes || '');

  useEffect(() => setNotes(caseInfo?.notes || ''), [caseInfo]);

  if (!caseInfo) return null;

  return (
    <div className="pdp-dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="notes-title">
      <div className="pdp-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="pdp-dialog__header">
          <h2 className="pdp-dialog__title" id="notes-title">Case Notes</h2>
        </div>
        <div className="pdp-dialog__body">
          <textarea
            className="pdp-dialog__textarea"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Enter notes..."
            aria-label={`Notes for tooth ${caseInfo.tooth}`}
          />
        </div>
        <div className="pdp-dialog__footer">
          <button type="button" className="pdp-dialog__btn pdp-dialog__btn--cancel" onClick={onCancel} disabled={isPending}>
            Cancel
          </button>
          <button type="button" className="pdp-dialog__btn pdp-dialog__btn--confirm" onClick={() => onSave(notes)} disabled={isPending}>
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

const CaseCard = React.forwardRef(function CaseCard(
  { caseInfo, highlighted, isPending, studentId, onReserve, onChangeStatus, onAddNote },
  ref,
) {
  const canChangeStatus = caseInfo.status === 'RESERVED' && isReservedByCurrentStudent(caseInfo, studentId);

  return (
    <div ref={ref} id={`case-${caseInfo.id}`} className={`case-card${highlighted ? ' case-card--highlighted' : ''}`}>
      <div className="case-card__header">
        <div className="case-card__tooth-badge">Tooth {caseInfo.tooth}</div>
        <DiagBadge diagnosis={caseInfo.diagnosis} label={caseInfo.diagnosisLabel} />
        <StatusBadge status={caseInfo.status} />
      </div>

      <dl className="case-card__dl">
        <div className="case-card__dl-row">
          <dt>Treatment</dt>
          <dd>{caseInfo.treatment}</dd>
        </div>
        {caseInfo.details && (
          <div className="case-card__dl-row">
            <dt>Details</dt>
            <dd>{caseInfo.details}</dd>
          </div>
        )}
        <div className="case-card__dl-row">
          <dt>Notes</dt>
          <dd>{caseInfo.notes || <span className="case-card__unassigned">No notes available.</span>}</dd>
        </div>
      </dl>

      <div className="case-card__footer">
        {caseInfo.status === 'AVAILABLE' && (
          <button type="button" className="case-card__reserve-btn" onClick={() => onReserve(caseInfo)} disabled={isPending}>
            Reserve
          </button>
        )}
        {canChangeStatus && (
          <button type="button" className="case-card__reserve-btn" onClick={() => onChangeStatus(caseInfo)} disabled={isPending}>
            Change Status
          </button>
        )}
        <button type="button" className="case-card__note-btn" onClick={() => onAddNote(caseInfo)}>
          Add Note
        </button>
      </div>
    </div>
  );
});

function PatientDetailsContent({ children, sidebarOpen, setSidebarOpen, studentProfile }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="dashboard-main">
        <Topbar pageTitle="Patient Details" user={studentProfile} onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-content pdp">{children}</main>
      </div>
    </div>
  );
}

export default function PatientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightedCase, setHighlightedCase] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [notesTarget, setNotesTarget] = useState(null);
  const [notification, setNotification] = useState(null);
  const highlightTimer = useRef(null);
  const notificationTimer = useRef(null);
  const caseRefs = useRef({});
  const studentId = user?.id || localStorage.getItem('userId');
  const studentProfile = getStudentProfile(user, studentId);
  const patientQueryKey = ['student-patient-details', id];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: patientQueryKey,
    queryFn: () => getPatientDetails(id),
    enabled: Boolean(id),
    retry: false,
  });

  const refreshPatientDetails = useCallback(
    () => queryClient.invalidateQueries({ queryKey: patientQueryKey, exact: true }),
    [patientQueryKey, queryClient],
  );

  const refreshStudentCaseQueries = useCallback(
    () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ['student-cases'] }),
      queryClient.invalidateQueries({ queryKey: ['student-reserved-cases', studentId] }),
      queryClient.invalidateQueries({ queryKey: ['student-completed-cases', studentId] }),
    ]),
    [queryClient, studentId],
  );

  const showNotification = useCallback((type, message) => {
    clearTimeout(notificationTimer.current);
    setNotification({ type, message });
    notificationTimer.current = setTimeout(() => setNotification(null), 3500);
  }, []);

  const reserveMutation = useMutation({
    mutationFn: (caseInfo) => bookCase(caseInfo.id),
    onSuccess: async (result, caseInfo) => {
      await Promise.all([refreshPatientDetails(), refreshStudentCaseQueries()]);
      showNotification('success', `Case for Tooth ${caseInfo.tooth} reserved successfully.`);
    },
    onError: () => showNotification('error', 'Unable to reserve this case. Please try again.'),
  });

  const completeMutation = useMutation({
    mutationFn: (caseInfo) => completeCase(studentId, caseInfo.id),
    onSuccess: async (result, caseInfo) => {
      await Promise.all([refreshPatientDetails(), refreshStudentCaseQueries()]);
      setStatusTarget(null);
      showNotification('success', `Case for Tooth ${caseInfo.tooth} marked as completed.`);
    },
    onError: () => showNotification('error', 'Unable to complete this case. Please try again.'),
  });

  const unreserveMutation = useMutation({
    mutationFn: (caseInfo) => unreserveCase(studentId, caseInfo.id),
    onSuccess: async (result, caseInfo) => {
      await Promise.all([refreshPatientDetails(), refreshStudentCaseQueries()]);
      setStatusTarget(null);
      showNotification('success', `Reservation for Tooth ${caseInfo.tooth} cancelled.`);
    },
    onError: () => showNotification('error', 'Unable to cancel this reservation. Please try again.'),
  });

  const notesMutation = useMutation({
    mutationFn: ({ caseInfo, notes }) => updateCaseNotes(studentId, caseInfo.id, notes),
    onSuccess: async (result, { caseInfo }) => {
      await refreshPatientDetails();
      setNotesTarget(null);
      showNotification('success', `Notes for Tooth ${caseInfo.tooth} saved.`);
    },
    onError: () => showNotification('error', 'Unable to save notes. Please try again.'),
  });

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  useEffect(() => () => {
    clearTimeout(highlightTimer.current);
    clearTimeout(notificationTimer.current);
  }, []);

  const patient = useMemo(() => getPatient(data), [data]);
  const cases = useMemo(() => getPatientCases(patient).map(normalizeCase).filter((caseInfo) => caseInfo.id), [patient]);
  const counts = useMemo(() => ({
    available: cases.filter((caseInfo) => caseInfo.status === 'AVAILABLE').length,
    reserved: cases.filter((caseInfo) => caseInfo.status === 'RESERVED').length,
    completed: cases.filter((caseInfo) => caseInfo.status === 'COMPLETED').length,
  }), [cases]);

  const handleToothClick = useCallback((tooth) => {
    const caseInfo = cases.find((currentCase) => String(currentCase.tooth) === String(tooth));
    if (!caseInfo) return;

    clearTimeout(highlightTimer.current);
    caseRefs.current[caseInfo.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedCase(caseInfo.id);
    highlightTimer.current = setTimeout(() => setHighlightedCase(null), 2500);
  }, [cases]);

  if (isLoading) {
    return <PatientDetailsContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} studentProfile={studentProfile}><p className="pdp__not-found">Loading patient details…</p></PatientDetailsContent>;
  }

  if (isError || !patient) {
    const message = error?.response?.status === 404 || !patient
      ? 'Patient not found.'
      : 'Unable to load patient details. Please try again.';
    return <PatientDetailsContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} studentProfile={studentProfile}><p className="pdp__not-found">{message}</p></PatientDetailsContent>;
  }

  const patientName = getPatientName(patient);
  const patientId = valueOr(patient.patientId, patient.id, patient._id, id) || '—';
  const age = valueOr(patient.age, patient.patientAge);
  const gender = valueOr(patient.gender, patient.sex);
  const phone = valueOr(patient.phone, patient.phoneNumber, patient.mobile);
  const isStatusPending = completeMutation.isPending || unreserveMutation.isPending;

  return (
    <PatientDetailsContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} studentProfile={studentProfile}>
      <div className="pdp__header">
        <button type="button" className="pdp__back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div className="pdp__patient-info">
          <div className="pdp__patient-avatar" aria-hidden="true">{patientName.split(' ').filter(Boolean).map((name) => name[0]).join('').slice(0, 2)}</div>
          <div>
            <h1 className="pdp__patient-name">{patientName}</h1>
            <div className="pdp__patient-meta">
              <span>{patientId}</span>
              <span className="pdp__dot" aria-hidden="true">·</span>
              <span>{age === undefined ? '—' : `${age} yrs`}</span>
              <span className="pdp__dot" aria-hidden="true">·</span>
              <span>{gender || '—'}</span>
              <span className="pdp__dot" aria-hidden="true">·</span>
              <span>{phone || '—'}</span>
            </div>
          </div>
        </div>

        <div className="pdp__status-pills">
          <span className="pdp__pill pdp__pill--available">{counts.available} Available</span>
          <span className="pdp__pill pdp__pill--reserved">{counts.reserved} Reserved</span>
          <span className="pdp__pill pdp__pill--completed">{counts.completed} Completed</span>
        </div>
      </div>

      <section className="pdp__section">
        <div className="pdp__section-header">
          <h2 className="pdp__section-title">Dental Overview</h2>
          <span className="pdp__section-badge">{cases.length} {cases.length === 1 ? 'case' : 'cases'}</span>
        </div>
        <div className="pdp__section-body"><PatientDentalChart cases={cases} onToothClick={handleToothClick} /></div>
      </section>

      <section className="pdp__section">
        <div className="pdp__section-header"><h2 className="pdp__section-title">Patient Cases</h2></div>
        <div className="pdp__section-body">
          {cases.length === 0 ? <p className="pdp__empty">No cases recorded for this patient.</p> : (
            <div className="case-grid">
              {cases.map((caseInfo) => (
                <CaseCard
                  key={caseInfo.id}
                  ref={(element) => { caseRefs.current[caseInfo.id] = element; }}
                  caseInfo={caseInfo}
                  highlighted={highlightedCase === caseInfo.id}
                  studentId={studentId}
                  isPending={reserveMutation.isPending}
                  onReserve={(currentCase) => reserveMutation.mutate(currentCase)}
                  onChangeStatus={setStatusTarget}
                  onAddNote={setNotesTarget}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <StatusDialog
        caseInfo={statusTarget}
        isPending={isStatusPending}
        onComplete={() => completeMutation.mutate(statusTarget)}
        onUnreserve={() => unreserveMutation.mutate(statusTarget)}
      />
      <NotesDialog
        caseInfo={notesTarget}
        isPending={notesMutation.isPending}
        onCancel={() => setNotesTarget(null)}
        onSave={(notes) => notesMutation.mutate({ caseInfo: notesTarget, notes })}
      />
      <Toast notification={notification} onClose={() => setNotification(null)} />
    </PatientDetailsContent>
  );
}
