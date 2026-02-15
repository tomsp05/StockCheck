import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Box, Trash2, ArrowRightLeft } from 'lucide-react';
import { useProducts, useCategories, useLocations, useStockLevels } from '../hooks';

export default function Dashboard() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { locations, loading: locationsLoading } = useLocations();
  const { stockLevels, loading: stockLevelsLoading } = useStockLevels();
  const [activeCategory, setActiveCategory] = useState('All Items');

  const loading = productsLoading || categoriesLoading || locationsLoading || stockLevelsLoading;

  const locationStockTotals = useMemo(() => {
    return locations.map((location) => {
      const total = stockLevels
        .filter((sl) => sl.locationId === location.id)
        .reduce((sum, sl) => sum + sl.quantity, 0);
      return { ...location, total };
    });
  }, [locations, stockLevels]);

  const pivotData = useMemo(() => {
    const productMap = products.reduce((acc, p) => {
      acc[p.id] = {
        product: p,
        category: categories.find((c) => c.id === p.categoryId)?.name || 'Uncategorized',
        locations: {},
        total: 0,
      };
      return acc;
    }, {});

    stockLevels.forEach((sl) => {
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
    return pivotData.filter((p) => p.category === activeCategory);
  }, [pivotData, activeCategory]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Stock Tracker</h1>
          <p>Track stock across sites</p>
        </div>
        <button className="btn">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="stats-grid">
        {locationStockTotals.map((loc) => (
          <Link to={`/locations/${loc.id}`} key={loc.id} className="stat-card">
            <div className="stat-card-header">
              <h2>{loc.name}</h2>
              <Box size={16} />
            </div>
            <div>
              <p className="stat-value">{loc.total}</p>
              <p className="stat-label">Total items in stock</p>
            </div>
          </Link>
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
          {categories.map((cat) => (
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
            {locations.map((loc) => (
              <th key={loc.id}>{loc.name}</th>
            ))}
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPivotData.map(({ product, category, locations: itemLocations, total }) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>
                <span className="category-pill">{category}</span>
              </td>
              {locations.map((loc) => (
                <td key={loc.id}>{itemLocations[loc.id] || 0}</td>
              ))}
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
