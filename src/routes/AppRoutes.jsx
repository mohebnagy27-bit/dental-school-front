import { Link, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import LandingPage                from '../pages/LandingPage'
import DoctorLoginPage            from '../pages/DoctorLoginPage'
import StudentLoginPage           from '../pages/StudentLoginPage'
import StudentCreatePasswordPage  from '../pages/StudentCreatePasswordPage'
import StudentPasswordPage        from '../pages/StudentPasswordPage'
import DoctorDashboard            from '../pages/DoctorDashboard'
import StudentDashboard           from '../pages/StudentDashboard'

import PatientsPage        from '../pages/pagedetails/PatientsPage'
import PatientDetailsPage  from '../pages/student/PatientDetailsPage'
import PatientDetailPage from '../pages/pagedetails/PatientDetailPage'
import ReservedCasesPage   from '../pages/pagedetails/ReservedCasesPage'
import CompletedCasesPage  from '../pages/pagedetails/CompletedCasesPage'
import PatientRegistrationPage from '../pages/pagedetails/PatientRegistrationPage'

import StudentProfilePage from '../pages/student/StudentProfilePage'

import SettingsPage from '../pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return children

  return (
    <main className="protected-route-message">
      <p>Please login first.</p>
      <Link to="/">Login first</Link>
    </main>
  )
}


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

      <Route path="/doctor/dashboard"  element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

      <Route path="/doctor/patients"          element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
      <Route path="/doctor/patients/:id"      element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
      <Route path="/student/reserved-cases"    element={<ProtectedRoute><ReservedCasesPage /></ProtectedRoute>} />
      <Route path="/student/completed-cases"   element={<ProtectedRoute><CompletedCasesPage /></ProtectedRoute>} />

      <Route path="/doctor/new-patient" element={<ProtectedRoute><PatientRegistrationPage /></ProtectedRoute>} />

      <Route path="/student/patients/:id"  element={<ProtectedRoute><PatientDetailsPage /></ProtectedRoute>} />
      <Route path="/student/profile"      element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

    </Routes>
  )
}
