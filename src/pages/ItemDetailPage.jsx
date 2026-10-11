import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, User, Mail, Phone, ShieldCheck, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { itemService } from '../services/itemService';
import { StatusBadge, CategoryBadge } from '../components/StatusBadge';
import { MatchCard } from '../components/MatchCard';
import { ClaimModal } from '../components/ClaimModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export function ItemDetailPage({ itemId, onBack, onSelectItem }) {
  const [item, setItem] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      setError(null);
      try {
        const res = await itemService.getItemById(itemId);
        setItem(res.item);
        setPotentialMatches(res.potentialMatches || []);
      } catch (err) {
        setError(err.message || 'Item not found');
      } finally {
        setLoading(false);
      }
    }
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  if (loading) {
    return <LoadingSpinner message="Loading item details..." />;
  }

  if (error || !item) {
    return (
      <EmptyState
        title="Item Not Found"
        message="The item you are looking for does not exist or may have been removed."
        actionLabel="Back to Search"
        onAction={onBack}
      />
    );
  }

  const isClaimable = item.status === 'open';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ marginBottom: 'var(--space-4)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} /> Back to Search
      </button>

      {/* Main Item Detail Card */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <StatusBadge type={item.type} />
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
              {item.title}
            </h1>
          </div>

          {/* Claim Action Button */}
          <div>
            {isClaimable ? (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => setIsClaimModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShieldCheck size={20} />
                Claim This Item
              </button>
            ) : (
              <div className="alert alert-info" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.85rem' }}>
                Item is currently marked as <strong>{item.status}</strong>.
              </div>
            )}
          </div>
        </div>

        {/* Image Display */}
        {item.image_url && (
          <div style={{ maxHeight: '360px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-6)', background: 'var(--neutral-100)', display: 'flex', justifyContent: 'center' }}>
            <img
              src={item.image_url}
              alt={item.title}
              style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Item Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', background: 'var(--neutral-50)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: '#ffffff', color: 'var(--primary-600)', border: '1px solid var(--neutral-200)' }}>
              <MapPin size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neutral-500)', fontWeight: 600 }}>Location</span>
              <p style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.95rem' }}>{item.location}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: '#ffffff', color: 'var(--primary-600)', border: '1px solid var(--neutral-200)' }}>
              <Calendar size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neutral-500)', fontWeight: 600 }}>Date {item.type === 'lost' ? 'Lost' : 'Found'}</span>
              <p style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.95rem' }}>{item.date_occurred}</p>
            </div>
          </div>

          {item.contact_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: '#ffffff', color: 'var(--primary-600)', border: '1px solid var(--neutral-200)' }}>
                <User size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neutral-500)', fontWeight: 600 }}>Reported By</span>
                <p style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.95rem' }}>{item.contact_name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Public Description */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 'var(--space-2)' }}>
            Description
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--neutral-700)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {item.description}
          </p>
        </div>

        {/* Privacy notice */}
        <div className="alert alert-info" style={{ fontSize: '0.85rem' }}>
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Verification Notice:</strong> Detailed personal identification and sensitive ownership proofs are not displayed publicly. To claim this item, click "Claim This Item" and submit verifying details to the reviewer.
          </span>
        </div>
      </div>

      {/* Suggested Matches Section */}
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <Sparkles size={18} color="var(--primary-600)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                Rule-Based Potential Matches
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
              Deterministic scoring based on matching category, location tokens, date proximity, and keywords.
            </p>
          </div>

          <span className="badge badge-category">
            {potentialMatches.length} suggested match{potentialMatches.length === 1 ? '' : 'es'}
          </span>
        </div>

        {potentialMatches.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {potentialMatches.map((match) => (
              <MatchCard key={match.item.id} match={match} onSelectMatch={onSelectItem} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
            No strong matching {item.type === 'lost' ? 'found' : 'lost'} items detected at this time.
          </div>
        )}
      </div>

      {/* Claim Modal Dialog */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        item={item}
        onClose={() => setIsClaimModalOpen(false)}
        onClaimSuccess={() => {
          // Refresh item status
          itemService.getItemById(itemId).then((res) => setItem(res.item));
        }}
      />
    </div>
  );
}
