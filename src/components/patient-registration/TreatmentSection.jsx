import { BRIDGE_OPTIONS, ORTHODONTIC_OPTIONS, SCALING_OPTIONS } from './constants';
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
  return (
    <FormSection title="Treatment Options" locked={!isUnlocked} sectionRef={sectionRef}>
      <fieldset className="reg-fieldset">
        <legend className="reg-fieldset__legend">Scaling</legend>
        <RadioChoices name="scaling" options={SCALING_OPTIONS} value={treatment.scaling} onChange={(value) => onChange('scaling', value)} onClear={() => onChange('scaling', '')} />
      </fieldset>

      <fieldset className="reg-fieldset">
        <legend className="reg-fieldset__legend">Orthodontic</legend>
        <RadioChoices name="orthodontic" options={ORTHODONTIC_OPTIONS} value={treatment.orthodontic} onChange={(value) => onChange('orthodontic', value)} onClear={() => onChange('orthodontic', '')} />
      </fieldset>

      <fieldset className="reg-fieldset">
        <legend className="reg-fieldset__legend">Bridge</legend>
        <RadioChoices name="bridge" options={BRIDGE_OPTIONS} value={treatment.bridge} formatOption={(option) => `${option} Bridge`} onChange={(value) => onChange('bridge', value)} onClear={() => onChange('bridge', '')} />
        {treatment.bridge && <div className="reg-subsection"><ToothPicker selected={treatment.bridgeTeeth} onChange={(value) => onChange('bridgeTeeth', value)} label="Select missing / pontic teeth:" /></div>}
      </fieldset>

      <fieldset className="reg-fieldset">
        <legend className="reg-fieldset__legend">Partial Denture</legend>
        <label className="reg-checkbox-label">
          <input type="checkbox" checked={treatment.partial} onChange={(event) => onChange('partial', event.target.checked)} />
          Include Partial Denture in treatment plan
        </label>
        {treatment.partial && <div className="reg-subsection"><ToothPicker selected={treatment.partialTeeth} onChange={(value) => onChange('partialTeeth', value)} label="Select missing teeth involved:" /></div>}
      </fieldset>

      <fieldset className="reg-fieldset">
        <legend className="reg-fieldset__legend">Implant</legend>
        <label className="reg-checkbox-label">
          <input type="checkbox" checked={treatment.implant} onChange={(event) => onChange('implant', event.target.checked)} />
          Include Implant in treatment plan
        </label>
        {treatment.implant && <div className="reg-subsection"><ToothPicker selected={treatment.implantTeeth} onChange={(value) => onChange('implantTeeth', value)} label="Select implant site teeth:" /></div>}
      </fieldset>

      {error && <p className="reg-form-error" role="alert">{error}</p>}
      <div className="reg-section__actions">
        <button type="button" className="reg-btn reg-btn--primary" onClick={onAdd} disabled={!isUnlocked}>+ Add Treatment</button>
        <span className="reg-section__actions-hint">Adds selected treatment options to the summary table.</span>
      </div>
    </FormSection>
  );
}
