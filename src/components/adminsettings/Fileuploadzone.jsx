import React, { useState } from 'react';

export default function FileUploadZone({
  inputRef,
  onFile,
  selectedFile,
  accept = '.xlsx,.xls',
  label,
  hint,
}) {
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      className={[
        'stg-upload-zone',
        drag ? 'stg-upload-zone--drag' : '',
        selectedFile ? 'stg-upload-zone--has-file' : '',
      ].filter(Boolean).join(' ')}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="stg-upload-zone__input"
        onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); e.target.value = ''; }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {selectedFile ? (
        <div className="stg-upload-zone__file">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M7 4h10l7 7v16a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" fill="#EFF6FF" stroke="#1D6FD8" strokeWidth="1.4" />
            <path d="M17 4v7h7" stroke="#1D6FD8" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <div>
            <p className="stg-upload-zone__filename">{selectedFile.name}</p>
            <p className="stg-upload-zone__filesize">
              {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
            </p>
          </div>
        </div>
      ) : (
        <div className="stg-upload-zone__placeholder">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 20V12M12 16l4-4 4 4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="4" width="24" height="24" rx="6" stroke="#E2E8F0" strokeWidth="1.5" />
          </svg>
          <p className="stg-upload-zone__label">{label}</p>
          <p className="stg-upload-zone__hint">{hint || 'Accepts .xlsx and .xls files'}</p>
        </div>
      )}
    </div>
  );
}