import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchItemsPage } from '../pages/SearchItemsPage';
import { itemService } from '../services/itemService';

vi.mock('../services/itemService', () => ({
  itemService: {
    getItems: vi.fn()
  }
}));

describe('SearchItemsPage Component', () => {
  const mockItems = [
    {
      id: 1,
      type: 'lost',
      title: 'Hydro Flask Water Bottle',
      category: 'Other',
      description: 'Teal colored hydro flask',
      location: 'Campus Gym',
      date_occurred: '2026-10-04',
      status: 'open'
    },
    {
      id: 2,
      type: 'found',
      title: 'iPhone 13 Navy Blue',
      category: 'Electronics',
      description: 'Found phone near cafeteria',
      location: 'Cafeteria',
      date_occurred: '2026-10-04',
      status: 'open'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    itemService.getItems.mockResolvedValue({
      success: true,
      total: 2,
      items: mockItems
    });
  });

  it('renders search filter bar and loaded items', async () => {
    render(<SearchItemsPage />);

    await waitFor(() => {
      expect(screen.getByText('Hydro Flask Water Bottle')).toBeInTheDocument();
      expect(screen.getByText('iPhone 13 Navy Blue')).toBeInTheDocument();
    });
  });

  it('triggers item fetch with updated keyword on search input change', async () => {
    render(<SearchItemsPage />);

    const searchInput = screen.getByPlaceholderText(/Search title or description/i);
    fireEvent.change(searchInput, { target: { value: 'iPhone' } });

    await waitFor(() => {
      expect(itemService.getItems).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'iPhone' })
      );
    });
  });

  it('resets filters when "Reset Filters" button is clicked', async () => {
    render(<SearchItemsPage />);

    const searchInput = screen.getByPlaceholderText(/Search title or description/i);
    fireEvent.change(searchInput, { target: { value: 'Test Query' } });

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
  });
});
