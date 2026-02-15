import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import StockTable from '../StockTable';

const mockStockLevels = [
  {
    id: 1,
    product: { id: 1, name: 'Widget A', sku: 'WGT-001' },
    location: { id: 1, name: 'Main Warehouse' },
    quantity: 150,
    updatedAt: '2025-01-01T00:00:00',
  },
  {
    id: 2,
    product: { id: 2, name: 'Gadget B', sku: 'GDG-002' },
    location: { id: 2, name: 'High Street Store' },
    quantity: 5,
    updatedAt: '2025-01-01T00:00:00',
  },
];

function renderStockTable(props = {}) {
  const defaultProps = {
    stockLevels: mockStockLevels,
    onUpdate: vi.fn(),
  };
  return render(
    <MemoryRouter>
      <StockTable {...defaultProps} {...props} />
    </MemoryRouter>,
  );
}

describe('StockTable component', () => {
  it('renders stock rows with stepper controls', () => {
    renderStockTable();
    expect(screen.getByText('Widget A')).toBeInTheDocument();
    expect(screen.getByText('WGT-001')).toBeInTheDocument();
    expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    expect(screen.getByText('Gadget B')).toBeInTheDocument();
    expect(screen.getByText('GDG-002')).toBeInTheDocument();
    expect(screen.getByText('High Street Store')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Stepper buttons always visible
    const decreaseButtons = screen.getAllByLabelText('Decrease quantity');
    const increaseButtons = screen.getAllByLabelText('Increase quantity');
    expect(decreaseButtons).toHaveLength(2);
    expect(increaseButtons).toHaveLength(2);
  });

  it('shows empty state when no stock data', () => {
    renderStockTable({ stockLevels: [] });
    expect(screen.getByText('No stock data available.')).toBeInTheDocument();
  });

  it('calls onUpdate when increment button is clicked', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderStockTable({ onUpdate });

    const increaseButtons = screen.getAllByLabelText('Increase quantity');
    await user.click(increaseButtons[0]);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('calls onUpdate when decrement button is clicked', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderStockTable({ onUpdate });

    const decreaseButtons = screen.getAllByLabelText('Decrease quantity');
    await user.click(decreaseButtons[0]);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('opens exact-value input when quantity is clicked', async () => {
    const user = userEvent.setup();
    renderStockTable();

    await user.click(screen.getByText('150'));

    expect(screen.getByRole('spinbutton')).toHaveValue(150);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('cancels exact-value edit mode', async () => {
    const user = userEvent.setup();
    renderStockTable();

    await user.click(screen.getByText('150'));
    await user.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('saves exact value and calls onUpdate', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderStockTable({ onUpdate });

    await user.click(screen.getByText('150'));

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '200');
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('handles null product/location gracefully', () => {
    const stockWithNulls = [
      {
        id: 1,
        product: null,
        location: null,
        quantity: 100,
        updatedAt: null,
      },
    ];
    renderStockTable({ stockLevels: stockWithNulls });
    expect(screen.getByText('Unknown Product')).toBeInTheDocument();
    expect(screen.getByText('Unknown Location')).toBeInTheDocument();
  });
});
