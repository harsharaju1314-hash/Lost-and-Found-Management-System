import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrackClaimPage } from '../pages/TrackClaimPage';
import { claimService } from '../services/claimService';

vi.mock('../services/claimService', () => ({
  claimService: {
    trackClaimByCode: vi.fn()
  }
}));

describe('TrackClaimPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders claim tracking code input', () => {
    render(<TrackClaimPage />);

    expect(screen.getByPlaceholderText(/e.g. CLM-9021A4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Track Claim/i })).toBeInTheDocument();
  });

  it('fetches and displays claim details with timeline history', async () => {
    claimService.trackClaimByCode.mockResolvedValueOnce({
      success: true,
      claim: {
        id: 1,
        claim_code: 'CLM-9021A4',
        item_title: 'Teal Hydro Flask',
        item_category: 'Other',
        item_location: 'Gym',
        status: 'approved',
        admin_notes: 'Stickers matched and verified with claimant.',
        history: [
          { id: 1, previous_status: 'none', new_status: 'pending', note: 'Claim submitted', updated_by: 'System', created_at: '2026-10-04T10:00:00Z' },
          { id: 2, previous_status: 'pending', new_status: 'approved', note: 'Verified stickers', updated_by: 'Admin', created_at: '2026-10-04T12:00:00Z' }
        ]
      }
    });

    render(<TrackClaimPage />);

    const input = screen.getByPlaceholderText(/e.g. CLM-9021A4/i);
    fireEvent.change(input, { target: { value: 'CLM-9021A4' } });

    const submitBtn = screen.getByRole('button', { name: /Track Claim/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(claimService.trackClaimByCode).toHaveBeenCalledWith('CLM-9021A4');
      expect(screen.getByText('Teal Hydro Flask')).toBeInTheDocument();
      expect(screen.getByText(/Stickers matched and verified with claimant/i)).toBeInTheDocument();
      expect(screen.getByText(/Status Timeline & Audit Trail/i)).toBeInTheDocument();
    });
  });

  it('displays friendly error message when code is not found', async () => {
    claimService.trackClaimByCode.mockRejectedValueOnce(
      new Error('No claim found with this tracking code.')
    );

    render(<TrackClaimPage />);

    const input = screen.getByPlaceholderText(/e.g. CLM-9021A4/i);
    fireEvent.change(input, { target: { value: 'CLM-INVALID' } });

    const submitBtn = screen.getByRole('button', { name: /Track Claim/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Claim Not Found/i)).toBeInTheDocument();
    });
  });
});
