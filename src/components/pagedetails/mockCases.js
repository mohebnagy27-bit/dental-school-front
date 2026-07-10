import { MOCK_PATIENTS } from './mockPatients';

/* ═══════════════════════════════════════════════════
   MOCK DATA — Flattened Cases
   Derived from MOCK_PATIENTS so PatientsPage,
   ReservedCasesPage, and CompletedCasesPage all stay
   in sync with the same source of truth.
   ═══════════════════════════════════════════════════ */

export const MOCK_ALL_CASES = MOCK_PATIENTS.flatMap((p) =>
  p.cases.map((c) => ({
    ...c,
    patientId: p.id,
    patientName: p.name,
  }))
);

export const RESERVED_CASES = MOCK_ALL_CASES.filter(
  (c) => c.status === 'reserved'
);

export const COMPLETED_CASES = MOCK_ALL_CASES.filter(
  (c) => c.status === 'completed'
);

export const AVAILABLE_CASES = MOCK_ALL_CASES.filter(
  (c) => c.status === 'available'
);
