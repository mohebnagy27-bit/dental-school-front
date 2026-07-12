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
import usePatientRegistration from '../../hooks/usePatientRegistration';
import '../../styles/pagedetails/PatientRegistrationPage.css';

export default function PatientRegistrationPage() {
  const registration = usePatientRegistration();

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={registration.sidebarOpen} onClose={() => registration.setSidebarOpen(false)} />
      {registration.sidebarOpen && <div className="sidebar-overlay" onClick={() => registration.setSidebarOpen(false)} />}

      <div className="dashboard-main">
        <Topbar onMenuClick={() => registration.setSidebarOpen(true)} />
        <main className="dashboard-content reg-page">
          <header className="reg-page__header">
            <div>
              <h1 className="reg-page__title">New Patient Registration</h1>
              <p className="reg-page__subtitle">Complete the form below to register a patient and build their dental case.</p>
            </div>
            <div className="reg-page__header-actions">
              <button
                type="button"
                className="reg-page__save-btn"
                onClick={registration.openSaveDialog}
                disabled={!registration.isPatientInfoValid && !registration.hasUnsavedChanges}
              >
                Save Patient Record
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

          <FormSection title="Dental Chart" badge="FDI System" locked={!registration.isPatientInfoValid}>
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
              <p className="reg-page__footer-warn">Complete patient information (Name, Age, Phone) before saving.</p>
            )}
            <button type="button" className="reg-btn reg-btn--save" onClick={registration.openSaveDialog}>Save Patient Record</button>
          </div>
        </main>
      </div>

      <RegistrationConfirmDialog
        isOpen={registration.showDialog}
        isSaving={registration.isSaving}
        saveSuccess={registration.saveSuccess}
        patientName={registration.patient.name}
        patientAge={registration.patient.age}
        patientPhone={registration.patient.phone}
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
