import React, { useState, useRef } from 'react';
import SharedActionCard    from './SharedActionCard';
import FileUploadZone      from './FileUploadZone';
import ImportPreviewDialog from './ImportPreviewDialog';

export default function ImportStudentsCard({ onImport }) {
  const inputRef                   = useRef(null);
  const [file,     setFile]        = useState(null);
  const [showDlg,  setShowDlg]     = useState(false);
  const [loading,  setLoading]     = useState(false);

  const handleFile = (f) => { setFile(f); setShowDlg(true); };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onImport(file);
      setLoading(false);
      setShowDlg(false);
      setFile(null);
    } catch {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) { setShowDlg(false); setFile(null); }
  };

  return (
    <>
      <SharedActionCard number="1" title="Import Students from Excel">
        <p className="stg-sub-desc">
          Upload an Excel file (.xlsx or .xls) containing student records. The server validates
          and imports the data after confirmation.
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
        loading={loading}
        confirmLabel="Confirm Import"
        description="The server will validate and import the selected student records."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
