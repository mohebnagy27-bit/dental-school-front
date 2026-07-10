import { Check } from 'lucide-react'
import '../../styles/RequirementItem.css'

/**
 * RequirementItem — One row in the password requirements checklist.
 * Props:
 *   met   — Boolean; true when the requirement is satisfied
 *   label — Requirement description text
 */
export function RequirementItem({ met, label }) {
  return (
    <div className="requirement-item">
      <div className={`requirement-item__icon requirement-item__icon--${met ? 'met' : 'unmet'}`}>
        {met
          ? <Check size={10} strokeWidth={3} />
          : <span className="requirement-item__dot" />
        }
      </div>
      <span className={`requirement-item__label requirement-item__label--${met ? 'met' : 'unmet'}`}>
        {label}
      </span>
    </div>
  )
}
