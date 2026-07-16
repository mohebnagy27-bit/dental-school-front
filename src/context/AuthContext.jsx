import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'token'
const ROLE_KEY = 'role'
const USER_ID_KEY = 'userId'
const USER_NAME_KEY = 'userName'
const STUDENT_PROFILE_KEY = 'studentProfile'
const STUDENT_SESSION_KEY = 'df_student_id'

function clearAuthenticationStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(USER_NAME_KEY)
  localStorage.removeItem(STUDENT_PROFILE_KEY)
  sessionStorage.removeItem(STUDENT_SESSION_KEY)
}

function getStoredStudentProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(STUDENT_PROFILE_KEY) || 'null')
    return profile && typeof profile === 'object' ? profile : null
  } catch {
    localStorage.removeItem(STUDENT_PROFILE_KEY)
    return null
  }
}

function isValidToken(token) {
  if (!token || typeof token !== 'string') return false

  try {
    const payload = token.split('.')[1]
    if (!payload) return false

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = JSON.parse(
      atob(normalizedPayload.padEnd(normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4), '='))
    )

    return typeof decodedPayload.exp === 'number'
      && decodedPayload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  const role = localStorage.getItem(ROLE_KEY)
  const id = localStorage.getItem(USER_ID_KEY)
  const name = localStorage.getItem(USER_NAME_KEY)
  const studentProfile = role === 'STUDENT' ? getStoredStudentProfile() : null

  if (!isValidToken(token) || !role || !id) {
    clearAuthenticationStorage()
    return { token: null, role: null, user: null }
  }

  return { token, role, user: { ...studentProfile, id, name, role } }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)

  const login = useCallback(({ token, user, role = user?.role }) => {
    const authenticatedUser = { ...user, role }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROLE_KEY, role)
    localStorage.setItem(USER_ID_KEY, user.id)
    localStorage.setItem(USER_NAME_KEY, user.name)
    if (role === 'STUDENT') {
      localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(authenticatedUser))
    } else {
      localStorage.removeItem(STUDENT_PROFILE_KEY)
    }

    setSession({ token, role, user: authenticatedUser })
  }, [])

  const updateUser = useCallback((updates) => {
    setSession((currentSession) => {
      if (!currentSession.user) return currentSession

      const user = { ...currentSession.user, ...updates }
      if (currentSession.role === 'STUDENT') {
        localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(user))
      }

      return { ...currentSession, user }
    })
  }, [])

  const logout = useCallback(() => {
    clearAuthenticationStorage()
    setSession({ token: null, role: null, user: null })
  }, [])

  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  const value = useMemo(() => ({
    user: session.user,
    token: session.token,
    role: session.role,
    login,
    updateUser,
    logout,
    isAuthenticated: Boolean(session.token && session.user),
  }), [session, login, updateUser, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
