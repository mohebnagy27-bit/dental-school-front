import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import DentalChart from '../../components/DentalChart/DentalChart';
import RegistrationConfirmDialog from '../../components/RegistrationConfirmDialog/RegistrationConfirmDialog';
import '../../styles/pagedetails/PatientRegistrationPage.css';

/* ================================================================
   CONSTANTS
   ================================================================ */

const DIAG_COLORS = {
  caries:         '#3B82F6',
  extraction:     '#EF4444',
  remaining_root: '#F97316',
};

const CARIES_CLASSES = ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI'];

const ALL_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

const TOOTH_QUADRANTS = [
  { label: 'Q1 — Upper Right', teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: 'Q2 — Upper Left',  teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: 'Q4 — Lower Right', teeth: [48, 47, 46, 45, 44, 43, 42, 41] },
  { label: 'Q3 — Lower Left',  teeth: [31, 32, 33, 34, 35, 36, 37, 38] },
];

/* ================================================================
   HELPERS
   ================================================================ */

let _id = 0;
const genId = () => `case_${++_id}_${Math.random().toString(36).slice(2, 6)}`;

const isValidName  = (v) => v.trim().length >= 2;
const isValidAge   = (v) => {
  const n = Number(v.trim());
  return v.trim() !== '' && !isNaN(n) && Number.isInteger(n) && n >= 1 && n <= 120;
};
const isValidPhone = (v) => {
  const d = v.replace(/[\s\-\(\)\+\.]/g, '');
  return /^[0-9]{7,15}$/.test(d);
};

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

/* ── Section wrapper with optional lock ── */
const Section = ({ title, badge, locked, children, sectionRef, className = '' }) => (
  <section
    ref={sectionRef}
    className={`reg-section${locked ? ' reg-section--locked' : ''}${className ? ` ${className}` : ''}`}
  >
    <div className="reg-section__header">
      <h2 className="reg-section__title">{title}</h2>
      {badge && <span className="reg-section__badge">{badge}</span>}
      {locked && <span className="reg-section__lock" aria-label="Locked">🔒</span>}
    </div>
    <div className="reg-section__body">{children}</div>
  </section>
);

/* ── Form field wrapper ── */
const Field = ({ label, error, required, children, hint }) => (
  <div className={`reg-field${error ? ' reg-field--error' : ''}`}>
    <label className="reg-field__label">
      {label}
      {required && <span className="reg-field__required" aria-hidden="true">*</span>}
    </label>
    {children}
    {hint && !error && <span className="reg-field__hint">{hint}</span>}
    {error && <span className="reg-field__error" role="alert">{error}</span>}
  </div>
);

/* ── Compact tooth picker for treatment tooth selection ── */
const ToothPicker = ({ selected, onChange, label }) => {
  const toggle = (n) => {
    const next = new Set(selected);
    next.has(n) ? next.delete(n) : next.add(n);
    onChange(next);
  };

  return (
    <div className="tooth-picker">
      {label && <p className="tooth-picker__label">{label}</p>}
      <div className="tooth-picker__quadrants">
        {TOOTH_QUADRANTS.map((q) => (
          <div key={q.label} className="tooth-picker__quadrant">
            <span className="tooth-picker__q-label">{q.label}</span>
            <div className="tooth-picker__teeth">
              {q.teeth.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`tooth-picker__btn${selected.has(n) ? ' tooth-picker__btn--active' : ''}`}
                  onClick={() => toggle(n)}
                  title={`Tooth ${n}`}
                  aria-pressed={selected.has(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected.size > 0 && (
        <p className="tooth-picker__selected">
          Selected: {Array.from(selected).sort((a, b) => a - b).join(', ')}
        </p>
      )}
    </div>
  );
};

/* ── Summary table row ── */
const SummaryRow = ({ c, index, onEdit, onDelete }) => {
  const toothCell = c.type === 'diagnosis'
    ? c.teeth.slice().sort((a, b) => a - b).join(', ')
    : c.treatmentTeeth && c.treatmentTeeth.length > 0
      ? c.treatmentTeeth.slice().sort((a, b) => a - b).join(', ')
      : '—';

  const diagCell  = c.type === 'diagnosis' ? c.diagnosisLabel : '—';
  const treatCell = c.type === 'treatment'  ? c.treatmentLabel : '—';

  const rowCls = [
    'sum-table__row',
    c.type === 'diagnosis' ? `sum-table__row--${c.diagnosisCategory}` : 'sum-table__row--treatment',
  ].join(' ');

  const badge = c.type === 'diagnosis'
    ? { caries: 'Caries', extraction: 'Extraction', remaining_root: 'Rem. Root' }[c.diagnosisCategory]
    : 'Treatment';

  const badgeCls = c.type === 'diagnosis'
    ? `sum-badge sum-badge--${c.diagnosisCategory}`
    : 'sum-badge sum-badge--treatment';

  return (
    <tr className={rowCls}>
      <td className="sum-table__cell sum-table__cell--num">{index + 1}</td>
      <td className="sum-table__cell">{toothCell}</td>
      <td className="sum-table__cell">
        {diagCell !== '—' ? <span className={badgeCls}>{diagCell}</span> : <span className="sum-table__dash">—</span>}
      </td>
      <td className="sum-table__cell">
        {treatCell !== '—' ? <span className={badgeCls}>{treatCell}</span> : <span className="sum-table__dash">—</span>}
      </td>
      <td className="sum-table__cell">
        <span className="sum-table__dash">—</span>
      </td>
      <td className="sum-table__cell sum-table__cell--actions">
        <button
          type="button"
          className="sum-action sum-action--edit"
          onClick={() => onEdit(c.id)}
          title="Edit this case"
        >
          Edit
        </button>
        <button
          type="button"
          className="sum-action sum-action--delete"
          onClick={() => onDelete(c.id)}
          title="Delete this case"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function PatientRegistrationPage() {
  /* ── Sidebar ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add('sidebar-open');
    else document.body.classList.remove('sidebar-open');
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  /* ── Patient info ── */
  const [patientName,  setPatientName]  = useState('');
  const [patientAge,   setPatientAge]   = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [touched,      setTouched]      = useState({});

  const nameError  = touched.name  && !isValidName(patientName)   ? 'Name must be at least 2 characters.' : '';
  const ageError   = touched.age   && !isValidAge(patientAge)     ? 'Enter a valid age (1–120).' : '';
  const phoneError = touched.phone && !isValidPhone(patientPhone) ? 'Enter a valid phone number.' : '';

  const patientInfoValid = isValidName(patientName) && isValidAge(patientAge) && isValidPhone(patientPhone);

  const blurField = (field) => setTouched((t) => ({ ...t, [field]: true }));

  /* ── Dental chart ── */
  const [pendingTeeth, setPendingTeeth] = useState(new Set());

  /* ── Cases ── */
  const [cases, setCases] = useState([]);

  /* toothColorMap: tooth# → hex color (from diagnosis cases) */
  const toothColorMap = useMemo(() => {
    const map = {};
    cases
      .filter((c) => c.type === 'diagnosis')
      .forEach((c) => {
        c.teeth.forEach((t) => {
          map[t] = DIAG_COLORS[c.diagnosisCategory] || '#6B7280';
        });
      });
    return map;
  }, [cases]);

  /* ── Tooth toggle ── */
  const handleToothToggle = useCallback((num) => {
    if (!patientInfoValid) return;
    if (toothColorMap[num] !== undefined) return; // already in a case
    setPendingTeeth((prev) => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }, [patientInfoValid, toothColorMap]);

  /* ── Diagnosis form ── */
  const [diagType,    setDiagType]    = useState('');
  const [diagSubtype, setDiagSubtype] = useState('');
  const [diagError,   setDiagError]   = useState('');

  const diagSectionRef = useRef(null);

  const handleAddDiagnosis = () => {
    if (pendingTeeth.size === 0) {
      setDiagError('Please select at least one tooth on the chart above.');
      return;
    }
    if (!diagType) {
      setDiagError('Please select a diagnosis type.');
      return;
    }
    if (diagType === 'caries' && !diagSubtype) {
      setDiagError('Please select a caries class.');
      return;
    }

    // Prevent tooth duplication across cases
    const conflictTeeth = Array.from(pendingTeeth).filter((t) => toothColorMap[t] !== undefined);
    if (conflictTeeth.length > 0) {
      setDiagError(`Tooth${conflictTeeth.length > 1 ? 'teeth' : ''} ${conflictTeeth.join(', ')} already assigned.`);
      return;
    }

    const diagLabel =
      diagType === 'caries' ? `Caries — ${diagSubtype}` :
      diagType === 'extraction' ? 'Extraction' :
      'Remaining Root';

    setCases((prev) => [...prev, {
      id:                genId(),
      type:              'diagnosis',
      teeth:             Array.from(pendingTeeth),
      diagnosisLabel:    diagLabel,
      diagnosisCategory: diagType,
      diagnosisSubtype:  diagSubtype,
      treatmentLabel:    null,
      treatmentTeeth:    [],
    }]);

    setPendingTeeth(new Set());
    setDiagType('');
    setDiagSubtype('');
    setDiagError('');
  };

  /* ── Treatment form ── */
  const [treatScaling, setTreatScaling] = useState('');
  const [treatOrthodontic, setTreatOrthodontic] = useState('');
  const [treatBridge,  setTreatBridge]  = useState('');
  const [bridgeTeeth,  setBridgeTeeth]  = useState(new Set());
  const [treatPartial, setTreatPartial] = useState(false);
  const [partialTeeth, setPartialTeeth] = useState(new Set());
  const [treatImplant, setTreatImplant] = useState(false);
  const [implantTeeth, setImplantTeeth] = useState(new Set());
  const [treatError,   setTreatError]   = useState('');

  const treatSectionRef = useRef(null);

  const handleAddTreatment = () => {
    const items = [];

    if (treatScaling) {
      items.push({
        id: genId(), type: 'treatment',
        treatmentLabel: `Scaling — ${treatScaling}`,
        treatmentTeeth: [],
        diagnosisLabel: null, diagnosisCategory: null, teeth: [],
      });
    }
    if (treatOrthodontic) {
      items.push({
        id: genId(), type: 'treatment',
        treatmentLabel: `Orthodontic — ${treatOrthodontic}`,
        treatmentTeeth: [],
        diagnosisLabel: null, diagnosisCategory: null, teeth: [],
      });
    }
    if (treatBridge) {
      items.push({
        id: genId(), type: 'treatment',
        treatmentLabel: `Bridge — ${treatBridge} Bridge`,
        treatmentTeeth: Array.from(bridgeTeeth),
        diagnosisLabel: null, diagnosisCategory: null, teeth: [],
      });
    }
    if (treatPartial) {
      items.push({
        id: genId(), type: 'treatment',
        treatmentLabel: 'Partial Denture',
        treatmentTeeth: Array.from(partialTeeth),
        diagnosisLabel: null, diagnosisCategory: null, teeth: [],
      });
    }
    if (treatImplant) {
      items.push({
        id: genId(), type: 'treatment',
        treatmentLabel: 'Implant',
        treatmentTeeth: Array.from(implantTeeth),
        diagnosisLabel: null, diagnosisCategory: null, teeth: [],
      });
    }

    if (items.length === 0) {
      setTreatError('Please select at least one treatment option.');
      return;
    }

    setCases((prev) => [...prev, ...items]);
    setTreatScaling('');
    setTreatOrthodontic('');
    setTreatBridge('');
    setBridgeTeeth(new Set());
    setTreatPartial(false);
    setPartialTeeth(new Set());
    setTreatImplant(false);
    setImplantTeeth(new Set());
    setTreatError('');
  };

  /* ── Additional options ── */
  const [completeDenture, setCompleteDenture] = useState(false);
  const [singleDenture,   setSingleDenture]   = useState(false);
  const [singleArch,      setSingleArch]      = useState('');

  /* ── Medical info ── */
  const [medicalHistory, setMedicalHistory] = useState('');
  const [complications,  setComplications]  = useState('');
  const [notes,          setNotes]          = useState('');

  /* ── Dialog / save ── */
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ── Unsaved changes guard ── */
  const hasUnsaved = !!(
    patientName || patientAge || patientPhone ||
    cases.length > 0 || completeDenture || singleDenture ||
    medicalHistory || complications || notes
  );

  useEffect(() => {
    const handler = (e) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  /* ── Edit case ── */
  const handleEditCase = (id) => {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    setCases((prev) => prev.filter((x) => x.id !== id));

    if (c.type === 'diagnosis') {
      setPendingTeeth(new Set(c.teeth));
      setDiagType(c.diagnosisCategory);
      setDiagSubtype(c.diagnosisSubtype || '');
      setTimeout(() => diagSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);

    } else if (c.type === 'treatment') {
      const lbl = c.treatmentLabel || '';
      if (lbl.startsWith('Scaling')) {
        setTreatScaling(lbl.replace('Scaling — ', ''));
      } else if (lbl.startsWith('Orthodontic')) {
        setTreatOrthodontic(lbl.replace('Orthodontic — ', ''));
      } else if (lbl.startsWith('Bridge')) {
        setTreatBridge(lbl.includes('Anterior') ? 'Anterior' : 'Posterior');
        setBridgeTeeth(new Set(c.treatmentTeeth || []));
      } else if (lbl === 'Partial Denture') {
        setTreatPartial(true);
        setPartialTeeth(new Set(c.treatmentTeeth || []));
      } else if (lbl === 'Implant') {
        setTreatImplant(true);
        setImplantTeeth(new Set(c.treatmentTeeth || []));
      }
      setTimeout(() => treatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }
  };

  /* ── Delete case ── */
  const handleDeleteCase = (id) => {
    setCases((prev) => prev.filter((x) => x.id !== id));
  };

  /* ── Save ── */
  const handleSaveClick = () => {
    // Touch all patient fields on save attempt
    setTouched({ name: true, age: true, phone: true });
    if (!patientInfoValid) return;
    setShowDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1600));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setShowDialog(false);
      setSaveSuccess(false);
      resetForm();
    }, 2200);
  };

  const resetForm = () => {
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setTouched({});
    setPendingTeeth(new Set());
    setCases([]);
    setDiagType('');
    setDiagSubtype('');
    setDiagError('');
    setTreatScaling('');
    setTreatBridge('');
    setBridgeTeeth(new Set());
    setTreatPartial(false);
    setPartialTeeth(new Set());
    setTreatImplant(false);
    setImplantTeeth(new Set());
    setTreatError('');
    setCompleteDenture(false);
    setSingleDenture(false);
    setSingleArch('');
    setSingleClass('');
    setTreatOrthodontic('');
    setMedicalHistory('');
    setComplications('');
    setNotes('');
  };

  /* ── Pending teeth tags ── */
  const pendingList = Array.from(pendingTeeth).sort((a, b) => a - b);

  /* ── Diagnosis label (live) ── */
  const pendingDiagLabel = pendingTeeth.size > 0
    ? `${pendingTeeth.size} tooth${pendingTeeth.size > 1 ? ' teeth' : ''} selected`
    : 'No teeth selected';

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="dashboard-content reg-page">
          {/* ── Page header ── */}
          <div className="reg-page__header">
            <div>
              <h1 className="reg-page__title">New Patient Registration</h1>
              <p className="reg-page__subtitle">Complete the form below to register a patient and build their dental case.</p>
            </div>
            <div className="reg-page__header-actions">
              <button
                type="button"
                className="reg-page__save-btn"
                onClick={handleSaveClick}
                disabled={!patientInfoValid && hasUnsaved === false}
              >
                Save Patient Record
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              1. PATIENT INFORMATION
              ══════════════════════════════════════════════ */}
          <Section title="Patient Information" badge="Required">
            <div className="reg-row reg-row--3">
              <Field label="Patient Name" required error={nameError}>
                <input
                  type="text"
                  className={`reg-input${nameError ? ' reg-input--error' : ''}`}
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  onBlur={() => blurField('name')}
                  placeholder="Full name"
                  autoComplete="name"
                />
              </Field>

              <Field label="Age" required error={ageError}>
                <input
                  type="number"
                  className={`reg-input${ageError ? ' reg-input--error' : ''}`}
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  onBlur={() => blurField('age')}
                  placeholder="e.g. 32"
                  min="1"
                  max="120"
                />
              </Field>

              <Field label="Phone Number" required error={phoneError} hint="7–15 digits, any format">
                <input
                  type="tel"
                  className={`reg-input${phoneError ? ' reg-input--error' : ''}`}
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  onBlur={() => blurField('phone')}
                  placeholder="e.g. +20 123 456 7890"
                  autoComplete="tel"
                  style={{ fontSize: 'max(16px, 0.875rem)' }}
                />
              </Field>
            </div>

            {patientInfoValid && (
              <div className="reg-patient-valid" role="status">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6.5" stroke="#22C55E" />
                  <path d="M4 7l2 2 4-4" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Patient information complete — form unlocked.
              </div>
            )}
          </Section>

          {/* ══════════════════════════════════════════════
              2. DENTAL CHART
              ══════════════════════════════════════════════ */}
          <Section
            title="Dental Chart"
            badge="FDI System"
            locked={!patientInfoValid}
          >
            <DentalChart
              pendingTeeth={pendingTeeth}
              toothColorMap={toothColorMap}
              onToothToggle={handleToothToggle}
              disabled={!patientInfoValid}
            />
          </Section>

          {/* ══════════════════════════════════════════════
              3. DIAGNOSIS ASSIGNMENT
              ══════════════════════════════════════════════ */}
          <Section
            title="Diagnosis Assignment"
            locked={!patientInfoValid}
            sectionRef={diagSectionRef}
          >
            {/* Selected teeth indicator */}
            <div className="reg-teeth-indicator">
              <div className="reg-teeth-indicator__count">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 2C5.79 2 4 3.79 4 6c0 2.38 1.5 4.5 3.5 6h1C10.5 10.5 12 8.38 12 6c0-2.21-1.79-4-4-4z" fill="#1D6FD8" fillOpacity=".15" stroke="#1D6FD8" strokeWidth="1.2" />
                </svg>
                <span>{pendingDiagLabel}</span>
              </div>

              {pendingList.length > 0 && (
                <div className="reg-teeth-tags">
                  {pendingList.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="reg-tooth-tag"
                      onClick={() => handleToothToggle(n)}
                      title={`Remove tooth ${n}`}
                    >
                      {n}
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="reg-teeth-clear"
                    onClick={() => setPendingTeeth(new Set())}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Diagnosis type + subtype */}
            <div className="reg-row reg-row--2">
              <Field label="Diagnosis Type" required>
                <select
                  className="reg-select"
                  value={diagType}
                  onChange={(e) => { setDiagType(e.target.value); setDiagSubtype(''); setDiagError(''); }}
                >
                  <option value="">Select diagnosis…</option>
                  <option value="caries">Caries</option>
                  <option value="extraction">Extraction</option>
                  <option value="remaining_root">Remaining Root</option>
                </select>
              </Field>

              {diagType === 'caries' && (
                <Field label="Caries Class" required>
                  <select
                    className="reg-select"
                    value={diagSubtype}
                    onChange={(e) => { setDiagSubtype(e.target.value); setDiagError(''); }}
                  >
                    <option value="">Select class…</option>
                    {CARIES_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>

            {diagError && <p className="reg-form-error" role="alert">{diagError}</p>}

            <div className="reg-section__actions">
              <button
                type="button"
                className="reg-btn reg-btn--primary"
                onClick={handleAddDiagnosis}
                disabled={!patientInfoValid}
              >
                + Add Diagnosis Group
              </button>
              <span className="reg-section__actions-hint">
                Assigns the selected teeth to this diagnosis and adds it to the summary table.
              </span>
            </div>
          </Section>

          {/* ══════════════════════════════════════════════
              4. TREATMENT OPTIONS
              ══════════════════════════════════════════════ */}
          <Section
            title="Treatment Options"
            locked={!patientInfoValid}
            sectionRef={treatSectionRef}
          >
            {/* Scaling */}
            <fieldset className="reg-fieldset">
              <legend className="reg-fieldset__legend">Scaling</legend>
              <div className="reg-radio-group">
                {['Simple', 'Moderate', 'Heavy'].map((s) => (
                  <label key={s} className="reg-radio-label">
                    <input
                      type="radio"
                      name="scaling"
                      value={s}
                      checked={treatScaling === s}
                      onChange={(e) => { setTreatScaling(e.target.value); setTreatError(''); }}
                    />
                    {s}
                  </label>
                ))}
                {treatScaling && (
                  <button
                    type="button"
                    className="reg-clear-link"
                    onClick={() => setTreatScaling('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </fieldset>

            <fieldset className="reg-fieldset">
              <legend className="reg-fieldset__legend">Orthodontic</legend>
              <div className="reg-radio-group">
                {['Crowding', 'Spacing', 'Class II', 'Class III'].map((o) => (
                  <label key={o} className="reg-radio-label">
                    <input
                      type="radio"
                      name="orthodontic"
                      value={o}
                      checked={treatOrthodontic === o}
                      onChange={(e) => { setTreatOrthodontic(e.target.value); setTreatError(''); }}
                    />
                    {o}
                  </label>
                ))}
                {treatOrthodontic && (
                  <button
                    type="button"
                    className="reg-clear-link"
                    onClick={() => setTreatOrthodontic('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </fieldset>

            {/* Bridge */}
            <fieldset className="reg-fieldset">
              <legend className="reg-fieldset__legend">Bridge</legend>
              <div className="reg-radio-group">
                {['Anterior', 'Posterior'].map((b) => (
                  <label key={b} className="reg-radio-label">
                    <input
                      type="radio"
                      name="bridge"
                      value={b}
                      checked={treatBridge === b}
                      onChange={(e) => { setTreatBridge(e.target.value); setTreatError(''); }}
                    />
                    {b} Bridge
                  </label>
                ))}
                {treatBridge && (
                  <button
                    type="button"
                    className="reg-clear-link"
                    onClick={() => { setTreatBridge(''); setBridgeTeeth(new Set()); }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {treatBridge && (
                <div className="reg-subsection">
                  <ToothPicker
                    selected={bridgeTeeth}
                    onChange={setBridgeTeeth}
                    label="Select missing / pontic teeth:"
                  />
                </div>
              )}
            </fieldset>

            {/* Partial Denture */}
            <fieldset className="reg-fieldset">
              <legend className="reg-fieldset__legend">Partial Denture</legend>
              <label className="reg-checkbox-label">
                <input
                  type="checkbox"
                  checked={treatPartial}
                  onChange={(e) => { setTreatPartial(e.target.checked); if (!e.target.checked) setPartialTeeth(new Set()); setTreatError(''); }}
                />
                Include Partial Denture in treatment plan
              </label>
              {treatPartial && (
                <div className="reg-subsection">
                  <ToothPicker
                    selected={partialTeeth}
                    onChange={setPartialTeeth}
                    label="Select missing teeth involved:"
                  />
                </div>
              )}
            </fieldset>

            {/* Implant */}
            <fieldset className="reg-fieldset">
              <legend className="reg-fieldset__legend">Implant</legend>
              <label className="reg-checkbox-label">
                <input
                  type="checkbox"
                  checked={treatImplant}
                  onChange={(e) => { setTreatImplant(e.target.checked); if (!e.target.checked) setImplantTeeth(new Set()); setTreatError(''); }}
                />
                Include Implant in treatment plan
              </label>
              {treatImplant && (
                <div className="reg-subsection">
                  <ToothPicker
                    selected={implantTeeth}
                    onChange={setImplantTeeth}
                    label="Select implant site teeth:"
                  />
                </div>
              )}
            </fieldset>

            {treatError && <p className="reg-form-error" role="alert">{treatError}</p>}

            <div className="reg-section__actions">
              <button
                type="button"
                className="reg-btn reg-btn--primary"
                onClick={handleAddTreatment}
                disabled={!patientInfoValid}
              >
                + Add Treatment
              </button>
              <span className="reg-section__actions-hint">
                Adds selected treatment options to the summary table.
              </span>
            </div>
          </Section>

          {/* ══════════════════════════════════════════════
              5. ADDITIONAL OPTIONS
              ══════════════════════════════════════════════ */}
          <Section title="Additional Prosthetic Options" locked={!patientInfoValid}>
            <div className="reg-additional">
              {/* Complete Denture */}
              <div className="reg-additional__item">
                <label className="reg-checkbox-label reg-checkbox-label--lg">
                  <input
                    type="checkbox"
                    checked={completeDenture}
                    onChange={(e) => setCompleteDenture(e.target.checked)}
                  />
                  <span>
                    <strong>Complete Denture</strong>
                    <span className="reg-checkbox-label__sub">Full arch tooth replacement</span>
                  </span>
                </label>
              </div>

              {/* Single Denture */}
              <div className="reg-additional__item">
                <label className="reg-checkbox-label reg-checkbox-label--lg">
                  <input
                    type="checkbox"
                    checked={singleDenture}
                    onChange={(e) => {
                      setSingleDenture(e.target.checked);
                      if (!e.target.checked) { setSingleArch(''); setSingleClass(''); }
                    }}
                  />
                  <span>
                    <strong>Single Denture</strong>
                    <span className="reg-checkbox-label__sub">One-arch partial or full denture</span>
                  </span>
                </label>

                {singleDenture && (
                  <div className="reg-additional__sub">
                    <fieldset className="reg-fieldset reg-fieldset--inline">
                      <legend className="reg-fieldset__legend">Arch</legend>
                      <div className="reg-radio-group">
                        {['Upper Arch', 'Lower Arch'].map((a) => (
                          <label key={a} className="reg-radio-label">
                            <input
                              type="radio"
                              name="singleArch"
                              value={a}
                              checked={singleArch === a}
                              onChange={(e) => setSingleArch(e.target.value)}
                            />
                            {a}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════════════════════
              6. MEDICAL INFORMATION
              ══════════════════════════════════════════════ */}
          <Section title="Medical Information" locked={!patientInfoValid}>
            <div className="reg-row reg-row--2">
              <Field label="Medical History" hint="Current conditions, medications, allergies…">
                <textarea
                  className="reg-textarea"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Enter relevant medical history…"
                  rows={4}
                />
              </Field>

              <Field label="Complications" hint="Previous dental complications or concerns">
                <textarea
                  className="reg-textarea"
                  value={complications}
                  onChange={(e) => setComplications(e.target.value)}
                  placeholder="Enter known complications…"
                  rows={4}
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                className="reg-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional clinical notes…"
                rows={3}
              />
            </Field>
          </Section>

          {/* ══════════════════════════════════════════════
              7. CASES SUMMARY TABLE
              ══════════════════════════════════════════════ */}
          <section className="reg-section reg-section--summary">
            <div className="reg-section__header">
              <h2 className="reg-section__title">Cases Summary</h2>
              {cases.length > 0 && (
                <span className="reg-section__badge">{cases.length} {cases.length === 1 ? 'entry' : 'entries'}</span>
              )}
            </div>
            <div className="reg-section__body">
              {/* Color legend */}
              <div className="sum-legend">
                <span className="sum-legend__item sum-legend__item--caries">Caries</span>
                <span className="sum-legend__item sum-legend__item--extraction">Extraction</span>
                <span className="sum-legend__item sum-legend__item--remaining_root">Remaining Root</span>
                <span className="sum-legend__item sum-legend__item--treatment">Treatment</span>
              </div>

              {cases.length === 0 ? (
                <div className="sum-empty">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <rect x="8" y="10" width="24" height="22" rx="3" stroke="#CBD5E1" strokeWidth="1.5" />
                    <path d="M13 18h14M13 22h10" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M25 6v8M15 6v8" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p>No cases added yet. Select teeth and assign a diagnosis above.</p>
                </div>
              ) : (
                <div className="sum-table-wrap">
                  <table className="sum-table">
                    <thead>
                      <tr className="sum-table__head">
                        <th className="sum-table__th">#</th>
                        <th className="sum-table__th">Tooth Number</th>
                        <th className="sum-table__th">Diagnosis</th>
                        <th className="sum-table__th">Treatment Type</th>
                        <th className="sum-table__th">Additional Details</th>
                        <th className="sum-table__th">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((c, i) => (
                        <SummaryRow
                          key={c.id}
                          c={c}
                          index={i}
                          onEdit={handleEditCase}
                          onDelete={handleDeleteCase}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Additional options preview in summary */}
              {(completeDenture || singleDenture) && (
                <div className="sum-additional">
                  <p className="sum-additional__title">Additional Prosthetic Options</p>
                  <div className="sum-additional__list">
                    {completeDenture && (
                      <div className="sum-additional__item">
                        <span className="sum-badge sum-badge--treatment">Complete Denture</span>
                      </div>
                    )}
                    {singleDenture && (
                      <div className="sum-additional__item">
                        <span className="sum-badge sum-badge--treatment">Single Denture</span>
                        {singleArch && <span className="sum-additional__detail">{singleArch}</span>}
                        {/* {singleClass && <span className="sum-additional__detail">{singleClass}</span>} */}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              8. SAVE
              ══════════════════════════════════════════════ */}
          <div className="reg-page__footer">
            {!patientInfoValid && hasUnsaved && (
              <p className="reg-page__footer-warn">
                Complete patient information (Name, Age, Phone) before saving.
              </p>
            )}
            <button
              type="button"
              className="reg-btn reg-btn--save"
              onClick={handleSaveClick}
            >
              Save Patient Record
            </button>
          </div>
        </main>
      </div>

      {/* ── Confirmation dialog ── */}
      <RegistrationConfirmDialog
        isOpen={showDialog}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        patientName={patientName}
        patientAge={patientAge}
        patientPhone={patientPhone}
        cases={cases}
        completeDenture={completeDenture}
        singleDenture={singleDenture}
        singleArch={singleArch}
        medicalHistory={medicalHistory}
        complications={complications}
        notes={notes}
        onConfirm={handleConfirmSave}
        onCancel={() => !isSaving && !saveSuccess && setShowDialog(false)}
      />
    </div>
  );
}
