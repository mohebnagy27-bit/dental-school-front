import { PATIENT_REGISTRATION_CONFIG, DIAGNOSIS_BY_ID } from '../../config/patientRegistration';
import FormField from './FormField';
import FormSection from './FormSection';

export default function DiagnosisSection({
  diagnosis,
  error,
  isUnlocked,
  pendingTeeth,
  sectionRef,
  onDiagnosisChange,
  onToothToggle,
  onClearTeeth,
  onAdd,
}) {
  const { diagnosis: labels } = PATIENT_REGISTRATION_CONFIG.sections;
  const selectedDiagnosis = DIAGNOSIS_BY_ID[diagnosis.type];
  const selectedTeeth = Array.from(pendingTeeth).sort((a, b) => a - b);
  const selectionLabel = pendingTeeth.size > 0
    ? `${pendingTeeth.size} tooth${pendingTeeth.size > 1 ? ' teeth' : ''} selected`
    : 'No teeth selected';

  return (
    <FormSection title={labels.title} locked={!isUnlocked} sectionRef={sectionRef}>
      <div className="reg-teeth-indicator">
        <div className="reg-teeth-indicator__count">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2C5.79 2 4 3.79 4 6c0 2.38 1.5 4.5 3.5 6h1C10.5 10.5 12 8.38 12 6c0-2.21-1.79-4-4-4z" fill="#1D6FD8" fillOpacity=".15" stroke="#1D6FD8" strokeWidth="1.2" />
          </svg>
          <span>{selectionLabel}</span>
        </div>
        {selectedTeeth.length > 0 && (
          <div className="reg-teeth-tags">
            {selectedTeeth.map((toothNumber) => (
              <button
                key={toothNumber}
                type="button"
                className="reg-tooth-tag"
                onClick={() => onToothToggle(toothNumber)}
                title={`Remove tooth ${toothNumber}`}
              >
                {toothNumber}<span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" className="reg-teeth-clear" onClick={onClearTeeth}>Clear all</button>
          </div>
        )}
      </div>

      <div className="reg-row reg-row--2">
        <FormField label={labels.diagnosisLabel} required>
          <select
            className="reg-select"
            value={diagnosis.type}
            onChange={(event) => onDiagnosisChange('type', event.target.value)}
          >
            <option value="">{labels.selectDiagnosisPlaceholder}</option>
            {PATIENT_REGISTRATION_CONFIG.diagnoses.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </FormField>
        {selectedDiagnosis?.subtypes.length > 0 && (
          <FormField label={labels.cariesClassLabel} required>
            <select
              className="reg-select"
              value={diagnosis.subtype}
              onChange={(event) => onDiagnosisChange('subtype', event.target.value)}
            >
              <option value="">{labels.selectSubtypePlaceholder}</option>
              {selectedDiagnosis.subtypes.map((subtype) => <option key={subtype} value={subtype}>{subtype}</option>)}
            </select>
          </FormField>
        )}
      </div>

      {error && <p className="reg-form-error" role="alert">{error}</p>}
      <div className="reg-section__actions">
        <button type="button" className="reg-btn reg-btn--primary" onClick={onAdd} disabled={!isUnlocked}>
          {labels.addLabel}
        </button>
        <span className="reg-section__actions-hint">{labels.addHint}</span>
      </div>
    </FormSection>
  );
}
