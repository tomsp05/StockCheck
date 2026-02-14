import { useEffect, useState } from 'react';
import { locationApi } from '../api/client';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchLocations = async () => {
    try {
      const res = await locationApi.getAll();
      setLocations(res.data);
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

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
    fetchLocations();
  };

  const handleEdit = (location) => {
    setForm({ name: location.name, address: location.address || '' });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this location?')) {
      await locationApi.delete(id);
      fetchLocations();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Locations</h1>
        <button className="btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', address: '' }); }}>
          {showForm ? 'Cancel' : 'Add Location'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button type="submit" className="btn">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <table className="data-table">
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
              <td>{loc.name}</td>
              <td>{loc.address || '-'}</td>
              <td>
                <button className="btn btn-sm" onClick={() => handleEdit(loc)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(loc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
