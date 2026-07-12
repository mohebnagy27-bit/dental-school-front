export default function FormField({ label, error, required, children, hint }) {
  return (
    <div className={`reg-field${error ? ' reg-field--error' : ''}`}>
      <label className="reg-field__label">
        {label}
        {required && <span className="reg-field__required" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <span className="reg-field__hint">{hint}</span>}
      {error && <span className="reg-field__error" role="alert">{error}</span>}
    </div>
  );
}
