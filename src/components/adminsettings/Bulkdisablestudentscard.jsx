import React, { useState, useRef } from 'react';
import SharedActionCard    from './SharedActionCard';
import FileUploadZone      from './FileUploadZone';
import ImportPreviewDialog from './ImportPreviewDialog';
import { BULK_PREVIEW_ROWS, simulateProgress } from './data';

export default function BulkDisableStudentsCard({ showToast }) {
  const inputRef                = useRef(null);
  const [file,     setFile]     = useState(null);
  const [showDlg,  setShowDlg]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (f) => { setFile(f); setShowDlg(true); };

  const handleConfirm = () => {
    setLoading(true);
    simulateProgress(setProgress, () => {
      setLoading(false);
      setShowDlg(false);
      setFile(null);
      setProgress(0);
      showToast(`${BULK_PREVIEW_ROWS.filter((r) => r.valid).length} students disabled successfully.`);
    });
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
        rows={BULK_PREVIEW_ROWS}
        loading={loading}
        progress={progress}
        confirmLabel="Confirm Disable"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}