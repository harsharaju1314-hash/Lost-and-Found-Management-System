import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle, Trash2, Edit, Search, Eye, Filter, RefreshCw, KeyRound, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { claimService } from '../services/claimService';
import { itemService } from '../services/itemService';
import { statsService } from '../services/statsService';
import { StatusBadge, CategoryBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';

export function AdminDashboardPage({ onSelectItem }) {
  const { user, isAdmin, login } = useAuth();
  const { showToast } = useNotification();

  // Admin login form state
  const [loginEmail, setLoginEmail] = useState('admin@lostfound.local');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' | 'items'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Claims Tab state
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimFilterStatus, setClaimFilterStatus] = useState('all');
  const [claimSearch, setClaimSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [updatingClaim, setUpdatingClaim] = useState(false);

  // Items Tab state
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [itemDeleteTarget, setItemDeleteTarget] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await login({ identifier: loginEmail, password: loginPassword });
      if (res.user.role !== 'admin') {
        showToast('Logged in user is not an administrator.', 'warning');
      } else {
        showToast('Welcome to Admin Portal', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Invalid administrator credentials', 'danger');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const res = await statsService.getOverviewStats();
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, []);

  const loadClaims = useCallback(async () => {
    setClaimsLoading(true);
    try {
      const res = await claimService.getClaims({
        status: claimFilterStatus,
        search: claimSearch
      });
      setClaims(res.claims || []);
    } catch (err) {
      console.error('Failed to load claims', err);
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  }, [claimFilterStatus, claimSearch]);

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res = await itemService.getItems({
        q: itemSearch,
        limit: 100
      });
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load items', err);
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, [itemSearch]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      if (activeTab === 'claims') loadClaims();
      if (activeTab === 'items') loadItems();
    }
  }, [isAdmin, activeTab, loadStats, loadClaims, loadItems]);

  const handleUpdateClaimStatus = async (newStatus) => {
    if (!selectedClaim) return;
    setUpdatingClaim(true);
    try {
      await claimService.updateClaimStatus(selectedClaim.id, {
        status: newStatus,
        admin_notes: resolutionNote.trim() || undefined
      });
      showToast(`Claim status updated to "${newStatus}"`, 'success');
      setSelectedClaim(null);
      setResolutionNote('');
      loadClaims();
      loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to update claim', 'danger');
    } finally {
      setUpdatingClaim(false);
    }
  };

  const handleUpdateItemStatus = async (itemId, newStatus) => {
    try {
      await itemService.updateItem(itemId, { status: newStatus });
      showToast(`Item status set to "${newStatus}"`, 'success');
      loadItems();
      loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to update item status', 'danger');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemDeleteTarget) return;
    setDeletingItem(true);
    try {
      await itemService.deleteItem(itemDeleteTarget.id);
      showToast('Item deleted successfully', 'success');
      setItemDeleteTarget(null);
      loadItems();
      loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'danger');
    } finally {
      setDeletingItem(false);
    }
  };

  // If not logged in as Admin, show login form
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '480px', margin: 'var(--space-8) auto' }}>
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--neutral-900)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
              <Lock size={28} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
              Administrator Portal
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginTop: '4px' }}>
              Sign in with admin credentials to review ownership claims and manage items.
            </p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Admin Email or Username</label>
              <input
                id="admin-email"
                type="text"
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-pass">Password</label>
              <input
                id="admin-pass"
                type="password"
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)' }} disabled={loginLoading}>
              <UserCheck size={18} />
              {loginLoading ? 'Signing In...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-3)', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--neutral-600)', border: '1px solid var(--neutral-200)' }}>
            <strong>Demo Admin Credentials:</strong><br />
            Email: <code>admin@lostfound.local</code><br />
            Password: <code>admin123</code>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Content
  return (
    <div>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-category" style={{ background: 'var(--neutral-900)', color: '#ffffff', border: 'none' }}>
              Admin Panel
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Logged in as {user?.username} ({user?.email})</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neutral-900)', marginTop: '4px' }}>
            System Administration & Claims Review
          </h1>
        </div>
      </div>

      {/* Overview Stats Bar */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Pending Claims</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '2px' }}>{stats.totalPendingClaims || 0}</div>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Approved Claims</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '2px' }}>{stats.totalApprovedClaims || 0}</div>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Total Lost</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-lost)', marginTop: '2px' }}>{stats.totalLost || 0}</div>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Total Found</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-found)', marginTop: '2px' }}>{stats.totalFound || 0}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          <ShieldCheck size={18} />
          Claim Verification Queue
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          <Edit size={18} />
          Item Catalog Management
        </button>
      </div>

      {/* TAB 1: CLAIMS REVIEW QUEUE */}
      {activeTab === 'claims' && (
        <div>
          {/* Claims Filter Bar */}
          <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by claim code, claimant name, or item..."
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
              <Search size={15} color="var(--neutral-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div>
              <select
                className="form-select"
                value={claimFilterStatus}
                onChange={(e) => setClaimFilterStatus(e.target.value)}
              >
                <option value="all">All Claim Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <button type="button" className="btn btn-secondary btn-sm" onClick={loadClaims}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Claims Table */}
          {claimsLoading ? (
            <LoadingSpinner message="Loading submitted claims..." />
          ) : claims.length > 0 ? (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim Code</th>
                    <th>Item Title</th>
                    <th>Claimant Name</th>
                    <th>Contact Email</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-700)' }}>
                        {c.claim_code}
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.item_title}</td>
                      <td>{c.claimant_name}</td>
                      <td style={{ color: 'var(--neutral-600)', fontSize: '0.85rem' }}>{c.claimant_email}</td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--neutral-500)' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedClaim(c);
                            setResolutionNote(c.admin_notes || '');
                          }}
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No claims in queue"
              message="There are currently no submitted claims matching your filters."
            />
          )}
        </div>
      )}

      {/* TAB 2: ITEM CATALOG MANAGEMENT */}
      {activeTab === 'items' && (
        <div>
          {/* Items Filter Bar */}
          <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search catalog by title, location, or description..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
              <Search size={15} color="var(--neutral-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <button type="button" className="btn btn-secondary btn-sm" onClick={loadItems}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Items Table */}
          {itemsLoading ? (
            <LoadingSpinner message="Loading catalog items..." />
          ) : items.length > 0 ? (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title & Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <StatusBadge type={it.type} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{it.title}</div>
                        <CategoryBadge category={it.category} />
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{it.location}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>{it.date_occurred}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: '0.825rem', width: 'auto' }}
                          value={it.status}
                          onChange={(e) => handleUpdateItemStatus(it.id, e.target.value)}
                        >
                          <option value="open">open</option>
                          <option value="claimed">claimed</option>
                          <option value="returned">returned</option>
                          <option value="closed">closed</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectItem(it.id)}
                            title="View Public Page"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setItemDeleteTarget(it)}
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No items in catalog"
              message="No items found matching your search query."
            />
          )}
        </div>
      )}

      {/* CLAIM REVIEW MODAL */}
      {selectedClaim && (
        <div className="modal-overlay" onClick={() => setSelectedClaim(null)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>
                  Review Ownership Claim
                </span>
                <h3 className="modal-title" style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>
                  {selectedClaim.claim_code}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedClaim(null)}>
                &times;
              </button>
            </div>

            {/* Target Item Reference */}
            <div style={{ background: 'var(--neutral-50)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', border: '1px solid var(--neutral-200)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase', fontWeight: 600 }}>Associated Item</span>
              <p style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{selectedClaim.item_title} ({selectedClaim.item_category})</p>
            </div>

            {/* Claimant Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--neutral-500)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Claimant</span>
                <strong>{selectedClaim.claimant_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--neutral-500)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</span>
                <span>{selectedClaim.claimant_email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--neutral-500)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone</span>
                <span>{selectedClaim.claimant_phone || 'Not provided'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--neutral-500)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date Lost</span>
                <span>{selectedClaim.date_lost || 'Not specified'}</span>
              </div>
            </div>

            {/* Submitted Proof / Identifying Information */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label" style={{ color: 'var(--neutral-900)' }}>
                Claimant's Submitted Proof / Distinguishing Marks:
              </label>
              <div style={{ background: 'var(--neutral-100)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--neutral-800)', lineHeight: 1.5, border: '1px solid var(--neutral-200)', whiteSpace: 'pre-line' }}>
                {selectedClaim.description_proof}
              </div>
            </div>

            {/* Reviewer Resolution Notes */}
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label" htmlFor="resolution-note">
                Reviewer Resolution Note (Visible to Claimant):
              </label>
              <textarea
                id="resolution-note"
                rows="3"
                className="form-textarea"
                placeholder="e.g. Serial number and engraving verified with claimant in person. Approved for pickup."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
            </div>

            {/* Reviewer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedClaim(null)}
                disabled={updatingClaim}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={() => handleUpdateClaimStatus('under_review')}
                  disabled={updatingClaim}
                >
                  <Clock size={14} /> Under Review
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleUpdateClaimStatus('rejected')}
                  disabled={updatingClaim}
                >
                  <XCircle size={14} /> Reject Claim
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleUpdateClaimStatus('approved')}
                  disabled={updatingClaim}
                >
                  <CheckCircle2 size={16} /> Approve Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(itemDeleteTarget)}
        title="Delete Item from Catalog"
        message={`Are you sure you want to delete "${itemDeleteTarget?.title}"? This action is permanent and cannot be undone.`}
        confirmText="Delete Item"
        isDanger={true}
        isLoading={deletingItem}
        onConfirm={handleDeleteItem}
        onCancel={() => setItemDeleteTarget(null)}
      />
    </div>
  );
}
