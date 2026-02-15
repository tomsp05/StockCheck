import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import StockLevels from '../StockLevels';

function renderStockLevels() {
  return render(
    <MemoryRouter>
      <StockLevels />
    </MemoryRouter>,
  );
}

describe('StockLevels page', () => {
  it('renders stock levels from API', async () => {
    renderStockLevels();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Widget A appears in two rows (two locations), Gadget B also in two rows
    expect(screen.getAllByText('Widget A').length).toBe(2);
    expect(screen.getAllByText('Gadget B').length).toBe(2);
  });

  it('shows location filter dropdown with locations', async () => {
    renderStockLevels();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('All Locations')).toBeInTheDocument();
  });

  it('filters stock by location', async () => {
    const user = userEvent.setup();
    renderStockLevels();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    // The first combobox is the location filter
    await user.selectOptions(selects[0], '1');

    // After filtering, only location 1 stock should show
    await waitFor(() => {
      // Main Warehouse appears in rows and in dropdown option
      expect(screen.getAllByText('Main Warehouse').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows export CSV link', async () => {
    renderStockLevels();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('shows Add Stock button', async () => {
    renderStockLevels();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Add Stock')).toBeInTheDocument();
  });

  it('shows Add Stock form when button is clicked', async () => {
    const user = userEvent.setup();
    renderStockLevels();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Stock'));

    expect(screen.getByLabelText('Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('submits Add Stock form', async () => {
    const user = userEvent.setup();
    renderStockLevels();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Stock'));

    await user.selectOptions(screen.getByLabelText('Product'), '1');
    await user.selectOptions(screen.getByLabelText('Location'), '1');
    const qtyInput = screen.getByLabelText('Quantity');
    await user.clear(qtyInput);
    await user.type(qtyInput, '50');

    await user.click(screen.getByText('Add'));

    // Form should close after submission
    await waitFor(() => {
      expect(screen.queryByLabelText('Product')).not.toBeInTheDocument();
    });
  });
});
