const sortTeeth = (teeth) => [...teeth].sort((a, b) => a - b);

/**
 * Converts UI-only state into a serializable record ready for a future API client.
 * Keeping this mapping separate means backend field changes stay out of the UI.
 */
export function createPatientRegistrationPayload({ patient, cases, options, medical }) {
  return {
    patient: {
      name: patient.name.trim(),
      age: Number(patient.age),
      phone: patient.phone.trim(),
    },
    cases: cases.map((caseItem) => ({
      ...caseItem,
      teeth: sortTeeth(caseItem.teeth),
      treatmentTeeth: sortTeeth(caseItem.treatmentTeeth),
    })),
    prostheticOptions: {
      completeDenture: options.completeDenture,
      singleDenture: options.singleDenture,
      singleArch: options.singleArch || null,
    },
    medicalInformation: {
      history: medical.history.trim(),
      complications: medical.complications.trim(),
      notes: medical.notes.trim(),
    },
  };
}
