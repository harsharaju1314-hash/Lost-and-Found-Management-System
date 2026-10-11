import React from 'react';

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
