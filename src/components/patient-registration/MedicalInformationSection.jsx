import FormField from './FormField';
import FormSection from './FormSection';

export default function MedicalInformationSection({ medical, isUnlocked, onChange }) {
  return (
    <FormSection title="Medical Information" locked={!isUnlocked}>
      <div className="reg-row reg-row--2">
        <FormField label="Medical History" hint="Current conditions, medications, allergies…">
          <textarea className="reg-textarea" value={medical.history} onChange={(event) => onChange('history', event.target.value)} placeholder="Enter relevant medical history…" rows={4} />
        </FormField>
        <FormField label="Complications" hint="Previous dental complications or concerns">
          <textarea className="reg-textarea" value={medical.complications} onChange={(event) => onChange('complications', event.target.value)} placeholder="Enter known complications…" rows={4} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="reg-textarea" value={medical.notes} onChange={(event) => onChange('notes', event.target.value)} placeholder="Additional clinical notes…" rows={3} />
      </FormField>
    </FormSection>
  );
}
