import React, { useState, useRef } from 'react';
import SharedActionCard    from './SharedActionCard';
import FileUploadZone      from './FileUploadZone';
import ImportPreviewDialog from './ImportPreviewDialog';
import { IMPORT_PREVIEW_ROWS, simulateProgress } from './data';

export default function ImportStudentsCard({ showToast }) {
  const inputRef                   = useRef(null);
  const [file,     setFile]        = useState(null);
  const [showDlg,  setShowDlg]     = useState(false);
  const [loading,  setLoading]     = useState(false);
  const [progress, setProgress]    = useState(0);

  const handleFile = (f) => { setFile(f); setShowDlg(true); };

  const handleConfirm = () => {
    setLoading(true);
    simulateProgress(setProgress, () => {
      setLoading(false);
      setShowDlg(false);
      setFile(null);
      setProgress(0);
      showToast(`${IMPORT_PREVIEW_ROWS.filter((r) => r.valid).length} students imported successfully.`);
    });
  };

  const handleCancel = () => {
    if (!loading) { setShowDlg(false); setFile(null); }
  };

  return (
    <>
      <SharedActionCard number="1" title="Import Students from Excel">
        <p className="stg-sub-desc">
          Upload an Excel file (.xlsx or .xls) containing student records. The system will preview
          and validate the data before importing.
        </p>
        <FileUploadZone
          inputRef={inputRef}
          onFile={handleFile}
          selectedFile={file}
          label="Click to select or drag an Excel file here"
          hint="Accepts .xlsx and .xls — max 10 MB"
        />
      </SharedActionCard>

      <ImportPreviewDialog
        open={showDlg}
        fileName={file?.name || ''}
        rows={IMPORT_PREVIEW_ROWS}
        loading={loading}
        progress={progress}
        confirmLabel="Confirm Import"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}