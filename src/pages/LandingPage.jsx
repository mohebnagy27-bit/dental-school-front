import { useNavigate } from 'react-router-dom'
import { ArrowRight, Stethoscope, GraduationCap } from 'lucide-react'
import { LogoBrand } from '../components/auth/LogoBrand'
import '../styles/LandingPage.css'

/**
 * LandingPage
 *
 * Public entry point. Split-panel full-viewport layout:
 *   Left  — white:  logo, headline, description, portal buttons, footer
 *   Right — navy:   decorative rings, clinic welcome text
 *
 * Routing:
 *   Doctor portal  → /doctor/login
 *   Student portal → /student/login
 */
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing">

      {/* ── LEFT PANEL ────────────────────────────────────────────── */}
      <div className="landing__left">

        {/* Logo */}
        <div className="landing__logo-area">
          <LogoBrand size="md" />
        </div>

        {/* Hero */}
        <div className="landing__content">
          <div className="landing__inner">

            <h1 className="landing__headline">
              Complete dental clinic<br />
              <span className="landing__headline-accent">patient management</span>
            </h1>

            <p className="landing__description">
              A modern platform for doctors and dental students.
              Manage patients, track cases, and coordinate treatments —
              all in one place.
            </p>

            {/* Portal buttons */}
            <div className="landing__buttons">

              {/* Doctor portal */}
              <button
                className="landing__btn landing__btn--primary"
                onClick={() => navigate('/doctor/login')}
              >
                <span className="landing__btn-left">
                  <Stethoscope size={15} />
                  Doctor portal
                </span>
                <ArrowRight size={14} />
              </button>

              {/* OR separator */}
              <div className="landing__divider">
                <span className="landing__divider-line" />
                <span className="landing__divider-text">or</span>
                <span className="landing__divider-line" />
              </div>

              {/* Student portal */}
              <button
                className="landing__btn landing__btn--secondary"
                onClick={() => navigate('/student/login')}
              >
                <span className="landing__btn-left">
                  <GraduationCap size={15} />
                  Student portal
                </span>
                <ArrowRight size={14} />
              </button>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="landing__footer">
          Cairo Dental Clinic · v1.0.0
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
      <div className="landing__right">
        <div className="landing__ring landing__ring--xl" />
        <div className="landing__ring landing__ring--lg" />
        <div className="landing__ring landing__ring--md" />
        <div className="landing__ring landing__ring--sm" />

        <div className="landing__welcome">
          <p className="landing__welcome-title">Welcome back</p>
          <p className="landing__welcome-sub">247 patients · 583 cases</p>
        </div>

        <div className="landing__glow" />
      </div>

    </div>
  )
}
