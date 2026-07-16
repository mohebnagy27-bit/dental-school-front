const sortTeeth = (teeth = []) => [...teeth].sort((a, b) => a - b);

const trimOrNull = (value) => {
  const trimmed = value?.trim();
  return trimmed || null;
};

const getCaseTeeth = (caseItem) => {
  const teeth = caseItem.type === 'diagnosis' ? caseItem.teeth : caseItem.treatmentTeeth;
  return sortTeeth(teeth).length ? sortTeeth(teeth) : [null];
};

const createCases = (cases) => cases.flatMap((caseItem) => {
  const problem = caseItem.diagnosisLabel || caseItem.treatmentLabel;
  const treatmentType = caseItem.treatmentLabel || caseItem.diagnosisLabel;

  return getCaseTeeth(caseItem).map((toothNumber) => ({
    problem,
    treatmentType,
    toothNumber: toothNumber === null ? null : Number(toothNumber),
    notes: trimOrNull(caseItem.notes),
  }));
});

const createMedicalHistory = (medical) => {
  const history = trimOrNull(medical.history);
  const complications = trimOrNull(medical.complications);

  if (!complications) return history;
  return history ? `${history}\n\nComplications: ${complications}` : `Complications: ${complications}`;
};

/**
 * Converts UI-only form state into the registration payload accepted by the API.
 */
export function createPatientRegistrationPayload({ patient, cases, options, medical }) {
  return {
    name: patient.name.trim(),
    age: Number(patient.age),
    phone: patient.phone.trim(),
    gender: patient.gender.toUpperCase(),
    medicalHistory: createMedicalHistory(medical),
    notes: trimOrNull(medical.notes),
    cases: createCases(cases),
  };
}
