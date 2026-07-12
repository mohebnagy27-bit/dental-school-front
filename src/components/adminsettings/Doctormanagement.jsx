import React from 'react';
import AddDoctorCard        from './AddDoctorCard';
import DisableDoctorCard    from './DisableDoctorCard';
import ReactivateDoctorCard from './ReactivateDoctorCard';

/**
 * DoctorManagement
 * Composes the three doctor-management action cards in order.
 *
 * Props:
 *   getDoctor          - (id: string) => doctor | null  (memoized in SettingsPage)
 *   setDoctorStatuses  - React state setter for the shared status map
 *   showToast          - (msg: string, type?: string) => void
 */
export default function DoctorManagement({ getDoctor, setDoctorStatuses, showToast }) {
  return (
    <>
      <AddDoctorCard showToast={showToast} />

      <div className="stg-divider" aria-hidden="true" />

      <DisableDoctorCard
        getDoctor={getDoctor}
        setDoctorStatuses={setDoctorStatuses}
        showToast={showToast}
      />

      <div className="stg-divider" aria-hidden="true" />

      <ReactivateDoctorCard
        getDoctor={getDoctor}
        setDoctorStatuses={setDoctorStatuses}
        showToast={showToast}
      />
    </>
  );
}