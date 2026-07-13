import { useEffect, useState } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'

function AuthenticationRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    const redirectToLandingPage = () => navigate('/', { replace: true })
    window.addEventListener('auth:logout', redirectToLandingPage)
    return () => window.removeEventListener('auth:logout', redirectToLandingPage)
  }, [navigate])

  return null
}

function RequestErrorNotice() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    let timer
    const showRequestError = (event) => {
      clearTimeout(timer)
      setMessage(event.detail.message)
      timer = setTimeout(() => setMessage(''), 5000)
    }

    window.addEventListener('app:request-error', showRequestError)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('app:request-error', showRequestError)
    }
  }, [])

  if (!message) return null

  return (
    <div className="global-request-error" role="alert" aria-live="polite">
      <span>{message}</span>
      <button type="button" onClick={() => setMessage('')} aria-label="Dismiss error">×</button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthenticationRedirect />
      <AppRoutes />
      <RequestErrorNotice />
    </BrowserRouter>
  )
}
