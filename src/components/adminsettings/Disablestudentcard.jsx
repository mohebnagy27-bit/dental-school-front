import React, { useState, useEffect } from 'react';
import SharedActionCard from './SharedActionCard';
import IdLookupField    from './IdLookupField';
import UserPreviewCard  from './UserPreviewCard';
import ConfirmDialog    from './ConfirmDialog';

export default function DisableStudentCard({ getStudent, setStudentStatuses, showToast }) {
  const [id,       setId]       = useState('');
  const [data,     setData]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showDlg,  setShowDlg]  = useState(false);

  /* Re-run whenever the typed ID or the status map changes */
  useEffect(() => {
    if (!id.trim()) { setData(null); setNotFound(false); return; }
    const s = getStudent(id.trim());
    setData(s);
    setNotFound(!s);
  }, [id, getStudent]);

  const handleAction = () => {
    if (!data) return;
    if (data.status === 'Inactive') {
      showToast('This student is already inactive.', 'error');
      return;
    }
    setShowDlg(true);
  };

  const handleConfirm = () => {
    setStudentStatuses((p) => ({ ...p, [data.id]: 'Inactive' }));
    setShowDlg(false);
    showToast(`${data.name} has been disabled.`);
  };

  return (
    <>
      <SharedActionCard number="2" title="Disable Student">
        <p className="stg-sub-desc">
          Enter a Student ID to locate and disable their account. Disabled students cannot log in.
        </p>
        <IdLookupField
          label="Student ID"
          placeholder="e.g. STU-20240001"
          value={id}
          onChange={setId}
          notFound={notFound}
        />
        {data && (
          <>
            <UserPreviewCard data={data} type="student" />
            <button
              type="button"
              className="stg-btn stg-btn--danger"
              onClick={handleAction}
              disabled={data.status === 'Inactive'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 4.5l-5 5M4.5 4.5l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {data.status === 'Inactive' ? 'Already Inactive' : 'Disable Student'}
            </button>
          </>
        )}
      </SharedActionCard>

      <ConfirmDialog
        open={showDlg}
        title="Disable Student"
        message="Are you sure you want to disable this student? They will no longer be able to log in."
        detail={data && `${data.name} — ${data.id}`}
        confirmLabel="Disable Student"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setShowDlg(false)}
      />
    </>
  );
}