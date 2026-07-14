import FormField from './FormField';
import FormSection from './FormSection';
import { PATIENT_REGISTRATION_CONFIG } from '../../config/patientRegistration';

export default function PatientInfoSection({ patient, errors, isValid, onChange, onBlur }) {
  const { patientInformation } = PATIENT_REGISTRATION_CONFIG;

  return (
    <FormSection title={patientInformation.title} badge={patientInformation.badge}>
      <div className="reg-row reg-row--3">
        {patientInformation.fields.map((field) => (
          <FormField key={field.key} label={field.label} required={field.required} error={errors[field.key]} hint={field.hint}>
            {field.type === 'select' ? (
              <select
                className={`reg-select${errors[field.key] ? ' reg-input--error' : ''}`}
                value={patient[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                onBlur={() => onBlur(field.key)}
              >
                <option value="">{field.placeholder}</option>
                {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <input
                type={field.type}
                className={`reg-input${errors[field.key] ? ' reg-input--error' : ''}`}
                value={patient[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                onBlur={() => onBlur(field.key)}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                min={field.min}
                max={field.max}
                style={field.key === 'phone' ? { fontSize: 'max(16px, 0.875rem)' } : undefined}
              />
            )}
          </FormField>
        ))}
      </div>
      {isValid && (
        <div className="reg-patient-valid" role="status">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6.5" stroke="#22C55E" />
            <path d="M4 7l2 2 4-4" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {patientInformation.completeMessage}
        </div>
      )}
    </FormSection>
  );
}
