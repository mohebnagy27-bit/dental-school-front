import React from 'react';

export default function StatusBadge({ status }) {
  return (
    <span className={`stg-badge stg-badge--${(status || '').toLowerCase()}`}>
      {status}
    </span>
  );
}