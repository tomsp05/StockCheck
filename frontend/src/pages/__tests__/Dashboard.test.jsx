import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard page', () => {
  it('shows loading state initially', () => {
    renderDashboard();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays stats cards after loading', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Total Stock')).toBeInTheDocument();
    // "Low Stock Alerts" appears both as h3 stat card and h2 section header
    expect(screen.getAllByText('Low Stock Alerts').length).toBeGreaterThanOrEqual(1);
  });

  it('displays low stock alerts table', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Gadget B')).toBeInTheDocument();
    });
    expect(screen.getByText('GDG-002')).toBeInTheDocument();
    expect(screen.getByText('High Street Store')).toBeInTheDocument();
  });

  it('renders quick action links', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('View Stock Levels')).toBeInTheDocument();
    });
    expect(screen.getByText('Manage Products')).toBeInTheDocument();
    expect(screen.getByText('Manage Locations')).toBeInTheDocument();

    expect(screen.getByText('View Stock Levels').closest('a')).toHaveAttribute('href', '/stock');
    expect(screen.getByText('Manage Products').closest('a')).toHaveAttribute('href', '/products');
    expect(screen.getByText('Manage Locations').closest('a')).toHaveAttribute('href', '/locations');
  });
});
