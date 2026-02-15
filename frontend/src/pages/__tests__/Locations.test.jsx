import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Locations from '../Locations';

function renderLocations() {
  const router = createMemoryRouter([{ path: '/', element: <Locations /> }]);
  return render(<RouterProvider router={router} />);
}

describe('Locations page', () => {
  it('renders location list from API', async () => {
    renderLocations();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });
    expect(screen.getByText('High Street Store')).toBeInTheDocument();
  });

  it('shows add form when button is clicked', async () => {
    const user = userEvent.setup();
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Location'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
  });

  it('creates a new location', async () => {
    const user = userEvent.setup();
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Location'));
    await user.type(screen.getByLabelText('Name'), 'New Office');
    await user.type(screen.getByLabelText('Address'), '10 Park Lane');
    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('New Office')).toBeInTheDocument();
    });
  });

  it('edits an existing location', async () => {
    const user = userEvent.setup();
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    expect(screen.getByLabelText('Name')).toHaveValue('Main Warehouse');
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('deletes a location after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.classList.contains('btn-danger-outline')
    );
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Delete this location?');

    await waitFor(() => {
      expect(screen.queryByText('Main Warehouse')).not.toBeInTheDocument();
    });

    window.confirm.mockRestore();
  });
});
