import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Alerts from '../Alerts';

function renderAlerts() {
  const router = createMemoryRouter([{ path: '/', element: <Alerts /> }]);
  return render(<RouterProvider router={router} />);
}

describe('Alerts page', () => {
  it('renders low stock alerts', async () => {
    renderAlerts();

    await waitFor(() => {
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
    });

    expect(screen.getByText('Gadget B')).toBeInTheDocument();
    expect(screen.getByText('High Street Store')).toBeInTheDocument();
  });

  it('shows deficit column', async () => {
    renderAlerts();

    await waitFor(() => {
      expect(screen.getByText('Gadget B')).toBeInTheDocument();
    });

    expect(screen.getByText('Deficit')).toBeInTheDocument();
    // currentQuantity=5 and deficit=5, so two cells with "5"
    const fives = screen.getAllByText('5');
    expect(fives.length).toBe(2);
  });
});
