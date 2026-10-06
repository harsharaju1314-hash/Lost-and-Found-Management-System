import React from 'react';
import { Compass, Shield, Search, FileText } from 'lucide-react';

export function Footer({ onNavigate }) {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--neutral-200)', padding: 'var(--space-10) var(--space-4) var(--space-6)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        {/* Brand & Purpose */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--neutral-900)', marginBottom: 'var(--space-3)' }}>
            <div className="brand-icon" style={{ padding: '4px', borderRadius: 'var(--radius-sm)' }}>
              <Compass size={16} />
            </div>
            <span>Lost & Found Hub</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', lineHeight: 1.5 }}>
            A centralized platform for communities, campuses, and organizations to report missing belongings, discover found items, and safely verify claims.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Actions
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
            <li>
              <a href="#search" onClick={(e) => { e.preventDefault(); onNavigate('search'); }}>
                Search All Items
              </a>
            </li>
            <li>
              <a href="#report-lost" onClick={(e) => { e.preventDefault(); onNavigate('report-lost'); }}>
                Report a Lost Item
              </a>
            </li>
            <li>
              <a href="#report-found" onClick={(e) => { e.preventDefault(); onNavigate('report-found'); }}>
                Report a Found Item
              </a>
            </li>
            <li>
              <a href="#track-claim" onClick={(e) => { e.preventDefault(); onNavigate('track-claim'); }}>
                Track Claim Status
              </a>
            </li>
          </ul>
        </div>

        {/* Verification & Privacy */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Security & Privacy
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', lineHeight: 1.5 }}>
            Sensitive ownership proofs and personal identifying details are kept strictly confidential and accessible only to authorized item reviewers.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
        <span>&copy; {new Date().getFullYear()} Lost & Found Management System</span>
        <span>Deterministic Rule-Based Matching Engine</span>
      </div>
    </footer>
  );
}
