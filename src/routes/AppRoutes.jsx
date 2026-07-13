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

const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  DOCTOR: '/doctor/dashboard',
  SUPER_ADMIN: '/doctor/dashboard',
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return (
      <main className="protected-route-message">
        <p>Please login first.</p>
        <Link to="/">Login first</Link>
      </main>
    )
  }

  if (allowedRoles?.includes(role)) return children

  return (
    <main className="protected-route-message">
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <Link to={ROLE_DASHBOARDS[role] || '/'}>Back to your dashboard</Link>
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

      <Route path="/doctor/dashboard"  element={<ProtectedRoute allowedRoles={['DOCTOR', 'SUPER_ADMIN']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />

      <Route path="/doctor/patients"          element={<ProtectedRoute allowedRoles={['DOCTOR', 'SUPER_ADMIN']}><PatientsPage /></ProtectedRoute>} />
      <Route path="/doctor/patients/:id"      element={<ProtectedRoute allowedRoles={['DOCTOR', 'SUPER_ADMIN']}><PatientDetailPage /></ProtectedRoute>} />
      <Route path="/student/reserved-cases"    element={<ProtectedRoute allowedRoles={['STUDENT']}><ReservedCasesPage /></ProtectedRoute>} />
      <Route path="/student/completed-cases"   element={<ProtectedRoute allowedRoles={['STUDENT']}><CompletedCasesPage /></ProtectedRoute>} />

      <Route path="/doctor/new-patient" element={<ProtectedRoute allowedRoles={['DOCTOR', 'SUPER_ADMIN']}><PatientRegistrationPage /></ProtectedRoute>} />

      <Route path="/student/patients/:id"  element={<ProtectedRoute allowedRoles={['STUDENT']}><PatientDetailsPage /></ProtectedRoute>} />
      <Route path="/student/profile"      element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SettingsPage /></ProtectedRoute>} />

    </Routes>
  )
}
