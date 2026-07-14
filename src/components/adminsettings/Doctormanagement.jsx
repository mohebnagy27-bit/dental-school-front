import React from 'react';
import AddDoctorCard        from './AddDoctorCard';
import DisableDoctorCard    from './DisableDoctorCard';
import ReactivateDoctorCard from './ReactivateDoctorCard';

/**
 * DoctorManagement
 * Composes the three doctor-management action cards in order.
 *
 * Props:
 *   onAddDoctor, onDeactivateDoctor, onReactivateDoctor - backend-backed action handlers
 */
export default function DoctorManagement({ onAddDoctor, onDeactivateDoctor, onReactivateDoctor }) {
  return (
    <>
      <AddDoctorCard onAddDoctor={onAddDoctor} />

      <div className="stg-divider" aria-hidden="true" />

      <DisableDoctorCard
        onDisable={onDeactivateDoctor}
      />

      <div className="stg-divider" aria-hidden="true" />

      <ReactivateDoctorCard
        onReactivate={onReactivateDoctor}
      />
    </>
  );
}
