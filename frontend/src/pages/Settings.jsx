import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { thresholdApi, productApi, locationApi } from '../api/client';

export default function Settings() {
  const [thresholds, setThresholds] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ productId: '', locationId: '', minQuantity: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tRes, pRes, lRes] = await Promise.all([
        thresholdApi.getAll(),
        productApi.getAll(),
        locationApi.getAll(),
      ]);
      setThresholds(tRes.data);
      setProducts(pRes.data);
      setLocations(lRes.data);
    } catch (err) {
      console.error('Failed to load settings data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await thresholdApi.set({
      productId: parseInt(form.productId, 10),
      locationId: parseInt(form.locationId, 10),
      minQuantity: parseInt(form.minQuantity, 10),
    });
    setForm({ productId: '', locationId: '', minQuantity: '' });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this threshold?')) {
      await thresholdApi.delete(id);
      fetchData();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Settings</h1>

      <div className="section">
        <h2>Alert Thresholds</h2>
        <p>Configure minimum stock levels that trigger low-stock alerts.</p>

        <form onSubmit={handleSubmit} className="form-card form-inline">
          <div className="form-group">
            <label htmlFor="threshold-product">Product</label>
            <select id="threshold-product" required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="threshold-location">Location</label>
            <select id="threshold-location" required value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              <option value="">Select location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="threshold-min-qty">Min Quantity</label>
            <input id="threshold-min-qty" type="number" min="0" required value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} />
          </div>
          <button type="submit" className="btn"><Save size={16} /> Set Threshold</button>
        </form>

        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Min Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {thresholds.map((t) => (
              <tr key={t.id}>
                <td>{t.product.name}</td>
                <td>{t.location.name}</td>
                <td>{t.minQuantity}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}><Trash2 size={14} /> Remove</button>
                </td>
              </tr>
            ))}
            {thresholds.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state">No thresholds configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
