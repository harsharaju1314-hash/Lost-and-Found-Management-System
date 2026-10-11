import React from 'react';
import { Sparkles, Check, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { CategoryBadge, StatusBadge } from './StatusBadge';

export function MatchCard({ match, onSelectMatch }) {
  if (!match || !match.item) return null;

  const { item, matchScore, matchConfidence, matchReasons } = match;

  const getScoreClass = (score) => {
    if (score >= 70) return 'match-score-high';
    if (score >= 45) return 'match-score-medium';
    return 'match-score-low';
  };

  return (
    <div className="match-card">
      {/* Match Header with Score & Confidence */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--primary-600)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-800)' }}>
            Suggested Match
          </span>
        </div>
        <div className={`match-score-badge ${getScoreClass(matchScore)}`}>
          <span>{matchScore}% Match</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>({matchConfidence} Confidence)</span>
        </div>
      </div>

      {/* Item info */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <StatusBadge type={item.type} />
          <CategoryBadge category={item.category} />
        </div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--neutral-900)', marginTop: '4px' }}>
          {item.title}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginTop: '4px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>
      </div>

      {/* Location & Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--neutral-500)', background: 'var(--neutral-50)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={13} color="var(--primary-600)" />
          <span>{item.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={13} />
          <span>{item.type === 'lost' ? 'Lost' : 'Found'} Date: {item.date_occurred}</span>
        </div>
      </div>

      {/* Transparent Match Reasons */}
      {matchReasons && matchReasons.length > 0 && (
        <div style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: 'var(--space-2)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Why this matched (Rule-Based):
          </span>
          <ul className="match-reasons-list" style={{ marginTop: '4px' }}>
            {matchReasons.map((reason, idx) => (
              <li key={idx}>
                <Check size={13} color="var(--color-success)" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onSelectMatch && onSelectMatch(item.id)}
        >
          View Matched Item <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
