import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchCard } from '../components/MatchCard';

describe('MatchCard Component', () => {
  const mockMatch = {
    item: {
      id: 2,
      type: 'found',
      title: 'Black Leather Wallet on Desk',
      category: 'Wallets & Bags',
      description: 'Found black bifold wallet turned into helpdesk.',
      location: 'Central Library 2nd Floor',
      date_occurred: '2026-10-04'
    },
    matchScore: 85,
    matchConfidence: 'High',
    matchReasons: [
      'Exact category match: "Wallets & Bags"',
      'Location keyword overlap (Library, Floor)',
      'Reported dates within 2 days'
    ]
  };

  it('renders match score percentage and confidence level', () => {
    render(<MatchCard match={mockMatch} />);

    expect(screen.getByText('85% Match')).toBeInTheDocument();
    expect(screen.getByText('(High Confidence)')).toBeInTheDocument();
    expect(screen.getByText('Black Leather Wallet on Desk')).toBeInTheDocument();
  });

  it('renders the deterministic rule-based match reasons list', () => {
    render(<MatchCard match={mockMatch} />);

    expect(screen.getByText(/Exact category match/i)).toBeInTheDocument();
    expect(screen.getByText(/Location keyword overlap/i)).toBeInTheDocument();
    expect(screen.getByText(/Reported dates within 2 days/i)).toBeInTheDocument();
  });

  it('triggers onSelectMatch callback when clicked', () => {
    const handleSelectMatch = vi.fn();
    render(<MatchCard match={mockMatch} onSelectMatch={handleSelectMatch} />);

    const button = screen.getByRole('button', { name: /View Matched Item/i });
    fireEvent.click(button);

    expect(handleSelectMatch).toHaveBeenCalledWith(2);
  });
});
