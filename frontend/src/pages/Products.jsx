import { useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { productApi } from '../api/client';
import { useProducts, useCategories } from '../hooks';

export default function Products() {
  const { products, loading: productsLoading, mutate: mutateProducts } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', description: '', categoryId: '', attributeValues: {} });
  const [editingId, setEditingId] = useState(null);

  const loading = productsLoading || categoriesLoading;

  const selectedCategory = categories.find((c) => c.id === Number(form.categoryId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      attributeValues: form.categoryId ? form.attributeValues : {},
    };
    if (editingId) {
      await productApi.update(editingId, payload);
    } else {
      await productApi.create(payload);
    }
    setForm({ name: '', sku: '', description: '', categoryId: '', attributeValues: {} });
    setEditingId(null);
    setShowForm(false);
    mutateProducts();
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      categoryId: product.categoryId ? String(product.categoryId) : '',
      attributeValues: product.attributeValues || {},
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await productApi.delete(id);
      mutateProducts();
    }
  };

  const handleCategoryChange = (categoryId) => {
    setForm({ ...form, categoryId, attributeValues: {} });
  };

  const handleAttributeChange = (attrName, value) => {
    setForm({ ...form, attributeValues: { ...form.attributeValues, [attrName]: value } });
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : null;
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', sku: '', description: '', categoryId: '', attributeValues: {} }); }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Product</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label htmlFor="product-name">Name</label>
            <input id="product-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="product-sku">SKU</label>
            <input id="product-sku" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="product-description">Description</label>
            <input id="product-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="product-category">Category</label>
            <select id="product-category" value={form.categoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">-- None --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {selectedCategory && selectedCategory.attributes && selectedCategory.attributes.map((attr) => (
            <div className="form-group" key={attr.name}>
              <label htmlFor={`attr-${attr.name}`}>{attr.name}</label>
              {attr.type === 'dropdown' ? (
                <select
                  id={`attr-${attr.name}`}
                  value={form.attributeValues[attr.name] || ''}
                  onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {attr.options && attr.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`attr-${attr.name}`}
                  type={attr.type === 'number' ? 'number' : 'text'}
                  value={form.attributeValues[attr.name] || ''}
                  onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <button type="submit" className="btn">{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <table className="stock-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>
                {getCategoryName(p.categoryId)
                  ? <span className="category-pill">{getCategoryName(p.categoryId)}</span>
                  : '-'}
              </td>
              <td>{p.description || '-'}</td>
              <td className="actions-cell">
                <div className="btn-group">
                  <button className="btn-outline btn-sm" onClick={() => handleEdit(p)}><Pencil size={14} /> Edit</button>
                  <button className="btn-danger-outline btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
