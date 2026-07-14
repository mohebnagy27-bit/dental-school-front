import FormSection from './FormSection';
import { PATIENT_REGISTRATION_CONFIG } from '../../config/patientRegistration';

export default function AdditionalProstheticSection({ options, isUnlocked, onChange }) {
  const { prostheticOptions } = PATIENT_REGISTRATION_CONFIG;

  return (
    <FormSection title={prostheticOptions.title} locked={!isUnlocked}>
      <div className="reg-additional">
        {prostheticOptions.items.map((item) => (
          <div key={item.id} className="reg-additional__item">
            <label className="reg-checkbox-label reg-checkbox-label--lg">
              <input type="checkbox" checked={options[item.id]} onChange={(event) => onChange(item.id, event.target.checked)} />
              <span><strong>{item.label}</strong><span className="reg-checkbox-label__sub">{item.description}</span></span>
            </label>
            {options[item.id] && item.options && (
            <div className="reg-additional__sub">
              <fieldset className="reg-fieldset reg-fieldset--inline">
                <legend className="reg-fieldset__legend">{item.optionLabel}</legend>
                <div className="reg-radio-group">
                  {item.options.map((arch) => (
                    <label key={arch} className="reg-radio-label">
                      <input type="radio" name="singleArch" value={arch} checked={options.singleArch === arch} onChange={(event) => onChange('singleArch', event.target.value)} />
                      {arch}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
          </div>
        ))}
      </div>
    </FormSection>
  );
}
