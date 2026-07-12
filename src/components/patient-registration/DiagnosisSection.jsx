import { CARIES_CLASSES } from './constants';
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
  const selectedTeeth = Array.from(pendingTeeth).sort((a, b) => a - b);
  const selectionLabel = pendingTeeth.size > 0
    ? `${pendingTeeth.size} tooth${pendingTeeth.size > 1 ? ' teeth' : ''} selected`
    : 'No teeth selected';

  return (
    <FormSection title="Diagnosis Assignment" locked={!isUnlocked} sectionRef={sectionRef}>
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
        <FormField label="Diagnosis Type" required>
          <select
            className="reg-select"
            value={diagnosis.type}
            onChange={(event) => onDiagnosisChange('type', event.target.value)}
          >
            <option value="">Select diagnosis…</option>
            <option value="caries">Caries</option>
            <option value="extraction">Extraction</option>
            <option value="remaining_root">Remaining Root</option>
          </select>
        </FormField>
        {diagnosis.type === 'caries' && (
          <FormField label="Caries Class" required>
            <select
              className="reg-select"
              value={diagnosis.subtype}
              onChange={(event) => onDiagnosisChange('subtype', event.target.value)}
            >
              <option value="">Select class…</option>
              {CARIES_CLASSES.map((cariesClass) => <option key={cariesClass} value={cariesClass}>{cariesClass}</option>)}
            </select>
          </FormField>
        )}
      </div>

      {error && <p className="reg-form-error" role="alert">{error}</p>}
      <div className="reg-section__actions">
        <button type="button" className="reg-btn reg-btn--primary" onClick={onAdd} disabled={!isUnlocked}>
          + Add Diagnosis Group
        </button>
        <span className="reg-section__actions-hint">Assigns the selected teeth to this diagnosis and adds it to the summary table.</span>
      </div>
    </FormSection>
  );
}
