import React from 'react';
import { Tag, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

export function StatusBadge({ status, type }) {
  if (type) {
    const isLost = type.toLowerCase() === 'lost';
    return (
      <span className={`badge badge-${type.toLowerCase()}`}>
        <Tag size={12} />
        {isLost ? 'Lost Item' : 'Found Item'}
      </span>
    );
  }

  if (!status) return null;

  const normalized = status.toLowerCase();
  let icon = <Clock size={12} />;

  if (normalized === 'approved' || normalized === 'claimed' || normalized === 'returned') {
    icon = <CheckCircle2 size={12} />;
  } else if (normalized === 'rejected') {
    icon = <XCircle size={12} />;
  } else if (normalized === 'under_review') {
    icon = <AlertCircle size={12} />;
  }

  const label = normalized.replace('_', ' ');

  return (
    <span className={`badge badge-${normalized}`}>
      {icon}
      {label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <span className="badge badge-category">
      {category}
    </span>
  );
}
