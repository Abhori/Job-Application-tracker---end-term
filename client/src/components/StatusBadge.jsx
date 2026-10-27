import React from 'react';

const STATUS_LABELS = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  ASSESSMENT: 'Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const StatusBadge = ({ status }) => {
  const normalized = status ? status.toUpperCase() : 'SAVED';
  const label = STATUS_LABELS[normalized] || normalized;

  return (
    <span className={`badge badge-${normalized}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
        }}
      />
      {label}
    </span>
  );
};
