import React, { useState, useEffect } from 'react';
import SharedActionCard from './SharedActionCard';
import IdLookupField    from './IdLookupField';
import UserPreviewCard  from './UserPreviewCard';
import ConfirmDialog    from './ConfirmDialog';

export default function ReactivateDoctorCard({ getDoctor, setDoctorStatuses, showToast }) {
  const [id,       setId]       = useState('');
  const [data,     setData]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showDlg,  setShowDlg]  = useState(false);

  useEffect(() => {
    if (!id.trim()) { setData(null); setNotFound(false); return; }
    const d = getDoctor(id.trim());
    setData(d);
    setNotFound(!d);
  }, [id, getDoctor]);

  const handleAction = () => {
    if (!data) return;
    if (data.status === 'Active') {
      showToast('This doctor is already active.', 'error');
      return;
    }
    setShowDlg(true);
  };

  const handleConfirm = () => {
    setDoctorStatuses((p) => ({ ...p, [data.id]: 'Active' }));
    setShowDlg(false);
    showToast(`${data.name} has been reactivated.`);
  };

  return (
    <>
      <SharedActionCard number="3" title="Reactivate Doctor">
        <p className="stg-sub-desc">
          Re-enable a previously disabled doctor account.
        </p>
        <IdLookupField
          label="Doctor ID"
          placeholder="e.g. DOC-003"
          value={id}
          onChange={setId}
          notFound={notFound}
        />
        {data && (
          <>
            <UserPreviewCard data={data} type="doctor" />
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
              {data.status === 'Active' ? 'Already Active' : 'Reactivate Doctor'}
            </button>
          </>
        )}
      </SharedActionCard>

      <ConfirmDialog
        open={showDlg}
        title="Reactivate Doctor"
        message="This will restore account access for this doctor. Do you want to continue?"
        detail={data && `${data.name} — ${data.id}`}
        confirmLabel="Reactivate Doctor"
        confirmVariant="success"
        onConfirm={handleConfirm}
        onCancel={() => setShowDlg(false)}
      />
    </>
  );
}