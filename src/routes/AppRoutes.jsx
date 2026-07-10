import { Routes, Route, Navigate } from 'react-router-dom'

import LandingPage                from '../pages/LandingPage'
import DoctorLoginPage            from '../pages/DoctorLoginPage'
import StudentLoginPage           from '../pages/StudentLoginPage'
import StudentCreatePasswordPage  from '../pages/StudentCreatePasswordPage'
import StudentPasswordPage        from '../pages/StudentPasswordPage'
// import DashboardPlaceholder       from '../pages/DashboardPlaceholder'
import DoctorDashboard            from '../pages/DoctorDashboard'
import StudentDashboard           from '../pages/StudentDashboard'

import PatientsPage        from '../pages/pagedetails/PatientsPage'
import PatientDetailsPage  from '../pages/student/PatientDetailsPage'
import PatientDetailPage from '../pages/pagedetails/PatientDetailPage'
import ReservedCasesPage   from '../pages/pagedetails/ReservedCasesPage'
import CompletedCasesPage  from '../pages/pagedetails/CompletedCasesPage'
import PatientRegistrationPage from '../pages/pagedetails/PatientRegistrationPage'

import StudentProfilePage from '../pages/student/StudentProfilePage'


/**
 * AppRoutes
 *
 * Central route registry for the entire application.
 *
 * Route map:
 *   /                         → Landing page
 *   /doctor/login             → Doctor sign-in
 *   /doctor/dashboard         → Doctor dashboard (placeholder)
 *   /student/login            → Student ID entry (step 1)
 *   /student/create-password  → First-time password setup (step 2a)
 *   /student/password         → Returning student password login (step 2b)
 *   /student/dashboard        → Student dashboard (placeholder)
 *   *                         → Redirect to /
 */
export function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ─────────────────────────────────────── */}
      <Route path="/"  element={<LandingPage />} />

      {/* ── Doctor auth ────────────────────────────────── */}
      <Route path="/doctor/login"      element={<DoctorLoginPage />} />
      {/* <Route path="/doctor/dashboard"  element={<DashboardPlaceholder role="doctor" />} /> */}

      {/* ── Student auth ───────────────────────────────── */}
      <Route path="/student/login"             element={<StudentLoginPage />} />
      <Route path="/student/create-password"   element={<StudentCreatePasswordPage />} />
      <Route path="/student/password"          element={<StudentPasswordPage />} />
      {/* <Route path="/student/dashboard"         element={<DashboardPlaceholder role="student" />} /> */}

      {/* ── 404 fallback ───────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/doctor/dashboard"  element={<DoctorDashboard />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />

      <Route path="/doctor/patients"          element={<PatientsPage />} />
      <Route path="/doctor/patients/:id"      element={<PatientDetailPage />} />
      <Route path="/student/reserved-cases"    element={<ReservedCasesPage />} />
      <Route path="/student/completed-cases"   element={<CompletedCasesPage />} />

      <Route path="/doctor/new-patient" element={<PatientRegistrationPage />} />

      <Route path="/student/patients/:id"  element={<PatientDetailsPage />} />
      <Route path="/student/profile"      element={<StudentProfilePage />} />

    </Routes>
  )
}
