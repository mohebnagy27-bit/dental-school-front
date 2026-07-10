import '../../styles/PasswordStrengthMeter.css'

/* Derive strength level from the raw password string */
function getStrength(password) {
  if (!password) return 'none'
  let score = 0
  if (password.length >= 8)           score++
  if (/[A-Z]/.test(password))         score++
  if (/[0-9]/.test(password))         score++
  if (/[^A-Za-z0-9]/.test(password))  score++
  if (score <= 1) return 'weak'
  if (score === 2) return 'fair'
  if (score === 3) return 'good'
  return 'strong'
}

const STRENGTH_META = {
  none:   { segments: 0, label: '' },
  weak:   { segments: 1, label: 'Too weak' },
  fair:   { segments: 2, label: 'Could be stronger' },
  good:   { segments: 3, label: 'Good' },
  strong: { segments: 4, label: 'Excellent' },
}

/**
 * PasswordStrengthMeter
 * Props:
 *   password — The current raw password string
 */
export function PasswordStrengthMeter({ password }) {
  const level  = getStrength(password)
  const meta   = STRENGTH_META[level]

  if (level === 'none') return null

  return (
    <div className="strength-meter">
      {/* 4 segments */}
      <div className="strength-meter__bars">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={[
              'strength-meter__bar',
              n <= meta.segments ? `strength-meter__bar--${level}` : '',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Label */}
      {meta.label && (
        <p className={`strength-meter__label strength-meter__label--${level}`}>
          {meta.label}
        </p>
      )}
    </div>
  )
}
