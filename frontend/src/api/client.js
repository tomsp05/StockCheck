import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const locationApi = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const stockApi = {
  getAll: () => api.get('/stock'),
  getByLocation: (locationId) => api.get(`/stock/location/${locationId}`),
  getByProduct: (productId) => api.get(`/stock/product/${productId}`),
  update: (data) => api.put('/stock', data),
  getAlerts: () => api.get('/stock/alerts'),
};

export const thresholdApi = {
  getAll: () => api.get('/thresholds'),
  set: (data) => api.put('/thresholds', data),
  delete: (id) => api.delete(`/thresholds/${id}`),
};

export const exportApi = {
  stockCsvUrl: () => `${api.defaults.baseURL}/export/stock.csv`,
};

export default api;
