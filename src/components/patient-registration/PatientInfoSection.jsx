import FormField from './FormField';
import FormSection from './FormSection';

export default function PatientInfoSection({ patient, errors, isValid, onChange, onBlur }) {
  return (
    <FormSection title="Patient Information" badge="Required">
      <div className="reg-row reg-row--3">
        <FormField label="Patient Name" required error={errors.name}>
          <input
            type="text"
            className={`reg-input${errors.name ? ' reg-input--error' : ''}`}
            value={patient.name}
            onChange={(event) => onChange('name', event.target.value)}
            onBlur={() => onBlur('name')}
            placeholder="Full name"
            autoComplete="name"
          />
        </FormField>
        <FormField label="Age" required error={errors.age}>
          <input
            type="number"
            className={`reg-input${errors.age ? ' reg-input--error' : ''}`}
            value={patient.age}
            onChange={(event) => onChange('age', event.target.value)}
            onBlur={() => onBlur('age')}
            placeholder="e.g. 32"
            min="1"
            max="120"
          />
        </FormField>
        <FormField label="Phone Number" required error={errors.phone} hint="7–15 digits, any format">
          <input
            type="tel"
            className={`reg-input${errors.phone ? ' reg-input--error' : ''}`}
            value={patient.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            onBlur={() => onBlur('phone')}
            placeholder="e.g. +20 123 456 7890"
            autoComplete="tel"
            style={{ fontSize: 'max(16px, 0.875rem)' }}
          />
        </FormField>
      </div>
      {isValid && (
        <div className="reg-patient-valid" role="status">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6.5" stroke="#22C55E" />
            <path d="M4 7l2 2 4-4" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Patient information complete — form unlocked.
        </div>
      )}
    </FormSection>
  );
}
