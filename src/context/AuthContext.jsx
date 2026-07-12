import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'token'
const ROLE_KEY = 'role'
const USER_ID_KEY = 'userId'
const USER_NAME_KEY = 'userName'

function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  const role = localStorage.getItem(ROLE_KEY)
  const id = localStorage.getItem(USER_ID_KEY)
  const name = localStorage.getItem(USER_NAME_KEY)

  return {
    token,
    role,
    user: token && id ? { id, name, role } : null,
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)

  const login = ({ token, user, role = user?.role }) => {
    const authenticatedUser = { ...user, role }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROLE_KEY, role)
    localStorage.setItem(USER_ID_KEY, user.id)
    localStorage.setItem(USER_NAME_KEY, user.name)

    setSession({ token, role, user: authenticatedUser })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(USER_NAME_KEY)
    setSession({ token: null, role: null, user: null })
  }

  const value = useMemo(() => ({
    user: session.user,
    token: session.token,
    role: session.role,
    login,
    logout,
    isAuthenticated: Boolean(session.token),
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
