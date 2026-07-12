import React from 'react';

const ChevronIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.5 6.75L9 11.25L13.5 6.75"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * ManagementSection
 * A collapsible section shell. `isOpen` and `onToggle` are injected
 * by the parent ManagementAccordion via React.cloneElement.
 *
 * Props:
 *   sectionId  - unique string used by ManagementAccordion
 *   icon       - SVG element shown in the header
 *   title      - section heading text
 *   isOpen     - injected by ManagementAccordion
 *   onToggle   - injected by ManagementAccordion
 *   children   - section body content
 */
export default function ManagementSection({
  sectionId,
  icon,
  title,
  isOpen = false,
  onToggle,
  children,
}) {
  const bodyId = `section-body-${sectionId}`;

  return (
    <section className="stg-section">
      {/* Clickable header — acts as accordion trigger */}
      <button
        type="button"
        className="stg-section__header stg-section__header--toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
      >
        <span className="stg-section__icon" aria-hidden="true">{icon}</span>
        <h2 className="stg-section__title">{title}</h2>
        <span className={`stg-section__chevron${isOpen ? ' stg-section__chevron--open' : ''}`}>
          <ChevronIcon />
        </span>
      </button>

      {/* Collapsible body */}
      <div
        id={bodyId}
        className={`stg-section__body${isOpen ? ' stg-section__body--open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="stg-section__body-inner">
          {children}
        </div>
      </div>
    </section>
  );
}