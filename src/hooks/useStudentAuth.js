/**
 * useStudentAuth
 *
 * Manages the student ID across the multi-step auth flow
 * (StudentLoginPage → StudentCreatePasswordPage / StudentPasswordPage).
 *
 * Persists the student ID in sessionStorage so a page refresh does not
 * lose the state. Automatically redirects to /student/login if the ID
 * is missing (e.g. user navigates directly to a protected step).
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SESSION_KEY = 'df_student_id'

export function useStudentAuth() {
  const navigate = useNavigate()

  // Initialise synchronously from sessionStorage to avoid a blank render
  const [studentId, setStudentIdState] = useState(
    () => sessionStorage.getItem(SESSION_KEY) || ''
  )

  // Guard: redirect to /student/login if no ID is present
  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      navigate('/student/login', { replace: true })
    }
  }, [navigate])

  /** Persist a verified student ID and update local state */
  const saveStudentId = (id) => {
    sessionStorage.setItem(SESSION_KEY, id)
    setStudentIdState(id)
  }

  /** Clear ID on logout or "not you?" action */
  const clearStudentId = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setStudentIdState('')
  }

  return { studentId, saveStudentId, clearStudentId }
}
