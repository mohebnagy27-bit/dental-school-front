import React, { useState } from 'react';
import SharedActionCard from './SharedActionCard';
import IdLookupField    from './IdLookupField';
import ConfirmDialog    from './ConfirmDialog';

export default function DisableStudentCard({ onDisable }) {
  const [id, setId] = useState('');
  const [showDlg, setShowDlg] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    if (id.trim()) setShowDlg(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onDisable(id.trim());
      setShowDlg(false);
      setId('');
    } catch {
      // The parent action displays the API error in the shared toast.
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SharedActionCard number="2" title="Disable Student">
        <p className="stg-sub-desc">
          Enter a Student ID to disable the account. Disabled students cannot log in.
        </p>
        <IdLookupField
          label="Student ID"
          placeholder="e.g. STU-20240001"
          value={id}
          onChange={setId}
        />
        <button
          type="button"
          className="stg-btn stg-btn--danger"
          onClick={handleAction}
          disabled={!id.trim()}
        >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 4.5l-5 5M4.5 4.5l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
          Disable Student
        </button>
      </SharedActionCard>

      <ConfirmDialog
        open={showDlg}
        title="Disable Student"
        message="Are you sure you want to disable this student? They will no longer be able to log in."
        detail={`Student ID: ${id}`}
        confirmLabel="Disable Student"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setShowDlg(false)}
        loading={loading}
      />
    </>
  );
}
