import React, { useState, useEffect } from 'react';
import SharedActionCard from './SharedActionCard';
import IdLookupField    from './IdLookupField';
import UserPreviewCard  from './UserPreviewCard';
import ConfirmDialog    from './ConfirmDialog';

export default function ReactivateStudentCard({ getStudent, setStudentStatuses, showToast }) {
  const [id,       setId]       = useState('');
  const [data,     setData]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showDlg,  setShowDlg]  = useState(false);

  useEffect(() => {
    if (!id.trim()) { setData(null); setNotFound(false); return; }
    const s = getStudent(id.trim());
    setData(s);
    setNotFound(!s);
  }, [id, getStudent]);

  const handleAction = () => {
    if (!data) return;
    if (data.status === 'Active') {
      showToast('This student is already active.', 'error');
      return;
    }
    setShowDlg(true);
  };

  const handleConfirm = () => {
    setStudentStatuses((p) => ({ ...p, [data.id]: 'Active' }));
    setShowDlg(false);
    showToast(`${data.name} has been reactivated.`);
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
          notFound={notFound}
        />
        {data && (
          <>
            <UserPreviewCard data={data} type="student" />
            <button
              type="button"
              className="stg-btn stg-btn--success"
              onClick={handleAction}
              disabled={data.status === 'Active'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {data.status === 'Active' ? 'Already Active' : 'Reactivate Student'}
            </button>
          </>
        )}
      </SharedActionCard>

      <ConfirmDialog
        open={showDlg}
        title="Reactivate Student"
        message="This will restore account access for this student. Do you want to continue?"
        detail={data && `${data.name} — ${data.id}`}
        confirmLabel="Reactivate Student"
        confirmVariant="success"
        onConfirm={handleConfirm}
        onCancel={() => setShowDlg(false)}
      />
    </>
  );
}