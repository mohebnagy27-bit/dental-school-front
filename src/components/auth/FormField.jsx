import { AlertCircle } from 'lucide-react'
import '../../styles/FormField.css'

/**
 * FormField — Label + input slot + inline validation message.
 * Props:
 *   label    — Field label text (rendered uppercase)
 *   required — Appends red asterisk when true
 *   hint     — Optional helper text
 *   error    — Validation error string
 *   children — The input / select element
 */
export function FormField({ label, required, hint, error, children }) {
  return (
    <div className="form-field">

      <label className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>

      {hint && <p className="form-field__hint">{hint}</p>}

      {children}

      {error && (
        <p className="form-field__error">
          <AlertCircle size={11} className="form-field__error-icon" />
          {error}
        </p>
      )}

    </div>
  )
}
