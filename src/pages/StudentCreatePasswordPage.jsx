import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { CheckCircle2 }        from 'lucide-react'

import { AuthCard }                from '../components/auth/AuthCard'
import { FormField }               from '../components/auth/FormField'
import { PasswordInput }           from '../components/auth/PasswordInput'
import { PasswordStrengthMeter }   from '../components/auth/PasswordStrengthMeter'
import { RequirementItem }         from '../components/auth/RequirementItem'
import { authService }             from '../services/auth.service'
import '../styles/StudentCreatePasswordPage.css'

const SESSION_KEY = 'df_student_id'

/** Password requirements — evaluated live against the current password */
function getRequirements(password) {
  return [
    { label: '8+ characters',     met: password.length >= 8 },
    { label: 'Uppercase letter',  met: /[A-Z]/.test(password) },
    { label: 'Number included',   met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]
}

/**
 * StudentCreatePasswordPage  — Step 2a of the student auth flow.
 *
 * Shown only when firstLoginCompleted === false.
 * Guards against direct navigation: redirects to /student/login
 * if no studentId exists in sessionStorage.
 *
 * On success → /student/dashboard
 */
export default function StudentCreatePasswordPage() {
  const navigate = useNavigate()

  const [studentId,      setStudentId]      = useState('')
  const [password,       setPassword]       = useState('')
  const [confirmPw,      setConfirmPw]      = useState('')
  const [apiError,       setApiError]       = useState('')
  const [isLoading,      setIsLoading]      = useState(false)
  const [isSuccess,      setIsSuccess]      = useState(false)

  /* ── Guard: redirect if no studentId in session ─────────────────── */
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (!stored) {
      navigate('/student/login', { replace: true })
      return
    }
    setStudentId(stored)
  }, [navigate])

  /* Render nothing until studentId is confirmed from sessionStorage */
  if (!studentId) return null

  /* ── Requirements (computed, not state) ─────────────────────────── */
  const requirements    = getRequirements(password)
  const allMet          = requirements.every((r) => r.met)
  const passwordsMatch  = confirmPw.length > 0 && password === confirmPw
  const confirmError    = confirmPw.length > 0 && !passwordsMatch
                            ? 'Passwords do not match'
                            : ''
  const canSubmit       = allMet && passwordsMatch && !isLoading

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    setApiError('')

    try {
      const result = await authService.createStudentPassword(studentId, password)

      if (result.success) {
        setIsSuccess(true)
        /* Brief success pause before navigating to dashboard */
        setTimeout(() => navigate('/student/dashboard'), 1600)
      } else {
        setApiError(result.message || 'Could not set password. Please try again.')
      }
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <AuthCard
      title="Create your password"
      subtitle={`Setting up account for ${studentId}`}
      badge="First time setup"
    >
      {/* ── Success state ─────────────────────────────────────────── */}
      {isSuccess ? (
        <div className="create-password__success" role="status">
          <div className="create-password__success-icon">
            <CheckCircle2 size={28} />
          </div>
          <p className="create-password__success-title">Password created!</p>
          <p className="create-password__success-sub">
            Redirecting to your dashboard…
          </p>
        </div>
      ) : (
        /* ── Form ─────────────────────────────────────────────────── */
        <form
          onSubmit={handleSubmit}
          className="create-password__form"
          noValidate
        >
          {/* API error banner */}
          {apiError && (
            <div className="error-banner" role="alert">
              <p className="error-banner__text">{apiError}</p>
            </div>
          )}

          {/* New password + strength meter */}
          <FormField label="New Password" required>
            <PasswordInput
              value={password}
              onChange={(e) => { setPassword(e.target.value); setApiError('') }}
              placeholder="Create a strong password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {/* Strength bar appears as soon as the user starts typing */}
            <PasswordStrengthMeter password={password} />
          </FormField>

          {/* Requirements checklist */}
          {password.length > 0 && (
            <div className="create-password__requirements">
              <p className="create-password__req-title">Requirements</p>
              {requirements.map((req) => (
                <RequirementItem key={req.label} met={req.met} label={req.label} />
              ))}
            </div>
          )}

          {/* Confirm password */}
          <FormField
            label="Confirm Password"
            required
            error={confirmError}
          >
            <PasswordInput
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setApiError('') }}
              placeholder="Re-enter your password"
              disabled={isLoading}
              error={!!confirmError}
              autoComplete="new-password"
            />
          </FormField>

          {/* Submit — disabled until all requirements met + passwords match */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn btn-primary btn-full create-password__submit"
          >
            {isLoading
              ? <><span className="spinner" aria-hidden="true" /> Setting up…</>
              : 'Set password & continue'
            }
          </button>
        </form>
      )}
    </AuthCard>
  )
}
