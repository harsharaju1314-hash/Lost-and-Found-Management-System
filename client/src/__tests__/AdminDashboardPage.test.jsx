import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { authService } from '../services/authService';
import { claimService } from '../services/claimService';
import { statsService } from '../services/statsService';
import { itemService } from '../services/itemService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    getMe: vi.fn(),
    logout: vi.fn()
  }
}));

vi.mock('../services/claimService', () => ({
  claimService: {
    getClaims: vi.fn(),
    updateClaimStatus: vi.fn()
  }
}));

vi.mock('../services/statsService', () => ({
  statsService: {
    getOverviewStats: vi.fn()
  }
}));

vi.mock('../services/itemService', () => ({
  itemService: {
    getItems: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn()
  }
}));

describe('AdminDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <AuthProvider>
        <NotificationProvider>
          <AdminDashboardPage />
        </NotificationProvider>
      </AuthProvider>
    );
  };

  it('renders login prompt when unauthenticated', () => {
    authService.getMe.mockRejectedValueOnce(new Error('Not logged in'));
    renderComponent();

    expect(screen.getByText(/Administrator Portal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In as Administrator/i })).toBeInTheDocument();
  });

  it('logs in as admin and shows claims verification queue', async () => {
    authService.login.mockResolvedValueOnce({
      success: true,
      token: 'fake_admin_token',
      user: { id: 1, username: 'admin', email: 'admin@lostfound.local', role: 'admin' }
    });

    statsService.getOverviewStats.mockResolvedValue({
      success: true,
      stats: { totalLost: 4, totalFound: 4, totalPendingClaims: 1, totalApprovedClaims: 1 }
    });

    claimService.getClaims.mockResolvedValue({
      success: true,
      claims: [
        {
          id: 5,
          claim_code: 'CLM-4482B7',
          item_title: 'Black Bifold Leather Wallet',
          claimant_name: 'John Doe',
          claimant_email: 'john@example.com',
          status: 'pending',
          created_at: '2026-10-04T10:00:00Z',
          description_proof: 'Inside pocket has my driver license in the name of John Doe.'
        }
      ]
    });

    renderComponent();

    const submitBtn = screen.getByRole('button', { name: /Sign In as Administrator/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/System Administration & Claims Review/i)).toBeInTheDocument();
      expect(screen.getByText('CLM-4482B7')).toBeInTheDocument();
      expect(screen.getByText('Black Bifold Leather Wallet')).toBeInTheDocument();
    });
  });
});
