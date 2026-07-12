import { TOOTH_QUADRANTS } from './constants';

export default function ToothPicker({ selected, onChange, label }) {
  const toggleTooth = (toothNumber) => {
    const nextSelection = new Set(selected);
    nextSelection.has(toothNumber) ? nextSelection.delete(toothNumber) : nextSelection.add(toothNumber);
    onChange(nextSelection);
  };

  return (
    <div className="tooth-picker">
      {label && <p className="tooth-picker__label">{label}</p>}
      <div className="tooth-picker__quadrants">
        {TOOTH_QUADRANTS.map((quadrant) => (
          <div key={quadrant.label} className="tooth-picker__quadrant">
            <span className="tooth-picker__q-label">{quadrant.label}</span>
            <div className="tooth-picker__teeth">
              {quadrant.teeth.map((toothNumber) => (
                <button
                  key={toothNumber}
                  type="button"
                  className={`tooth-picker__btn${selected.has(toothNumber) ? ' tooth-picker__btn--active' : ''}`}
                  onClick={() => toggleTooth(toothNumber)}
                  title={`Tooth ${toothNumber}`}
                  aria-pressed={selected.has(toothNumber)}
                >
                  {toothNumber}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected.size > 0 && (
        <p className="tooth-picker__selected">
          Selected: {Array.from(selected).sort((a, b) => a - b).join(', ')}
        </p>
      )}
    </div>
  );
}
