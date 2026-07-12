import React from 'react';

/**
 * SharedActionCard
 * Numbered wrapper for each management action inside a section.
 * Replaces the inline `SubCard` from the original monolith.
 *
 * Props:
 *   number   - display number (string or int)
 *   title    - action heading
 *   children - action body (description, inputs, buttons)
 */
export default function SharedActionCard({ number, title, children }) {
  return (
    <div className="stg-sub-card">
      <div className="stg-sub-card__header">
        <span className="stg-sub-card__num" aria-hidden="true">{number}</span>
        <h3 className="stg-sub-card__title">{title}</h3>
      </div>
      <div className="stg-sub-card__body">
        {children}
      </div>
    </div>
  );
}