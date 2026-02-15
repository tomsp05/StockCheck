import { useEffect, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { stockApi, locationApi, productApi, exportApi } from '../api/client';
import StockTable from '../components/StockTable';

export default function StockLevels() {
  const [stockLevels, setStockLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ productId: '', locationId: '', quantity: 0 });

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = selectedLocation
        ? await stockApi.getByLocation(selectedLocation)
        : await stockApi.getAll();
      setStockLevels(res.data);
    } catch (err) {
      console.error('Failed to load stock levels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    locationApi.getAll().then((res) => setLocations(res.data));
    productApi.getAll().then((res) => setProducts(res.data));
  }, []);

  useEffect(() => {
    fetchStock();
  }, [selectedLocation]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    await stockApi.update({
      productId: Number(formData.productId),
      locationId: Number(formData.locationId),
      quantity: parseInt(formData.quantity, 10),
    });
    setShowForm(false);
    setFormData({ productId: '', locationId: '', quantity: 0 });
    fetchStock();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stock Levels</h1>
        <div className="page-actions">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="select"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Stock
          </button>
          <a href={exportApi.stockCsvUrl()} className="btn" download>
            <Download size={16} /> Export CSV
          </a>
        </div>
      </div>

      {showForm && (
        <form className="form-card form-inline" onSubmit={handleAddStock}>
          <div className="form-group">
            <label htmlFor="add-product">Product</label>
            <select
              id="add-product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="add-location">Location</label>
            <select
              id="add-location"
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              required
            >
              <option value="">Select location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="add-quantity">Quantity</label>
            <input
              id="add-quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn">Add</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <StockTable stockLevels={stockLevels} onUpdate={fetchStock} />
      )}
    </div>
  );
}
