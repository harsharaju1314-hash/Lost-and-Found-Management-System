import React, { useState } from 'react';
import { Search, FileSearch, Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert, ArrowRight, CornerDownRight } from 'lucide-react';
import { claimService } from '../services/claimService';
import { StatusBadge, CategoryBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function TrackClaimPage({ onSelectItem }) {
  const [claimCode, setClaimCode] = useState('');
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!claimCode.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await claimService.trackClaimByCode(claimCode.trim());
      setClaim(res.claim);
    } catch (err) {
      setError(err.message || 'No claim found with this tracking code. Please verify the code.');
      setClaim(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
          <FileSearch size={28} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '4px' }}>
          Track Your Claim Status
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--neutral-500)', maxWidth: '480px', margin: '0 auto' }}>
          Enter the unique 8-character claim code (e.g. <code>CLM-9021A4</code>) provided when you submitted your claim.
        </p>
      </div>

      {/* Code Input Form */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CLM-9021A4"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1.05rem', letterSpacing: '0.04em' }}
              aria-label="Claim Tracking Code"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !claimCode.trim()}>
            <Search size={16} />
            {loading ? 'Searching...' : 'Track Claim'}
          </button>
        </form>

        {/* Quick sample code hint */}
        <div style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
          Tip: You can test with sample code <code>CLM-9021A4</code> or <code>CLM-4482B7</code> from the seed dataset.
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner message="Looking up claim record..." />}

      {/* Error State */}
      {error && searched && !loading && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-6)' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Claim Not Found</strong>
            <p style={{ marginTop: '2px', fontSize: '0.85rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Found Claim Details */}
      {claim && !loading && (
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          {/* Claim Summary Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--neutral-200)', marginBottom: 'var(--space-5)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', textTransform: 'uppercase', fontWeight: 600 }}>Claim Tracking Code</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>
                {claim.claim_code}
              </h2>
            </div>

            <div>
              <StatusBadge status={claim.status} />
            </div>
          </div>

          {/* Item Reference */}
          <div style={{ background: 'var(--neutral-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase', fontWeight: 600 }}>Claimed Item</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>{claim.item_title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <CategoryBadge category={claim.item_category} />
                <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Location: {claim.item_location}</span>
              </div>
            </div>

            {onSelectItem && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onSelectItem(claim.item_id)}
              >
                View Item <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Reviewer Resolution Note */}
          {claim.admin_notes && (
            <div className={`alert ${claim.status === 'approved' ? 'alert-success' : claim.status === 'rejected' ? 'alert-danger' : 'alert-info'}`} style={{ marginBottom: 'var(--space-6)' }}>
              {claim.status === 'approved' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <div>
                <strong>Reviewer Resolution Note:</strong>
                <p style={{ marginTop: '2px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {claim.admin_notes}
                </p>
              </div>
            </div>
          )}

          {/* Audit History / Timeline */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 'var(--space-4)' }}>
              Status Timeline & Audit Trail
            </h3>

            {claim.history && claim.history.length > 0 ? (
              <div className="timeline">
                {claim.history.map((step) => (
                  <div key={step.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <StatusBadge status={step.new_status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                          {new Date(step.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--neutral-700)', marginTop: '4px' }}>
                        {step.note || `Status changed to ${step.new_status}`}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginTop: '4px', display: 'block' }}>
                        Updated by: {step.updated_by}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>No timeline updates available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
