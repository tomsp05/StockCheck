import { useEffect, useState } from 'react';
import { stockApi, locationApi, exportApi } from '../api/client';
import StockTable from '../components/StockTable';

export default function StockLevels() {
  const [stockLevels, setStockLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = selectedLocation
        ? await stockApi.getByLocation(selectedLocation)
        : await stockApi.getAll();
      setStockLevels(res.data);
    } catch (err) {
      console.error('Failed to load stock levels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    locationApi.getAll().then((res) => setLocations(res.data));
  }, []);

  useEffect(() => {
    fetchStock();
  }, [selectedLocation]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stock Levels</h1>
        <div className="page-actions">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="select"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <a href={exportApi.stockCsvUrl()} className="btn" download>
            Export CSV
          </a>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <StockTable stockLevels={stockLevels} onUpdate={fetchStock} />
      )}
    </div>
  );
}
