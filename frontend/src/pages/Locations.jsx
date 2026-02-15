import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { locationApi } from '../api/client';
import { useLocations } from '../hooks';

export default function Locations() {
  const { locations, loading, mutate } = useLocations();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await locationApi.update(editingId, form);
    } else {
      await locationApi.create(form);
    }
    setForm({ name: '', address: '' });
    setEditingId(null);
    setShowForm(false);
    mutate();
  };

  const handleEdit = (location) => {
    setForm({ name: location.name, address: location.address || '' });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this location?')) {
      await locationApi.delete(id);
      mutate();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Locations</h1>
        <button className="btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', address: '' }); }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Location</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label htmlFor="location-name">Name</label>
            <input id="location-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="location-address">Address</label>
            <input id="location-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button type="submit" className="btn">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <table className="stock-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id}>
              <td>
                <Link to={`/locations/${loc.id}`} className="text-blue-600 hover:underline">
                  {loc.name}
                </Link>
              </td>
              <td>{loc.address || '-'}</td>
              <td className="actions-cell">
                <div className="btn-group">
                  <button className="btn-outline btn-sm" onClick={() => handleEdit(loc)}><Pencil size={14} /> Edit</button>
                  <button className="btn-danger-outline btn-sm" onClick={() => handleDelete(loc.id)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
