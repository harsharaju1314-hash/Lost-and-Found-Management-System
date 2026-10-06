import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Info, FileText } from 'lucide-react';
import { claimService } from '../services/claimService';
import { useNotification } from '../context/NotificationContext';

export function ClaimModal({ isOpen, item, onClose, onClaimSuccess }) {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    claimant_name: '',
    claimant_email: '',
    claimant_phone: '',
    date_lost: '',
    description_proof: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.claimant_name.trim()) {
      newErrors.claimant_name = 'Full name is required.';
    }
    if (!formData.claimant_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.claimant_email)) {
      newErrors.claimant_email = 'A valid email address is required for claim updates.';
    }
    if (!formData.description_proof.trim() || formData.description_proof.trim().length < 15) {
      newErrors.description_proof = 'Please provide detailed proof or identifying features (minimum 15 characters).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await claimService.submitClaim(item.id, formData);
      setSubmittedClaim(res.claim || { claim_code: res.claimCode });
      showToast('Claim submitted successfully!', 'success');
      if (onClaimSuccess) onClaimSuccess(res.claim);
    } catch (err) {
      showToast(err.message || 'Failed to submit claim', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (submittedClaim?.claim_code) {
      navigator.clipboard.writeText(submittedClaim.claim_code);
      setCopied(true);
      showToast('Claim code copied to clipboard!', 'info');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetAndClose = () => {
    setFormData({
      claimant_name: '',
      claimant_email: '',
      claimant_phone: '',
      date_lost: '',
      description_proof: ''
    });
    setSubmittedClaim(null);
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--primary-600)" />
            <h3 className="modal-title">
              {submittedClaim ? 'Claim Submitted Successfully' : `Claim Item: ${item.title}`}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={resetAndClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {submittedClaim ? (
          /* Success Receipt State */
          <div>
            <div className="alert alert-success" style={{ marginBottom: 'var(--space-5)' }}>
              <ShieldCheck size={20} />
              <div>
                <strong>Your claim has been recorded!</strong>
                <p style={{ marginTop: '2px', fontSize: '0.85rem' }}>
                  Our reviewer team will evaluate your submitted proof. You can monitor your review status anytime using your unique tracking code below.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--neutral-50)', border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Claim Tracking Code
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-700)', letterSpacing: '0.05em' }}>
                  {submittedClaim.claim_code}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyCode}
                  title="Copy Tracking Code"
                >
                  {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-primary" onClick={resetAndClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Claim Form */
          <form onSubmit={handleSubmit}>
            <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)', fontSize: '0.85rem' }}>
              <Info size={18} style={{ flexShrink: 0 }} />
              <div>
                Please provide specific identifying information (e.g., serial number, engravings, lockscreen wallpaper, exact pouch contents) to establish ownership.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="claimant_name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="claimant_name"
                type="text"
                className={`form-input ${errors.claimant_name ? 'error' : ''}`}
                placeholder="e.g. Jane Doe"
                value={formData.claimant_name}
                onChange={(e) => setFormData({ ...formData, claimant_name: e.target.value })}
              />
              {errors.claimant_name && <span className="form-error-msg">{errors.claimant_name}</span>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="claimant_email">
                  Contact Email <span className="required">*</span>
                </label>
                <input
                  id="claimant_email"
                  type="email"
                  className={`form-input ${errors.claimant_email ? 'error' : ''}`}
                  placeholder="name@example.com"
                  value={formData.claimant_email}
                  onChange={(e) => setFormData({ ...formData, claimant_email: e.target.value })}
                />
                {errors.claimant_email && <span className="form-error-msg">{errors.claimant_email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="claimant_phone">
                  Phone Number (Optional)
                </label>
                <input
                  id="claimant_phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 555-0199"
                  value={formData.claimant_phone}
                  onChange={(e) => setFormData({ ...formData, claimant_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date_lost">
                Date Lost / Misplaced
              </label>
              <input
                id="date_lost"
                type="date"
                className="form-input"
                value={formData.date_lost}
                onChange={(e) => setFormData({ ...formData, date_lost: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description_proof">
                Proof of Ownership / Distinguishing Marks <span className="required">*</span>
              </label>
              <textarea
                id="description_proof"
                rows="4"
                className={`form-textarea ${errors.description_proof ? 'error' : ''}`}
                placeholder="Describe specific features only you would know (e.g. 'Inside pocket has my driver license with name Jane Doe', 'Back has a scratch near the logo', 'Lockscreen picture is a golden retriever')."
                value={formData.description_proof}
                onChange={(e) => setFormData({ ...formData, description_proof: e.target.value })}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                {errors.description_proof ? (
                  <span className="form-error-msg">{errors.description_proof}</span>
                ) : (
                  <span className="form-help">Minimum 15 characters required</span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                  {formData.description_proof.length} chars
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button type="button" className="btn btn-secondary" onClick={resetAndClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting Claim...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
