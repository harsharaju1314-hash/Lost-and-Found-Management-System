import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = false, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-3)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isDanger ? 'var(--color-danger-bg)' : 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDanger ? 'var(--color-danger)' : 'var(--primary-600)' }}>
            <AlertTriangle size={20} />
          </div>
          <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>{title}</h3>
        </div>

        <p style={{ fontSize: '0.925rem', color: 'var(--neutral-600)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </button>
          <button type="button" className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
