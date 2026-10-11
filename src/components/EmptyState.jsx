import React from 'react';
import { SearchX, Inbox, FolderOpen } from 'lucide-react';

export function EmptyState({ title = 'No items found', message = 'There are no records matching your criteria.', actionLabel, onAction, icon: Icon = Inbox }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)', marginBottom: 'var(--space-4)' }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.925rem', color: 'var(--neutral-500)', maxWidth: '440px', marginBottom: actionLabel ? 'var(--space-6)' : 0 }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ message = 'Loading details...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12) 0', gap: 'var(--space-4)' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--neutral-200)',
        borderTopColor: 'var(--primary-600)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
