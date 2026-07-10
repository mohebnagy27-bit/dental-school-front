import React from 'react';
import '../../styles/pagedetails/RegistrationConfirmDialog.css';

export default function RegistrationConfirmDialog({
  isOpen,
  isSaving,
  saveSuccess,
  patientName,
  patientAge,
  patientPhone,
  cases,
  completeDenture,
  singleDenture,
  singleArch,
  medicalHistory,
  complications,
  notes,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const hasOrtho = completeDenture || singleDenture;

  return (
    <div
      className="rcd-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rcd-title"
      onClick={!isSaving && !saveSuccess ? onCancel : undefined}
    >
      <div className="rcd" onClick={(e) => e.stopPropagation()}>
        {/* ── Success state ── */}
        {saveSuccess ? (
          <div className="rcd__success">
            <div className="rcd__success-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="23" stroke="#22C55E" strokeWidth="2" />
                <path d="M14 24l7 7 13-14" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="rcd__success-title">Patient Registered</h2>
            <p className="rcd__success-msg">The record has been saved successfully.</p>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="rcd__header">
              <h2 className="rcd__title" id="rcd-title">Confirm Registration</h2>
              <button
                type="button"
                className="rcd__close"
                onClick={onCancel}
                disabled={isSaving}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="rcd__body">

              {/* Patient info */}
              <section className="rcd__section">
                <h3 className="rcd__section-title">Patient Information</h3>
                <dl className="rcd__dl">
                  <div className="rcd__dl-row">
                    <dt>Name</dt>
                    <dd>{patientName}</dd>
                  </div>
                  <div className="rcd__dl-row">
                    <dt>Age</dt>
                    <dd>{patientAge}</dd>
                  </div>
                  <div className="rcd__dl-row">
                    <dt>Phone</dt>
                    <dd>{patientPhone}</dd>
                  </div>
                </dl>
              </section>

              {/* Cases summary */}
              {cases.length > 0 && (
                <section className="rcd__section">
                  <h3 className="rcd__section-title">Cases Summary</h3>
                  <div className="rcd__cases">
                    {cases.map((c, i) => {
                      let label = '';
                      let sub = '';

                      if (c.type === 'diagnosis') {
                        label = c.diagnosisLabel;
                        sub = `Teeth: ${c.teeth.sort((a, b) => a - b).join(', ')}`;
                      } else if (c.type === 'treatment') {
                        label = c.treatmentLabel;
                        if (c.treatmentTeeth && c.treatmentTeeth.length > 0) {
                          sub = `Missing teeth: ${c.treatmentTeeth.sort((a, b) => a - b).join(', ')}`;
                        }
                      }

                      const catClass = c.type === 'diagnosis'
                        ? `rcd__case-item--${c.diagnosisCategory}`
                        : 'rcd__case-item--treatment';

                      return (
                        <div key={c.id} className={`rcd__case-item ${catClass}`}>
                          <span className="rcd__case-num">#{i + 1}</span>
                          <div className="rcd__case-detail">
                            <strong>{label}</strong>
                            {sub && <span>{sub}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Orthodontic / Prosthetic */}
              {hasOrtho && (
                <section className="rcd__section">
                  <h3 className="rcd__section-title">Orthodontic / Prosthetic</h3>
                  <ul className="rcd__list">
                    {completeDenture && <li>Complete Denture</li>}
                    {singleDenture && (
                      <li>
                        Single Denture
                        {singleArch && ` — ${singleArch}`}
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {/* Medical info */}
              {(medicalHistory || complications) && (
                <section className="rcd__section">
                  <h3 className="rcd__section-title">Medical Information</h3>
                  <dl className="rcd__dl">
                    {medicalHistory && (
                      <div className="rcd__dl-row rcd__dl-row--block">
                        <dt>Medical History</dt>
                        <dd>{medicalHistory}</dd>
                      </div>
                    )}
                    {complications && (
                      <div className="rcd__dl-row rcd__dl-row--block">
                        <dt>Complications</dt>
                        <dd>{complications}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              {/* Notes */}
              {notes && (
                <section className="rcd__section">
                  <h3 className="rcd__section-title">Notes</h3>
                  <p className="rcd__notes-text">{notes}</p>
                </section>
              )}

              {cases.length === 0 && !hasOrtho && !medicalHistory && !complications && !notes && (
                <p className="rcd__empty">No cases or additional information recorded.</p>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="rcd__footer">
              <button
                type="button"
                className="rcd__btn rcd__btn--cancel"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rcd__btn rcd__btn--confirm"
                onClick={onConfirm}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="rcd__spinner" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  'Confirm Save'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
