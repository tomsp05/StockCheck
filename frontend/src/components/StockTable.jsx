import { useState } from 'react';
import { stockApi } from '../api/client';

export default function StockTable({ stockLevels, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [quantity, setQuantity] = useState('');

  const handleEdit = (sl) => {
    setEditing(sl.id);
    setQuantity(String(sl.quantity));
  };

  const handleSave = async (sl) => {
    await stockApi.update({
      productId: sl.product.id,
      locationId: sl.location.id,
      quantity: parseInt(quantity, 10),
    });
    setEditing(null);
    onUpdate();
  };

  const handleCancel = () => {
    setEditing(null);
    setQuantity('');
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Location</th>
          <th>Quantity</th>
          <th>Last Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {stockLevels.map((sl) => (
          <tr key={sl.id}>
            <td>{sl.product.name}</td>
            <td>{sl.product.sku}</td>
            <td>{sl.location.name}</td>
            <td>
              {editing === sl.id ? (
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="inline-input"
                />
              ) : (
                sl.quantity
              )}
            </td>
            <td>{sl.updatedAt ? new Date(sl.updatedAt).toLocaleString() : '-'}</td>
            <td>
              {editing === sl.id ? (
                <>
                  <button className="btn btn-sm" onClick={() => handleSave(sl)}>Save</button>
                  <button className="btn btn-sm btn-secondary" onClick={handleCancel}>Cancel</button>
                </>
              ) : (
                <button className="btn btn-sm" onClick={() => handleEdit(sl)}>Edit</button>
              )}
            </td>
          </tr>
        ))}
        {stockLevels.length === 0 && (
          <tr>
            <td colSpan="6" className="empty-state">No stock data available.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
