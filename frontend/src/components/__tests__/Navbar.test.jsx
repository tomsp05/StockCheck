import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Navbar from '../Navbar';

function renderNavbar(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navbar />
    </MemoryRouter>,
  );
}

describe('Navbar component', () => {
  it('renders the brand link', () => {
    renderNavbar();
    const brand = screen.getByText('StockCheck');
    expect(brand).toBeInTheDocument();
    expect(brand.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders all navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Stock Levels')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights the active route', () => {
    renderNavbar('/products');
    const productsLink = screen.getByText('Products');
    expect(productsLink).toHaveClass('active');

    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).not.toHaveClass('active');
  });

  it('nav links have correct hrefs', () => {
    renderNavbar();
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Stock Levels').closest('a')).toHaveAttribute('href', '/stock');
    expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/products');
    expect(screen.getByText('Locations').closest('a')).toHaveAttribute('href', '/locations');
    expect(screen.getByText('Alerts').closest('a')).toHaveAttribute('href', '/alerts');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
  });
});
