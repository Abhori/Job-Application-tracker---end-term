import React from 'react';
import { FolderSearch } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'You have not added any items here yet.',
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px dashed var(--border-color)',
        borderRadius: 'var(--radius-md)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card-subtle)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        <Icon size={28} />
      </div>
      <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '1.5rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
