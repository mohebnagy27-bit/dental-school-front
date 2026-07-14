import { PATIENT_REGISTRATION_CONFIG } from '../../config/patientRegistration';
import FormSection from './FormSection';
import ToothPicker from './ToothPicker';

function RadioChoices({ name, options, value, onChange, formatOption = (option) => option, onClear }) {
  return (
    <div className="reg-radio-group">
      {options.map((option) => (
        <label key={option} className="reg-radio-label">
          <input type="radio" name={name} value={option} checked={value === option} onChange={(event) => onChange(event.target.value)} />
          {formatOption(option)}
        </label>
      ))}
      {value && <button type="button" className="reg-clear-link" onClick={onClear}>Clear</button>}
    </div>
  );
}

export default function TreatmentSection({ treatment, error, isUnlocked, sectionRef, onChange, onAdd }) {
  const { treatment: labels } = PATIENT_REGISTRATION_CONFIG.sections;

  return (
    <FormSection title={labels.title} locked={!isUnlocked} sectionRef={sectionRef}>
      {PATIENT_REGISTRATION_CONFIG.treatmentPlans.map((plan) => (
        <fieldset key={plan.id} className="reg-fieldset">
          <legend className="reg-fieldset__legend">{plan.label}</legend>
          {plan.control === 'radio' ? (
            <RadioChoices
              name={plan.id}
              options={plan.options}
              value={treatment[plan.id]}
              formatOption={(option) => `${option}${plan.optionSuffix || ''}`}
              onChange={(value) => onChange(plan.id, value)}
              onClear={() => onChange(plan.id, '')}
            />
          ) : (
            <label className="reg-checkbox-label">
              <input type="checkbox" checked={treatment[plan.id]} onChange={(event) => onChange(plan.id, event.target.checked)} />
              {plan.checkboxLabel}
            </label>
          )}
          {treatment[plan.id] && plan.toothField && (
            <div className="reg-subsection">
              <ToothPicker selected={treatment[plan.toothField]} onChange={(value) => onChange(plan.toothField, value)} label={plan.toothPickerLabel} />
            </div>
          )}
        </fieldset>
      ))}

      {error && <p className="reg-form-error" role="alert">{error}</p>}
      <div className="reg-section__actions">
        <button type="button" className="reg-btn reg-btn--primary" onClick={onAdd} disabled={!isUnlocked}>{labels.addLabel}</button>
        <span className="reg-section__actions-hint">{labels.addHint}</span>
      </div>
    </FormSection>
  );
}
