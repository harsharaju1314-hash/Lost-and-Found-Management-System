import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportItemPage } from '../pages/ReportItemPage';
import { NotificationProvider } from '../context/NotificationContext';
import { itemService } from '../services/itemService';

vi.mock('../services/itemService', () => ({
  itemService: {
    createItem: vi.fn()
  }
}));

describe('ReportItemPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <NotificationProvider>
        <ReportItemPage {...props} />
      </NotificationProvider>
    );
  };

  it('renders required field inputs for reporting an item', () => {
    renderComponent({ defaultType: 'lost' });

    expect(screen.getByLabelText(/Item Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Approximate Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting with empty required fields', async () => {
    renderComponent({ defaultType: 'lost' });

    const submitBtn = screen.getByRole('button', { name: /Submit Lost Item/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Location is required/i)).toBeInTheDocument();
    });
  });

  it('allows switching between lost and found tabs', () => {
    renderComponent({ defaultType: 'lost' });

    const foundTab = screen.getByRole('button', { name: /Report Found Item/i });
    fireEvent.click(foundTab);

    expect(screen.getByRole('button', { name: /Submit Found Item/i })).toBeInTheDocument();
  });

  it('submits valid item form and shows success screen with match suggestions', async () => {
    itemService.createItem.mockResolvedValueOnce({
      success: true,
      item: {
        id: 10,
        type: 'lost',
        title: 'Sony Headphones Black',
        category: 'Electronics'
      },
      potentialMatches: [
        {
          item: { id: 11, title: 'Black Sony Over-Ear Headphones', category: 'Electronics', type: 'found', location: 'Library' },
          matchScore: 80,
          matchConfidence: 'High',
          matchReasons: ['Exact category match']
        }
      ]
    });

    renderComponent({ defaultType: 'lost' });

    fireEvent.change(screen.getByLabelText(/Item Title/i), { target: { value: 'Sony Headphones Black' } });
    fireEvent.change(screen.getByLabelText(/Approximate Location/i), { target: { value: 'Student Union' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Black over-ear noise cancelling headphones left on couch.' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Lost Item/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(itemService.createItem).toHaveBeenCalled();
      expect(screen.getByText(/Lost Item Report Submitted/i)).toBeInTheDocument();
      expect(screen.getByText(/Potential Matching Items Discovered/i)).toBeInTheDocument();
    });
  });
});
