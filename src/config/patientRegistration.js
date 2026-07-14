const freeze = (value) => Object.freeze(value);

export const PATIENT_REGISTRATION_CONFIG = freeze({
  page: freeze({
    title: 'New Patient Registration',
    subtitle: 'Complete the form below to register a patient and build their dental case.',
    saveLabel: 'Save Patient Record',
    incompleteMessage: 'Complete patient information (Name, Age, Phone, Gender) before saving.',
  }),
  patientInformation: freeze({
    title: 'Patient Information',
    badge: 'Required',
    completeMessage: 'Patient information complete — form unlocked.',
    fields: freeze([
      freeze({ key: 'name', label: 'Patient Name', type: 'text', placeholder: 'Full name', autoComplete: 'name', required: true }),
      freeze({ key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 32', min: 1, max: 120, required: true }),
      freeze({ key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. +20 123 456 7890', autoComplete: 'tel', hint: '7–15 digits, any format', required: true }),
      freeze({ key: 'gender', label: 'Gender', type: 'select', placeholder: 'Select gender…', required: true, options: freeze(['Male', 'Female']) }),
    ]),
  }),
  dentalChart: freeze({
    title: 'Dental Chart',
    badge: 'FDI System',
    pendingLabel: 'Pending',
    pendingColor: '#64748B',
    disabledHint: 'Complete patient information above to activate the dental chart.',
    idleHint: 'Click teeth to select them. Multiple teeth can be selected at once.',
    quadrants: freeze([
      freeze({ label: 'Q1 — Upper Right', teeth: freeze([18, 17, 16, 15, 14, 13, 12, 11]) }),
      freeze({ label: 'Q2 — Upper Left', teeth: freeze([21, 22, 23, 24, 25, 26, 27, 28]) }),
      freeze({ label: 'Q4 — Lower Right', teeth: freeze([48, 47, 46, 45, 44, 43, 42, 41]) }),
      freeze({ label: 'Q3 — Lower Left', teeth: freeze([31, 32, 33, 34, 35, 36, 37, 38]) }),
    ]),
  }),
  diagnoses: freeze([
    freeze({ id: 'caries', label: 'Caries', color: '#3B82F6', aliases: freeze(['caries', 'composite filling']), subtypes: freeze(['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI']) }),
    freeze({ id: 'extraction', label: 'Extraction', color: '#EF4444', aliases: freeze(['extraction', 'surgical extraction']), subtypes: freeze([]) }),
    freeze({ id: 'remaining_root', label: 'Remaining Root', color: '#F97316', aliases: freeze(['remaining root']), subtypes: freeze([]) }),
  ]),
  treatmentPlans: freeze([
    freeze({ id: 'scaling', label: 'Scaling', category: 'Periodontal', color: '#16A34A', control: 'radio', options: freeze(['Simple', 'Moderate', 'Heavy']) }),
    freeze({ id: 'orthodontic', label: 'Orthodontic', category: 'Orthodontic', color: '#7C3AED', control: 'radio', options: freeze(['Crowding', 'Spacing', 'Class II', 'Class III']) }),
    freeze({ id: 'bridge', label: 'Bridge', category: 'Prosthetic', color: '#DB2777', control: 'radio', options: freeze(['Anterior', 'Posterior']), optionSuffix: ' Bridge', toothField: 'bridgeTeeth', toothPickerLabel: 'Select missing / pontic teeth:' }),
    freeze({ id: 'partial', label: 'Partial Denture', category: 'Prosthetic', color: '#DB2777', control: 'checkbox', checkboxLabel: 'Include Partial Denture in treatment plan', toothField: 'partialTeeth', toothPickerLabel: 'Select missing teeth involved:' }),
    freeze({ id: 'implant', label: 'Implant', category: 'Restorative', color: '#0891B2', control: 'checkbox', checkboxLabel: 'Include Implant in treatment plan', toothField: 'implantTeeth', toothPickerLabel: 'Select implant site teeth:' }),
  ]),
  treatmentPlanIdsByDiagnosis: freeze({
    caries: freeze(['scaling', 'orthodontic', 'bridge', 'partial', 'implant']),
    extraction: freeze(['scaling', 'orthodontic', 'bridge', 'partial', 'implant']),
    remaining_root: freeze(['scaling', 'orthodontic', 'bridge', 'partial', 'implant']),
  }),
  prostheticOptions: freeze({
    title: 'Additional Prosthetic Options',
    items: freeze([
      freeze({ id: 'completeDenture', label: 'Complete Denture', description: 'Full arch tooth replacement' }),
      freeze({ id: 'singleDenture', label: 'Single Denture', description: 'One-arch partial or full denture', options: freeze(['Upper Arch', 'Lower Arch']), optionLabel: 'Arch' }),
    ]),
  }),
  medicalInformation: freeze({
    title: 'Medical Information',
    fields: freeze([
      freeze({ key: 'history', label: 'Medical History', hint: 'Current conditions, medications, allergies…', placeholder: 'Enter relevant medical history…', rows: 4 }),
      freeze({ key: 'complications', label: 'Complications', hint: 'Previous dental complications or concerns', placeholder: 'Enter known complications…', rows: 4 }),
      freeze({ key: 'notes', label: 'Notes', placeholder: 'Additional clinical notes…', rows: 3 }),
    ]),
  }),
  sections: freeze({
    diagnosis: freeze({ title: 'Diagnosis Assignment', diagnosisLabel: 'Diagnosis Type', cariesClassLabel: 'Caries Class', selectDiagnosisPlaceholder: 'Select diagnosis…', selectSubtypePlaceholder: 'Select class…', addLabel: '+ Add Diagnosis Group', addHint: 'Assigns the selected teeth to this diagnosis and adds it to the summary table.' }),
    treatment: freeze({ title: 'Treatment Options', addLabel: '+ Add Treatment', addHint: 'Adds selected treatment options to the summary table.' }),
  }),
});

export const DIAGNOSIS_BY_ID = freeze(Object.fromEntries(
  PATIENT_REGISTRATION_CONFIG.diagnoses.map((diagnosis) => [diagnosis.id, diagnosis])
));

export const TREATMENT_PLAN_BY_ID = freeze(Object.fromEntries(
  PATIENT_REGISTRATION_CONFIG.treatmentPlans.map((treatment) => [treatment.id, treatment])
));

const LEGACY_TREATMENT_COLORS = freeze([
  freeze({ color: '#F59E0B', aliases: freeze(['root canal treatment', 'endodontic therapy']) }),
  freeze({ color: '#7C3AED', aliases: freeze(['crown restoration', 'porcelain crown', 'zirconia crown']) }),
  freeze({ color: '#0891B2', aliases: freeze(['pulp capping', 'direct pulp capping', 'indirect pulp capping']) }),
  freeze({ color: '#DB2777', aliases: freeze(['fixed partial denture', 'bridge placement']) }),
]);

export function getDiagnosisLabel(type, subtype = '') {
  const diagnosis = DIAGNOSIS_BY_ID[type];
  if (!diagnosis) return '';
  return subtype ? `${diagnosis.label} — ${subtype}` : diagnosis.label;
}

export function getDiagnosisColor(type) {
  return DIAGNOSIS_BY_ID[type]?.color || '#64748B';
}

export function getTreatmentLabel(id, option = '') {
  const treatment = TREATMENT_PLAN_BY_ID[id];
  if (!treatment) return '';
  return option ? `${treatment.label} — ${option}${treatment.optionSuffix || ''}` : treatment.label;
}

export function getTreatmentColor(treatment) {
  const value = String(treatment || '').trim().toLowerCase();
  if (!value) return '#64748B';

  const diagnosis = PATIENT_REGISTRATION_CONFIG.diagnoses.find((item) => (
    value === item.id || item.aliases.some((alias) => value === alias || value.startsWith(alias))
  ));
  if (diagnosis) return diagnosis.color;

  const plan = PATIENT_REGISTRATION_CONFIG.treatmentPlans.find((item) => value === item.id || value.startsWith(item.label.toLowerCase()));
  if (plan) return plan.color;

  const legacy = LEGACY_TREATMENT_COLORS.find((item) => item.aliases.some((alias) => value === alias || value.startsWith(alias)));
  return legacy?.color || '#64748B';
}
