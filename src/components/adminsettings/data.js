/* ================================================================
   data.js — mock data + shared helpers for the Settings feature
   ================================================================ */

export const MOCK_STUDENTS = {
  'STU-20240001': { id: 'STU-20240001', name: 'Sarah Johnson',  year: '3rd Year', status: 'Active'   },
  'STU-20240002': { id: 'STU-20240002', name: 'Omar Khalid',    year: '2nd Year', status: 'Active'   },
  'STU-20240003': { id: 'STU-20240003', name: 'Layla Ibrahim',  year: '4th Year', status: 'Inactive' },
  'STU-20240004': { id: 'STU-20240004', name: 'Mohammed Ali',   year: '1st Year', status: 'Active'   },
  'STU-20240005': { id: 'STU-20240005', name: 'Hana Youssef',   year: '2nd Year', status: 'Inactive' },
};

export const MOCK_DOCTORS = {
  'DOC-001': { id: 'DOC-001', name: 'Dr. Ahmed Hassan', email: 'ahmed.hassan@dental.edu', status: 'Active'   },
  'DOC-002': { id: 'DOC-002', name: 'Dr. Fatima Malik',  email: 'fatima.malik@dental.edu', status: 'Active'   },
  'DOC-003': { id: 'DOC-003', name: 'Dr. Karim Nasser',  email: 'karim.nasser@dental.edu', status: 'Inactive' },
};

export const IMPORT_PREVIEW_ROWS = [
  { row: 1, name: 'Amira Saad',    id: 'STU-20240101', year: '1st Year', valid: true  },
  { row: 2, name: 'Bassem Fawzy',  id: 'STU-20240102', year: '2nd Year', valid: true  },
  { row: 3, name: 'Camilia Helmy', id: 'STU-20240103', year: '3rd Year', valid: true  },
  { row: 4, name: '',              id: 'STU-20240104', year: '4th Year', valid: false },
  { row: 5, name: 'Donia Rashad',  id: 'STU-20240105', year: '2nd Year', valid: true  },
  { row: 6, name: 'Emad Soliman',  id: '',             year: '1st Year', valid: false },
  { row: 7, name: 'Fatma Essam',   id: 'STU-20240107', year: '3rd Year', valid: true  },
];

export const BULK_PREVIEW_ROWS = [
  { row: 1, id: 'STU-20240001', name: 'Sarah Johnson',  valid: true  },
  { row: 2, id: 'STU-20240002', name: 'Omar Khalid',    valid: true  },
  { row: 3, id: 'STU-XXXXXXX',  name: '—',              valid: false },
  { row: 4, id: 'STU-20240004', name: 'Mohammed Ali',   valid: true  },
];

/** Validates an email string. */
export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/**
 * Animates a numeric setter from 0 → 100 over `duration` ms,
 * then calls `onDone`. Returns the interval id.
 */
export const simulateProgress = (setter, onDone, duration = 2000) => {
  setter(0);
  const steps = 40;
  const delay = duration / steps;
  let current = 0;
  const timer = setInterval(() => {
    current += 100 / steps;
    if (current >= 100) {
      clearInterval(timer);
      setter(100);
      setTimeout(onDone, 300);
    } else {
      setter(Math.min(current, 99));
    }
  }, delay);
  return timer;
};