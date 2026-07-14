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
 *   onImportStudents, onBulkDeactivateStudents, onDeactivateStudent,
 *   onReactivateStudent - backend-backed action handlers
 */
export default function StudentManagement({ onImportStudents, onBulkDeactivateStudents, onDeactivateStudent, onReactivateStudent }) {
  return (
    <>
      <ImportStudentsCard onImport={onImportStudents} />

      <div className="stg-divider" aria-hidden="true" />

      <DisableStudentCard
        onDisable={onDeactivateStudent}
      />

      <div className="stg-divider" aria-hidden="true" />

      <ReactivateStudentCard
        onReactivate={onReactivateStudent}
      />

      <div className="stg-divider" aria-hidden="true" />

      <BulkDisableStudentsCard onBulkDisable={onBulkDeactivateStudents} />
    </>
  );
}
