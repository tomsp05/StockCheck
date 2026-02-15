import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Blocks, MapPin, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { stockApi, locationApi, productApi } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, locations: 0, alerts: 0, totalStock: 0 });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, locationsRes, stockRes, alertsRes] = await Promise.all([
          productApi.getAll(),
          locationApi.getAll(),
          stockApi.getAll(),
          stockApi.getAlerts(),
        ]);

        const totalStock = stockRes.data.reduce((sum, sl) => sum + sl.quantity, 0);

        setStats({
          products: productsRes.data.length,
          locations: locationsRes.data.length,
          alerts: alertsRes.data.length,
          totalStock,
        });
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card stat-card--indigo">
          <div className="stat-icon stat-icon--indigo">
            <Blocks size={22} />
          </div>
          <div>
            <h3>Products</h3>
            <p className="stat-value">{stats.products}</p>
          </div>
        </div>
        <div className="stat-card stat-card--amber">
          <div className="stat-icon stat-icon--amber">
            <MapPin size={22} />
          </div>
          <div>
            <h3>Locations</h3>
            <p className="stat-value">{stats.locations}</p>
          </div>
        </div>
        <div className="stat-card stat-card--emerald">
          <div className="stat-icon stat-icon--emerald">
            <Package size={22} />
          </div>
          <div>
            <h3>Total Stock</h3>
            <p className="stat-value">{stats.totalStock}</p>
          </div>
        </div>
        <div className="stat-card alert-card stat-card--rose">
          <div className="stat-icon stat-icon--rose">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3>Low Stock Alerts</h3>
            <p className="stat-value">{stats.alerts}</p>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="section">
          <h2>Low Stock Alerts</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Location</th>
                <th>Current Qty</th>
                <th>Threshold</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section">
        <h2>Quick Actions</h2>
        <div className="actions">
          <Link to="/stock" className="btn"><ArrowRight size={16} /> View Stock Levels</Link>
          <Link to="/products" className="btn"><ArrowRight size={16} /> Manage Products</Link>
          <Link to="/locations" className="btn"><ArrowRight size={16} /> Manage Locations</Link>
        </div>
      </div>
    </div>
  );
}
