import { useState, useEffect, useRef } from 'react'
import { useNavigate }                  from 'react-router-dom'
import { AlertCircle }                  from 'lucide-react'

import { AuthCard }      from '../components/auth/AuthCard'
import { FormField }     from '../components/auth/FormField'
import { PasswordInput } from '../components/auth/PasswordInput'
import '../styles/StudentPasswordPage.css'

import { studentLogin } from '../services/authService'

const SESSION_KEY = 'df_student_id'

/**
 * StudentPasswordPage  — Step 2b of the student auth flow.
 *
 * Shown only when firstLoginCompleted === true (returning student).
 * Guards against direct navigation: redirects to /student/login if
 * no studentId is present in sessionStorage.
 *
 * Mock password for STU-20240042: "password123"
 * On success → /student/dashboard
 */
export default function StudentPasswordPage() {
  const navigate = useNavigate()
  const formRef  = useRef(null)

  const [studentId, setStudentId] = useState('')
  const [password,  setPassword]  = useState('')
  const [apiError,  setApiError]  = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /* ── Guard: redirect if no studentId in session ─────────────────── */
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (!stored) {
      navigate('/student/login', { replace: true })
      return
    }
    setStudentId(stored)
  }, [navigate])

  if (!studentId) return null

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const triggerShake = () => {
    const el = formRef.current
    if (!el) return
    el.classList.add('form-shaking')
    setTimeout(() => el.classList.remove('form-shaking'), 400)
  }

  /** Clear the student session and go back to the ID entry screen */
  const handleNotYou = () => {
    sessionStorage.removeItem(SESSION_KEY)
    navigate('/student/login')
  }

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password) {
      setApiError('Password is required')
      triggerShake()
      return
    }

    setIsLoading(true)
    setApiError('')

    try {
      const data = await studentLogin({ studentId, password });
 
      // Backend returns: { message, token, student: { id, name, phone } }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'STUDENT');
      localStorage.setItem('userId', data.student.id);
      localStorage.setItem('userName', data.student.name);
 
      navigate('/student/dashboard');
    } catch (error) {
      setApiError(
      error.response?.data?.message || 'Network error. Please check your connection and try again.')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Enter your password to continue"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="student-password__form"
        noValidate
      >
        {/* Active student ID pill with "Not you?" escape */}
        <div className="student-password__id-row">
          <div>
            <p className="student-password__id-label">Signed in as</p>
            <p className="student-password__id-value">{studentId}</p>
          </div>
          <button
            type="button"
            onClick={handleNotYou}
            className="student-password__not-you"
          >
            Not you?
          </button>
        </div>

        {/* API / validation error banner */}
        {apiError && (
          <div className="error-banner" role="alert">
            <AlertCircle size={14} className="error-banner__icon" />
            <p className="error-banner__text">{apiError}</p>
          </div>
        )}

        {/* Password field */}
        <FormField label="Password" required>
          <PasswordInput
            value={password}
            onChange={(e) => { setPassword(e.target.value); setApiError('') }}
            placeholder="Enter your password"
            disabled={isLoading}
            error={!!apiError}
            autoComplete="current-password"
          />
        </FormField>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-full"
        >
          {isLoading
            ? <><span className="spinner" aria-hidden="true" /> Signing in…</>
            : 'Sign in'
          }
        </button>
      </form>

      {/* Footer */}
      <div className="student-password__footer">
        <button type="button" className="auth-link">
          Forgot password?
        </button>
      </div>
    </AuthCard>
  )
}
