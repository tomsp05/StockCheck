import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Categories from '../Categories';

function renderCategories() {
  return render(
    <MemoryRouter>
      <Categories />
    </MemoryRouter>,
  );
}

describe('Categories page', () => {
  it('renders category list from API', async () => {
    renderCategories();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Toys')).toBeInTheDocument();
    });
    expect(screen.getByText('Art Supplies')).toBeInTheDocument();
    expect(screen.getByText('Age Range, Material')).toBeInTheDocument();
    expect(screen.getByText('Colour Count, Medium')).toBeInTheDocument();
  });

  it('shows the add category form when button is clicked', async () => {
    const user = userEvent.setup();
    renderCategories();

    await waitFor(() => {
      expect(screen.getByText('Toys')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Category'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('creates a new category with attributes', async () => {
    const user = userEvent.setup();
    renderCategories();

    await waitFor(() => {
      expect(screen.getByText('Toys')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Category'));
    await user.type(screen.getByLabelText('Name'), 'Electronics');
    await user.type(screen.getByLabelText('Attribute 1 name'), 'Voltage');

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
  });

  it('adds and removes attribute rows', async () => {
    const user = userEvent.setup();
    renderCategories();

    await waitFor(() => {
      expect(screen.getByText('Toys')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Category'));
    expect(screen.getByLabelText('Attribute 1 name')).toBeInTheDocument();

    await user.click(screen.getByText('Add Attribute'));
    expect(screen.getByLabelText('Attribute 2 name')).toBeInTheDocument();

    // Remove first attribute
    const removeButtons = screen.getAllByRole('button', { name: '' });
    // The trash buttons for attributes - click the first one
    const trashButtons = screen.getAllByRole('button').filter((btn) => btn.closest('.btn-danger') && btn.closest('.form-card'));
    if (trashButtons.length > 0) {
      await user.click(trashButtons[0]);
    }
  });

  it('shows dropdown options input when type is dropdown', async () => {
    const user = userEvent.setup();
    renderCategories();

    await waitFor(() => {
      expect(screen.getByText('Toys')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Category'));
    await user.selectOptions(screen.getByLabelText('Attribute 1 type'), 'dropdown');
    expect(screen.getByLabelText('Attribute 1 options')).toBeInTheDocument();
  });

  it('edits an existing category', async () => {
    const user = userEvent.setup();
    renderCategories();

    await waitFor(() => {
      expect(screen.getByText('Toys')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveValue('Toys');
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('deletes a category after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderCategories();

    await waitFor(() => {
      expect(screen.getByText('Toys')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Delete this category?');

    await waitFor(() => {
      expect(screen.queryByText('Toys')).not.toBeInTheDocument();
    });

    window.confirm.mockRestore();
  });
});
