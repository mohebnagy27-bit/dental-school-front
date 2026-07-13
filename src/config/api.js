export const API_BASE_URL = "http://localhost:5000";

export const API_ENDPOINTS = {
  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────
  auth: {
    staffLogin:       `${API_BASE_URL}/api/auth/staff/login`,
    studentCheck:     `${API_BASE_URL}/api/auth/student/check`,
    studentActivate:  `${API_BASE_URL}/api/auth/student/activate`,
    studentLogin:     `${API_BASE_URL}/api/auth/student/login`,
  },

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────
  admin: {
    uploadStudents:         `${API_BASE_URL}/api/admin/students/upload`,
    bulkDeactivateStudents: `${API_BASE_URL}/api/admin/students/deactivate`,
    addDoctor:              `${API_BASE_URL}/api/admin/doctors`,
    deactivateDoctor:  (id) => `${API_BASE_URL}/api/admin/doctors/${id}/deactivate`,
    reactivateDoctor:  (id) => `${API_BASE_URL}/api/admin/doctors/${id}/reactivate`,
    deactivateStudent: (id) => `${API_BASE_URL}/api/admin/students/${id}/deactivate`,
    reactivateStudent: (id) => `${API_BASE_URL}/api/admin/students/${id}/reactivate`,
  },

  // ─────────────────────────────────────────────
  // DOCTOR
  // ─────────────────────────────────────────────
  doctor: {
    addPatient:    `${API_BASE_URL}/api/doctor/patients-with-case`,
    editPatient:   (id) => `${API_BASE_URL}/api/doctor/patients/${id}`,
    createCase:    `${API_BASE_URL}/api/doctor/cases`,
    editCase:      (id) => `${API_BASE_URL}/api/doctor/cases/${id}`,
  },

  // ─────────────────────────────────────────────
  // STUDENT
  // ─────────────────────────────────────────────
  student: {
    getPatients:      `${API_BASE_URL}/api/student/patients`,
    getPatientById:   (id)     => `${API_BASE_URL}/api/student/patients/${id}`,
    getAllCases:       `${API_BASE_URL}/api/student/cases`,
    bookCase:         (caseId) => `${API_BASE_URL}/api/student/cases/${caseId}/book`,
    unreserveCase:    (id)     => `${API_BASE_URL}/api/student/cases/${id}/unreserve`,
    completeCase:     (id)     => `${API_BASE_URL}/api/student/cases/${id}/complete`,
    updateNotes:      (id)     => `${API_BASE_URL}/api/student/cases/${id}/notes`,
    getReservedCases: `${API_BASE_URL}/api/student/my-cases/reserved`,
    getCompletedCases:`${API_BASE_URL}/api/student/my-cases/completed`,
  },

  // ─────────────────────────────────────────────
  // MANAGEMENT
  // ─────────────────────────────────────────────
  management: {
    patientsOverview: `${API_BASE_URL}/api/management/patients`,
    dashboard:        `${API_BASE_URL}/api/management/dashboard`,
    patientDetails: (patientId) => `${API_BASE_URL}/api/management/patients/${patientId}`,
  },
};
