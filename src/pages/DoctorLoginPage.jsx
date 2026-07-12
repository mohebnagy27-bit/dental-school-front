import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import { AuthCard }      from '../components/auth/AuthCard'
import { FormField }     from '../components/auth/FormField'
import { PasswordInput } from '../components/auth/PasswordInput'
import { staffLogin } from '../services/authService'
import '../styles/DoctorLoginPage.css'

/**
 * DoctorLoginPage
 *
 * Fields:    Username, Password, Remember me checkbox
 * Validation: username (required, ≥3 chars), password (required)
 * On success: navigate to /doctor/dashboard
 *
 * Mock credentials:  username = "doctor"  |  password = "password123"
 */
export default function DoctorLoginPage() {
  const navigate = useNavigate()
  const formRef  = useRef(null)

  /* ── Form state ────────────────────────────────────────────────── */
  const [username,      setUsername]      = useState('')
  const [password,      setPassword]      = useState('')
  const [rememberMe,    setRememberMe]    = useState(false)

  /* ── Error state ───────────────────────────────────────────────── */
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [apiError,      setApiError]      = useState('')

  /* ── Async state ───────────────────────────────────────────────── */
  const [isLoading, setIsLoading] = useState(false)

  /* ── Helpers ───────────────────────────────────────────────────── */

  /** Adds the shake CSS class to the form, then removes it after the animation */
  const triggerShake = () => {
    const el = formRef.current
    if (!el) return
    el.classList.add('form-shaking')
    setTimeout(() => el.classList.remove('form-shaking'), 400)
  }

  /** Client-side validation; returns true when all fields are valid */
  const validate = () => {
    let valid = true

    if (!username.trim()) {
      setUsernameError('Username is required')
      valid = false
    } else if (username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters')
      valid = false
    }

    if (!password) {
      setPasswordError('Password is required')
      valid = false
    }

    return valid
  }

  /** Clear all error state when the user starts editing */
  const clearErrors = () => {
    setUsernameError('')
    setPasswordError('')
    setApiError('')
  }

  /* ── Submit ────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      triggerShake()
      return
    }

    setIsLoading(true)
    setApiError('')

    try {

      const data = await staffLogin({ identifier: username, password });
 
      // Backend returns: { message, token, user: { id, name, email, role } }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
 
      if (data.user.role === 'SUPER_ADMIN') {
      navigate('/admin/dashboard');
      } else if (data.user.role === 'DOCTOR') {
      navigate('/doctor/dashboard');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'An unexpected error occurred. Please try again.')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <AuthCard
      title="Doctor sign in"
      subtitle="Access your clinic dashboard"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="doctor-login__form"
        noValidate
      >
        {/* API error banner */}
        {apiError && (
          <div className="error-banner" role="alert">
            <AlertCircle size={14} className="error-banner__icon" />
            <p className="error-banner__text">{apiError}</p>
          </div>
        )}

        {/* Username */}
        <FormField label="Username" required error={usernameError}>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearErrors() }}
            placeholder="Enter your username"
            disabled={isLoading}
            autoComplete="username"
            className={`form-input${usernameError ? ' form-input--error' : ''}`}
          />
        </FormField>

        {/* Password */}
        <FormField label="Password" required error={passwordError}>
          <PasswordInput
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearErrors() }}
            placeholder="Enter your password"
            disabled={isLoading}
            error={!!passwordError}
            autoComplete="current-password"
          />
        </FormField>

        {/* Remember me */}
        <div className="doctor-login__remember">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="doctor-login__checkbox"
          />
          <label htmlFor="rememberMe" className="doctor-login__remember-label">
            Keep me signed in
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-full"
        >
          {isLoading
            ? <><span className="spinner" aria-hidden="true" /> Signing in...</>
            : 'Sign in'
          }
        </button>
      </form>

      {/* Forgot password */}
      <div className="doctor-login__footer">
        <button type="button" className="auth-link">
          Forgot password?
        </button>
      </div>
    </AuthCard>
  )
}
