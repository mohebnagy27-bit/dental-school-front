import React, { useState } from 'react';
import SharedActionCard from './SharedActionCard';
import IdLookupField    from './IdLookupField';
import ConfirmDialog    from './ConfirmDialog';

export default function ReactivateStudentCard({ onReactivate }) {
  const [id, setId] = useState('');
  const [showDlg, setShowDlg] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    if (id.trim()) setShowDlg(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onReactivate(id.trim());
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
      <SharedActionCard number="3" title="Reactivate Student">
        <p className="stg-sub-desc">
          Re-enable a previously disabled student account so they can log in again.
        </p>
        <IdLookupField
          label="Student ID"
          placeholder="e.g. STU-20240003"
          value={id}
          onChange={setId}
        />
        <button
          type="button"
          className="stg-btn stg-btn--success"
          onClick={handleAction}
          disabled={!id.trim()}
        >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
          Reactivate Student
        </button>
      </SharedActionCard>

      <ConfirmDialog
        open={showDlg}
        title="Reactivate Student"
        message="This will restore account access for this student. Do you want to continue?"
        detail={`Student ID: ${id}`}
        confirmLabel="Reactivate Student"
        confirmVariant="success"
        onConfirm={handleConfirm}
        onCancel={() => setShowDlg(false)}
        loading={loading}
      />
    </>
  );
}
