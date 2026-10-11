import React from 'react';
import { MapPin, Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { StatusBadge, CategoryBadge } from './StatusBadge';

export function ItemCard({ item, onViewDetails }) {
  if (!item) return null;

  return (
    <div className="card card-clickable" onClick={() => onViewDetails && onViewDetails(item.id)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Meta Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <StatusBadge type={item.type} />
        <StatusBadge status={item.status} />
      </div>

      {/* Image Preview or Category Fallback */}
      {item.image_url ? (
        <div style={{ height: '160px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-3)', background: 'var(--neutral-100)' }}>
          <img
            src={item.image_url}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ) : (
        <div style={{ height: '80px', width: '100%', borderRadius: 'var(--radius-md)', background: item.type === 'lost' ? 'var(--color-lost-bg)' : 'var(--color-found-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === 'lost' ? 'var(--color-lost)' : 'var(--color-found)', marginBottom: 'var(--space-3)' }}>
          <ImageIcon size={28} opacity={0.6} />
        </div>
      )}

      {/* Item Title & Category */}
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--neutral-900)', marginBottom: '6px', lineHeight: 1.3 }}>
          {item.title}
        </h3>
        <CategoryBadge category={item.category} />
      </div>

      {/* Description Preview */}
      <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginBottom: 'var(--space-4)', flex: 1, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.description}
      </p>

      {/* Location and Date */}
      <div style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: 'var(--neutral-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color="var(--primary-600)" />
          <span style={{ fontWeight: 500, color: 'var(--neutral-700)' }}>{item.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} />
          <span>{item.type === 'lost' ? 'Lost on' : 'Found on'}: {item.date_occurred}</span>
        </div>
      </div>

      {/* Card Action */}
      <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-600)' }}>
          View Details <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}
