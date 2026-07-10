import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import '../../styles/PasswordInput.css'

/**
 * PasswordInput — Controlled password field with show/hide toggle.
 *
 * Props:
 *   value        — Controlled value
 *   onChange     — Standard React onChange (receives the native event)
 *   placeholder  — Input placeholder
 *   disabled     — Disables input and hides toggle
 *   error        — Applies red border / ring when true
 *   autoComplete — Passed through to the native input
 *   id           — For associating an external <label>
 *   name         — Native name attribute
 */
export function PasswordInput({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  autoComplete,
  id,
  name,
}) {
  const [visible, setVisible] = useState(false)

  const inputClass = [
    'form-input',
    'form-input--pr',
    error && 'form-input--error',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="password-input">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputClass}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="password-input__toggle"
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}
