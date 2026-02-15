import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard';

function renderDashboard() {
  const router = createMemoryRouter([{ path: '/', element: <Dashboard /> }]);
  return render(<RouterProvider router={router} />);
}

describe('Dashboard page', () => {
  it('renders heading and stat cards after loading', async () => {
    renderDashboard();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Childcare Stock Manager')).toBeInTheDocument();
    });

    const statCards = document.querySelectorAll('.stat-card');
    expect(statCards.length).toBeGreaterThanOrEqual(2);
  });

  it('displays stock totals per location', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Childcare Stock Manager')).toBeInTheDocument();
    });

    // Main Warehouse: 150 + 75 = 225, High Street Store: 30 + 5 = 35
    expect(screen.getByText('225')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('displays category filter pills', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Childcare Stock Manager')).toBeInTheDocument();
    });

    const pillContainer = document.querySelector('.filter-pills');
    expect(within(pillContainer).getByText('All Items')).toBeInTheDocument();
    expect(within(pillContainer).getByText('Toys')).toBeInTheDocument();
    expect(within(pillContainer).getByText('Art Supplies')).toBeInTheDocument();
  });

  it('filters products by category', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    expect(screen.getByText('Gadget B')).toBeInTheDocument();

    const pillContainer = document.querySelector('.filter-pills');
    await user.click(within(pillContainer).getByText('Toys'));

    expect(screen.getByText('Widget A')).toBeInTheDocument();
    expect(screen.queryByText('Gadget B')).not.toBeInTheDocument();
  });
});
