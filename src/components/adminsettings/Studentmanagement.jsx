import React from 'react';
import ImportStudentsCard      from './ImportStudentsCard';
import DisableStudentCard      from './DisableStudentCard';
import ReactivateStudentCard   from './ReactivateStudentCard';
import BulkDisableStudentsCard from './BulkDisableStudentsCard';

/**
 * StudentManagement
 * Composes the four student-management action cards in order.
 *
 * Props:
 *   getStudent          - (id: string) => student | null  (memoized in SettingsPage)
 *   setStudentStatuses  - React state setter for the shared status map
 *   showToast           - (msg: string, type?: string) => void
 */
export default function StudentManagement({ getStudent, setStudentStatuses, showToast }) {
  return (
    <>
      <ImportStudentsCard showToast={showToast} />

      <div className="stg-divider" aria-hidden="true" />

      <DisableStudentCard
        getStudent={getStudent}
        setStudentStatuses={setStudentStatuses}
        showToast={showToast}
      />

      <div className="stg-divider" aria-hidden="true" />

      <ReactivateStudentCard
        getStudent={getStudent}
        setStudentStatuses={setStudentStatuses}
        showToast={showToast}
      />

      <div className="stg-divider" aria-hidden="true" />

      <BulkDisableStudentsCard showToast={showToast} />
    </>
  );
}