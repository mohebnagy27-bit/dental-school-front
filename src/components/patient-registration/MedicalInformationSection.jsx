import FormField from './FormField';
import FormSection from './FormSection';
import { PATIENT_REGISTRATION_CONFIG } from '../../config/patientRegistration';

export default function MedicalInformationSection({ medical, isUnlocked, onChange }) {
  const { medicalInformation } = PATIENT_REGISTRATION_CONFIG;

  return (
    <FormSection title={medicalInformation.title} locked={!isUnlocked}>
      <div className="reg-row reg-row--2">
        {medicalInformation.fields.slice(0, 2).map((field) => (
          <FormField key={field.key} label={field.label} hint={field.hint}>
            <textarea className="reg-textarea" value={medical[field.key]} onChange={(event) => onChange(field.key, event.target.value)} placeholder={field.placeholder} rows={field.rows} />
          </FormField>
        ))}
      </div>
      <FormField label={medicalInformation.fields[2].label} hint={medicalInformation.fields[2].hint}>
        <textarea className="reg-textarea" value={medical.notes} onChange={(event) => onChange('notes', event.target.value)} placeholder={medicalInformation.fields[2].placeholder} rows={medicalInformation.fields[2].rows} />
      </FormField>
    </FormSection>
  );
}
