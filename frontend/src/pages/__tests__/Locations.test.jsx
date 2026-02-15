import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Locations from '../Locations';

function renderLocations() {
  return render(
    <MemoryRouter>
      <Locations />
    </MemoryRouter>,
  );
}

describe('Locations page', () => {
  it('renders location list from API', async () => {
    renderLocations();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });
    expect(screen.getByText('High Street Store')).toBeInTheDocument();
    expect(screen.getByText('1 Industrial Park, London')).toBeInTheDocument();
    expect(screen.getByText('42 High Street, London')).toBeInTheDocument();
  });

  it('shows the add location form when button is clicked', async () => {
    const user = userEvent.setup();
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Location'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('hides form and resets when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Location'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('creates a new location via the form', async () => {
    const user = userEvent.setup();
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Location'));
    await user.type(screen.getByLabelText('Name'), 'New Depot');
    await user.type(screen.getByLabelText('Address'), '99 Depot Lane');
    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('New Depot')).toBeInTheDocument();
    });
    expect(screen.getByText('99 Depot Lane')).toBeInTheDocument();
  });

  it('edits an existing location', async () => {
    const user = userEvent.setup();
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveValue('Main Warehouse');
    expect(screen.getByText('Update')).toBeInTheDocument();

    await user.clear(nameInput);
    await user.type(nameInput, 'Central Warehouse');
    await user.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(screen.getByText('Central Warehouse')).toBeInTheDocument();
    });
  });

  it('deletes a location after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Delete this location?');

    await waitFor(() => {
      expect(screen.queryByText('Main Warehouse')).not.toBeInTheDocument();
    });

    window.confirm.mockRestore();
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderLocations();

    await waitFor(() => {
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(screen.getByText('Main Warehouse')).toBeInTheDocument();

    window.confirm.mockRestore();
  });
});
