import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DIAGNOSIS_COLORS } from '../components/patient-registration/constants';
import { createPatientRegistrationPayload } from '../components/patient-registration/patientRegistrationPayload';
import { validatePatient } from '../components/patient-registration/validation';

const createInitialPatient = () => ({ name: '', age: '', phone: '' });
const createInitialDiagnosis = () => ({ type: '', subtype: '' });
const createInitialTreatment = () => ({
  scaling: '', orthodontic: '', bridge: '', bridgeTeeth: new Set(),
  partial: false, partialTeeth: new Set(), implant: false, implantTeeth: new Set(),
});
const createInitialOptions = () => ({ completeDenture: false, singleDenture: false, singleArch: '' });
const createInitialMedical = () => ({ history: '', complications: '', notes: '' });

let nextCaseId = 0;
const createCaseId = () => `case_${++nextCaseId}_${Math.random().toString(36).slice(2, 6)}`;

// Retains the current confirmation experience without making a network request.
const simulateRegistrationSave = () => new Promise((resolve) => setTimeout(resolve, 1600));

export default function usePatientRegistration({ submitRegistration = simulateRegistrationSave } = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patient, setPatient] = useState(createInitialPatient);
  const [touchedFields, setTouchedFields] = useState({});
  const [pendingTeeth, setPendingTeeth] = useState(new Set());
  const [cases, setCases] = useState([]);
  const [diagnosis, setDiagnosis] = useState(createInitialDiagnosis);
  const [diagnosisError, setDiagnosisError] = useState('');
  const [treatment, setTreatment] = useState(createInitialTreatment);
  const [treatmentError, setTreatmentError] = useState('');
  const [options, setOptions] = useState(createInitialOptions);
  const [medical, setMedical] = useState(createInitialMedical);
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const diagnosisSectionRef = useRef(null);
  const treatmentSectionRef = useRef(null);

  const patientValidation = useMemo(() => validatePatient(patient), [patient]);
  const patientErrors = useMemo(() => ({
    name: touchedFields.name ? patientValidation.name : '',
    age: touchedFields.age ? patientValidation.age : '',
    phone: touchedFields.phone ? patientValidation.phone : '',
  }), [patientValidation, touchedFields]);
  const isPatientInfoValid = !patientValidation.name && !patientValidation.age && !patientValidation.phone;

  const toothColorMap = useMemo(() => {
    const colors = {};
    cases.filter((caseItem) => caseItem.type === 'diagnosis').forEach((caseItem) => {
      caseItem.teeth.forEach((toothNumber) => {
        colors[toothNumber] = DIAGNOSIS_COLORS[caseItem.diagnosisCategory] || '#6B7280';
      });
    });
    return colors;
  }, [cases]);

  const hasUnsavedChanges = Boolean(
    patient.name || patient.age || patient.phone || cases.length > 0 || options.completeDenture || options.singleDenture ||
    medical.history || medical.complications || medical.notes
  );

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  useEffect(() => {
    const warnBeforeLeaving = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasUnsavedChanges]);

  const changePatient = useCallback((field, value) => setPatient((current) => ({ ...current, [field]: value })), []);
  const touchPatientField = useCallback((field) => setTouchedFields((current) => ({ ...current, [field]: true })), []);

  const toggleTooth = useCallback((toothNumber) => {
    if (!isPatientInfoValid || toothColorMap[toothNumber] !== undefined) return;
    setPendingTeeth((current) => {
      const nextSelection = new Set(current);
      nextSelection.has(toothNumber) ? nextSelection.delete(toothNumber) : nextSelection.add(toothNumber);
      return nextSelection;
    });
  }, [isPatientInfoValid, toothColorMap]);

  const changeDiagnosis = useCallback((field, value) => {
    setDiagnosis((current) => field === 'type' ? { ...current, type: value, subtype: '' } : { ...current, [field]: value });
    setDiagnosisError('');
  }, []);

  const addDiagnosis = useCallback(() => {
    if (pendingTeeth.size === 0) return setDiagnosisError('Please select at least one tooth on the chart above.');
    if (!diagnosis.type) return setDiagnosisError('Please select a diagnosis type.');
    if (diagnosis.type === 'caries' && !diagnosis.subtype) return setDiagnosisError('Please select a caries class.');

    const selectedTeeth = Array.from(pendingTeeth);
    const conflictingTeeth = selectedTeeth.filter((toothNumber) => toothColorMap[toothNumber] !== undefined);
    if (conflictingTeeth.length) {
      return setDiagnosisError(`Tooth${conflictingTeeth.length > 1 ? 'teeth' : ''} ${conflictingTeeth.join(', ')} already assigned.`);
    }
    const diagnosisLabel = diagnosis.type === 'caries' ? `Caries — ${diagnosis.subtype}` : diagnosis.type === 'extraction' ? 'Extraction' : 'Remaining Root';
    setCases((current) => [...current, {
      id: createCaseId(), type: 'diagnosis', teeth: selectedTeeth, diagnosisLabel,
      diagnosisCategory: diagnosis.type, diagnosisSubtype: diagnosis.subtype, treatmentLabel: null, treatmentTeeth: [],
    }]);
    setPendingTeeth(new Set());
    setDiagnosis(createInitialDiagnosis());
    setDiagnosisError('');
  }, [diagnosis, pendingTeeth, toothColorMap]);

  const changeTreatment = useCallback((field, value) => {
    setTreatment((current) => {
      if (field === 'bridge' && !value) return { ...current, bridge: '', bridgeTeeth: new Set() };
      if (field === 'partial' && !value) return { ...current, partial: false, partialTeeth: new Set() };
      if (field === 'implant' && !value) return { ...current, implant: false, implantTeeth: new Set() };
      return { ...current, [field]: value };
    });
    setTreatmentError('');
  }, []);

  const addTreatment = useCallback(() => {
    const newTreatments = [];
    const add = (treatmentLabel, treatmentTeeth = []) => newTreatments.push({
      id: createCaseId(), type: 'treatment', treatmentLabel, treatmentTeeth,
      diagnosisLabel: null, diagnosisCategory: null, teeth: [],
    });
    if (treatment.scaling) add(`Scaling — ${treatment.scaling}`);
    if (treatment.orthodontic) add(`Orthodontic — ${treatment.orthodontic}`);
    if (treatment.bridge) add(`Bridge — ${treatment.bridge} Bridge`, Array.from(treatment.bridgeTeeth));
    if (treatment.partial) add('Partial Denture', Array.from(treatment.partialTeeth));
    if (treatment.implant) add('Implant', Array.from(treatment.implantTeeth));
    if (!newTreatments.length) return setTreatmentError('Please select at least one treatment option.');
    setCases((current) => [...current, ...newTreatments]);
    setTreatment(createInitialTreatment());
    setTreatmentError('');
  }, [treatment]);

  const changeOptions = useCallback((field, value) => {
    setOptions((current) => field === 'singleDenture' && !value ? { ...current, singleDenture: false, singleArch: '' } : { ...current, [field]: value });
  }, []);
  const changeMedical = useCallback((field, value) => setMedical((current) => ({ ...current, [field]: value })), []);

  const editCase = useCallback((caseId) => {
    const caseItem = cases.find((item) => item.id === caseId);
    if (!caseItem) return;
    setCases((current) => current.filter((item) => item.id !== caseId));
    if (caseItem.type === 'diagnosis') {
      setPendingTeeth(new Set(caseItem.teeth));
      setDiagnosis({ type: caseItem.diagnosisCategory, subtype: caseItem.diagnosisSubtype || '' });
      setTimeout(() => diagnosisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      return;
    }
    const label = caseItem.treatmentLabel || '';
    if (label.startsWith('Scaling')) setTreatment((current) => ({ ...current, scaling: label.replace('Scaling — ', '') }));
    else if (label.startsWith('Orthodontic')) setTreatment((current) => ({ ...current, orthodontic: label.replace('Orthodontic — ', '') }));
    else if (label.startsWith('Bridge')) setTreatment((current) => ({ ...current, bridge: label.includes('Anterior') ? 'Anterior' : 'Posterior', bridgeTeeth: new Set(caseItem.treatmentTeeth || []) }));
    else if (label === 'Partial Denture') setTreatment((current) => ({ ...current, partial: true, partialTeeth: new Set(caseItem.treatmentTeeth || []) }));
    else if (label === 'Implant') setTreatment((current) => ({ ...current, implant: true, implantTeeth: new Set(caseItem.treatmentTeeth || []) }));
    setTimeout(() => treatmentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }, [cases]);

  const deleteCase = useCallback((caseId) => setCases((current) => current.filter((item) => item.id !== caseId)), []);

  const resetForm = useCallback(() => {
    setPatient(createInitialPatient()); setTouchedFields({}); setPendingTeeth(new Set()); setCases([]);
    setDiagnosis(createInitialDiagnosis()); setDiagnosisError(''); setTreatment(createInitialTreatment()); setTreatmentError('');
    setOptions(createInitialOptions()); setMedical(createInitialMedical());
  }, []);

  const openSaveDialog = useCallback(() => {
    setTouchedFields({ name: true, age: true, phone: true });
    if (isPatientInfoValid) setShowDialog(true);
  }, [isPatientInfoValid]);

  const closeSaveDialog = useCallback(() => {
    if (!isSaving && !saveSuccess) setShowDialog(false);
  }, [isSaving, saveSuccess]);

  const confirmSave = useCallback(async () => {
    setIsSaving(true);
    await submitRegistration(createPatientRegistrationPayload({ patient, cases, options, medical }));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => { setShowDialog(false); setSaveSuccess(false); resetForm(); }, 2200);
  }, [cases, medical, options, patient, resetForm, submitRegistration]);

  return {
    sidebarOpen, setSidebarOpen, patient, patientErrors, isPatientInfoValid, hasUnsavedChanges, changePatient, touchPatientField,
    pendingTeeth, setPendingTeeth, toothColorMap, toggleTooth, diagnosis, diagnosisError, changeDiagnosis, addDiagnosis, diagnosisSectionRef,
    treatment, treatmentError, changeTreatment, addTreatment, treatmentSectionRef, options, changeOptions, medical, changeMedical,
    cases, editCase, deleteCase, showDialog, isSaving, saveSuccess, openSaveDialog, closeSaveDialog, confirmSave,
  };
}
