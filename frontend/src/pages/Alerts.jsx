import { useEffect, useState } from 'react';
import { stockApi } from '../api/client';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stockApi.getAlerts()
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error('Failed to load alerts', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Low Stock Alerts</h1>

      {alerts.length === 0 ? (
        <p className="empty-state">No low stock alerts. All items are above their thresholds.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Location</th>
              <th>Current Qty</th>
              <th>Threshold</th>
              <th>Deficit</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, i) => (
              <tr key={i} className="alert-row">
                <td>{alert.productName}</td>
                <td>{alert.sku}</td>
                <td>{alert.locationName}</td>
                <td>{alert.currentQuantity}</td>
                <td>{alert.threshold}</td>
                <td>{alert.threshold - alert.currentQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
