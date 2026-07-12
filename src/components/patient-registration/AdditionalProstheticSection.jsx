import FormSection from './FormSection';

export default function AdditionalProstheticSection({ options, isUnlocked, onChange }) {
  return (
    <FormSection title="Additional Prosthetic Options" locked={!isUnlocked}>
      <div className="reg-additional">
        <div className="reg-additional__item">
          <label className="reg-checkbox-label reg-checkbox-label--lg">
            <input type="checkbox" checked={options.completeDenture} onChange={(event) => onChange('completeDenture', event.target.checked)} />
            <span><strong>Complete Denture</strong><span className="reg-checkbox-label__sub">Full arch tooth replacement</span></span>
          </label>
        </div>
        <div className="reg-additional__item">
          <label className="reg-checkbox-label reg-checkbox-label--lg">
            <input type="checkbox" checked={options.singleDenture} onChange={(event) => onChange('singleDenture', event.target.checked)} />
            <span><strong>Single Denture</strong><span className="reg-checkbox-label__sub">One-arch partial or full denture</span></span>
          </label>
          {options.singleDenture && (
            <div className="reg-additional__sub">
              <fieldset className="reg-fieldset reg-fieldset--inline">
                <legend className="reg-fieldset__legend">Arch</legend>
                <div className="reg-radio-group">
                  {['Upper Arch', 'Lower Arch'].map((arch) => (
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
      </div>
    </FormSection>
  );
}
