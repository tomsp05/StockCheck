import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';
import { server } from '../../test/mocks/server';
import Alerts from '../Alerts';

function renderAlerts() {
  return render(
    <MemoryRouter>
      <Alerts />
    </MemoryRouter>,
  );
}

describe('Alerts page', () => {
  it('renders low stock alerts', async () => {
    renderAlerts();

    await waitFor(() => {
      expect(screen.getByText('Gadget B')).toBeInTheDocument();
    });
    expect(screen.getByText('GDG-002')).toBeInTheDocument();
    expect(screen.getByText('High Street Store')).toBeInTheDocument();

    // currentQuantity=5, threshold=10, deficit=5 — multiple cells have "5"
    const fives = screen.getAllByText('5');
    expect(fives.length).toBe(2); // currentQuantity and deficit
    expect(screen.getByText('10')).toBeInTheDocument(); // threshold
  });

  it('shows empty state when no alerts', async () => {
    server.use(
      http.get('/api/stock/alerts', () => {
        return HttpResponse.json([]);
      }),
    );

    renderAlerts();

    await waitFor(() => {
      expect(
        screen.getByText('No low stock alerts. All items are above their thresholds.'),
      ).toBeInTheDocument();
    });
  });
});
