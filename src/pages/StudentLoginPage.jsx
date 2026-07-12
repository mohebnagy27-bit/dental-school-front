import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import { AuthCard }    from '../components/auth/AuthCard'
import { FormField }   from '../components/auth/FormField'
import '../styles/StudentLoginPage.css'

import { useStudentStatus } from '../hooks/useAuthMutations'

/* sessionStorage key shared across the student auth flow */
const SESSION_KEY = 'df_student_id'

/**
 * StudentLoginPage  — Step 1 of the student auth flow.
 *
 * The student enters their ID.  The service checks whether they have
 * already set a password (firstLoginCompleted):
 *   false → /student/create-password   (first-time setup)
 *   true  → /student/password          (returning login)
 *
 * Mock IDs:
 *   STU-20240001  first-time login
 *   STU-20240042  returning student
 *   STU-20240099  first-time login
 */
export default function StudentLoginPage() {
  const navigate = useNavigate()
  const formRef  = useRef(null)

  const [studentId,      setStudentId]      = useState('')
  const [fieldError,     setFieldError]     = useState('')
  const [apiError,       setApiError]       = useState('')
  const studentStatusMutation = useStudentStatus()
  const isLoading = studentStatusMutation.isPending

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const triggerShake = () => {
    const el = formRef.current
    if (!el) return
    el.classList.add('form-shaking')
    setTimeout(() => el.classList.remove('form-shaking'), 400)
  }

  const validate = () => {
    const trimmed = studentId.trim()
    if (!trimmed) {
      setFieldError('Student ID is required')
      return false
    }
    if (trimmed.length < 5) {
      setFieldError('Please enter a valid Student ID')
      return false
    }
    return true
  }

  const clearErrors = () => {
    setFieldError('')
    setApiError('')
  }

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) { triggerShake(); return }

    setApiError('')

    try {
    const data = await studentStatusMutation.mutateAsync(studentId);

    sessionStorage.setItem(SESSION_KEY, studentId)

    if (!data.exists) {
      setApiError('No student account found with this ID.');
      return;
    }
 
    if (!data.isActive) {
      setApiError('Your account has been disabled. Please contact your administrator.');
      return;
    }

    if (!data.hasPassword) {
      // Student has never logged in — move to activation step
      navigate('/student/create-password')
    } else {
      // Student already has a password — move to login step
      navigate('/student/password')
    }

    } catch (error) {
      setApiError(error.response?.data?.message || 'Network error. Please check your connection and try again.')
      triggerShake()
    }
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <AuthCard
      title="Student sign in"
      subtitle="Enter your student ID to continue"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="student-login__form"
        noValidate
      >
        {/* API error banner */}
        {apiError && (
          <div className="error-banner" role="alert">
            <AlertCircle size={14} className="error-banner__icon" />
            <p className="error-banner__text">{apiError}</p>
          </div>
        )}

        {/* Student ID field */}
        <FormField label="Student ID" required error={fieldError}>
          <input
            type="text"
            value={studentId}
            onChange={(e) => { setStudentId(e.target.value); clearErrors() }}
            placeholder="e.g. STU-20240001"
            disabled={isLoading}
            autoComplete="username"
            spellCheck={false}
            className={`form-input form-input--mono${fieldError ? ' form-input--error' : ''}`}
          />
          <span className="student-login__hint">
            Tip — try STU-20240001 or STU-20240042
          </span>
        </FormField>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-full"
        >
          {isLoading
            ? <><span className="spinner" aria-hidden="true" /> Checking...</>
            : 'Continue'
          }
        </button>
      </form>

      {/* Back link */}
      <div className="student-login__footer">
        <button
          type="button"
          className="auth-link"
          onClick={() => navigate('/')}
        >
          ← Back to home
        </button>
      </div>
    </AuthCard>
  )
}
