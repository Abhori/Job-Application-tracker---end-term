import React from 'react';
import { Modal } from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div className="modal-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {isDanger && (
          <div
            style={{
              padding: '0.625rem',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              color: '#dc2626',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
        )}
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </button>
        <button
          className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
