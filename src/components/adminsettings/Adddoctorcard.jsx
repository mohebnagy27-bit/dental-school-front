import React, { useState } from 'react';
import SharedActionCard from './SharedActionCard';
import AddDoctorModal   from './AddDoctorModal';

export default function AddDoctorCard({ onAddDoctor }) {
  const [showDlg, setShowDlg] = useState(false);

  const handleSave = async (form) => {
    await onAddDoctor(form);
    setShowDlg(false);
  };

  return (
    <>
      <SharedActionCard number="1" title="Add New Doctor">
        <p className="stg-sub-desc">
          Create a new doctor account with login credentials. The doctor will be able to access
          the full admin dashboard immediately.
        </p>
        <button
          type="button"
          className="stg-btn stg-btn--primary"
          onClick={() => setShowDlg(true)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Add Doctor
        </button>
      </SharedActionCard>

      <AddDoctorModal
        open={showDlg}
        onSave={handleSave}
        onCancel={() => setShowDlg(false)}
      />
    </>
  );
}
