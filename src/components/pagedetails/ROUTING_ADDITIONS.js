// ── ADD THESE IMPORTS to your existing App.jsx ────────────────────────────────
import DoctorDashboard     from './pages/DoctorDashboard';
import StudentDashboard    from './pages/StudentDashboard';
import PatientsPage        from './pages/PatientsPage';
import PatientDetailsPage  from './pages/PatientDetailsPage';
import ReservedCasesPage   from './pages/ReservedCasesPage';
import CompletedCasesPage  from './pages/CompletedCasesPage';

// ── ADD THESE ROUTES inside your existing <Routes> block ──────────────────────
//
//   <Route path="/doctor/dashboard"  element={<DoctorDashboard />} />
//   <Route path="/student/dashboard" element={<StudentDashboard />} />
//
//   <Route path="/patients"          element={<PatientsPage />} />
//   <Route path="/patients/:id"      element={<PatientDetailsPage />} />
//   <Route path="/reserved-cases"    element={<ReservedCasesPage />} />
//   <Route path="/completed-cases"   element={<CompletedCasesPage />} />
//
// No other existing routes should be changed.
//
// NOTE: The Sidebar's "Patients" (doctor), "Completed Cases"
// (doctor + student), and "Reserved Cases" (student) links now point
// to these shared top-level routes (/patients, /completed-cases,
// /reserved-cases) instead of the old /doctor/* and /student/* paths,
// so both roles land on the same pages.
// ─────────────────────────────────────────────────────────────────────────────
