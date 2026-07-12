import React from 'react';

export default function IdLookupField({ label, placeholder, value, onChange, notFound }) {
  return (
    <div className="stg-id-field">
      <label className="stg-field__label" htmlFor={`id-lookup-${label}`}>
        {label}
      </label>
      <input
        id={`id-lookup-${label}`}
        type="text"
        className={`stg-input${notFound ? ' stg-input--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder={placeholder}
      />
      {notFound && (
        <span className="stg-field__error">No record found for this ID.</span>
      )}
    </div>
  );
}