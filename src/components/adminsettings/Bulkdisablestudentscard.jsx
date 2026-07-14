import React, { useState, useRef } from 'react';
import SharedActionCard    from './SharedActionCard';
import FileUploadZone      from './FileUploadZone';
import ImportPreviewDialog from './ImportPreviewDialog';

export default function BulkDisableStudentsCard({ onBulkDisable }) {
  const inputRef                = useRef(null);
  const [file,     setFile]     = useState(null);
  const [showDlg,  setShowDlg]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleFile = (f) => { setFile(f); setShowDlg(true); };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onBulkDisable(file);
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
      <SharedActionCard number="4" title="Disable Multiple Students">
        <p className="stg-sub-desc">
          Upload a list of Student IDs in an Excel file to disable multiple accounts at once.
        </p>
        <FileUploadZone
          inputRef={inputRef}
          onFile={handleFile}
          selectedFile={file}
          label="Click to select or drag an Excel file here"
          hint="Each row should contain a Student ID — .xlsx / .xls"
        />
      </SharedActionCard>

      <ImportPreviewDialog
        open={showDlg}
        fileName={file?.name || ''}
        loading={loading}
        confirmLabel="Confirm Disable"
        description="The server will validate the uploaded IDs and disable the matching student accounts."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
