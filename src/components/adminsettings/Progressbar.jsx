import React from 'react';

export default function ProgressBar({ value }) {
  return (
    <div
      className="stg-progress"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div className="stg-progress__fill" style={{ '--p': `${value}%` }} />
      <span className="stg-progress__label">{Math.round(value)}%</span>
    </div>
  );
}