import { useState } from 'react';
import { Minus, Plus, Check, X } from 'lucide-react';
import { stockApi } from '../api/client';

export default function StockTable({ stockLevels, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [flashId, setFlashId] = useState(null);

  const flashRow = (id) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 600);
  };

  const getIds = (sl) => ({
    productId: sl.product ? sl.product.id : sl.productId,
    locationId: sl.location ? sl.location.id : sl.locationId,
  });

  const handleStep = async (sl, delta) => {
    const newQty = Math.max(0, sl.quantity + delta);
    await stockApi.update({ ...getIds(sl), quantity: newQty });
    flashRow(sl.id);
    onUpdate();
  };

  const handleClickQuantity = (sl) => {
    setEditing(sl.id);
    setQuantity(String(sl.quantity));
  };

  const handleSave = async (sl) => {
    await stockApi.update({
      ...getIds(sl),
      quantity: parseInt(quantity, 10),
    });
    setEditing(null);
    flashRow(sl.id);
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
        </tr>
      </thead>
      <tbody>
        {stockLevels.map((sl) => (
          <tr key={sl.id} className={flashId === sl.id ? 'row-flash' : ''}>
            <td>{sl.product ? sl.product.name : 'Unknown Product'}</td>
            <td>{sl.product ? sl.product.sku : '-'}</td>
            <td>{sl.location ? sl.location.name : 'Unknown Location'}</td>
            <td>
              {editing === sl.id ? (
                <span className="stepper-cell">
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="inline-input"
                    autoFocus
                  />
                  <button className="btn btn-sm" onClick={() => handleSave(sl)}>
                    <Check size={14} /> Save
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={handleCancel}>
                    <X size={14} /> Cancel
                  </button>
                </span>
              ) : (
                <span className="stepper-cell">
                  <button
                    className="stepper-btn"
                    onClick={() => handleStep(sl, -1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="stepper-value"
                    onClick={() => handleClickQuantity(sl)}
                    role="button"
                    tabIndex={0}
                    title="Click to edit exact value"
                  >
                    {sl.quantity}
                  </span>
                  <button
                    className="stepper-btn"
                    onClick={() => handleStep(sl, 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </span>
              )}
            </td>
            <td>{sl.updatedAt ? new Date(sl.updatedAt).toLocaleString() : '-'}</td>
          </tr>
        ))}
        {stockLevels.length === 0 && (
          <tr>
            <td colSpan="5" className="empty-state">No stock data available.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
