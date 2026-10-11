import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '../components/ItemCard';

describe('ItemCard Component', () => {
  const mockItem = {
    id: 1,
    type: 'lost',
    title: 'Black Leather Bifold Wallet',
    category: 'Wallets & Bags',
    description: 'Lost wallet near library study desks on 2nd floor.',
    location: 'Central Library',
    date_occurred: '2026-10-04',
    status: 'open'
  };

  it('renders item title, category badge, and location correctly', () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText('Black Leather Bifold Wallet')).toBeInTheDocument();
    expect(screen.getByText('Wallets & Bags')).toBeInTheDocument();
    expect(screen.getByText('Central Library')).toBeInTheDocument();
    expect(screen.getByText(/Lost Item/i)).toBeInTheDocument();
    expect(screen.getByText(/open/i)).toBeInTheDocument();
  });

  it('triggers onViewDetails callback when card is clicked', () => {
    const handleViewDetails = vi.fn();
    render(<ItemCard item={mockItem} onViewDetails={handleViewDetails} />);

    const card = screen.getByText('Black Leather Bifold Wallet').closest('.card');
    fireEvent.click(card);

    expect(handleViewDetails).toHaveBeenCalledWith(1);
  });
});
