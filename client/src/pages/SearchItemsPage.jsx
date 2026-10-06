import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, MapPin, Tag } from 'lucide-react';
import { itemService } from '../services/itemService';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Wallets & Bags',
  'Keys & Badges',
  'Documents & IDs',
  'Clothing & Accessories',
  'Jewelry',
  'Books & Stationery',
  'Other'
];

export function SearchItemsPage({ onSelectItem, onNavigate }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: '',
    type: 'all', // 'all', 'lost', 'found'
    category: 'all',
    status: 'all',
    location: ''
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itemService.getItems({
        q: filters.q,
        type: filters.type,
        category: filters.category === 'All Categories' ? 'all' : filters.category,
        status: filters.status,
        location: filters.location,
        limit: 40
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load items', err);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleResetFilters = () => {
    setFilters({
      q: '',
      type: 'all',
      category: 'all',
      status: 'all',
      location: ''
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: '4px' }}>
          Search & Browse Items
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--neutral-500)' }}>
          Search through reported lost and found items in the database.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        {/* Type Filter Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${filters.type === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilters({ ...filters, type: 'all' })}
          >
            All Items
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filters.type === 'lost' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setFilters({ ...filters, type: 'lost' })}
          >
            Lost Items
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filters.type === 'found' ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => setFilters({ ...filters, type: 'found' })}
          >
            Found Items
          </button>
        </div>

        {/* Search & Filter Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search title or description..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--neutral-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c === 'All Categories' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              style={{ paddingLeft: '36px' }}
            />
            <MapPin size={16} color="var(--neutral-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open / Active Only</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned to Owner</option>
            </select>
          </div>
        </div>

        {/* Reset & Status Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--neutral-100)', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--neutral-500)', fontWeight: 500 }}>
            Showing <strong>{items.length}</strong> of <strong>{total}</strong> items
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={12} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Item Grid */}
      {loading ? (
        <LoadingSpinner message="Searching records..." />
      ) : items.length > 0 ? (
        <div className="grid-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onViewDetails={onSelectItem} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No items found"
          message="No items match your search criteria. Try adjusting keywords, category, or clear filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
}
