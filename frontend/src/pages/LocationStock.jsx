import { useParams } from 'react-router-dom';
import { useStockLevels, useProducts, useCategories, useLocations } from '../hooks';
import { useMemo } from 'react';

export default function LocationStock() {
  const { id } = useParams();
  const { locations, loading: locationsLoading } = useLocations();
  const { stockLevels, loading: stockLevelsLoading } = useStockLevels();
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const loading = locationsLoading || stockLevelsLoading || productsLoading || categoriesLoading;

  const location = useMemo(() => {
    return locations.find(loc => loc.id === Number(id));
  }, [locations, id]);

  const locationStock = useMemo(() => {
    return stockLevels.filter(sl => sl.locationId === Number(id));
  }, [stockLevels, id]);

  const stockByCategory = useMemo(() => {
    const byCategory = {};
    for (const sl of locationStock) {
      const product = products.find(p => p.id === sl.productId);
      if (product) {
        const category = categories.find(c => c.id === product.categoryId) || { id: 0, name: 'Uncategorized' };
        if (!byCategory[category.name]) {
          byCategory[category.name] = [];
        }
        byCategory[category.name].push({
          ...sl,
          product,
        });
      }
    }
    return byCategory;
  }, [locationStock, products, categories]);

  if (loading) return <p>Loading...</p>;

  if (!location) return <p>Location not found.</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{location.name} Stock</h1>
      </div>

      {Object.keys(stockByCategory).map(categoryName => (
        <div key={categoryName}>
          <h2>{categoryName}</h2>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {stockByCategory[categoryName].map(sl => (
                <tr key={sl.id}>
                  <td>{sl.product.name}</td>
                  <td>{sl.product.sku}</td>
                  <td>{sl.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
