import { getTreatmentColor as getSharedTreatmentColor } from '../config/patientRegistration';

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function getObjectId(value) {
  if (value && typeof value === 'object') return value.id || value._id || value.patientId;
  return value;
}

function asText(value) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

export function getResponseList(response) {
  if (Array.isArray(response)) return response;
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return data?.cases || data?.patients || [];
}

export function getPatientCases(patient) {
  const cases = patient?.cases || patient?.patientCases || patient?.caseRecords || [];
  return Array.isArray(cases) ? cases : [];
}

export function getPatientName(record) {
  const patient = record?.patient && typeof record.patient === 'object' ? record.patient : record;

  return firstValue(
    record?.patientName,
    patient?.name,
    patient?.fullName,
    [patient?.firstName, patient?.lastName].filter(Boolean).join(' '),
  ) || '—';
}

export function getPatientId(record) {
  const patientId = firstValue(
    record?.patientId,
    getObjectId(record?.patient),
    getObjectId(record?.patientInfo),
    getObjectId(record?.patientDetails),
  );

  if (patientId) return patientId;

  const isPatientRecord = record?.cases || record?.patientCases || record?.firstName || record?.name || record?.fullName;
  return isPatientRecord ? firstValue(record?.id, record?._id) : undefined;
}

export function getCaseTreatment(caseInfo) {
  return asText(firstValue(
    caseInfo?.treatmentType,
    caseInfo?.treatment?.type,
    caseInfo?.treatment?.name,
    typeof caseInfo?.treatment === 'string' ? caseInfo.treatment : undefined,
    caseInfo?.treatmentLabel,
  ));
}

export function getCaseDiagnosis(caseInfo) {
  return asText(firstValue(
    caseInfo?.diagnosisLabel,
    caseInfo?.diagnosis?.label,
    caseInfo?.diagnosis?.type,
    caseInfo?.diagnosis?.category,
    typeof caseInfo?.diagnosis === 'string' ? caseInfo.diagnosis : undefined,
    caseInfo?.diagnosisCategory,
    caseInfo?.problem,
  ));
}

export function getCaseTooth(caseInfo) {
  return firstValue(
    caseInfo?.toothNumber,
    caseInfo?.tooth,
    Array.isArray(caseInfo?.teeth) ? caseInfo.teeth[0] : undefined,
    Array.isArray(caseInfo?.treatmentTeeth) ? caseInfo.treatmentTeeth[0] : undefined,
  );
}

export function getTreatmentColor(treatment) {
  return getSharedTreatmentColor(treatment);
}

export function getStudentProfile(user, fallbackId = '') {
  const name = user?.name || '';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return {
    name,
    id: user?.id || fallbackId,
    initials,
    role: 'Student',
    academicYear: user?.academicYear || '—',
  };
}

export function normalizeStudentCase(caseInfo) {
  return {
    id: firstValue(caseInfo?.id, caseInfo?._id, caseInfo?.caseId),
    patientId: getPatientId(caseInfo),
    patientName: getPatientName(caseInfo),
    toothNumber: getCaseTooth(caseInfo) ?? '—',
    diagnosis: getCaseDiagnosis(caseInfo) || '—',
    treatmentType: getCaseTreatment(caseInfo) || '—',
    completionDate: firstValue(caseInfo?.completedAt, caseInfo?.completionDate, caseInfo?.completedDate),
  };
}

export function filterStudentRecords(records, searchText) {
  const query = String(searchText || '').trim().toLowerCase();
  if (!query) return records;

  return records.filter((record) => {
    const cases = getPatientCases(record);
    const caseValues = [record, ...cases].flatMap((caseInfo) => [
      getCaseTreatment(caseInfo),
      getCaseDiagnosis(caseInfo),
      caseInfo?.problem,
      getCaseTooth(caseInfo),
    ]);

    return [getPatientName(record), ...caseValues]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}
