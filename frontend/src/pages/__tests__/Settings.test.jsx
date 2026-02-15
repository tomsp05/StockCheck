import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Settings from '../Settings';

function renderSettings() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>,
  );
}

describe('Settings page', () => {
  it('renders thresholds list', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
    });

    // Thresholds table should show min quantities
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Check remove buttons exist for each threshold
    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons.length).toBe(2);
  });

  it('shows form with product and location dropdowns', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByLabelText('Product')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Quantity')).toBeInTheDocument();
    expect(screen.getByText('Set Threshold')).toBeInTheDocument();
  });

  it('creates a new threshold via the form', async () => {
    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => {
      expect(screen.getByLabelText('Product')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Product'), '1');
    await user.selectOptions(screen.getByLabelText('Location'), '1');
    await user.type(screen.getByLabelText('Min Quantity'), '50');
    await user.click(screen.getByText('Set Threshold'));

    await waitFor(() => {
      expect(screen.getByLabelText('Min Quantity')).toHaveValue(null);
    });
  });

  it('deletes a threshold after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderSettings();

    await waitFor(() => {
      expect(screen.getAllByText('Remove').length).toBeGreaterThanOrEqual(1);
    });

    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Remove this threshold?');

    window.confirm.mockRestore();
  });

  it('shows empty state when no thresholds', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Configure minimum stock levels that trigger low-stock alerts.'),
    ).toBeInTheDocument();
  });
});
