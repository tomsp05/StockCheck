import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Settings from '../Settings';

function renderSettings() {
  const router = createMemoryRouter([{ path: '/', element: <Settings /> }]);
  return render(<RouterProvider router={router} />);
}

describe('Settings page', () => {
  it('renders threshold list', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
    });

    const table = document.querySelector('.stock-table');
    const tableScope = within(table);
    expect(tableScope.getByText('Widget A')).toBeInTheDocument();
    expect(tableScope.getByText('Main Warehouse')).toBeInTheDocument();
  });

  it('shows threshold form with product and location selects', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Quantity')).toBeInTheDocument();
  });

  it('deletes a threshold after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
    });

    const table = document.querySelector('.stock-table');
    const tableScope = within(table);
    expect(tableScope.getByText('Widget A')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.classList.contains('btn-danger-outline')
    );
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Remove this threshold?');

    await waitFor(() => {
      expect(tableScope.queryByText('Widget A')).not.toBeInTheDocument();
    });

    window.confirm.mockRestore();
  });
});
