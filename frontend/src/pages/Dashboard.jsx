import { useEffect, useState, useMemo } from 'react';
import { Plus, Box, Trash2, ArrowRightLeft } from 'lucide-react';
import { productApi, categoryApi, locationApi, stockApi } from '../api/client';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Items');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, catRes, locRes, stockRes] = await Promise.all([
          productApi.getAll(),
          categoryApi.getAll(),
          locationApi.getAll(),
          stockApi.getAll(),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setLocations(locRes.data);
        setStockLevels(stockRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const locationStockTotals = useMemo(() => {
    return locations.map(location => {
      const total = stockLevels
        .filter(sl => sl.locationId === location.id)
        .reduce((sum, sl) => sum + sl.quantity, 0);
      return { ...location, total };
    });
  }, [locations, stockLevels]);

  const pivotData = useMemo(() => {
    const productMap = products.reduce((acc, p) => {
      acc[p.id] = {
        product: p,
        category: categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized',
        locations: {},
        total: 0,
      };
      return acc;
    }, {});

    stockLevels.forEach(sl => {
      if (productMap[sl.productId]) {
        productMap[sl.productId].locations[sl.locationId] = sl.quantity;
        productMap[sl.productId].total += sl.quantity;
      }
    });

    return Object.values(productMap);
  }, [products, stockLevels, categories]);

  const filteredPivotData = useMemo(() => {
    if (activeCategory === 'All Items') {
      return pivotData;
    }
    return pivotData.filter(p => p.category === activeCategory);
  }, [pivotData, activeCategory]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Childcare Stock Manager</h1>
          <p>Track and distribute toys and activities across your sites</p>
        </div>
        <button className="btn">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="stats-grid">
        {locationStockTotals.map(loc => (
          <div key={loc.id} className="stat-card">
            <div className="stat-card-header">
              <h2>{loc.name}</h2>
              <Box size={16} />
            </div>
            <div>
              <p className="stat-value">{loc.total}</p>
              <p className="stat-label">Total items in stock</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="filter-pills">
          <button
            onClick={() => setActiveCategory('All Items')}
            className={activeCategory === 'All Items' ? 'active' : ''}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={activeCategory === cat.name ? 'active' : ''}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            {locations.map(loc => <th key={loc.id}>{loc.name}</th>)}
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPivotData.map(({ product, category, locations: itemLocations, total }) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td><span className="category-pill">{category}</span></td>
              {locations.map(loc => <td key={loc.id}>{itemLocations[loc.id] || 0}</td>)}
              <td>{total}</td>
              <td className="actions-cell">
                <div className="btn-group">
                  <button className="btn-outline btn-sm">
                    <ArrowRightLeft size={14} /> Transfer
                  </button>
                  <button className="btn-danger-outline btn-sm">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
