import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import PatientDentalChart from '../../components/DentalChart/PatientDentalChart';
import '../../styles/student/PatientDetailsPage.css';
/* ================================================================
   MOCK DATA
   ================================================================ */

const MOCK_PATIENTS = {
  'PAT-001': {
    id: 'PAT-001',
    name: 'Ahmed Hassan',
    age: 32,
    gender: 'Male',
    phone: '+20 123 456 7890',
    addedDate: '15 Jan 2024',
    cases: [
      {
        id: 'c1', tooth: 16,
        diagnosis: 'caries', diagnosisLabel: 'Caries — Class II',
        treatment: 'Composite Filling',
        details: 'Mesio-occlusal surface involvement',
        student: 'Sarah Johnson (STU-20240001)',
        status: 'Available',
      },
      {
        id: 'c2', tooth: 26,
        diagnosis: 'caries', diagnosisLabel: 'Caries — Class III',
        treatment: 'Composite Filling',
        details: 'Approximal surface caries',
        student: null,
        status: 'Available',
      },
      {
        id: 'c3', tooth: 36,
        diagnosis: 'extraction', diagnosisLabel: 'Extraction',
        treatment: 'Surgical Extraction',
        details: 'Non-restorable, Grade III mobility',
        student: 'Mohammed Ali (STU-20240042)',
        status: 'Reserved',
      },
      {
        id: 'c4', tooth: 11,
        diagnosis: 'remaining_root', diagnosisLabel: 'Remaining Root',
        treatment: 'Extraction',
        details: 'Post-traumatic root remnant',
        student: 'Layla Ibrahim (STU-20240099)',
        status: 'Completed',
      },
      {
        id: 'c5', tooth: 46,
        diagnosis: 'caries', diagnosisLabel: 'Caries — Class I',
        treatment: 'Amalgam Restoration',
        details: 'Pit and fissure occlusal caries',
        student: null,
        status: 'Available',
      },
    ],
  },
  'PAT-002': {
    id: 'PAT-002',
    name: 'Fatima Malik',
    age: 45,
    gender: 'Female',
    phone: '+20 155 789 1234',
    addedDate: '3 Feb 2024',
    cases: [
      {
        id: 'c6', tooth: 14,
        diagnosis: 'caries', diagnosisLabel: 'Caries — Class V',
        treatment: 'GIC Restoration',
        details: 'Cervical caries near gum line',
        student: null,
        status: 'Available',
      },
      {
        id: 'c7', tooth: 24,
        diagnosis: 'extraction', diagnosisLabel: 'Extraction',
        treatment: 'Simple Extraction',
        details: 'Periodontally compromised tooth',
        student: null,
        status: 'Available',
      },
      {
        id: 'c8', tooth: 17,
        diagnosis: 'remaining_root', diagnosisLabel: 'Remaining Root',
        treatment: 'Surgical Extraction',
        details: 'Root fracture below the gum line',
        student: 'Sarah Johnson (STU-20240001)',
        status: 'Reserved',
      },
    ],
  },
  'PAT-003': {
    id: 'PAT-003',
    name: 'Omar Khalid',
    age: 28,
    gender: 'Male',
    phone: '+20 100 234 5678',
    addedDate: '22 Jan 2024',
    cases: [
      {
        id: 'c9', tooth: 47,
        diagnosis: 'caries', diagnosisLabel: 'Caries — Class II',
        treatment: 'Composite Filling',
        details: 'Distal surface caries extending to pulp',
        student: null,
        status: 'Available',
      },
      {
        id: 'c10', tooth: 21,
        diagnosis: 'remaining_root', diagnosisLabel: 'Remaining Root',
        treatment: 'Extraction + Implant Planning',
        details: 'Tooth fracture, requires extraction',
        student: 'Mohammed Ali (STU-20240042)',
        status: 'Completed',
      },
    ],
  },
};

/* ================================================================
   STATUS BADGE
   ================================================================ */

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-badge--${status.toLowerCase()}`}>
    {status}
  </span>
);

/* ================================================================
   DIAGNOSIS BADGE
   ================================================================ */

const DiagBadge = ({ diagnosis, label }) => (
  <span className={`diag-badge diag-badge--${diagnosis}`}>{label}</span>
);

/* ================================================================
   TOAST NOTIFICATION
   ================================================================ */

const Toast = ({ notification, onClose }) => {
  if (!notification) return null;
  return (
    <div className={`pdp-toast pdp-toast--${notification.type}`} role="alert" aria-live="polite">
      <span className="pdp-toast__icon" aria-hidden="true">
        {notification.type === 'success' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : '!'}
      </span>
      <span className="pdp-toast__msg">{notification.msg}</span>
      <button type="button" className="pdp-toast__close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
};

/* ================================================================
   RESERVE DIALOG
   ================================================================ */

const ReserveDialog = ({ open, caseInfo, onConfirm, onCancel }) => {
  if (!open || !caseInfo) return null;
  return (
    <div className="pdp-dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="reserve-title">
      <div className="pdp-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pdp-dialog__header">
          <h2 className="pdp-dialog__title" id="reserve-title">Reserve Case</h2>
        </div>
        <div className="pdp-dialog__body">
          <p className="pdp-dialog__msg">Are you sure you want to reserve this case?</p>
          <div className="pdp-dialog__detail">
            <span>Tooth {caseInfo.tooth}</span>
            <span>—</span>
            <span>{caseInfo.diagnosisLabel}</span>
          </div>
        </div>
        <div className="pdp-dialog__footer">
          <button type="button" className="pdp-dialog__btn pdp-dialog__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="pdp-dialog__btn pdp-dialog__btn--confirm" onClick={onConfirm}>
            Confirm Reserve
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   CASE CARD
   ================================================================ */

const CaseCard = React.forwardRef(function CaseCard(
  { c, highlighted, onReserve },
  ref,
) {
  return (
    <div
      ref={ref}
      id={`case-${c.tooth}`}
      className={`case-card${highlighted ? ' case-card--highlighted' : ''}`}
    >
      {/* Card header */}
      <div className="case-card__header">
        <div className="case-card__tooth-badge">Tooth {c.tooth}</div>
        <DiagBadge diagnosis={c.diagnosis} label={c.diagnosisLabel} />
        <StatusBadge status={c.status} />
      </div>

      {/* Card body */}
      <dl className="case-card__dl">
        <div className="case-card__dl-row">
          <dt>Treatment</dt>
          <dd>{c.treatment}</dd>
        </div>
        {c.details && (
          <div className="case-card__dl-row">
            <dt>Details</dt>
            <dd>{c.details}</dd>
          </div>
        )}
        <div className="case-card__dl-row">
          <dt>Assigned Student</dt>
          <dd>{c.student || <span className="case-card__unassigned">Unassigned</span>}</dd>
        </div>
      </dl>

      {/* Reserve button — Available cases only */}
      {c.status === 'Available' && (
        <div className="case-card__footer">
          <button
            type="button"
            className="case-card__reserve-btn"
            onClick={() => onReserve(c)}
          >
            Reserve Case
          </button>
        </div>
      )}
    </div>
  );
});

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function PatientDetailsPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  /* Sidebar */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add('sidebar-open');
    else             document.body.classList.remove('sidebar-open');
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  /* Patient data — use param id, fall back to first patient */
  const patientSource = MOCK_PATIENTS[id] || MOCK_PATIENTS['PAT-001'];

  /* Cases as mutable state (so reserve can update status) */
  const [cases, setCases] = useState(() => patientSource.cases);

  /* Highlighted case (from chart tooth click) */
  const [highlightedCase, setHighlightedCase] = useState(null);
  const highlightTimer = useRef(null);
  const caseRefs       = useRef({});

  /* Reserve dialog */
  const [reserveTarget, setReserveTarget] = useState(null);

  /* Toast notification */
  const [notification, setNotification] = useState(null);
  const notifTimer = useRef(null);

  /* Cleanup on unmount */
  useEffect(() => () => {
    clearTimeout(highlightTimer.current);
    clearTimeout(notifTimer.current);
  }, []);

  /* ── Tooth click → scroll + highlight ── */
  const handleToothClick = useCallback((tooth) => {
    const match = cases.find((c) => c.tooth === tooth);
    if (!match) return;

    /* Clear any pending highlight timer */
    clearTimeout(highlightTimer.current);

    /* Scroll to case card */
    const el = caseRefs.current[match.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* Set highlight */
    setHighlightedCase(match.id);
    highlightTimer.current = setTimeout(() => setHighlightedCase(null), 2500);
  }, [cases]);

  /* ── Reserve ── */
  const handleReserveClick = useCallback((c) => {
    setReserveTarget(c);
  }, []);

  const handleReserveConfirm = useCallback(() => {
    if (!reserveTarget) return;
    const caseId = reserveTarget.id;

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'Reserved' } : c)),
    );
    setReserveTarget(null);

    /* Show success toast */
    clearTimeout(notifTimer.current);
    setNotification({ type: 'success', msg: `Case for Tooth ${reserveTarget.tooth} reserved successfully.` });
    notifTimer.current = setTimeout(() => setNotification(null), 3500);
  }, [reserveTarget]);

  const handleReserveCancel = useCallback(() => setReserveTarget(null), []);

  /* ── Count by status ── */
  const counts = useMemo(() => ({
    available: cases.filter((c) => c.status === 'Available').length,
    reserved:  cases.filter((c) => c.status === 'Reserved').length,
    completed: cases.filter((c) => c.status === 'Completed').length,
  }), [cases]);

  /* ── No patient found ── */
  if (!patientSource) {
    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="dashboard-main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="dashboard-content pdp">
            <p className="pdp__not-found">Patient not found.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="dashboard-content pdp">

          {/* ── Page header ── */}
          <div className="pdp__header">
            <button
              type="button"
              className="pdp__back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>

            <div className="pdp__patient-info">
              <div className="pdp__patient-avatar" aria-hidden="true">
                {patientSource.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="pdp__patient-name">{patientSource.name}</h1>
                <div className="pdp__patient-meta">
                  <span>{patientSource.id}</span>
                  <span className="pdp__dot" aria-hidden="true">·</span>
                  <span>{patientSource.age} yrs</span>
                  <span className="pdp__dot" aria-hidden="true">·</span>
                  <span>{patientSource.gender}</span>
                  <span className="pdp__dot" aria-hidden="true">·</span>
                  <span>{patientSource.phone}</span>
                </div>
              </div>
            </div>

            {/* Status summary pills */}
            <div className="pdp__status-pills">
              <span className="pdp__pill pdp__pill--available">{counts.available} Available</span>
              <span className="pdp__pill pdp__pill--reserved">{counts.reserved} Reserved</span>
              <span className="pdp__pill pdp__pill--completed">{counts.completed} Completed</span>
            </div>
          </div>

          {/* ── Dental Chart ── */}
          <section className="pdp__section">
            <div className="pdp__section-header">
              <h2 className="pdp__section-title">Dental Overview</h2>
              <span className="pdp__section-badge">{cases.length} {cases.length === 1 ? 'case' : 'cases'}</span>
            </div>
            <div className="pdp__section-body">
              <PatientDentalChart
                cases={cases}
                onToothClick={handleToothClick}
              />
            </div>
          </section>

          {/* ── Cases Grid ── */}
          <section className="pdp__section">
            <div className="pdp__section-header">
              <h2 className="pdp__section-title">Patient Cases</h2>
            </div>
            <div className="pdp__section-body">
              {cases.length === 0 ? (
                <p className="pdp__empty">No cases recorded for this patient.</p>
              ) : (
                <div className="case-grid">
                  {cases.map((c) => (
                    <CaseCard
                      key={c.id}
                      c={c}
                      highlighted={highlightedCase === c.id}
                      onReserve={handleReserveClick}
                      ref={(el) => { caseRefs.current[c.id] = el; }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* ── Reserve Dialog ── */}
      <ReserveDialog
        open={!!reserveTarget}
        caseInfo={reserveTarget}
        onConfirm={handleReserveConfirm}
        onCancel={handleReserveCancel}
      />

      {/* ── Toast ── */}
      <Toast notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
