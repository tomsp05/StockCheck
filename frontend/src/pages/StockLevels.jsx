import { useState } from 'react';
import { stockApi } from '../api/client';
import { useProducts, useLocations, useStockLevels } from '../hooks';

export default function StockLevels() {
  const { products, loading: productsLoading } = useProducts();
  const { locations, loading: locationsLoading } = useLocations();
  const { stockLevels, loading: stockLevelsLoading, mutate } = useStockLevels();
  const [form, setForm] = useState({ productId: '', locationId: '', quantity: '' });

  const loading = productsLoading || locationsLoading || stockLevelsLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.locationId) {
      alert('Please select a product and a location.');
      return;
    }
    await stockApi.update({
      productId: Number(form.productId),
      locationId: Number(form.locationId),
      quantity: Number(form.quantity),
    });
    setForm({ productId: '', locationId: '', quantity: '' });
    mutate();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Update Stock</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label htmlFor="product-select">Product</label>
          <select
            id="product-select"
            required
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">-- Select Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location-select">Location</label>
          <select
            id="location-select"
            required
            value={form.locationId}
            onChange={(e) => setForm({ ...form, locationId: e.target.value })}
          >
            <option value="">-- Select Location --</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quantity-input">Quantity</label>
          <input
            id="quantity-input"
            type="number"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            min="0"
          />
        </div>

        <button type="submit" className="btn">
          Update Stock
        </button>
      </form>

      <div className="page-header">
        <h1>Current Stock Levels</h1>
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Location</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {stockLevels.map((sl) => (
            <tr key={`${sl.productId}-${sl.locationId}`}>
              <td>{sl.product ? `${sl.product.name} (${sl.product.sku})` : 'N/A'}</td>
              <td>{sl.location ? sl.location.name : 'N/A'}</td>
              <td>{sl.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
