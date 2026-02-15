import { useEffect, useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { categoryApi } from '../api/client';

const emptyAttribute = () => ({ name: '', type: 'text', options: '' });

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', attributes: [emptyAttribute()] });
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      attributes: form.attributes.map((a) => ({
        name: a.name,
        type: a.type,
        options: a.type === 'dropdown' ? a.options.split(',').map((o) => o.trim()).filter(Boolean) : null,
      })),
    };
    if (editingId) {
      await categoryApi.update(editingId, payload);
    } else {
      await categoryApi.create(payload);
    }
    setForm({ name: '', attributes: [emptyAttribute()] });
    setEditingId(null);
    setShowForm(false);
    fetchCategories();
  };

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      attributes: cat.attributes.map((a) => ({
        name: a.name,
        type: a.type,
        options: a.type === 'dropdown' && a.options ? a.options.join(', ') : '',
      })),
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await categoryApi.delete(id);
      fetchCategories();
    }
  };

  const updateAttribute = (index, field, value) => {
    const updated = [...form.attributes];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, attributes: updated });
  };

  const addAttribute = () => {
    setForm({ ...form, attributes: [...form.attributes, emptyAttribute()] });
  };

  const removeAttribute = (index) => {
    setForm({ ...form, attributes: form.attributes.filter((_, i) => i !== index) });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', attributes: [emptyAttribute()] }); }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Category</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label htmlFor="category-name">Name</label>
            <input id="category-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Attributes</label>
            {form.attributes.map((attr, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input
                  placeholder="Attribute name"
                  aria-label={`Attribute ${i + 1} name`}
                  required
                  value={attr.name}
                  onChange={(e) => updateAttribute(i, 'name', e.target.value)}
                />
                <select
                  aria-label={`Attribute ${i + 1} type`}
                  value={attr.type}
                  onChange={(e) => updateAttribute(i, 'type', e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="dropdown">Dropdown</option>
                </select>
                {attr.type === 'dropdown' && (
                  <input
                    placeholder="Options (comma-separated)"
                    aria-label={`Attribute ${i + 1} options`}
                    value={attr.options}
                    onChange={(e) => updateAttribute(i, 'options', e.target.value)}
                  />
                )}
                <button type="button" className="btn-danger-outline btn-sm" onClick={() => removeAttribute(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" className="btn-outline btn-sm" onClick={addAttribute}>
              <Plus size={14} /> Add Attribute
            </button>
          </div>

          <button type="submit" className="btn">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <table className="stock-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Attributes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.attributes ? cat.attributes.map((a) => a.name).join(', ') : '-'}</td>
              <td className="actions-cell">
                <div className="btn-group">
                  <button className="btn-outline btn-sm" onClick={() => handleEdit(cat)}><Pencil size={14} /> Edit</button>
                  <button className="btn-danger-outline btn-sm" onClick={() => handleDelete(cat.id)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
