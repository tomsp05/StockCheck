import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
        <div className="empty-state">
          <CheckCircle2 size={48} className="empty-state-icon" />
          <p>No low stock alerts. All items are above their thresholds.</p>
        </div>
      ) : (
        <table className="stock-table">
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
              <tr key={i}>
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
