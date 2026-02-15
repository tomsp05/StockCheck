import { useEffect, useState } from 'react';
import { stockApi } from '../api/client';

export function useStockLevels() {
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStockLevels = async () => {
    try {
      setLoading(true);
      const res = await stockApi.getAll();
      setStockLevels(res.data);
    } catch (err) {
      console.error('Failed to load stock levels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockLevels();
  }, []);

  return { stockLevels, loading, mutate: fetchStockLevels };
}
