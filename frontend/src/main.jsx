import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Locations from './pages/Locations';
import StockLevels from './pages/StockLevels';
import LocationStock from './pages/LocationStock';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import './index.css';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/products', element: <Products /> },
      { path: '/categories', element: <Categories /> },
      { path: '/locations', element: <Locations /> },
      { path: '/locations/:id', element: <LocationStock /> },
      { path: '/stock-levels', element: <StockLevels /> },
      { path: '/alerts', element: <Alerts /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
