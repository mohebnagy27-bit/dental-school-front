import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDiagnosisColor,
  getDiagnosisLabel,
  getTreatmentLabel,
  PATIENT_REGISTRATION_CONFIG,
} from '../config/patientRegistration';
import { createPatientRegistrationPayload } from '../components/patient-registration/patientRegistrationPayload';
import { validatePatient } from '../components/patient-registration/validation';
import { addPatient } from '../services/doctorService';

const createInitialPatient = () => ({ name: '', age: '', phone: '', gender: '' });
const createInitialDiagnosis = () => ({ type: '', subtype: '' });
const createInitialTreatment = () => PATIENT_REGISTRATION_CONFIG.treatmentPlans.reduce((initialTreatment, plan) => {
  initialTreatment[plan.id] = plan.control === 'checkbox' ? false : '';
  if (plan.toothField) initialTreatment[plan.toothField] = new Set();
  return initialTreatment;
}, {});
const createInitialOptions = () => ({ completeDenture: false, singleDenture: false, singleArch: '' });
const createInitialMedical = () => ({ history: '', complications: '', notes: '' });

let nextCaseId = 0;
const createCaseId = () => `case_${++nextCaseId}_${Math.random().toString(36).slice(2, 6)}`;

export default function usePatientRegistration() {
  const queryClient = useQueryClient();
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const diagnosisSectionRef = useRef(null);
  const treatmentSectionRef = useRef(null);
  const registrationMutation = useMutation({
    mutationFn: addPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['management-patients-overview'] });
      queryClient.invalidateQueries({ queryKey: ['student-patients'] });
      queryClient.invalidateQueries({ queryKey: ['student-cases'] });
    },
  });
  const isSaving = registrationMutation.isPending;

  const patientValidation = useMemo(() => validatePatient(patient), [patient]);
  const patientErrors = useMemo(() => ({
    name: touchedFields.name ? patientValidation.name : '',
    age: touchedFields.age ? patientValidation.age : '',
    phone: touchedFields.phone ? patientValidation.phone : '',
    gender: touchedFields.gender ? patientValidation.gender : '',
  }), [patientValidation, touchedFields]);
  const isPatientInfoValid = !patientValidation.name && !patientValidation.age && !patientValidation.phone && !patientValidation.gender;

  const toothColorMap = useMemo(() => {
    const colors = {};
    cases.filter((caseItem) => caseItem.type === 'diagnosis').forEach((caseItem) => {
      caseItem.teeth.forEach((toothNumber) => {
        colors[toothNumber] = getDiagnosisColor(caseItem.diagnosisCategory);
      });
    });
    return colors;
  }, [cases]);

  const hasUnsavedChanges = Boolean(
    patient.name || patient.age || patient.phone || patient.gender || cases.length > 0 || options.completeDenture || options.singleDenture ||
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
    if (PATIENT_REGISTRATION_CONFIG.diagnoses.find((item) => item.id === diagnosis.type)?.subtypes.length && !diagnosis.subtype) return setDiagnosisError('Please select a caries class.');

    const selectedTeeth = Array.from(pendingTeeth);
    const conflictingTeeth = selectedTeeth.filter((toothNumber) => toothColorMap[toothNumber] !== undefined);
    if (conflictingTeeth.length) {
      return setDiagnosisError(`Tooth${conflictingTeeth.length > 1 ? 'teeth' : ''} ${conflictingTeeth.join(', ')} already assigned.`);
    }
    const diagnosisLabel = getDiagnosisLabel(diagnosis.type, diagnosis.subtype);
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
    PATIENT_REGISTRATION_CONFIG.treatmentPlans.forEach((plan) => {
      if (!treatment[plan.id]) return;
      add(getTreatmentLabel(plan.id, plan.control === 'radio' ? treatment[plan.id] : ''), plan.toothField ? Array.from(treatment[plan.toothField]) : []);
    });
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
    const plan = PATIENT_REGISTRATION_CONFIG.treatmentPlans.find((item) => label === item.label || label.startsWith(`${item.label} — `));
    if (plan) {
      const option = plan.control === 'radio'
        ? label.replace(`${plan.label} — `, '').replace(plan.optionSuffix || '', '')
        : true;
      setTreatment((current) => ({
        ...current,
        [plan.id]: option,
        ...(plan.toothField ? { [plan.toothField]: new Set(caseItem.treatmentTeeth || []) } : {}),
      }));
    }
    setTimeout(() => treatmentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }, [cases]);

  const deleteCase = useCallback((caseId) => setCases((current) => current.filter((item) => item.id !== caseId)), []);

  const resetForm = useCallback(() => {
    setPatient(createInitialPatient()); setTouchedFields({}); setPendingTeeth(new Set()); setCases([]);
    setDiagnosis(createInitialDiagnosis()); setDiagnosisError(''); setTreatment(createInitialTreatment()); setTreatmentError('');
    setOptions(createInitialOptions()); setMedical(createInitialMedical());
  }, []);

  const openSaveDialog = useCallback(() => {
    setTouchedFields({ name: true, age: true, phone: true, gender: true });
    setSaveError('');
    if (isPatientInfoValid) setShowDialog(true);
  }, [isPatientInfoValid]);

  const closeSaveDialog = useCallback(() => {
    if (!isSaving && !saveSuccess) setShowDialog(false);
    setSaveError('');
  }, [isSaving, saveSuccess]);

  const confirmSave = useCallback(async () => {
    if (registrationMutation.isPending) return;
    setSaveError('');
    try {
      await registrationMutation.mutateAsync(createPatientRegistrationPayload({ patient, cases, options, medical }));
      setSaveSuccess(true);
      setTimeout(() => { setShowDialog(false); setSaveSuccess(false); resetForm(); }, 2200);
    } catch (error) {
      setSaveError(error.response?.data?.message || error.userMessage || 'Unable to save the patient record. Please try again.');
    }
  }, [cases, medical, options, patient, registrationMutation, resetForm]);

  return {
    sidebarOpen, setSidebarOpen, patient, patientErrors, isPatientInfoValid, hasUnsavedChanges, changePatient, touchPatientField,
    pendingTeeth, setPendingTeeth, toothColorMap, toggleTooth, diagnosis, diagnosisError, changeDiagnosis, addDiagnosis, diagnosisSectionRef,
    treatment, treatmentError, changeTreatment, addTreatment, treatmentSectionRef, options, changeOptions, medical, changeMedical,
    cases, editCase, deleteCase, showDialog, isSaving, saveSuccess, saveError, openSaveDialog, closeSaveDialog, confirmSave,
  };
}
