import React, { useState, useEffect } from 'react';
import SharedActionCard from './SharedActionCard';
import IdLookupField    from './IdLookupField';
import UserPreviewCard  from './UserPreviewCard';
import ConfirmDialog    from './ConfirmDialog';

export default function DisableDoctorCard({ getDoctor, setDoctorStatuses, showToast }) {
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
    if (data.status === 'Inactive') {
      showToast('This doctor is already inactive.', 'error');
      return;
    }
    setShowDlg(true);
  };

  const handleConfirm = () => {
    setDoctorStatuses((p) => ({ ...p, [data.id]: 'Inactive' }));
    setShowDlg(false);
    showToast(`${data.name} has been disabled.`);
  };

  return (
    <>
      <SharedActionCard number="2" title="Disable Doctor">
        <p className="stg-sub-desc">
          Enter a Doctor ID to locate and disable their account access.
        </p>
        <IdLookupField
          label="Doctor ID"
          placeholder="e.g. DOC-001"
          value={id}
          onChange={setId}
          notFound={notFound}
        />
        {data && (
          <>
            <UserPreviewCard data={data} type="doctor" />
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
              {data.status === 'Inactive' ? 'Already Inactive' : 'Disable Doctor'}
            </button>
          </>
        )}
      </SharedActionCard>

      <ConfirmDialog
        open={showDlg}
        title="Disable Doctor"
        message="Are you sure you want to disable this doctor account?"
        detail={data && `${data.name} — ${data.id}`}
        confirmLabel="Disable Doctor"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setShowDlg(false)}
      />
    </>
  );
}