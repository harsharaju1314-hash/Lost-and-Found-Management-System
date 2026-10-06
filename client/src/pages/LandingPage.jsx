import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, PlusCircle, FileSearch, ArrowRight, CheckCircle2, RefreshCw, Compass } from 'lucide-react';
import { statsService } from '../services/statsService';
import { itemService } from '../services/itemService';
import { ItemCard } from '../components/ItemCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function LandingPage({ onNavigate, onSelectItem }) {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          statsService.getOverviewStats().catch(() => ({ stats: null })),
          itemService.getItems({ limit: 6 }).catch(() => ({ items: [] }))
        ]);

        if (statsRes?.stats) setStats(statsRes.stats);
        if (itemsRes?.items) setRecentItems(itemsRes.items);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Banner with 4 Core Action Cards */}
      <section className="hero-banner">
        <div style={{ maxWidth: '800px' }}>
          <h1 className="hero-title">
            Reuniting People with Their Lost Possessions
          </h1>
          <p className="hero-subtitle">
            A reliable, transparent system to report misplaced items, browse found valuables, and verify ownership through structured claim reviews.
          </p>
        </div>

        {/* 4 Core Quick Actions */}
        <div className="hero-grid">
          <div className="action-card" onClick={() => onNavigate('report-lost')} role="button" tabIndex={0}>
            <div className="action-icon lost">
              <ShieldAlert size={24} />
            </div>
            <h3>I Lost Something</h3>
            <p>Report a missing item with category, date, location, and description.</p>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-lost)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Report Lost Item <ArrowRight size={14} />
            </span>
          </div>

          <div className="action-card" onClick={() => onNavigate('report-found')} role="button" tabIndex={0}>
            <div className="action-icon found">
              <PlusCircle size={24} />
            </div>
            <h3>I Found Something</h3>
            <p>Found an item? Post it here to help the rightful owner locate it safely.</p>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-found)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Report Found Item <ArrowRight size={14} />
            </span>
          </div>

          <div className="action-card" onClick={() => onNavigate('search')} role="button" tabIndex={0}>
            <div className="action-icon search">
              <Search size={24} />
            </div>
            <h3>Search Items</h3>
            <p>Browse all active lost and found records by keywords, category, or location.</p>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Search Catalog <ArrowRight size={14} />
            </span>
          </div>

          <div className="action-card" onClick={() => onNavigate('track-claim')} role="button" tabIndex={0}>
            <div className="action-icon track">
              <FileSearch size={24} />
            </div>
            <h3>Track My Claim</h3>
            <p>Check the live review status and timeline using your Claim Code.</p>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
              Check Status <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </section>

      {/* Real-time System Statistics */}
      {stats && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-lost-bg)', color: 'var(--color-lost)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)' }}>{stats.totalLost || 0}</span>
                <p style={{ fontSize: '0.825rem', color: 'var(--neutral-500)', fontWeight: 500 }}>Reported Lost</p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-found-bg)', color: 'var(--color-found)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={24} />
              </div>
              <div>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)' }}>{stats.totalFound || 0}</span>
                <p style={{ fontSize: '0.825rem', color: 'var(--neutral-500)', fontWeight: 500 }}>Reported Found</p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)' }}>{stats.totalResolved || 0}</span>
                <p style={{ fontSize: '0.825rem', color: 'var(--neutral-500)', fontWeight: 500 }}>Resolved & Returned</p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={24} />
              </div>
              <div>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)' }}>{stats.totalPendingClaims || 0}</span>
                <p style={{ fontSize: '0.825rem', color: 'var(--neutral-500)', fontWeight: 500 }}>Claims Under Review</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-5)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-900)' }}>Recent Postings</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)' }}>Recently reported lost and found items in the community</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('search')}>
            View All Items <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading recent postings..." />
        ) : recentItems.length > 0 ? (
          <div className="grid-3">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} onViewDetails={onSelectItem} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--neutral-500)' }}>No items reported yet.</p>
        )}
      </section>

      {/* How It Works Section */}
      <section className="card" style={{ padding: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-900)', textAlign: 'center', marginBottom: 'var(--space-2)' }}>
          How the Lost & Found Process Works
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--neutral-500)', fontSize: '0.925rem', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
          A secure, four-step workflow designed to protect personal belongings and verify rightful ownership.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Report Item</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>Submit details about the lost or found item including location, date, and description.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Rule-Based Match</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>Our deterministic algorithm calculates match heuristics based on category, date, location, and keywords.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Submit Claim</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>Provide unique distinguishing marks, serial numbers, or private details to establish ownership.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
              4
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Review & Handover</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>An authorized reviewer verifies the claim details, updates status, and coordinates safe return.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
