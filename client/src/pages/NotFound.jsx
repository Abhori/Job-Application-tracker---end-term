import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2rem',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'inline-grid',
            placeItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          The page or opportunity you are looking for doesn't exist, has been removed, or is inaccessible.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <Home size={18} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
