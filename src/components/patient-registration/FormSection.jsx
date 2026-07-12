export default function FormSection({ title, badge, locked, children, sectionRef, className = '' }) {
  return (
    <section
      ref={sectionRef}
      className={`reg-section${locked ? ' reg-section--locked' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="reg-section__header">
        <h2 className="reg-section__title">{title}</h2>
        {badge && <span className="reg-section__badge">{badge}</span>}
        {locked && <span className="reg-section__lock" aria-label="Locked">🔒</span>}
      </div>
      <div className="reg-section__body">{children}</div>
    </section>
  );
}
