import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Products from '../Products';

function renderProducts() {
  const router = createMemoryRouter([{ path: '/', element: <Products /> }]);
  return render(<RouterProvider router={router} />);
}

describe('Products page', () => {
  it('renders product list from API', async () => {
    renderProducts();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });
    expect(screen.getByText('Gadget B')).toBeInTheDocument();
    expect(screen.getByText('WGT-001')).toBeInTheDocument();
    expect(screen.getByText('GDG-002')).toBeInTheDocument();
  });

  it('displays category column with pills', async () => {
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Toys')).toBeInTheDocument();
    expect(screen.getByText('Art Supplies')).toBeInTheDocument();
  });

  it('shows the add product form when button is clicked', async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Product'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('shows dynamic attribute fields when category selected', async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Product'));
    await user.selectOptions(screen.getByLabelText('Category'), '1');

    expect(screen.getByLabelText('Age Range')).toBeInTheDocument();
    expect(screen.getByLabelText('Material')).toBeInTheDocument();
  });

  it('clears attribute values when category changes', async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Product'));
    await user.selectOptions(screen.getByLabelText('Category'), '1');
    await user.type(screen.getByLabelText('Material'), 'Wood');

    await user.selectOptions(screen.getByLabelText('Category'), '2');
    expect(screen.queryByLabelText('Material')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Colour Count')).toBeInTheDocument();
  });

  it('hides form when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Product'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  it('creates a new product via the form', async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Product'));
    await user.type(screen.getByLabelText('Name'), 'New Product');
    await user.type(screen.getByLabelText('SKU'), 'NEW-001');
    await user.type(screen.getByLabelText('Description'), 'A brand new product');
    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });
    expect(screen.getByText('NEW-001')).toBeInTheDocument();
  });

  it('edits an existing product with category pre-selected', async () => {
    const user = userEvent.setup();
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    expect(screen.getByLabelText('Name')).toHaveValue('Widget A');
    expect(screen.getByLabelText('Category')).toHaveValue('1');
    expect(screen.getByText('Update')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Widget A Updated');
    await user.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(screen.getByText('Widget A Updated')).toBeInTheDocument();
    });
  });

  it('deletes a product after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.classList.contains('btn-danger-outline')
    );
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Delete this product?');

    await waitFor(() => {
      expect(screen.queryByText('Widget A')).not.toBeInTheDocument();
    });

    window.confirm.mockRestore();
  });
});
