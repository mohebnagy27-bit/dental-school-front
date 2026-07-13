import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { getPatientById } from '../../components/pagedetails/mockPatients';
import '../../styles/pagedetails/shared-layout.css';
import '../../styles/pagedetails/PatientDetailsPage.css';
// import DentalChart from '../../components/DentalChart/DentalChart';

function StatusBadge({ value }) {
  return <span className={`status-badge status-badge--${value}`}>{value}</span>;
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const patient = getPatientById(id);

  function handleLogout() {
    setSidebarOpen(false);
    navigate('/doctor/login');
  }

  const doctorUser = {
    name: 'Dr. Ahmed Nasser',
    role: 'Doctor',
    initials: 'AN',
  };

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
          pageTitle="Patient Details"
          user={doctorUser}
          searchValue=""
          // onSearchChange={() => {}}
          // onMenuToggle={() => setSidebarOpen((o) => !o)}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="page-shell__content">
          {!patient ? (
            <div className="section-card patient-details__not-found">
              <h2 className="page-header__title">Patient not found</h2>
              <p className="page-header__sub">
                We couldn&apos;t find a patient with ID &ldquo;{id}&rdquo;.
              </p>
              <Link to="/doctor/patients" className="btn btn--primary">
                ← Back to Patients
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="page-header">
                <div>
                  <Link to="/doctor/patients" className="patient-details__back">
                    ← Back to Patients
                  </Link>
                  <h2 className="page-header__title">{patient.name}</h2>
                  <p className="page-header__sub">
                    Patient ID: P-{String(patient.id).padStart(4, '0')} &middot;{' '}
                    Registered {patient.registrationDate}
                  </p>
                </div>
                <div className="page-header__actions">
                  <StatusBadge value={patient.status} />
                </div>
              </div>

              {/* Dental Chart Placeholder */}
              <div className="section-card dental-chart-placeholder">
                <div className="dental-chart-placeholder__icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2c-2.5 0-4.5 1.5-5.5 3.5C5.5 7.5 5 9 5 11c0 3 1 6 2 8 .5 1 1.5 1.5 2 0 .5-1.5 1-3 2-3s1.5 1.5 2 3c.5 1.5 1.5 1 2 0 1-2 2-5 2-8 0-2-.5-3.5-1.5-5.5C16.5 3.5 14.5 2 12 2z" />
                  </svg>
                </div>
                <h3 className="dental-chart-placeholder__title">
                  Dental Chart Component Will Be Added Here
                </h3>
                <p className="dental-chart-placeholder__sub">
                  This space is reserved for the interactive Universal Numbering
                  System dental chart, which will visualize each tooth and its
                  associated case status.
                </p>
              </div>

              {/* Patient Information */}
              <div className="section-card">
                <h3 className="section-card__title">Patient Information</h3>
                <div className="patient-info-grid">
                  <div className="patient-info-item">
                    <span className="patient-info-item__label">Name</span>
                    <span className="patient-info-item__value">{patient.name}</span>
                  </div>
                  <div className="patient-info-item">
                    <span className="patient-info-item__label">Age</span>
                    <span className="patient-info-item__value">{patient.age} years</span>
                  </div>
                  <div className="patient-info-item">
                    <span className="patient-info-item__label">Phone</span>
                    <span className="patient-info-item__value">{patient.phone}</span>
                  </div>
                  <div className="patient-info-item">
                    <span className="patient-info-item__label">Gender</span>
                    <span className="patient-info-item__value">{patient.gender}</span>
                  </div>
                  <div className="patient-info-item patient-info-item--wide">
                    <span className="patient-info-item__label">Medical History</span>
                    <span className="patient-info-item__value">{patient.medicalHistory}</span>
                  </div>
                  <div className="patient-info-item patient-info-item--wide">
                    <span className="patient-info-item__label">Notes</span>
                    <span className="patient-info-item__value">{patient.notes}</span>
                  </div>
                </div>
              </div>

              {/* Case Information */}
              <div className="section-card">
                <h3 className="section-card__title">
                  Case Information ({patient.cases.length})
                </h3>
                <div className="case-list">
                  {patient.cases.map((c) => (
                    <div key={c.id} className="case-card">
                      <div className="case-card__header">
                        <span className="case-card__tooth">Tooth #{c.toothNumber}</span>
                        <StatusBadge value={c.status} />
                      </div>
                      <div className="case-card__grid">
                        <div className="case-card__item">
                          <span className="case-card__label">Diagnosis</span>
                          <span className="case-card__value">{c.diagnosis}</span>
                        </div>
                        <div className="case-card__item">
                          <span className="case-card__label">Treatment Type</span>
                          <span className="case-card__value">{c.treatmentType}</span>
                        </div>
                        <div className="case-card__item">
                          <span className="case-card__label">Reservation Status</span>
                          <span className="case-card__value">{c.reservationStatus}</span>
                        </div>
                        <div className="case-card__item">
                          <span className="case-card__label">Assigned Student</span>
                          <span className="case-card__value">{c.assignedStudent}</span>
                        </div>
                      </div>

                      {/* Treatment Timeline */}
                      <div className="treatment-timeline">
                        <span className="treatment-timeline__title">Treatment Timeline</span>
                        <ol className="treatment-timeline__list">
                          {c.timeline.map((step, idx) => (
                            <li
                              key={idx}
                              className={`treatment-timeline__step${step.done ? ' treatment-timeline__step--done' : ''}`}
                            >
                              <span className="treatment-timeline__dot" />
                              <div className="treatment-timeline__body">
                                <span className="treatment-timeline__stage">{step.stage}</span>
                                <span className="treatment-timeline__date">
                                  {step.date || 'Pending'}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
