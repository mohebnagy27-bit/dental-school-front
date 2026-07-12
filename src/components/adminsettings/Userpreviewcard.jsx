import React from 'react';
import StatusBadge from './StatusBadge';

export default function UserPreviewCard({ data, type }) {
  if (!data) return null;
  const initials = data.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="stg-preview-card">
      <div className="stg-preview-card__avatar" aria-hidden="true">{initials}</div>
      <dl className="stg-preview-card__dl">
        <div className="stg-preview-card__row">
          <dt>Name</dt>
          <dd>{data.name}</dd>
        </div>
        <div className="stg-preview-card__row">
          <dt>{type === 'doctor' ? 'Doctor ID' : 'Student ID'}</dt>
          <dd><span className="stg-id-chip">{data.id}</span></dd>
        </div>
        {type === 'doctor' && (
          <div className="stg-preview-card__row">
            <dt>Email</dt>
            <dd>{data.email}</dd>
          </div>
        )}
        {type === 'student' && (
          <div className="stg-preview-card__row">
            <dt>Academic Year</dt>
            <dd>{data.year}</dd>
          </div>
        )}
        <div className="stg-preview-card__row">
          <dt>Status</dt>
          <dd><StatusBadge status={data.status} /></dd>
        </div>
      </dl>
    </div>
  );
}