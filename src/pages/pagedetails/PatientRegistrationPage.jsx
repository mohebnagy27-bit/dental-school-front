import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import DentalChart from '../../components/DentalChart/DentalChart';
import RegistrationConfirmDialog from '../../components/RegistrationConfirmDialog/RegistrationConfirmDialog';
import AdditionalProstheticSection from '../../components/patient-registration/AdditionalProstheticSection';
import CasesSummary from '../../components/patient-registration/CasesSummary';
import DiagnosisSection from '../../components/patient-registration/DiagnosisSection';
import FormSection from '../../components/patient-registration/FormSection';
import MedicalInformationSection from '../../components/patient-registration/MedicalInformationSection';
import PatientInfoSection from '../../components/patient-registration/PatientInfoSection';
import TreatmentSection from '../../components/patient-registration/TreatmentSection';
import { PATIENT_REGISTRATION_CONFIG } from '../../config/patientRegistration';
import usePatientRegistration from '../../hooks/usePatientRegistration';
import '../../styles/pagedetails/PatientRegistrationPage.css';

export default function PatientRegistrationPage() {
  const registration = usePatientRegistration();
  const { page, dentalChart } = PATIENT_REGISTRATION_CONFIG;

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" isOpen={registration.sidebarOpen} onClose={() => registration.setSidebarOpen(false)} />
      {registration.sidebarOpen && <div className="sidebar-overlay" onClick={() => registration.setSidebarOpen(false)} />}

      <div className="dashboard-main">
        <Topbar onMenuClick={() => registration.setSidebarOpen(true)} />
        <main className="dashboard-content reg-page">
          <header className="reg-page__header">
            <div>
              <h1 className="reg-page__title">{page.title}</h1>
              <p className="reg-page__subtitle">{page.subtitle}</p>
            </div>
            <div className="reg-page__header-actions">
              <button
                type="button"
                className="reg-page__save-btn"
                onClick={registration.openSaveDialog}
                disabled={!registration.isPatientInfoValid && !registration.hasUnsavedChanges}
              >
                {page.saveLabel}
              </button>
            </div>
          </header>

          <PatientInfoSection
            patient={registration.patient}
            errors={registration.patientErrors}
            isValid={registration.isPatientInfoValid}
            onChange={registration.changePatient}
            onBlur={registration.touchPatientField}
          />

          <FormSection title={dentalChart.title} badge={dentalChart.badge} locked={!registration.isPatientInfoValid}>
            <DentalChart
              pendingTeeth={registration.pendingTeeth}
              toothColorMap={registration.toothColorMap}
              onToothToggle={registration.toggleTooth}
              disabled={!registration.isPatientInfoValid}
            />
          </FormSection>

          <DiagnosisSection
            diagnosis={registration.diagnosis}
            error={registration.diagnosisError}
            isUnlocked={registration.isPatientInfoValid}
            pendingTeeth={registration.pendingTeeth}
            sectionRef={registration.diagnosisSectionRef}
            onDiagnosisChange={registration.changeDiagnosis}
            onToothToggle={registration.toggleTooth}
            onClearTeeth={() => registration.setPendingTeeth(new Set())}
            onAdd={registration.addDiagnosis}
          />

          <TreatmentSection
            treatment={registration.treatment}
            error={registration.treatmentError}
            isUnlocked={registration.isPatientInfoValid}
            sectionRef={registration.treatmentSectionRef}
            onChange={registration.changeTreatment}
            onAdd={registration.addTreatment}
          />

          <AdditionalProstheticSection options={registration.options} isUnlocked={registration.isPatientInfoValid} onChange={registration.changeOptions} />
          <MedicalInformationSection medical={registration.medical} isUnlocked={registration.isPatientInfoValid} onChange={registration.changeMedical} />
          <CasesSummary cases={registration.cases} options={registration.options} onEdit={registration.editCase} onDelete={registration.deleteCase} />

          <div className="reg-page__footer">
            {!registration.isPatientInfoValid && registration.hasUnsavedChanges && (
              <p className="reg-page__footer-warn">{page.incompleteMessage}</p>
            )}
            <button type="button" className="reg-btn reg-btn--save" onClick={registration.openSaveDialog}>{page.saveLabel}</button>
          </div>
        </main>
      </div>

      <RegistrationConfirmDialog
        isOpen={registration.showDialog}
        isSaving={registration.isSaving}
        saveSuccess={registration.saveSuccess}
        saveError={registration.saveError}
        patientName={registration.patient.name}
        patientAge={registration.patient.age}
        patientPhone={registration.patient.phone}
        patientGender={registration.patient.gender}
        cases={registration.cases}
        completeDenture={registration.options.completeDenture}
        singleDenture={registration.options.singleDenture}
        singleArch={registration.options.singleArch}
        medicalHistory={registration.medical.history}
        complications={registration.medical.complications}
        notes={registration.medical.notes}
        onConfirm={registration.confirmSave}
        onCancel={registration.closeSaveDialog}
      />
    </div>
  );
}
