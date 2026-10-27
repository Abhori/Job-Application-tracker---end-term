import React from 'react';
import { HelpCircle } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tooltip,
  color = 'var(--primary)',
  bgColor = 'var(--primary-light)',
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {title}
          </span>
          {tooltip && (
            <span
              title={tooltip}
              style={{ cursor: 'help', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <HelpCircle size={14} />
            </span>
          )}
        </div>
        {Icon && (
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: bgColor,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
