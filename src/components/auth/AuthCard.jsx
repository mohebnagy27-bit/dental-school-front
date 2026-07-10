import '../../styles/AuthCard.css'
import { LogoBrand } from './LogoBrand'

/**
 * AuthCard — Centered white card shell for all authentication screens.
 * Props:
 *   title    — Page heading
 *   subtitle — Short line below the heading
 *   badge    — Optional pill label (e.g. "First time setup")
 *   children — Form content
 */
export function AuthCard({ title, subtitle, badge, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-card__logo">
          <LogoBrand size="sm" />
        </div>

        {/* Optional status badge */}
        {badge && (
          <span className="auth-card__badge">{badge}</span>
        )}

        {/* Heading */}
        <h1 className="auth-card__title">{title}</h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="auth-card__subtitle">{subtitle}</p>
        )}

        {/* Slotted form content */}
        {children}

      </div>
    </div>
  )
}
