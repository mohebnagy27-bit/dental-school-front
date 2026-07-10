import '../../styles/SearchBar.css';

export default function SearchBar({ placeholder = 'Search...', value, onChange, 
  onClear 
}) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        className="search-bar__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={onClear}
          aria-label="Clear search"
          type="button"
          >
          ✕
        </button>
      )}
    </div>
  );
}
