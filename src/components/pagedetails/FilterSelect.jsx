import '../../styles/pagedetails/FilterSelect.css';

export default function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="filter-select">
      {label && <span className="filter-select__label">{label}</span>}
      <span className="filter-select__control">
        <select
          className="filter-select__input"
          value={value}
          onChange={onChange}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="filter-select__chevron"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </label>
  );
}
